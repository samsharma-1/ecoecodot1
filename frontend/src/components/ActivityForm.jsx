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
      <h2 className="text-2xl font-bold text-slate-950">Log an Activity</h2>
      <p className="mt-1 text-sm text-slate-600">Add one measurable activity. EcoTrack converts it to kg CO2e.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-lg border border-slate-200 bg-white p-5">
        <div>
          <label htmlFor="activity-date" className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
          <input
            id="activity-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-md border border-slate-300 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            required
          />
        </div>

        <div>
          <label htmlFor="activity-category" className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
          <select
            id="activity-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-md border border-slate-300 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <option value="transport">Transport (Miles Driven)</option>
            <option value="energy">Energy (kWh Used)</option>
            <option value="diet">Diet (Meat-based Meals)</option>
            <option value="waste">Waste (Trash Bags)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">{categoryHelp[category]}</p>
        </div>

        <div>
          <label htmlFor="activity-amount" className="mb-1 block text-sm font-semibold text-slate-700">Amount</label>
          <input
            id="activity-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-md border border-slate-300 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-3 font-bold text-white transition-colors hover:bg-emerald-800 disabled:bg-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          {loading ? 'Logging...' : 'Log Activity'} <Send className="h-4 w-4" aria-hidden="true" />
        </button>

        {message && (
          <div className={`rounded-md p-3 text-sm font-medium ${message.includes('Success') ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-800'}`} role="status">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default ActivityForm;
