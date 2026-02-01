import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, Scale, PieChart, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BalanceSheet = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/accounts/balances')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  // --- Grouping Logic ---
  const assets = data.filter(item => item.accountCode.startsWith('1'));
  const liabilities = data.filter(item => item.accountCode.startsWith('2'));
  const equity = data.filter(item => item.accountCode.startsWith('3'));

  const totalAssets = assets.reduce((acc, curr) => acc + curr.balance, 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + Math.abs(curr.balance), 0);
  const totalEquity = equity.reduce((acc, curr) => acc + Math.abs(curr.balance), 0);
  
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Balance Sheet", 14, 22);
    
    autoTable(doc, {
      startY: 30,
      head: [['Assets', 'Balance']],
      body: [
        ...assets.map(a => [a.accountCode, `$${a.balance.toLocaleString()}`]),
        [{ content: 'Total Assets', styles: { fontStyle: 'bold' } }, `$${totalAssets.toLocaleString()}`]
      ],
      headStyles: { fillColor: [30, 58, 138] }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Liabilities & Equity', 'Balance']],
      body: [
        ...liabilities.map(l => [l.accountCode, `$${Math.abs(l.balance).toLocaleString()}`]),
        ...equity.map(e => [e.accountCode, `$${Math.abs(e.balance).toLocaleString()}`]),
        [{ content: 'Total Liabilities & Equity', styles: { fontStyle: 'bold' } }, `$${totalLiabilitiesAndEquity.toLocaleString()}`]
      ],
      headStyles: { fillColor: [31, 41, 55] }
    });

    doc.save("Balance_Sheet.pdf");
  };

  if (loading) return <div className="text-center p-10">Loading Financial Position...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={32} color="#1e3a8a" /> Balance Sheet
          </h1>
          <p style={{ color: '#64748b', margin: '5px 0' }}>Financial position as of {new Date().toLocaleDateString()}</p>
        </div>
        <button onClick={downloadPDF} style={{ background: '#1e3a8a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Export PDF
        </button>
      </div>

      {/* Equation Check Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>TOTAL ASSETS</span>
          <h2 style={{ margin: '5px 0', color: '#1e3a8a' }}>${totalAssets.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={40} color={totalAssets === totalLiabilitiesAndEquity ? "#10b981" : "#f59e0b"} />
          <div style={{ marginLeft: '10px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>EQUATION STATUS</p>
            <p style={{ margin: 0, color: totalAssets === totalLiabilitiesAndEquity ? "#059669" : "#d97706" }}>
              {totalAssets === totalLiabilitiesAndEquity ? "Balanced" : "Out of Balance"}
            </p>
          </div>
        </div>
        <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>LIABILITIES + EQUITY</span>
          <h2 style={{ margin: '5px 0', color: '#1e293b' }}>${totalLiabilitiesAndEquity.toLocaleString()}</h2>
        </div>
      </div>

      {/* Table Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Assets Column */}
        <div>
          <h3 style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '10px' }}>Assets</h3>
          {assets.map(item => (
            <div key={item.accountCode} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>{item.accountCode}</span>
              <span style={{ fontWeight: '600' }}>${item.balance.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', marginTop: '10px', fontSize: '18px', fontWeight: 'bold', borderTop: '2px double #1e3a8a' }}>
            <span>Total Assets</span>
            <span>${totalAssets.toLocaleString()}</span>
          </div>
        </div>

        {/* Liabilities & Equity Column */}
        <div>
          <h3 style={{ borderBottom: '2px solid #1f2937', paddingBottom: '10px' }}>Liabilities & Equity</h3>
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginTop: '15px' }}>LIABILITIES</p>
          {liabilities.map(item => (
            <div key={item.accountCode} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>{item.accountCode}</span>
              <span>${Math.abs(item.balance).toLocaleString()}</span>
            </div>
          ))}
          
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginTop: '25px' }}>EQUITY</p>
          {equity.map(item => (
            <div key={item.accountCode} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>{item.accountCode}</span>
              <span>${Math.abs(item.balance).toLocaleString()}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', marginTop: '10px', fontSize: '18px', fontWeight: 'bold', borderTop: '2px double #1f2937' }}>
            <span>Total L & E</span>
            <span>${totalLiabilitiesAndEquity.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;