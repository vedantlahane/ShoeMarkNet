import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { formatNumber } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrdersChart = ({ data, timeRange, totalOrders, pending }) => {
  const chartData = useMemo(() => {
    const labels = data.map(item => {
      const date = new Date(item.date);
      return timeRange === '1d' ? 
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) :
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const orders = data.map(item => item.orders || 0);
    const completedOrders = data.map(item => item.completed || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Total Orders',
          data: orders,
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Completed',
          data: completedOrders,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  }, [data, timeRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6B7280',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
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
            return formatNumber(value);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <i className="fas fa-shopping-cart mr-3 text-purple-500"></i>
            Orders Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor order trends and fulfillment
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatNumber(totalOrders)}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">
            <i className="fas fa-clock mr-1"></i>
            {pending} pending
          </div>
        </div>
      </div>
      
      <div className="h-80">
        {data.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">No order data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersChart;
