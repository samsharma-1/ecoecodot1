import { useState, useEffect } from 'react';
import { Leaf, Activity, MessageSquare, BarChart2, Target } from 'lucide-react';
import api from './api';
import ActivityForm from './components/ActivityForm';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emissions, setEmissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [insights, setInsights] = useState(null);
  const [status, setStatus] = useState('loading');

  const fetchSummary = async () => {
    try {
      setStatus('loading');
      const response = await api.get('/api/summary');
      setEmissions(response.data.emissions);
      setActivities(response.data.activities);
      setInsights(response.data.insights);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'log', label: 'Log Activity', icon: Activity },
    { id: 'chat', label: 'Eco AI Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Leaf className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EcoTrack AI</h1>
              <p className="text-sm text-slate-600">Personal carbon footprint coach</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 md:flex">
            <Target className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            {insights ? `${insights.carbonScore}/100 ${insights.scoreStatus}` : 'Tracking score'}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-8">
        <aside className="md:sticky md:top-6 md:self-start">
          <nav className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-white p-2 md:grid-cols-1" aria-label="Primary">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:justify-start ${
                  activeTab === id
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-h-[calc(100vh-140px)]">
          {status === 'error' && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              Could not reach the EcoTrack API. Check that the backend is running.
            </div>
          )}
          {activeTab === 'dashboard' && <Dashboard emissions={emissions} activities={activities} insights={insights} loading={status === 'loading'} />}
          {activeTab === 'log' && <ActivityForm onActivityLogged={fetchSummary} />}
          {activeTab === 'chat' && <Chatbot />}
        </section>
      </main>
    </div>
  );
}

export default App;
