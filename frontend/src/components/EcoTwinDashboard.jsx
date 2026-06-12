import React, { useState, useEffect } from 'react';
import { TrendingUp, UserCircle, Zap, ArrowRight, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

export default function EcoTwinDashboard({ insights }) {
  const [twinData, setTwinData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTwin = async () => {
      try {
        const response = await api.post('/api/ecotwin', { 
          totalEmissions: insights?.totalEmissions 
        });
        setTwinData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (insights) {
      fetchTwin();
    }
  }, [insights]);

  if (!insights) return <div className="text-slate-400 animate-pulse">Please wait, loading insights...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-emerald-400" />
        <h2 className="text-3xl font-bold text-white">EcoTwin & Financial ROI</h2>
      </div>
      <p className="text-slate-400 max-w-2xl">
        Meet your Future Sustainable You. AI predicts the environmental and financial impact of adopting our recommended lifestyle changes.
      </p>

      {loading ? (
        <div className="text-slate-400 animate-pulse">Generating your EcoTwin...</div>
      ) : twinData ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-slate-700/50">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <UserCircle className="h-32 w-32" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-6 relative z-10">Current You</h3>
            <div className="text-5xl font-mono font-bold text-white mb-2 relative z-10">
              {twinData.currentEmissions.toFixed(1)} <span className="text-2xl text-slate-400">kg</span>
            </div>
            <p className="text-slate-400 relative z-10">Monthly CO₂ Emissions</p>
          </div>

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Zap className="h-32 w-32 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-400 mb-6 relative z-10">Future Sustainable You</h3>
            <div className="text-5xl font-mono font-bold text-emerald-300 mb-2 relative z-10">
              {twinData.targetEmissions.toFixed(1)} <span className="text-2xl text-emerald-500/50">kg</span>
            </div>
            <p className="text-emerald-100/70 relative z-10 mb-6">Target Monthly Emissions</p>
            
            <div className="pt-6 border-t border-emerald-500/20 relative z-10">
              <div className="flex items-center gap-3 text-emerald-300">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-emerald-100/70">Estimated Monthly Savings</div>
                  <div className="text-2xl font-bold">${twinData.financialSavings}</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="md:col-span-2 glass-panel p-8 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-4">Gap Analysis & Action Roadmap</h3>
            <p className="text-slate-300 mb-6">{twinData.gapAnalysis}</p>
            <div className="space-y-4">
              {twinData.actionRoadmap.map((action, i) => (
                <motion.div 
                  key={i} 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="p-2 rounded-full bg-emerald-500/20">
                    <ArrowRight className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  </div>
                  <span className="text-slate-200 font-medium text-lg">{action}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
