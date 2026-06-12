import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Car, Zap, Trash2 } from 'lucide-react';
import api from '../api';

export default function SavingsSimulator() {
  const [transport, setTransport] = useState(50);
  const [energy, setEnergy] = useState(200);
  const [waste, setWaste] = useState(4);
  const [savingStatus, setSavingStatus] = useState('');

  // Mock baseline
  const baseline = {
    transport: 100, // miles
    energy: 400, // kWh
    waste: 10 // bags
  };

  const factors = {
    transport: 0.3,
    energy: 0.36,
    waste: 0.75
  };

  const currentCO2 = (transport * factors.transport) + (energy * factors.energy) + (waste * factors.waste);
  const baselineCO2 = (baseline.transport * factors.transport) + (baseline.energy * factors.energy) + (baseline.waste * factors.waste);
  const savedCO2 = baselineCO2 - currentCO2;

  const saveSimulation = async () => {
    try {
      setSavingStatus('saving');
      await api.post('/api/simulate', {
        category: 'Combined',
        before_value: baselineCO2,
        after_value: currentCO2,
        co2_saved: savedCO2
      });
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus(''), 2000);
    } catch (err) {
      setSavingStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings2 className="h-8 w-8 text-emerald-400" />
        <h2 className="text-3xl font-bold text-white">Carbon Savings Simulator</h2>
      </div>
      <p className="text-slate-400">
        Adjust the sliders to simulate changes in your daily habits and see the immediate impact on your carbon footprint.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Car className="h-5 w-5 text-emerald-400" />
                <span>Transport (Miles/week)</span>
              </div>
              <span className="font-mono text-emerald-400">{transport} mi</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={transport} 
              onChange={(e) => setTransport(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Zap className="h-5 w-5 text-emerald-400" />
                <span>Energy (kWh/month)</span>
              </div>
              <span className="font-mono text-emerald-400">{energy} kWh</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="800" 
              value={energy} 
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Trash2 className="h-5 w-5 text-emerald-400" />
                <span>Waste (Bags/month)</span>
              </div>
              <span className="font-mono text-emerald-400">{waste} bags</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="20" 
              value={waste} 
              onChange={(e) => setWaste(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between h-full bg-gradient-to-br from-slate-900/50 to-slate-800/50">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-slate-700/50 pb-4">Simulation Results</h3>
            
            <div className="flex justify-between items-end">
              <span className="text-slate-400">Baseline CO₂</span>
              <span className="text-xl text-slate-300 font-mono">{baselineCO2.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-slate-400">Simulated CO₂</span>
              <span className="text-2xl text-white font-mono">{currentCO2.toFixed(1)} kg</span>
            </div>
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-end">
                <span className="text-emerald-400 font-medium">Potential Savings</span>
                <motion.span 
                  key={savedCO2}
                  initial={{ scale: 1.2, color: '#fff' }}
                  animate={{ scale: 1, color: '#34d399' }}
                  className="text-4xl font-bold font-mono text-emerald-400"
                >
                  {savedCO2 > 0 ? '-' : ''}{Math.abs(savedCO2).toFixed(1)} kg
                </motion.span>
              </div>
            </div>
          </div>

          <button 
            onClick={saveSimulation}
            disabled={savingStatus === 'saving'}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 font-semibold text-white transition-all hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'saved' ? 'Saved!' : 'Save Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
