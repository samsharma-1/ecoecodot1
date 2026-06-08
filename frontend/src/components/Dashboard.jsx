import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ emissions }) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily CO₂e Emissions',
      },
    },
  };

  const data = {
    labels: emissions.map(e => e.date),
    datasets: [
      {
        label: 'kg CO₂e',
        data: emissions.map(e => e.total_CO2e),
        backgroundColor: 'rgba(34, 197, 94, 0.6)', // Tailwind green-500
        borderColor: 'rgba(21, 128, 61, 1)', // Tailwind green-700
        borderWidth: 1,
      },
    ],
  };

  const totalEmissions = emissions.reduce((acc, curr) => acc + curr.total_CO2e, 0);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Your Footprint Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
          <h3 className="text-sm font-medium text-green-600 uppercase tracking-wide">Total Emissions</h3>
          <p className="text-4xl font-bold text-green-900 mt-2">{totalEmissions.toFixed(2)} <span className="text-xl">kg CO₂e</span></p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
          <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide">Days Tracked</h3>
          <p className="text-4xl font-bold text-blue-900 mt-2">{emissions.length}</p>
        </div>
      </div>

      <div className="flex-grow min-h-[300px]">
        {emissions.length > 0 ? (
          <Bar options={options} data={data} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data yet. Go to "Log Activity" to start tracking!
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
