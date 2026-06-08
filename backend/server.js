const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'ecotrack.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected.');
    // Create tables
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS ActivityLog (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT,
          amount REAL,
          date TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS EmissionRecord (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          total_CO2e REAL
        )
      `);
    });
  }
});

// Calculate emissions logic (MVP)
// Factors: kg CO2e per unit
const FACTORS = {
  transport: 0.30, // kg CO2e per mile
  energy: 0.36,    // kg CO2e per kWh
  diet: 2.5,       // kg CO2e per meat-based meal
};

// API Endpoints
app.post('/api/activities', (req, res) => {
  const { category, amount, date } = req.body;
  if (!category || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const factor = FACTORS[category] || 0;
  const co2e = amount * factor;

  // Insert Activity
  db.run(
    'INSERT INTO ActivityLog (category, amount, date) VALUES (?, ?, ?)',
    [category, amount, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update or insert EmissionRecord for the date
      db.get('SELECT * FROM EmissionRecord WHERE date = ?', [date], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
          db.run(
            'UPDATE EmissionRecord SET total_CO2e = total_CO2e + ? WHERE date = ?',
            [co2e, date]
          );
        } else {
          db.run(
            'INSERT INTO EmissionRecord (date, total_CO2e) VALUES (?, ?)',
            [date, co2e]
          );
        }
      });

      res.status(201).json({ 
        message: 'Activity logged successfully', 
        co2e_added: co2e,
        id: this.lastID 
      });
    }
  );
});

app.get('/api/emissions', (req, res) => {
  db.all('SELECT * FROM EmissionRecord ORDER BY date ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  // Mock AI Logic for MVP
  const lowerMsg = message.toLowerCase();
  let reply = "I'm your EcoTrack AI assistant! Tell me what activities you did today (like driving, using electricity, or eating a meat-heavy meal).";

  if (lowerMsg.includes('drive') || lowerMsg.includes('car') || lowerMsg.includes('miles')) {
    reply = "Driving is a major source of emissions. Try carpooling, public transit, or biking for short trips to save around 0.3 kg CO₂e per mile!";
  } else if (lowerMsg.includes('electricity') || lowerMsg.includes('power') || lowerMsg.includes('kwh')) {
    reply = "Electricity usage adds up. Consider switching to LED bulbs or unplugging devices when not in use. You could save ~0.36 kg CO₂e per kWh.";
  } else if (lowerMsg.includes('meat') || lowerMsg.includes('diet') || lowerMsg.includes('eat')) {
    reply = "Replacing one meat-based meal with a plant-based one can save roughly 2 to 5 kg of CO₂e!";
  } else if (lowerMsg.includes('total') || lowerMsg.includes('emissions')) {
    reply = "Check your dashboard to see your total calculated emissions over time. Every small reduction counts!";
  }

  // Simulate network delay
  setTimeout(() => {
    res.json({ reply });
  }, 1000);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
