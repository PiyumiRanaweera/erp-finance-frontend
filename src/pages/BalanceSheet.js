import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, Scale, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BalanceSheet = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIXED: Corrected the URL to match the @RequestMapping in AccountController
    fetch('http://localhost:8080/api/finance/accounts/balances')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch balances");
        return res.json();
      })
      .then(json => {
        // Ensure we are setting an array even if the backend response is unexpected
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching balances:", err);
        setData([]); // Fallback to empty array to prevent .filter crash
        setLoading(false);
      });
  }, []);

  // --- Grouping Logic (Safety check: added Array.isArray check) ---
  const assets = Array.isArray(data) ? data.filter(item => item.accountCode?.startsWith('1')) : [];
  const liabilities = Array.isArray(data) ? data.filter(item => item.accountCode?.startsWith('2')) : [];
  const equity = Array.isArray(data) ? data.filter(item => item.accountCode?.startsWith('3')) : [];

  // Utility to handle BigDecimal precision from API
  const formatCurrency = (val) => {
    const num = parseFloat(val || 0);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalAssets = assets.reduce((acc, curr) => acc + parseFloat(curr.balance || 0), 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + Math.abs(parseFloat(curr.balance || 0)), 0);
  const totalEquity = equity.reduce((acc, curr) => acc + Math.abs(parseFloat(curr.balance || 0)), 0);
  
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  
  // Fundamental accounting equation check
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SoftwarePlus ERP - Balance Sheet", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    autoTable(doc, {
      startY: 35,
      head: [['Code', 'Account Name', 'Balance (USD)']],
      body: [
        ...assets.map(a => [a.accountCode, a.accountName, formatCurrency(a.balance)]),
        [{ content: 'Total Assets', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
         { content: formatCurrency(totalAssets), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]
      ],
      headStyles: { fillColor: [30, 58, 138] }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Code', 'Liabilities & Equity', 'Balance (USD)']],
      body: [
        ...liabilities.map(l => [l.accountCode, l.accountName, formatCurrency(Math.abs(l.balance))]),
        ...equity.map(e => [e.accountCode, e.accountName, formatCurrency(Math.abs(e.balance))]),
        [{ content: 'Total Liabilities & Equity', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
         { content: formatCurrency(totalLiabilitiesAndEquity), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]
      ],
      headStyles: { fillColor: [31, 41, 55] }
    });

    doc.save(`Balance_Sheet_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '10px' }}>
        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#1e3a8a', borderRadius: '50%' }}></div>
        <span>Loading Financial Position...</span>
    </div>
  );

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: '"Inter", sans-serif', color: '#1e293b' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', fontWeight: '800' }}>
            <Scale size={36} color="#1e3a8a" /> Statement of Financial Position
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Snapshot as of <strong>{new Date().toLocaleDateString()}</strong></p>
        </div>
        <button 
            onClick={downloadPDF} 
            style={{ background: '#1e3a8a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
        >
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* Accuracy Status Banner */}
      {!isBalanced && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#b91c1c' }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: '500' }}>Warning: The Balance Sheet is currently out of balance by ${formatCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity))}</span>
        </div>
      )}

      {/* Summary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Assets</span>
          <h2 style={{ margin: '8px 0 0 0', color: '#1e3a8a', fontSize: '24px' }}>${formatCurrency(totalAssets)}</h2>
        </div>
        
        <div style={{ background: isBalanced ? '#f0fdf4' : '#fff7ed', padding: '24px', borderRadius: '16px', border: `1px solid ${isBalanced ? '#bbf7d0' : '#fed7aa'}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ShieldCheck size={44} color={isBalanced ? "#10b981" : "#f59e0b"} />
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#475569' }}>EQUATION STATUS</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isBalanced ? "#166534" : "#9a3412" }}>
              {isBalanced ? "Balanced" : "Verification Required"}
            </p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Liabilities + Equity</span>
          <h2 style={{ margin: '8px 0 0 0', color: '#1e293b', fontSize: '24px' }}>${formatCurrency(totalLiabilitiesAndEquity)}</h2>
        </div>
      </div>

      {/* Detailed Report Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', borderBottom: '3px solid #1e3a8a', paddingBottom: '12px', marginBottom: '20px' }}>Assets</h3>
          <div style={{ minHeight: '300px' }}>
            {assets.map(item => (
                <div key={item.accountCode} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.accountName}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.accountCode}</span>
                </div>
                <span style={{ fontWeight: '700', fontSize: '16px' }}>{formatCurrency(item.balance)}</span>
                </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', marginTop: '20px', fontSize: '20px', fontWeight: '800', borderTop: '4px double #1e3a8a', color: '#1e3a8a' }}>
            <span>Total Assets</span>
            <span>${formatCurrency(totalAssets)}</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', borderBottom: '3px solid #334155', paddingBottom: '12px', marginBottom: '20px' }}>Liabilities & Equity</h3>
          <div style={{ minHeight: '300px' }}>
            {liabilities.map(item => (
                <div key={item.accountCode} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.accountName}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.accountCode}</span>
                </div>
                <span style={{ fontWeight: '700' }}>{formatCurrency(Math.abs(item.balance))}</span>
                </div>
            ))}
            {equity.map(item => (
                <div key={item.accountCode} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.accountName}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.accountCode}</span>
                </div>
                <span style={{ fontWeight: '700' }}>{formatCurrency(Math.abs(item.balance))}</span>
                </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', marginTop: '20px', fontSize: '20px', fontWeight: '800', borderTop: '4px double #334155', color: '#334155' }}>
            <span>Total L & E</span>
            <span>${formatCurrency(totalLiabilitiesAndEquity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;