import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

function ActivityForm({ onActivityLogged }) {
  const [category, setCategory] = useState('transport');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await axios.post('http://localhost:3001/api/activities', {
        category,
        amount: parseFloat(amount),
        date
      });
      setMessage(`Success! Added ${res.data.co2e_added.toFixed(2)} kg CO₂e.`);
      setAmount('');
      if (onActivityLogged) onActivityLogged();
    } catch (err) {
      setMessage('Error logging activity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Log an Activity</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="transport">Transport (Miles Driven)</option>
            <option value="energy">Energy (kWh Used)</option>
            <option value="diet">Diet (Meat-based Meals)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors"
        >
          {loading ? 'Logging...' : 'Log Activity'} <Send className="w-4 h-4" />
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default ActivityForm;
