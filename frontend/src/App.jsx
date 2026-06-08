import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, Activity, MessageSquare, BarChart2 } from 'lucide-react';
import ActivityForm from './components/ActivityForm';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emissions, setEmissions] = useState([]);

  const fetchEmissions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/emissions');
      setEmissions(response.data);
    } catch (error) {
      console.error('Error fetching emissions:', error);
    }
  };

  useEffect(() => {
    fetchEmissions();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <header className="bg-green-600 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          <h1 className="text-xl font-bold">EcoTrack AI</h1>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row h-[80vh]">
          {/* Sidebar */}
          <nav className="bg-green-100 w-full md:w-64 flex flex-row md:flex-col p-4 gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 p-3 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-green-500 text-white' : 'hover:bg-green-200 text-green-800'}`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`flex items-center gap-2 p-3 rounded-lg font-medium transition-colors ${activeTab === 'log' ? 'bg-green-500 text-white' : 'hover:bg-green-200 text-green-800'}`}
            >
              <Activity className="w-5 h-5" />
              <span className="hidden md:inline">Log Activity</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 p-3 rounded-lg font-medium transition-colors ${activeTab === 'chat' ? 'bg-green-500 text-white' : 'hover:bg-green-200 text-green-800'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden md:inline">Eco AI Chat</span>
            </button>
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'dashboard' && <Dashboard emissions={emissions} />}
            {activeTab === 'log' && <ActivityForm onActivityLogged={fetchEmissions} />}
            {activeTab === 'chat' && <Chatbot />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
