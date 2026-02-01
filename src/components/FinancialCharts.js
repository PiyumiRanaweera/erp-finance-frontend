import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const FinancialCharts = ({ data }) => {
  // Logic: Filter data for charts
  const revenue = data.filter(item => item.accountCode.startsWith('6')).reduce((a, b) => a + b.balance, 0);
  const expenses = data.filter(item => item.accountCode.startsWith('7')).reduce((a, b) => a + Math.abs(b.balance), 0);

  const barData = {
    labels: ['Revenue', 'Expenses'],
    datasets: [
      {
        label: 'USD ($)',
        data: [revenue, expenses],
        backgroundColor: ['#2e7d32', '#c62828'],
      },
    ],
  };

  const pieData = {
    labels: data.filter(item => item.accountCode.startsWith('7')).map(i => i.accountCode),
    datasets: [
      {
        data: data.filter(item => item.accountCode.startsWith('7')).map(i => Math.abs(i.balance)),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
      },
    ],
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>Revenue vs Expenses</h3>
        <Bar data={barData} />
      </div>
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>Expense Breakdown</h3>
        <Pie data={pieData} />
      </div>
    </div>
  );
};

export default FinancialCharts;