import React, { useState, useEffect } from 'react'; // Added useEffect import
import { Percent, Calculator, ShieldCheck, PieChart, Landmark, RefreshCw } from 'lucide-react';
import axios from 'axios';

const TaxManagement = () => {
  // 1. Add this function inside the TaxManagement component
const handleRecordLiability = async () => {
  if (!calcTaxAmount || calcTaxAmount <= 0) {
    alert("Please enter a valid amount first.");
    return;
  }

  const payload = {
    description: `Tax Provision: ${taxRate}% on $${netAmount}`,
    status: "POSTED",
    lines: [
      { 
        accountName: "Tax Expense", // Usually a 7xxx code
        debit: calcTaxAmount, 
        credit: 0 
      },
      { 
        accountName: "VAT Payable", // Usually a 2xxx code
        debit: 0, 
        credit: calcTaxAmount 
      }
    ]
  };

  try {
    await axios.post('http://localhost:8080/api/accounts/journals', payload);
    alert("Tax Liability successfully recorded in Ledger!");
    fetchTaxData(); // Refresh the "Live Tax Liability" card
  } catch (error) {
    console.error("Failed to record tax:", error);
    alert("Error connecting to backend.");
  }
};

// 2. Update the button at the bottom of the Estimator section:
<button 
  onClick={handleRecordLiability} // Attach the function here
  style={{ 
    width: '100%', marginTop: '20px', padding: '12px', borderRadius: '8px', 
    background: '#1a237e', color: 'white', border: 'none', fontWeight: 'bold', 
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
  }}
>
  <Landmark size={18} /> Record as Liability
</button>
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [netAmount, setNetAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(15);

  // 1. Fetch live ledger data on component mount
  useEffect(() => {
    fetchTaxData();
  }, []);

  const fetchTaxData = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/accounts/balances')
      .then(res => {
        setLedgerData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tax base data", err);
        setLoading(false);
      });
  };

  // 2. Calculate Live Liability from PostgreSQL Data
  // Sums all expenses (Account Code starts with '7')
  const totalExpenses = ledgerData
    .filter(item => item.accountCode.startsWith('7'))
    .reduce((sum, item) => sum + Math.abs(item.balance), 0);

  const liveTaxLiability = totalExpenses * (taxRate / 100);

  // 3. Calculator Logic (Single declaration)
  const calcTaxAmount = (netAmount * taxRate) / 100;
  const calcTotalAmount = parseFloat(netAmount || 0) + calcTaxAmount;

  // Mock data for tax history table
  const taxHistory = [
    { period: "Q4 2025", type: "VAT", amount: 12500, status: "Paid", date: "2025-12-31" },
    { period: "Q3 2025", type: "VAT", amount: 10800, status: "Paid", date: "2025-09-30" },
    { period: "Q2 2025", type: "VAT", amount: 9400, status: "Overdue", date: "2025-06-30" },
  ];

  return (
    <div style={{ padding: '30px', color: '#1e293b' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <div style={{ background: '#1a237e', padding: '8px', borderRadius: '8px' }}>
              <Percent color="white" size={24} />
            </div>
            Tax & Compliance Center
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Monitor live liabilities and calculate localized GST/VAT filings.</p>
        </div>
        <button 
          onClick={fetchTaxData}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600' }}
        >
          <RefreshCw size={18} style={{ animation: loading ? 'spin 2s linear infinite' : 'none' }} /> 
          Sync Ledger
        </button>
      </div>

      {/* Top Row: Live Stats from DB */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Live Tax Liability</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1a237e', margin: '10px 0' }}>
            ${liveTaxLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '12px' }}>
            Based on current ledger expenses
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Tax Credit Earned</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669', margin: '10px 0' }}>$1,120.50</div>
          <div style={{ background: '#f1f5f9', height: '6px', borderRadius: '3px', width: '100%' }}>
            <div style={{ background: '#059669', height: '100%', borderRadius: '3px', width: '65%' }}></div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)', padding: '20px', borderRadius: '16px', color: 'white' }}>
          <div style={{ opacity: 0.8, fontSize: '13px', fontWeight: '600' }}>COMPLIANCE SCORE</div>
          <div style={{ fontSize: '28px', fontWeight: '800', margin: '10px 0' }}>98%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
            <ShieldCheck size={16} /> All accounts reconciled
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        
        {/* Left Column: Tax History */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold' }}>Recent Filings & Obligations</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', fontSize: '12px', color: '#64748b' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left' }}>PERIOD</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>TYPE</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>AMOUNT</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {taxHistory.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px', fontSize: '14px' }}>{item.period}</td>
                  <td style={{ padding: '15px', fontSize: '14px' }}>{item.type}</td>
                  <td style={{ padding: '15px', fontSize: '14px', fontWeight: 'bold' }}>${item.amount.toLocaleString()}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                      background: item.status === 'Paid' ? '#dcfce7' : '#fee2e2',
                      color: item.status === 'Paid' ? '#166534' : '#991b1b'
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estimator */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0', fontSize: '18px' }}>
            <Calculator size={20} color="#1a237e" /> Smart Tax Estimator
          </h3>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>TRANSACTION AMOUNT</label>
          <input 
            type="number" 
            onChange={(e) => setNetAmount(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px' }} 
          />
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>RATE</label>
          <select 
            onChange={(e) => setTaxRate(Number(e.target.value))}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}
          >
            <option value="15">VAT Standard (15%)</option>
            <option value="5">GST Reduced (5%)</option>
          </select>
          <div style={{ background: '#f4f7fe', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Tax:</span><strong>${calcTaxAmount.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800', borderTop: '2px solid #dbeafe', paddingTop: '10px' }}>
              <span>Total:</span><strong>${calcTotalAmount.toFixed(2)}</strong>
            </div>
          </div>
          <button style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '8px', background: '#1a237e', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            <Landmark size={18} style={{ marginRight: '8px' }} /> Record as Liability
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxManagement;