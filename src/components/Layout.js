import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main style={{ 
        flexGrow: 1, 
        marginLeft: '280px', // Matches Sidebar width
        padding: '0', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header Bar (Optional but Recommended) */}
        <header style={{
          height: '64px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 40px',
          position: 'sticky',
          top: 0,
          zIndex: 900
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>System Status:</span>
            <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Operational</span>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '40px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;