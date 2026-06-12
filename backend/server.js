const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

const FACTORS = {
  transport: { factor: 0.3, unit: 'mile', label: 'Transport' },
  energy: { factor: 0.36, unit: 'kWh', label: 'Energy' },
  diet: { factor: 2.5, unit: 'meal', label: 'Diet' },
  waste: { factor: 0.75, unit: 'bag', label: 'Waste' },
};

const CATEGORY_TIPS = {
  transport: 'Replace one short car trip with walking, biking, or public transit.',
  energy: 'Shift heavy appliance use away from peak hours and turn off standby devices.',
  diet: 'Swap one meat-based meal for a plant-forward meal this week.',
  waste: 'Plan meals before shopping and compost food scraps where possible.',
};

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'ecotrack.sqlite');
let resolveDbReady;
let rejectDbReady;
const dbReady = new Promise((resolve, reject) => {
  resolveDbReady = resolve;
  rejectDbReady = reject;
});
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
    rejectDbReady(err);
    return;
  }

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS ActivityLog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        co2e REAL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS EmissionRecord (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        total_CO2e REAL NOT NULL DEFAULT 0
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS EcoScore (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT DEFAULT 'default',
        level TEXT DEFAULT 'Beginner',
        score INTEGER DEFAULT 0,
        badges TEXT DEFAULT '[]',
        streak INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS Simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        before_value REAL,
        after_value REAL,
        co2_saved REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS EcoFeed (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        type TEXT,
        url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.all('PRAGMA table_info(ActivityLog)', (pragmaErr, columns = []) => {
      if (pragmaErr) {
        rejectDbReady(pragmaErr);
        return;
      }

      const migrations = [];
if (!columns.some((column) => column.name === 'co2e')) {
  migrations.push('ALTER TABLE ActivityLog ADD COLUMN co2e REAL');
}

if (!columns.some((column) => column.name === 'created_at')) {
  migrations.push('ALTER TABLE ActivityLog ADD COLUMN created_at TEXT');
}

      if (!migrations.length) {
        resolveDbReady();
        return;
      }

      let remaining = migrations.length;
      migrations.forEach((migration) => {
        db.run(migration, (migrationErr) => {
          if (migrationErr) {
            rejectDbReady(migrationErr);
            return;
          }
          remaining -= 1;
          if (remaining === 0) resolveDbReady();
        });
      });
    });
  });
});

app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

const allowedOrigin = process.env.CORS_ORIGIN || (isProduction ? false : 'http://localhost:5173');
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '32kb' }));

app.use('/api', async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database is not ready.' });
  }
});

const requestCounts = new Map();
app.use('/api', (req, res, next) => {
  const windowMs = 60 * 1000;
  const maxRequests = Number(process.env.RATE_LIMIT_PER_MINUTE || 90);
  const key = req.ip || 'local';
  const now = Date.now();
  const current = requestCounts.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  requestCounts.set(key, current);

  if (current.count > maxRequests) {
    return res.status(429).json({ error: 'Too many requests. Please try again soon.' });
  }

  next();
});

function calculateEmission(category, amount) {
  const profile = FACTORS[category];
  if (!profile) return 0;
  return Number((amount * profile.factor).toFixed(3));
}

function validateActivity({ category, amount, date }) {
  const numericAmount = Number(amount);
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!FACTORS[category]) {
    return { error: 'Choose a valid category: transport, energy, diet, or waste.' };
  }
  if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > 100000) {
    return { error: 'Amount must be a positive number.' };
  }
  if (!datePattern.test(date || '') || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    return { error: 'Date must use YYYY-MM-DD format.' };
  }

  return { value: { category, amount: numericAmount, date } };
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function getActivityRows() {
  const rows = await allQuery('SELECT category, amount, co2e, date FROM ActivityLog ORDER BY date ASC, id ASC');
  return rows.map((row) => ({
    ...row,
    co2e: typeof row.co2e === 'number' ? row.co2e : calculateEmission(row.category, row.amount),
  }));
}

async function getEmissionRows() {
  return allQuery('SELECT date, total_CO2e FROM EmissionRecord ORDER BY date ASC');
}

function summarizeActivities(activities, emissions) {
  const categoryTotals = Object.keys(FACTORS).map((category) => ({
    category,
    label: FACTORS[category].label,
    total: Number(
      activities
        .filter((activity) => activity.category === category)
        .reduce((sum, activity) => sum + activity.co2e, 0)
        .toFixed(2)
    ),
  }));

  const totalEmissions = Number(categoryTotals.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  const latestSeven = emissions.slice(-7);
  const previousSeven = emissions.slice(-14, -7);
  const weeklyTotal = latestSeven.reduce((sum, row) => sum + row.total_CO2e, 0);
  const previousWeeklyTotal = previousSeven.reduce((sum, row) => sum + row.total_CO2e, 0);
  const trendPercent = previousWeeklyTotal > 0
    ? Number((((weeklyTotal - previousWeeklyTotal) / previousWeeklyTotal) * 100).toFixed(1))
    : 0;
  const dailyAverage = emissions.length ? totalEmissions / emissions.length : 0;
  const monthlyProjection = Number((dailyAverage * 30).toFixed(2));
  const score = Math.max(0, Math.min(100, Math.round(100 - dailyAverage * 6)));
  const topCategory = [...categoryTotals].sort((a, b) => b.total - a.total)[0];
  const goalKg = Number(process.env.MONTHLY_GOAL_KG || 120);
  const goalProgress = Math.min(100, Math.round((monthlyProjection / goalKg) * 100));

  const achievements = [
    activities.length > 0 && 'First Activity Logged',
    activities.length >= 3 && 'Eco Starter',
    categoryTotals.find((item) => item.category === 'transport')?.total < totalEmissions * 0.35 && activities.length >= 3
      ? 'Sustainable Traveler'
      : false,
    totalEmissions >= 10 && 'Carbon Reducer',
  ].filter(Boolean);

  return {
    totalEmissions,
    categoryTotals,
    weeklyTotal: Number(weeklyTotal.toFixed(2)),
    trendPercent,
    monthlyProjection,
    carbonScore: score,
    scoreStatus: score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'Needs Improvement',
    topCategory,
    topRecommendation: topCategory?.total > 0 ? CATEGORY_TIPS[topCategory.category] : 'Log your first activity to unlock personalized recommendations.',
    goal: {
      monthlyTargetKg: goalKg,
      projectedKg: monthlyProjection,
      progressPercent: goalProgress,
      daysRemaining: Math.max(0, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()),
    },
    achievements,
  };
}

function buildFallbackReply(message, insights) {
  const lowerMessage = message.toLowerCase();
  const topLabel = insights.topCategory?.label || 'your daily habits';
  const topTip = insights.topRecommendation;

  if (lowerMessage.includes('score')) {
    return `Your carbon score is ${insights.carbonScore}/100 (${insights.scoreStatus}). The quickest improvement is ${topTip}`;
  }
  if (lowerMessage.includes('goal') || lowerMessage.includes('month')) {
    return `Your current monthly projection is ${insights.monthlyProjection} kg CO2e against a ${insights.goal.monthlyTargetKg} kg target. Focus on ${topLabel.toLowerCase()} first.`;
  }
  if (lowerMessage.includes('transport') || lowerMessage.includes('drive') || lowerMessage.includes('car')) {
    return 'Transport reductions usually compound fast: combine errands, carpool once a week, or replace short drives with walking, cycling, or transit.';
  }
  if (lowerMessage.includes('energy') || lowerMessage.includes('electricity') || lowerMessage.includes('kwh')) {
    return 'For energy, start with LED lighting, AC temperature discipline, and switching off standby loads. Track kWh weekly to see the trend.';
  }
  if (lowerMessage.includes('diet') || lowerMessage.includes('meat') || lowerMessage.includes('food')) {
    return 'For diet emissions, one plant-forward meal swap can save several kg CO2e. Pick a recurring meal so the change is easy to repeat.';
  }
  if (lowerMessage.includes('waste') || lowerMessage.includes('trash')) {
    return 'Waste reductions start with meal planning, reusable containers, and separating compostable scraps where local services support it.';
  }

  return `Your biggest current opportunity is ${topLabel.toLowerCase()}. ${topTip} Ask about score, goals, transport, energy, diet, or waste for a focused plan.`;
}

async function generateAssistantReply(message, history, insights) {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackReply(message, insights);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 220,
      messages: [
        {
          role: 'system',
          content: `You are EcoTrack AI, a concise sustainability coach. Use this user footprint summary: ${JSON.stringify(insights)}. Give practical, quantified carbon reduction advice. Do not invent data.`,
        },
        ...history.slice(-8),
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || buildFallbackReply(message, insights);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ecotrack-ai' });
});

app.post('/api/activities', async (req, res) => {
  const parsed = validateActivity(req.body || {});
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const { category, amount, date } = parsed.value;
  const co2e = calculateEmission(category, amount);

  try {
    const result = await runQuery(
      'INSERT INTO ActivityLog (category, amount, co2e, date) VALUES (?, ?, ?, ?)',
      [category, amount, co2e, date]
    );
    await runQuery(
      `INSERT INTO EmissionRecord (date, total_CO2e)
       VALUES (?, ?)
       ON CONFLICT(date) DO UPDATE SET total_CO2e = total_CO2e + excluded.total_CO2e`,
      [date, co2e]
    );

    res.status(201).json({
      message: 'Activity logged successfully',
      co2e_added: co2e,
      id: result.lastID,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not log activity.' });
  }
});

app.get('/api/emissions', async (req, res) => {
  try {
    res.json(await getEmissionRows());
  } catch (err) {
    res.status(500).json({ error: 'Could not load emissions.' });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const [activities, emissions] = await Promise.all([getActivityRows(), getEmissionRows()]);
    res.json({
      emissions,
      activities,
      insights: summarizeActivities(activities, emissions),
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not load dashboard summary.' });
  }
});

app.get('/api/score', async (req, res) => {
  try {
    let scoreRow = await allQuery("SELECT * FROM EcoScore WHERE user_id = 'default'");
    if (!scoreRow.length) {
      await runQuery("INSERT INTO EcoScore (user_id) VALUES ('default')");
      scoreRow = await allQuery("SELECT * FROM EcoScore WHERE user_id = 'default'");
    }
    res.json(scoreRow[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not load score.' });
  }
});

app.post('/api/score/badges', async (req, res) => {
  try {
    const { badge } = req.body;
    res.json({ success: true, badge });
  } catch (err) {
    res.status(500).json({ error: 'Could not update badge.' });
  }
});

app.post('/api/simulate', async (req, res) => {
  try {
    const { category, before_value, after_value, co2_saved } = req.body;
    const result = await runQuery(
      'INSERT INTO Simulations (category, before_value, after_value, co2_saved) VALUES (?, ?, ?, ?)',
      [category, before_value, after_value, co2_saved]
    );
    res.json({ id: result.lastID, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not save simulation.' });
  }
});

app.get('/api/feed', async (req, res) => {
  try {
    const feed = await allQuery('SELECT * FROM EcoFeed ORDER BY created_at DESC LIMIT 20');
    if (feed.length === 0) {
      const mockFeed = [
        { id: 1, title: 'Solar Panel efficiency hits new high', content: 'New perovskite solar cells have reached 30% efficiency, promising cheaper renewable energy.', type: 'news' },
        { id: 2, title: 'Local public transit expansion', content: 'City council approves 5 new electric bus routes starting next month.', type: 'local' },
        { id: 3, title: 'Composting Guide', content: 'Check out the updated rules for composting in your area to reduce waste emissions.', type: 'tip' }
      ];
      res.json(mockFeed);
    } else {
      res.json(feed);
    }
  } catch (err) {
    res.status(500).json({ error: 'Could not load feed.' });
  }
});

app.post('/api/ecotwin', async (req, res) => {
  try {
    const { totalEmissions } = req.body; 
    const current = totalEmissions || 0;
    const twinData = {
      currentEmissions: current,
      targetEmissions: current * 0.6,
      financialSavings: 150, 
      gapAnalysis: 'Your biggest gap is transport. Switching to EV or Public Transit saves 40% of your footprint.',
      actionRoadmap: ['Switch to EV/Transit', 'Install Solar/Energy Efficient Appliances', 'Compost daily']
    };
    res.json(twinData);
  } catch (err) {
    res.status(500).json({ error: 'Could not generate EcoTwin.' });
  }
});

app.post('/api/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim();
  const history = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!message || message.length > 1000) {
    return res.status(400).json({ error: 'Message must be between 1 and 1000 characters.' });
  }

  try {
    const [activities, emissions] = await Promise.all([getActivityRows(), getEmissionRows()]);
    const insights = summarizeActivities(activities, emissions);
    const reply = await generateAssistantReply(message, history, insights);
    res.json({ reply, insights });
  } catch (err) {
    const [activities, emissions] = await Promise.all([getActivityRows(), getEmissionRows()]);
    const insights = summarizeActivities(activities, emissions);
    res.json({ reply: buildFallbackReply(message, insights), insights });
  }
});

if (isProduction) {
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      service: 'EcoTrack AI API',
    });
  });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = {
  app,
  calculateEmission,
  summarizeActivities,
  validateActivity,
};
