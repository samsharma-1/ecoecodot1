import React from 'react';
import { Trophy, Star, Shield, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EcoScoreCard({ scoreData, insights }) {
  if (!scoreData || !insights) {
    return <div className="text-slate-400 animate-pulse">Loading your Eco Score...</div>;
  }

  const badges = JSON.parse(scoreData.badges || '[]');
  const levelProgress = (insights.carbonScore / 100) * 100;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          <Trophy className="h-16 w-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white">Level: {scoreData.level}</h2>
        <p className="text-slate-400 text-center max-w-md">
          You are currently an {scoreData.level}. Reduce your footprint to unlock the next tier!
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex justify-between text-sm mb-2 text-slate-300">
          <span>Carbon Score</span>
          <span className="font-bold text-emerald-400">{insights.carbonScore} / 100</span>
        </div>
        <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-400" /> Milestone Badges
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {insights.achievements.map((badge, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="glass-panel flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-500/30 text-center gap-2"
            >
              <Shield className="h-8 w-8 text-emerald-400" />
              <span className="text-sm font-medium text-slate-200">{badge}</span>
            </motion.div>
          ))}
          {insights.achievements.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-8 glass-panel rounded-xl">
              Log activities to earn your first badge!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
