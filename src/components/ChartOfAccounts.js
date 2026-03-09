import React, { useState, useEffect } from 'react';
import { Plus, FileUp, Download, Search, Edit3, Folder, FileText, ChevronDown, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- STYLES ---
const btnPrimary = { background: '#1a237e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' };
const btnSecondary = { background: 'white', color: '#1a237e', border: '1px solid #1a237e', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };

const badgeStyle = (code) => {
  const firstDigit = code?.toString()[0];
  const types = {
    '1': { label: 'Asset', bg: '#e1f5fe', text: '#0288d1' },
    '2': { label: 'Liability', bg: '#fff3e0', text: '#f57c00' },
    '3': { label: 'Equity', bg: '#e8f5e9', text: '#2e7d32' },
    '4': { label: 'Revenue', bg: '#ede7f6', text: '#673ab7' },
    '5': { label: 'Expense', bg: '#fce4ec', text: '#d81b60' }
  };
  const style = types[firstDigit] || { label: 'Other', bg: '#f3f4f6', text: '#374151' };
  return { padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: style.bg, color: style.text, display: 'inline-block' };
};

const ChartOfAccounts = () => {
  const [activeTab, setActiveTab] = useState('Accounts List');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ accountCode: '', accountName: '', type: 'Balance Sheet', department: 'General' });

  // Update this URL to match your @RequestMapping("/api/finance/accounts")
  const API_URL = 'http://localhost:8080/api/finance/accounts';

  const fetchAccounts = () => {
    setLoading(true);
    fetch(`${API_URL}/balances`)
      .then(res => res.json())
      .then(data => {
        setAccounts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAccounts([]);
        setLoading(false);
      });
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });
      if (response.ok) {
        setIsModalOpen(false);
        setNewAccount({ accountCode: '', accountName: '', type: 'Balance Sheet', department: 'General' });
        fetchAccounts();
      }
    } catch (err) { console.error("Save failed", err); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const filteredAccounts = accounts.filter(a => 
    a.accountName.toLowerCase().includes(search.toLowerCase()) || 
    a.accountCode.toString().includes(search)
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f4f7fe', minHeight: '100vh', textAlign: 'left' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Chart of Accounts</h1>
          <span style={{ fontSize: '12px', color: '#1a237e', background: '#e8eaf6', padding: '4px 12px', borderRadius: '12px', fontWeight: '600' }}>USALI Hotel Standard</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={btnPrimary} onClick={() => setIsModalOpen(true)}><Plus size={16}/> Add Account</button>
          <button style={btnSecondary}><Download size={16}/> Export</button>
          <button style={btnSecondary} onClick={fetchAccounts}><FileUp size={16}/> Sync Balances</button>
        </div>
      </div>

      {/* Main Content Card */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af' }} size={18} />
            <input 
              placeholder="Search by name or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} 
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
          {['Accounts List', 'Account Hierarchy', 'Account Balances'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab ? '3px solid #1a237e' : '3px solid transparent',
              color: activeTab === tab ? '#1a237e' : '#6b7280', fontWeight: 'bold', transition: '0.3s'
            }}>{tab}</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Processing Financial Data...</div> : (
          <>
            {activeTab === 'Accounts List' && <AccountsTable accounts={filteredAccounts} />}
            {activeTab === 'Account Hierarchy' && <HierarchyList accounts={filteredAccounts} />}
            {activeTab === 'Account Balances' && <AnalyticsDashboard accounts={accounts} />}
          </>
        )}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Add New Account</h2>
              <X cursor="pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleAddAccount}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Account Code</label>
                <input required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} 
                  onChange={e => setNewAccount({...newAccount, accountCode: e.target.value})} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Account Name</label>
                <input required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} 
                  onChange={e => setNewAccount({...newAccount, accountName: e.target.value})} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Type</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  onChange={e => setNewAccount({...newAccount, type: e.target.value})}>
                  <option>Balance Sheet</option>
                  <option>Revenue</option>
                  <option>Expense</option>
                </select>
              </div>
              <button type="submit" style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Save Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const AccountsTable = ({ accounts }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '13px', borderBottom: '2px solid #f1f5f9' }}>
        <th style={{ padding: '16px' }}>Code</th>
        <th style={{ padding: '16px' }}>Account Name</th>
        <th style={{ padding: '16px' }}>Type</th>
        <th style={{ padding: '16px', textAlign: 'right' }}>Balance</th>
        <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {accounts.map((acc, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <td style={{ padding: '16px', fontWeight: '600' }}>{acc.accountCode}</td>
          <td style={{ padding: '16px' }}>{acc.accountName}</td>
          <td style={{ padding: '16px' }}><span style={badgeStyle(acc.accountCode)}>{acc.type}</span></td>
          <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: acc.balance < 0 ? '#ef4444' : '#10b981' }}>
            ${acc.balance.toLocaleString()}
          </td>
          <td style={{ padding: '16px', textAlign: 'center' }}>
            <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '6px' }}><Edit3 size={14}/></button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const HierarchyList = ({ accounts }) => {
  const sorted = [...accounts].sort((a, b) => a.accountCode - b.accountCode);
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ color: '#1a237e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Folder size={20} /> Hotel Financial Structure (USALI)
      </div>
      {sorted.map((acc, i) => {
        const isSub = acc.accountCode.toString().length > 4;
        return (
          <div key={i} style={{ marginLeft: isSub ? '45px' : '0px', padding: '12px 20px', display: 'flex', background: isSub ? 'transparent' : '#f8fafc', borderRadius: '8px', marginBottom: '4px', borderLeft: isSub ? '2px solid #e2e8f0' : 'none', alignItems: 'center' }}>
            {!isSub ? <ChevronDown size={16} style={{marginRight: '10px'}} /> : <FileText size={14} style={{marginRight: '10px'}} color="#94a3b8" />}
            <span style={{ width: '80px', fontWeight: 'bold', color: '#1a237e' }}>{acc.accountCode}</span>
            <span style={{ flex: 1 }}>{acc.accountName}</span>
            <span style={{ fontWeight: 'bold' }}>${acc.balance.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
};

const AnalyticsDashboard = ({ accounts }) => {
  const totals = accounts.reduce((acc, curr) => {
    const code = curr.accountCode.toString()[0];
    if (code === '1') acc.assets += curr.balance;
    if (code === '2') acc.liabilities += curr.balance;
    if (code === '4') acc.revenue += curr.balance;
    return acc;
  }, { assets: 0, liabilities: 0, revenue: 0 });

  const chartData = [
    { name: 'Assets', value: Math.abs(totals.assets), color: '#0288d1' },
    { name: 'Liabilities', value: Math.abs(totals.liabilities), color: '#f57c00' },
  ];

  return (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ height: '300px', width: '50%' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={chartData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
              {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: '40%', display: 'grid', gap: '10px' }}>
        <SummaryCard title="Total Assets" value={totals.assets} color="#0288d1" />
        <SummaryCard title="Total Liabilities" value={totals.liabilities} color="#f57c00" />
        <SummaryCard title="Monthly Revenue" value={totals.revenue} color="#673ab7" />
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, color }) => (
  <div style={{ padding: '15px', borderRadius: '10px', borderLeft: `5px solid ${color}`, background: '#f8fafc' }}>
    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{title}</div>
    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>${value.toLocaleString()}</div>
  </div>
);

export default ChartOfAccounts;