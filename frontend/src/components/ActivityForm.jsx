import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../api';

const categoryHelp = {
  transport: 'Miles driven by car',
  energy: 'Electricity used in kWh',
  diet: 'Meat-based meals',
  waste: 'Trash bags sent to landfill',
};

function ActivityForm({ onActivityLogged }) {
  const [category, setCategory] = useState('transport');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/api/activities', {
        category,
        amount: parseFloat(amount),
        date,
      });
      setMessage(`Success. Added ${res.data.co2e_added.toFixed(2)} kg CO2e.`);
      setAmount('');
      onActivityLogged?.();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error logging activity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-white">Log an Activity</h2>
      <p className="mt-1 text-sm text-slate-400">Add one measurable activity. EcoTrack converts it to kg CO2e.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl glass-panel p-6 border border-slate-700/50">
        <div>
          <label htmlFor="activity-date" className="mb-1 block text-sm font-semibold text-slate-300">Date</label>
          <input
            id="activity-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-800/50 text-white p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="activity-category" className="mb-1 block text-sm font-semibold text-slate-300">Category</label>
          <select
            id="activity-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-800/50 text-white p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <option value="transport" className="bg-slate-800 text-white">Transport (Miles Driven)</option>
            <option value="energy" className="bg-slate-800 text-white">Energy (kWh Used)</option>
            <option value="diet" className="bg-slate-800 text-white">Diet (Meat-based Meals)</option>
            <option value="waste" className="bg-slate-800 text-white">Waste (Trash Bags)</option>
          </select>
          <p className="mt-1 text-xs text-slate-400">{categoryHelp[category]}</p>
        </div>

        <div>
          <label htmlFor="activity-amount" className="mb-1 block text-sm font-semibold text-slate-300">Amount</label>
          <input
            id="activity-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-md border border-slate-600 bg-slate-800/50 text-white p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 placeholder-slate-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 font-bold text-white transition-all hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          {loading ? 'Logging...' : 'Log Activity'} <Send className="h-5 w-5" aria-hidden="true" />
        </button>

        {message && (
          <div className={`rounded-xl p-4 text-sm font-medium ${message.includes('Success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`} role="status">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default ActivityForm;
