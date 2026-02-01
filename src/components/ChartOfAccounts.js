import React, { useState, useEffect } from 'react';
import { Plus, FileUp, Download, Search, Edit3, Slash, Folder, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- STYLES ---
const btnPrimary = { background: '#1a237e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' };
const btnSecondary = { background: 'white', color: '#1a237e', border: '1px solid #1a237e', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' };

const badgeStyle = (type) => {
  const colors = {
    Asset: { bg: '#e1f5fe', text: '#0288d1' },
    Liability: { bg: '#fff3e0', text: '#f57c00' },
    Equity: { bg: '#e8f5e9', text: '#2e7d32' },
    Revenue: { bg: '#ede7f6', text: '#673ab7' },
    Expense: { bg: '#fce4ec', text: '#d81b60' }
  };
  const style = colors[type] || { bg: '#f3f4f6', text: '#374151' };
  return { padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: style.bg, color: style.text };
};

const ChartOfAccounts = () => {
  const [activeTab, setActiveTab] = useState('Accounts List');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/accounts/balances')
      .then(res => res.json())
      .then(data => setAccounts(data))
      .catch(err => console.error("Error loading accounts:", err));
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f4f7fe', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>Chart of Accounts</h1>
          <span style={{ fontSize: '12px', color: '#6b7280', background: '#e5e7eb', padding: '2px 8px', borderRadius: '10px' }}>General Business</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={btnPrimary}><Plus size={16}/> Add Account</button>
          <button style={btnSecondary}><Download size={16}/> Export</button>
          <button style={btnSecondary}><FileUp size={16}/> Load Sample</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '10px', color: '#9ca3af' }} size={18} />
            <input placeholder="Search accounts..." style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>
          <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}><option>All Types</option></select>
          <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}><option>All Status</option></select>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
          {['Accounts List', 'Account Hierarchy', 'Account Balances'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #1a237e' : 'none',
              color: activeTab === tab ? '#1a237e' : '#6b7280', fontWeight: activeTab === tab ? '600' : '400'
            }}>{tab}</button>
          ))}
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div style={{ marginTop: '20px' }}>
          {activeTab === 'Accounts List' && <AccountsTable accounts={accounts} />}
          {activeTab === 'Account Hierarchy' && <HierarchyList accounts={accounts} />}
          {activeTab === 'Account Balances' && <AnalyticsDashboard accounts={accounts} />}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const AccountsTable = ({ accounts }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: '12px', borderBottom: '1px solid #e5e7eb' }}>
        <th style={{ padding: '12px' }}>Account Code</th>
        <th style={{ padding: '12px' }}>Account Name</th>
        <th style={{ padding: '12px' }}>Type</th>
        <th style={{ padding: '12px' }}>Balance</th>
        <th style={{ padding: '12px' }}>Status</th>
        <th style={{ padding: '12px' }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {accounts.map((acc, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
          <td style={{ padding: '12px', fontWeight: 'bold' }}>{acc.accountCode}</td>
          <td style={{ padding: '12px' }}>{acc.accountName || 'Account Name'}</td>
          <td style={{ padding: '12px' }}><span style={badgeStyle(acc.accountCode?.startsWith('1') ? 'Asset' : 'Liability')}>{acc.accountCode?.startsWith('1') ? 'Asset' : 'Liability'}</span></td>
          <td style={{ padding: '12px' }}>${acc.balance?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style={{ padding: '12px' }}><span style={{ color: '#2e7d32', fontSize: '12px' }}>● Active</span></td>
          <td style={{ padding: '12px' }}>
            <button style={{ background: 'none', border: '1px solid #ddd', padding: '4px', borderRadius: '4px', marginRight: '4px', cursor: 'pointer' }}><Edit3 size={14}/></button>
            <button style={{ background: 'none', border: '1px solid #ddd', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><Slash size={14}/></button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const HierarchyList = ({ accounts }) => (
  <div style={{ padding: '10px' }}>
    <div style={{ color: '#1a237e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
      <Folder size={18} /> Financial Accounts Tree
    </div>
    {accounts.map((acc, i) => (
      <div key={i} style={{ marginLeft: '30px', padding: '10px', display: 'flex', gap: '20px', borderBottom: '1px solid #f9fafb', alignItems: 'center' }}>
        <FileText size={14} color="#9ca3af" />
        <span style={{ width: '60px', fontMono: 'true' }}>{acc.accountCode}</span>
        <span style={{ flex: 1 }}>{acc.accountName || 'Unnamed Account'}</span>
        <span style={{ fontWeight: 'bold', color: '#1a237e' }}>${acc.balance?.toLocaleString()}</span>
      </div>
    ))}
  </div>
);

const AnalyticsDashboard = ({ accounts }) => {
  // Logic to sum totals by type
  const data = [
    { name: 'Asset', value: 502000, color: '#0288d1' },
    { name: 'Liability', value: 178000, color: '#f57c00' },
    { name: 'Equity', value: 325000, color: '#2e7d32' },
    { name: 'Revenue', value: 535000, color: '#673ab7' },
    { name: 'Expense', value: 394000, color: '#d81b60' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ height: '350px', width: '100%' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', background: '#f9fafb', color: '#6b7280', fontSize: '12px' }}>
            <th style={{ padding: '12px' }}>Account Type</th>
            <th style={{ padding: '12px' }}>Total Balance</th>
            <th style={{ padding: '12px' }}>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
                {item.name}
              </td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>${item.value.toLocaleString()}</td>
              <td style={{ padding: '12px' }}>
                 <div style={{ width: '100px', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: item.color }}></div>
                 </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChartOfAccounts;