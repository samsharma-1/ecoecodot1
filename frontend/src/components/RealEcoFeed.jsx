import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, Newspaper, MapPin, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

export default function RealEcoFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await api.get('/api/feed');
        setFeed(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'news': return <Newspaper className="h-5 w-5 text-blue-400" />;
      case 'local': return <MapPin className="h-5 w-5 text-emerald-400" />;
      case 'tip': return <Zap className="h-5 w-5 text-amber-400" />;
      default: return <Globe className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Globe className="h-8 w-8 text-emerald-400" />
        <h2 className="text-3xl font-bold text-white">Real Eco Feed</h2>
      </div>

      {loading ? (
        <div className="text-slate-400 animate-pulse">Loading latest eco news...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {feed.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:bg-slate-800/50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {getIcon(item.type)}
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {item.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-300 mb-4">{item.content}</p>
              </div>
              <button className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                Read more <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
