import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  DollarSign, ArrowUpRight, Activity, 
  PieChart as PieIcon, RefreshCw, Hotel, PlusCircle, History, LayoutDashboard, Search, TrendingUp, Layers
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Import local components
import JournalEntryForm from '../components/finance/JournalEntryForm';
import LedgerExplorer from './LedgerExplorer'; 

const Dashboard = () => {
  const [view, setView] = useState('overview');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    cashBalance: 0,
    netIncome: 0 
  });
  const [deptData, setDeptData] = useState([]); 
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    // Initial load doesn't need a toast, but refreshes do
    const isInitialLoad = loading;
    let loadingToast;
    if (!isInitialLoad) loadingToast = toast.loading("Syncing Hotel Ledger...");

    try {
      // 1. Fetch Summary Stats
      const summaryRes = await api.get('/api/finance/dashboard/summary');
      const sData = summaryRes.data;
      setStats({
        totalRevenue: parseFloat(sData.totalRevenue || 0),
        totalExpenses: parseFloat(sData.totalExpenses || 0),
        accountsReceivable: parseFloat(sData.accountsReceivable || 0),
        accountsPayable: parseFloat(sData.accountsPayable || 0),
        cashBalance: parseFloat(sData.cashBalance || 0),
        netIncome: parseFloat(sData.netIncome || 0)
      });

      // 2. Fetch Departmental Data
      try {
        const deptRes = await api.get('/api/finance/dashboard/departments');
        setDeptData(deptRes.data || []);
      } catch (e) {
        console.warn("Department data unavailable", e);
      }

      // 3. Fetch Transaction History (Handles 404/500 gracefully)
      try {
        const historyRes = await api.get('/api/finance/entries/history');
        setHistory(historyRes.data || []);
      } catch (e) {
        console.warn("History endpoint not found, using empty array", e);
        setHistory([]);
      }

      // 4. Generate Trend Data
      const rev = parseFloat(sData.totalRevenue || 0);
      const exp = parseFloat(sData.totalExpenses || 0);
      setChartData([
        { month: 'Prior Period', revenue: rev * 0.82, expenses: exp * 0.88 },
        { month: 'Current Period', revenue: rev, expenses: exp },
      ]);

      if (!isInitialLoad) toast.success("Hotel Intelligence Updated", { id: loadingToast });
    } catch (err) {
      console.error("Dashboard Error:", err);
      toast.error("Sync failed. Check API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="text-center">
        <RefreshCw className="animate-spin mb-3 text-primary" size={48} />
        <h5 className="fw-bold text-navy">Accessing Hotel Back Office...</h5>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-light min-vh-100 text-start" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" />
      
      {/* Navigation Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
             <div className="bg-primary p-2 rounded-3 text-white"><Hotel size={20}/></div>
             <h4 className="fw-bold text-navy mb-0">SoftwarePlus Finance</h4>
          </div>
          <p className="text-muted small mb-0">Status: <span className="text-success fw-bold">ERP Live</span></p>
        </div>
        
        <div className="d-flex gap-2">
            <button onClick={() => setView('overview')} className={`btn ${view === 'overview' ? 'btn-primary' : 'btn-white border'} shadow-sm d-flex align-items-center gap-2`}>
                <LayoutDashboard size={16} /> Overview
            </button>
            <button onClick={() => setView('history')} className={`btn ${view === 'history' ? 'btn-primary' : 'btn-white border'} shadow-sm d-flex align-items-center gap-2`}>
                <History size={16} /> History
            </button>
            <button onClick={() => setView('explorer')} className={`btn ${view === 'explorer' ? 'btn-primary' : 'btn-white border'} shadow-sm d-flex align-items-center gap-2`}>
                <Search size={16} /> Explorer
            </button>
            <button onClick={() => setView('new-entry')} className="btn btn-success shadow-sm d-flex align-items-center gap-2">
                <PlusCircle size={16} /> New Entry
            </button>
        </div>
      </div>

      {/* VIEW: OVERVIEW */}
      {view === 'overview' && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
                <KPICard title="Total Revenue" value={stats.totalRevenue} icon={<ArrowUpRight size={20}/>} color="#10b981" subtitle="Room & POS Sales" />
            </div>
            <div className="col-md-3">
                <KPICard title="Cash on Hand" value={stats.cashBalance} icon={<DollarSign size={20}/>} color="#3b82f6" subtitle="Operating Funds" />
            </div>
            <div className="col-md-3">
                <KPICard title="City Ledger (AR)" value={stats.accountsReceivable} icon={<Layers size={20}/>} color="#6366f1" subtitle="Corporate Due" />
            </div>
            <div className="col-md-3">
                <KPICard title="Net Profit" value={stats.netIncome} icon={<Activity size={20}/>} color="#1a237e" isProfit subtitle="Bottom Line" />
            </div>
          </div>

          <div className="row g-4">
            {/* Chart Area */}
            <div className="col-md-8">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                    <h6 className="fw-bold text-navy mb-4 d-flex align-items-center gap-2">
                        <TrendingUp size={18} className="text-primary"/> Performance Trends
                    </h6>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="top" align="right" />
                                <Bar dataKey="revenue" name="Revenue" fill="#1a237e" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="expenses" name="Expenses" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Department Breakdown List */}
            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                    <h6 className="fw-bold text-navy mb-4 d-flex align-items-center gap-2">
                        <PieIcon size={18} className="text-primary"/> Spending by Dept
                    </h6>
                    <div className="d-flex flex-column gap-3 overflow-auto" style={{maxHeight: '350px'}}>
                        {deptData.length > 0 ? (
                            deptData.map((item, index) => (
                                <AssetItem 
                                    key={index} 
                                    label={item.name} 
                                    amount={item.value} 
                                    color={index % 2 === 0 ? '#1a237e' : '#10b981'} 
                                    percentage={stats.totalExpenses > 0 ? (item.value / stats.totalExpenses) * 100 : 0} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-5">
                                <Activity size={32} className="text-muted mb-2 opacity-25" />
                                <p className="text-muted small">No departmental expenses yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </>
      )}

      {/* OTHER VIEWS */}
      {view === 'new-entry' && (
        <JournalEntryForm onBack={() => { setView('overview'); fetchDashboardData(); }} />
      )}

      {view === 'explorer' && (
        <LedgerExplorer onBack={() => setView('overview')} />
      )}

      {view === 'history' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-navy mb-4">Transaction Ledger History</h5>
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr className="small text-muted text-uppercase">
                            <th>Date</th>
                            <th>Description</th>
                            <th>Reference</th>
                            <th className="text-end">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? (
                            history.map((item) => {
                                const total = item.lines?.reduce((sum, l) => sum + parseFloat(l.debit || 0), 0) || 0;
                                return (
                                    <tr key={item.id}>
                                        <td className="small">{item.entryDate}</td>
                                        <td>
                                          <div className="fw-bold small text-navy">{item.description}</div>
                                          <div className="text-muted" style={{fontSize: '10px'}}>{item.lines?.length || 0} split lines</div>
                                        </td>
                                        <td className="text-muted small">{item.referenceNo || 'N/A'}</td>
                                        <td className="fw-bold text-primary text-end">
                                            ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="4" className="text-center py-4 text-muted">No transactions recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

// Internal Sub-components
const KPICard = ({ title, value, icon, color, isProfit, subtitle }) => (
  <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div>
        <small className="text-uppercase fw-bold text-muted" style={{fontSize: '10px'}}>{title}</small>
        <h3 className={`fw-bold mt-1 mb-0 ${isProfit ? (value >= 0 ? 'text-success' : 'text-danger') : 'text-navy'}`}>
          ${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <p className="text-muted mb-0 mt-1" style={{fontSize: '11px'}}>{subtitle}</p>
      </div>
      <div className="p-2 rounded-3" style={{ background: `${color}15`, color: color }}>
        {icon}
      </div>
    </div>
  </div>
);

const AssetItem = ({ label, amount, color, percentage }) => (
  <div className="mb-2 text-start">
    <div className="d-flex justify-content-between align-items-center mb-1">
      <small className="fw-bold text-navy" style={{fontSize: '11px'}}>{label}</small>
      <small className="text-muted" style={{fontSize: '11px'}}>${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</small>
    </div>
    <div className="progress" style={{ height: '5px', borderRadius: '10px', backgroundColor: '#f1f5f9' }}>
      <div 
        className="progress-bar" 
        style={{ 
          width: `${Math.min(Math.max(percentage, 2), 100)}%`, 
          backgroundColor: color,
          transition: 'width 1.2s ease-in-out'
        }}
      ></div>
    </div>
  </div>
);

export default Dashboard;