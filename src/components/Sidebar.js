import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Landmark, FileBarChart, Settings, 
  LogOut, BookOpen, PlusCircle, Scale, Percent, 
  ClipboardList, Database, ChevronRight,
  CreditCard, Users // Added icons for AP and AR
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(null);

  // Updated menuItems with Accounts Payable and Accounts Receivable
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/new-entry', label: 'New Journal Entry', icon: <PlusCircle size={18} /> },
    { path: '/ledger', label: 'General Ledger', icon: <BookOpen size={18} /> },
    
    // --- ADDED THESE TWO ITEMS ---
    { 
        path: '/accounts-payable', 
        label: 'Accounts Payable', 
        icon: <CreditCard size={18} />, 
        badge: 5 // Optional: Shows the notification count from your screenshot
    },
    { 
        path: '/accounts-receivable', 
        label: 'Accounts Receivable', 
        icon: <Users size={18} />, 
        badge: 12 
    },
    // -----------------------------

    { path: '/reports', label: 'Income Statement', icon: <FileBarChart size={18} /> },
    { path: '/balance-sheet', label: 'Balance Sheet', icon: <Scale size={18} /> },
    { path: '/bank', label: 'Bank Reconciliation', icon: <Landmark size={18} /> },
    { path: '/tax', label: 'Tax Management', icon: <Percent size={18} /> },
    { path: '/audit', label: 'Audit Logs', icon: <ClipboardList size={18} /> },
    { path: '/backup', label: 'Backup & Restore', icon: <Database size={18} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div style={sidebarContainer}>
      {/* Brand Section */}
      <div style={brandSection}>
        <div style={logoIcon}>E</div>
        <div>
          <h2 style={brandTitle}>ERP MASTER</h2>
          <span style={brandVersion}>Enterprise v1.0</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={navContainer}>
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
                ...navLink,
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : (isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                color: isActive ? '#fff' : '#94a3b8'
              }}
            >
              <span style={{ color: isActive ? '#00bcd4' : 'inherit', display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              
              <span style={{ flexGrow: 1, fontWeight: isActive ? '600' : '400' }}>
                {item.label}
              </span>

              {/* Added Badge Logic for the Red Circles */}
              {item.badge && (
                <span style={badgeStyle}>
                    {item.badge}
                </span>
              )}

              {isActive && <ChevronRight size={14} color="#00bcd4" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Section */}
      <div style={footerSection}>
        <div style={userBadge}>
          <div style={avatar}>A</div>
          <div style={{ overflow: 'hidden' }}>
            <p style={userName}>Admin User</p>
            <p style={userRole}>System Administrator</p>
          </div>
        </div>
        <button style={logoutButton}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

// --- Style Objects ---

const sidebarContainer = {
  width: '280px',
  height: '100vh',
  background: '#0f172a', 
  color: '#fff',
  position: 'fixed',
  left: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '1px 0 0 0 rgba(255,255,255,0.1)',
  zIndex: 1000,
  fontFamily: "'Inter', sans-serif"
};

const brandSection = {
  padding: '32px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.05)'
};

const logoIcon = {
  width: '32px',
  height: '32px',
  background: 'linear-gradient(135deg, #00bcd4 0%, #1a237e 100%)',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '18px'
};

const brandTitle = { fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '0.5px' };
const brandVersion = { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' };

const navContainer = { flexGrow: 1, padding: '24px 16px', overflowY: 'auto' };

const navLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 16px',
  borderRadius: '10px',
  marginBottom: '4px',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'all 0.2s ease'
};

const badgeStyle = {
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '10px',
    marginLeft: 'auto',
    marginRight: '8px'
};

const footerSection = {
  padding: '20px 16px',
  backgroundColor: 'rgba(0,0,0,0.2)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const userBadge = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatar = { 
  width: '36px', height: '36px', borderRadius: '10px', 
  background: '#1e293b', display: 'flex', alignItems: 'center', 
  justifyContent: 'center', fontWeight: 'bold', color: '#00bcd4',
  border: '1px solid rgba(255,255,255,0.1)'
};

const userName = { fontSize: '13px', fontWeight: '600', margin: 0 };
const userRole = { fontSize: '11px', color: '#64748b', margin: 0 };

const logoutButton = {
  display: 'flex', alignItems: 'center', gap: '8px', 
  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
  border: 'none', padding: '10px', borderRadius: '8px',
  fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%',
  transition: 'background 0.2s'
};

export default Sidebar;