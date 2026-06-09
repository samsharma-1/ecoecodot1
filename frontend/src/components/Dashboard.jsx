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

const palette = ['#047857', '#2563eb', '#f59e0b', '#be123c'];

function Stat({ label, value, tone = 'slate' }) {
  const toneClasses = {
    slate: 'border-slate-200 bg-white text-slate-950',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    blue: 'border-blue-200 bg-blue-50 text-blue-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
  };

  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Dashboard({ emissions, activities, insights, loading }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
        Loading dashboard...
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
      backgroundColor: '#047857',
      borderColor: '#065f46',
      borderWidth: 1,
    },
  ],
};
  
  const trendData = {
    labels: safeEmissions.slice(-10).map((item) => item.date),
    datasets: [
      {
        label: 'Daily trend',
        data: safeEmissions.slice(-10).map((item) => item.total_CO2e),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        tension: 0.35,
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
      legend: { position: 'bottom' },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Your Footprint Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Track safeEmissions, forecast impact, and choose the next best reduction.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label="Total safeEmissions" value={`${safeInsights.totalEmissions.toFixed(2)} kg CO2e`} tone="emerald" />
        <Stat label="Carbon score" value={`${safeInsights.carbonScore}/100`} tone="blue" />
        <Stat label="Days tracked" value={safeEmissions.length} />
        <Stat label="Monthly projection" value={`${safeInsights.monthlyProjection.toFixed(1)} kg`} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Daily safeEmissions</h3>
              <p className="text-sm text-slate-600">kg CO2e by logged date</p>
            </div>
            <TrendingDown className="h-5 w-5 text-blue-700" aria-hidden="true" />
          </div>
          <div className="h-72">
            {safeEmissions.length ? (
              <Bar options={chartOptions} data={dailyData} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
                No activity logged yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-900">Emission Breakdown</h3>
          <p className="text-sm text-slate-600">Category share</p>
          <div className="mt-4 h-72">
            {safeInsights.totalEmissions > 0 ? (
              <Doughnut options={chartOptions} data={categoryData} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
                Breakdown appears after logging.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h3 className="font-bold text-slate-900">Monthly Goal</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Projected {safeInsights.goal.projectedKg.toFixed(1)} kg against {safeInsights.goal.monthlyTargetKg} kg target.
          </p>
          <div className="mt-4 h-3 rounded-full bg-slate-100" aria-label="Monthly goal progress">
            <div
              className="h-3 rounded-full bg-emerald-700"
              style={{ width: `${Math.min(100, safeInsights.goal.progressPercent)}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">{safeInsights.goal.daysRemaining} days remaining</p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h3 className="font-bold text-slate-900">Top Recommendation</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{safeInsights.topRecommendation}</p>
          <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
            Weekly trend: {safeInsights.trendPercent > 0 ? '+' : ''}{safeInsights.trendPercent}%
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h3 className="font-bold text-slate-900">Achievements</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {safeInsights.achievements.length ? (
              safeInsights.achievements.map((achievement) => (
                <span key={achievement} className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
                  {achievement}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">Log one activity to earn your first badge.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-900">Recent Trend</h3>
        <div className="mt-4 h-64">
          {safeEmissions.length ? (
            <Line options={chartOptions} data={trendData} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
              Trend appears after your first activity.
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-slate-500">{safeActivities.length} activities logged using category-specific emission factors.</p>
    </div>
  );
}

export default Dashboard;
