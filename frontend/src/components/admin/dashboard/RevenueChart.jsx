import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatCurrency, formatPercentage } from '../../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ data, timeRange, totalRevenue, growth }) => {
  const chartData = useMemo(() => {
    const labels = data.map(item => {
      const date = new Date(item.date);
      return timeRange === '1d' ? 
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) :
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const revenues = data.map(item => item.revenue || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenues,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }
      ]
    };
  }, [data, timeRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          label: function(context) {
            return `Revenue: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <i className="fas fa-chart-line mr-3 text-blue-500"></i>
            Revenue Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your earnings over time
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalRevenue)}
          </div>
          <div className={`text-sm font-medium ${
            growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <i className={`fas ${growth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
            {formatPercentage(Math.abs(growth))} vs last period
          </div>
        </div>
      </div>
      
      <div className="h-80">
        {data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-chart-line text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
