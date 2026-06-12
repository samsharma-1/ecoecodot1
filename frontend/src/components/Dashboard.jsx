import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Award, Lightbulb, Target, TrendingDown } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const palette = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'];

function Stat({ label, value, tone = 'slate' }) {
  const toneClasses = {
    slate: 'border-slate-700/50 glass-panel text-white',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  };

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Dashboard({ emissions, activities, insights, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl glass-panel p-8 text-slate-400 animate-pulse border border-slate-700/50">
        Loading your footprint data...
      </div>
    );
  }

  const safeInsights = insights || {
    totalEmissions: 0,
    categoryTotals: [],
    weeklyTotal: 0,
    monthlyProjection: 0,
    trendPercent: 0,
    carbonScore: 100,
    scoreStatus: 'Excellent',
    topRecommendation: 'Log your first activity to unlock personalized recommendations.',
    goal: { monthlyTargetKg: 120, projectedKg: 0, progressPercent: 0, daysRemaining: 0 },
    achievements: [],
  };

  const safeEmissions = Array.isArray(emissions) ? emissions : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  const dailyData = {
    labels: safeEmissions.slice(-10).map((item) => item.date),
    datasets: [
      {
        label: 'kg CO2e',
        data: safeEmissions.slice(-10).map((item) => item.total_CO2e),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
  
  const trendData = {
    labels: safeEmissions.slice(-10).map((item) => item.date),
    datasets: [
      {
        label: 'Daily trend',
        data: safeEmissions.slice(-10).map((item) => item.total_CO2e),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: safeInsights.categoryTotals.map((item) => item.label),
    datasets: [
      {
        data: safeInsights.categoryTotals.map((item) => item.total),
        backgroundColor: palette,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { color: '#94a3b8' }
      },
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { color: '#94a3b8' }
      },
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Your Footprint Dashboard</h2>
        <p className="mt-2 text-slate-400">Track emissions, forecast impact, and choose the next best reduction.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label="Total Emissions" value={`${safeInsights.totalEmissions.toFixed(2)} kg`} tone="emerald" />
        <Stat label="Carbon score" value={`${safeInsights.carbonScore}/100`} tone="blue" />
        <Stat label="Days tracked" value={safeEmissions.length} />
        <Stat label="Monthly projection" value={`${safeInsights.monthlyProjection.toFixed(1)} kg`} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl glass-panel p-6 border border-slate-700/50">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Daily Emissions</h3>
              <p className="text-sm text-slate-400">kg CO2e by logged date</p>
            </div>
            <TrendingDown className="h-6 w-6 text-blue-400" aria-hidden="true" />
          </div>
          <div className="h-72">
            {safeEmissions.length ? (
              <Bar options={chartOptions} data={dailyData} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-800/50 text-sm text-slate-500 border border-slate-700/30">
                No activity logged yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl glass-panel p-6 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white">Emission Breakdown</h3>
          <p className="text-sm text-slate-400">Category share</p>
          <div className="mt-6 h-72">
            {safeInsights.totalEmissions > 0 ? (
              <Doughnut options={pieOptions} data={categoryData} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-800/50 text-sm text-slate-500 border border-slate-700/30">
                Breakdown appears after logging.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-3xl glass-panel p-6 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-emerald-400" aria-hidden="true" />
            <h3 className="text-lg font-bold text-white">Monthly Goal</h3>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Projected <span className="font-bold text-emerald-400">{safeInsights.goal.projectedKg.toFixed(1)} kg</span> against {safeInsights.goal.monthlyTargetKg} kg target.
          </p>
          <div className="mt-5 h-4 rounded-full bg-slate-800" aria-label="Monthly goal progress">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              style={{ width: `${Math.min(100, safeInsights.goal.progressPercent)}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold text-emerald-400">{safeInsights.goal.daysRemaining} days remaining</p>
        </section>

        <section className="rounded-3xl glass-panel p-6 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-amber-400" aria-hidden="true" />
            <h3 className="text-lg font-bold text-white">Top Recommendation</h3>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">{safeInsights.topRecommendation}</p>
          <div className="mt-4 inline-block rounded-lg bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Weekly trend: {safeInsights.trendPercent > 0 ? '+' : ''}{safeInsights.trendPercent}%
          </div>
        </section>

        <section className="rounded-3xl glass-panel p-6 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-blue-400" aria-hidden="true" />
            <h3 className="text-lg font-bold text-white">Achievements</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {safeInsights.achievements.length ? (
              safeInsights.achievements.map((achievement) => (
                <span key={achievement} className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-sm font-semibold text-blue-300">
                  {achievement}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">Log one activity to earn your first badge.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl glass-panel p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white">Recent Trend</h3>
        <div className="mt-6 h-64">
          {safeEmissions.length ? (
            <Line options={chartOptions} data={trendData} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-slate-800/50 text-sm text-slate-500 border border-slate-700/30">
              Trend appears after your first activity.
            </div>
          )}
        </div>
      </section>

      <p className="text-sm text-slate-500 text-center">{safeActivities.length} activities logged using category-specific emission factors.</p>
    </div>
  );
}

export default Dashboard;
