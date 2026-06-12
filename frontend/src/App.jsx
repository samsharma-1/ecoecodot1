import { useState, useEffect } from 'react';
import { Leaf, Activity, MessageSquare, BarChart2, Target, Trophy, Settings2, Globe, TrendingUp, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';
import ActivityForm from './components/ActivityForm';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import SavingsSimulator from './components/SavingsSimulator';
import EcoScoreCard from './components/EcoScoreCard';
import RealEcoFeed from './components/RealEcoFeed';
import EcoTwinDashboard from './components/EcoTwinDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emissions, setEmissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [insights, setInsights] = useState(null);
  const [status, setStatus] = useState('loading');
  const [scoreData, setScoreData] = useState(null);
  const [theme, setTheme] = useState('dark');

  const fetchSummary = async () => {
    try {
      setStatus('loading');
      const response = await api.get('/api/summary');
      setEmissions(response.data.emissions);
      setActivities(response.data.activities);
      setInsights(response.data.insights);
      
      const scoreRes = await api.get('/api/score');
      setScoreData(scoreRes.data);
      
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchSummary();
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'log', label: 'Log Activity', icon: Activity },
    { id: 'simulator', label: 'Simulator', icon: Settings2 },
    { id: 'ecotwin', label: 'EcoTwin', icon: TrendingUp },
    { id: 'score', label: 'EcoScore', icon: Trophy },
    { id: 'feed', label: 'EcoFeed', icon: Globe },
    { id: 'chat', label: 'Eco AI Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen text-slate-100 transition-colors duration-300 app-container">
      <header className="glass-panel sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Leaf className="h-6 w-6" aria-hidden="true" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">EcoTrack AI</h1>
              <p className="text-sm text-slate-400 app-subtitle">Personal carbon footprint coach</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="flex items-center justify-center h-10 w-10 rounded-full glass-panel hover:bg-emerald-500/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-400" />}
            </button>
            <div className="hidden items-center gap-2 rounded-xl glass-panel px-4 py-2 text-sm text-emerald-400 font-medium md:flex border border-emerald-500/20">
              <Target className="h-4 w-4" aria-hidden="true" />
              {insights ? `${insights.carbonScore}/100 ${insights.scoreStatus}` : 'Tracking score'}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-8">
        <aside className="md:sticky md:top-24 md:self-start z-40">
          <nav className="glass-panel flex gap-2 rounded-2xl p-2 md:flex-col overflow-x-auto no-scrollbar" aria-label="Primary">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`relative flex min-h-[48px] min-w-max items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 md:justify-start ${
                  activeTab === id
                    ? 'text-white active-tab-text'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 inactive-tab-text'
                }`}
              >
                {activeTab === id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/80 to-teal-500/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" aria-hidden="true" />
                <span className="relative z-10 hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-h-[calc(100vh-140px)] w-full max-w-full overflow-hidden">
          {status === 'error' && (
            <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]" role="alert">
              Could not reach the EcoTrack API. Check that the backend is running.
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="glass-panel rounded-3xl p-6 sm:p-8"
            >
              {activeTab === 'dashboard' && <Dashboard emissions={emissions} activities={activities} insights={insights} loading={status === 'loading'} />}
              {activeTab === 'log' && <ActivityForm onActivityLogged={fetchSummary} />}
              {activeTab === 'chat' && <Chatbot />}
              {activeTab === 'simulator' && <SavingsSimulator />}
              {activeTab === 'ecotwin' && <EcoTwinDashboard insights={insights} />}
              {activeTab === 'score' && <EcoScoreCard scoreData={scoreData} insights={insights} />}
              {activeTab === 'feed' && <RealEcoFeed />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default App;
