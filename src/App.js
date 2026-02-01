import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookText, Receipt, 
  UserCheck, ClipboardList, ArrowRightLeft, 
  Percent, FileDown, Landmark, LogOut, 
  Scale, Database, ChevronRight, ShieldCheck,
  CreditCard, Users, Box 
} from 'lucide-react';

// --- Page & Component Imports ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GeneralLedger from './components/finance/GeneralLedger';
import AccountsPayable from './pages/AccountsPayable';
import AccountsReceivable from './pages/AccountsReceivable';
import FixedAssets from './pages/FixedAssets';
import NewEntry from './pages/NewEntry';
import BalanceSheet from './pages/BalanceSheet';
import ChartOfAccounts from './components/ChartOfAccounts';
import TaxManagement from './components/TaxManagement';
import AuditLogs from './components/AuditLogs';
import BankRecon from './components/BankRecon';
import IncomeStatement from './components/IncomeStatement';
import BackupRestore from './components/BackupRestore';

const COLORS = {
  sidebarBg: '#0f172a',
  sidebarHover: 'rgba(255, 255, 255, 0.05)',
  sidebarActive: 'rgba(255, 255, 255, 0.1)',
  accent: '#00bcd4',
  bodyBg: '#f1f5f9',
  textMain: '#1e293b',
  textMuted: '#64748b'
};

const MainLayout = ({ children, onLogout }) => {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(null);

  // RED NUMBERS REMOVED: Deleted the 'badge' property from these objects
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/chart', label: 'Chart of Accounts', icon: <Landmark size={18} /> },
    { path: '/ledger', label: 'General Ledger', icon: <BookText size={18} /> },
    { path: '/accounts-payable', label: 'Accounts Payable', icon: <CreditCard size={18} /> },
    { path: '/accounts-receivable', label: 'Accounts Receivable', icon: <Users size={18} /> },
    { path: '/fixed-assets', label: 'Fixed Assets', icon: <Box size={18} /> },
    { path: '/new-entry', label: 'New Entry', icon: <Receipt size={18} /> },
    { path: '/balance-sheet', label: 'Balance Sheet', icon: <Scale size={18} /> },
    { path: '/bank', label: 'Bank Recon', icon: <ArrowRightLeft size={18} /> },
    { path: '/tax', label: 'Tax Management', icon: <Percent size={18} /> },
    { path: '/reports', label: 'Income Statement', icon: <FileDown size={18} /> },
    { path: '/audit', label: 'Audit Logs', icon: <ClipboardList size={18} /> },
    { path: '/backup', label: 'Backup & Restore', icon: <Database size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bodyBg }}>
      {/* Sidebar */}
      <div style={{ width: '280px', backgroundColor: COLORS.sidebarBg, color: 'white', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '1px' }}>ERP MASTER</h2>
          <span style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: '600' }}>ENTERPRISE V1.0</span>
        </div>

        <nav style={{ flexGrow: 1, padding: '24px 16px', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredPath === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
                  marginBottom: '4px', textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s',
                  backgroundColor: isActive ? COLORS.sidebarActive : (isHovered ? COLORS.sidebarHover : 'transparent'),
                  color: isActive ? '#fff' : '#94a3b8'
                }}
              >
                <span style={{ color: isActive ? COLORS.accent : 'inherit', display: 'flex' }}>{item.icon}</span>
                <span style={{ flexGrow: 1, fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
                
                {/* Badge rendering logic has been removed from here */}

                {isActive && <ChevronRight size={14} color={COLORS.accent} />}
              </Link>
            );
          })}
        </nav>

        <div onClick={onLogout} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#ff8a80', margin: '10px' }}>
          <LogOut size={18} /> <span style={{ fontWeight: '600', fontSize: '14px' }}>Logout</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 40px', position: 'sticky', top: 0, zIndex: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
              <ShieldCheck size={16} /> Operational
            </div>
            <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: COLORS.textMain, fontWeight: '600', fontSize: '14px' }}>
              <UserCheck size={18} color={COLORS.sidebarBg}/> Admin User
            </div>
          </div>
        </header>

        <div style={{ padding: '40px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isLoggedIn') === 'true');

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Toaster position="top-right" />
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <MainLayout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chart" element={<ChartOfAccounts />} />
            <Route path="/balance-sheet" element={<BalanceSheet />} />
            <Route path="/accounts-payable" element={<AccountsPayable />} />
            <Route path="/accounts-receivable" element={<AccountsReceivable />} />
            <Route path="/fixed-assets" element={<FixedAssets />} />
            <Route path="/accounts-receivable" element={<div>Accounts Receivable Content</div>} />
            <Route path="/fixed-assets" element={<div>Fixed Assets Content</div>} />
            <Route path="/new-entry" element={<NewEntry />} />
            <Route path="/ledger" element={<GeneralLedger />} />
            <Route path="/bank" element={<BankRecon />} />
            <Route path="/tax" element={<TaxManagement />} />
            <Route path="/reports" element={<IncomeStatement />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/backup" element={<BackupRestore />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>
      )}
    </Router>
  );
}