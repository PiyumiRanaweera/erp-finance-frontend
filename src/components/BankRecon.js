import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Upload, CheckCircle, AlertCircle, PlusCircle, 
  RefreshCw, Landmark, Search, History, 
  TrendingUp, ArrowRightLeft, ShieldCheck 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const BankReconciliation = () => {
  const [bankStatement, setBankStatement] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('reconciliation');

  // 1. Fetch live ledger balances from your Spring Boot backend
  const fetchLedger = () => {
    const loadToast = toast.loading("Syncing with Ledger...");
    axios.get('http://localhost:8080/api/accounts/balances')
      .then(res => {
        setLedgerEntries(res.data);
        toast.success("Ledger Synchronized", { id: loadToast });
      })
      .catch(err => {
        console.error("Error fetching ledger:", err);
        toast.error("Could not load ledger data", { id: loadToast });
      });
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // 2. Automated Statement Ingestion
  const handleFileUpload = () => {
    const loadingToast = toast.loading("Ingesting Bank Statement...");
    
    // Simulating document parsing delay
    setTimeout(() => {
      const simulatedCSV = [
        { id: 'TXN-101', date: '2023-10-01', description: 'Office Rent Payment', amount: 2500.00 },
        { id: 'TXN-102', date: '2023-10-02', description: 'Client Project Alpha', amount: 1200.00 },
        { id: 'TXN-103', date: '2023-10-03', description: 'Bank Service Fee', amount: 45.00 },
        { id: 'TXN-104', date: '2023-10-04', description: 'Unknown Utility Bill', amount: 135.50 },
      ];
      setBankStatement(simulatedCSV);
      performReconciliation(simulatedCSV);
      toast.success(`${simulatedCSV.length} Transactions Ingested`, { id: loadingToast });
    }, 800);
  };

  // 3. Automated Matching Engine Logic
  const performReconciliation = (statement) => {
    const results = statement.map(bankRow => {
      // Find if an exact balance exists in the Ledger (DB)
      const exactMatch = ledgerEntries.find(ledger => 
        Math.abs(ledger.balance) === Math.abs(bankRow.amount)
      );

      if (exactMatch) {
        return { ...bankRow, status: 'MATCHED', color: '#2e7d32', account: exactMatch.accountCode };
      } else {
        return { ...bankRow, status: 'UNMATCHED', color: '#d32f2f', account: 'N/A' };
      }
    });
    setMatches(results);
  };

  // 4. Quick-Post Adjustment (Creates Journal Entry in Database)
  const handleQuickPost = async (row) => {
    setIsProcessing(true);
    const payload = {
      description: `Bank Adj: ${row.description}`,
      transactionDate: new Date().toISOString().split('T')[0],
      status: "POSTED",
      lines: [
        { accountCode: '5000', debit: row.amount, credit: 0 },
        { accountCode: '1000', debit: 0, credit: row.amount } 
      ]
    };

    try {
      const response = await axios.post('http://localhost:8080/api/journals', payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(`Entry Created: ${row.description}`);
        fetchLedger(); 
        setMatches(prev => prev.map(m => m.id === row.id ? {...m, status: 'MATCHED', color: '#2e7d32'} : m));
      }
    } catch (error) {
      toast.error(error.response?.data || "Backend Posting Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats Calculations
  const unmatchedCount = matches.filter(m => m.status === 'UNMATCHED').length;
  const totalBankBalance = bankStatement.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-4 bg-light min-vh-100 text-start">
      <Toaster position="top-right" />
      
      {/* 1. Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-navy mb-0">Bank & Reconciliation</h4>
          <p className="text-muted small">Match bank statements with your General Ledger records</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={fetchLedger} className="btn btn-white border shadow-sm rounded-3">
            <RefreshCw size={18} className="text-muted" />
          </button>
          <button className="btn btn-navy px-4 shadow-sm d-flex align-items-center gap-2">
            <TrendingUp size={18}/> Reconcile Period
          </button>
        </div>
      </div>

      {/* 2. Top Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Bank Balance', val: `$${totalBankBalance.toLocaleString()}`, icon: <Landmark className="text-primary"/>, sub: 'Live Feed' },
          { label: 'Unmatched Items', val: unmatchedCount, icon: <AlertCircle className="text-danger"/>, sub: 'Needs adjustment' },
          { label: 'Last Sync', val: 'Oct 25, 2023', icon: <History className="text-success"/>, sub: 'Successful' },
          { label: 'Match Accuracy', val: bankStatement.length > 0 ? `${((matches.filter(m => m.status === 'MATCHED').length / matches.length) * 100).toFixed(0)}%` : '0%', icon: <ShieldCheck className="text-info"/>, sub: 'Engine Score' }
        ].map((card, i) => (
          <div key={i} className="col-md-3">
            <div className="card border-0 shadow-sm p-3 rounded-4">
              <div className="d-flex justify-content-between mb-2">
                <small className="text-uppercase fw-bold text-muted small-text">{card.label}</small>
                {card.icon}
              </div>
              <h3 className="fw-bold mb-0">{card.val}</h3>
              <small className="text-muted" style={{fontSize: '11px'}}>{card.sub}</small>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Drop Zone */}
      <div 
        onClick={handleFileUpload}
        className="card border-0 shadow-sm mb-4 rounded-4 p-5 text-center transition-all"
        style={{ cursor: 'pointer', border: '2px dashed #e0e0e0', backgroundColor: 'white' }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9ff'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
      >
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
          <Upload size={32} className="text-primary" />
        </div>
        <h5 className="fw-bold text-navy">Upload Bank Statement</h5>
        <p className="text-muted small">Drag and drop your CSV or Excel file to begin the matching process</p>
        {bankStatement.length > 0 && (
          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill mt-2">
            <CheckCircle size={14} className="me-1"/> {bankStatement.length} Entries Ready
          </span>
        )}
      </div>

      {/* 4. Matching Engine Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white p-3 border-bottom-0 d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3">
                <button className={`btn btn-sm fw-bold ${activeTab === 'reconciliation' ? 'btn-navy' : 'text-muted'}`} onClick={() => setActiveTab('reconciliation')}>Reconciliation</button>
                <button className={`btn btn-sm fw-bold ${activeTab === 'history' ? 'btn-navy' : 'text-muted'}`} onClick={() => setActiveTab('history')}>Match History</button>
            </div>
            <div className="input-group w-25">
                <span className="input-group-text bg-light border-0"><Search size={14}/></span>
                <input type="text" className="form-control form-control-sm bg-light border-0" placeholder="Search..."/>
            </div>
        </div>

        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr className="text-muted small text-uppercase">
              <th className="ps-4">Description</th>
              <th>Bank Amount</th>
              <th>Reference</th>
              <th>Status</th>
              <th className="text-center">Engine Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">No statement data found. Upload a document to start matching.</td>
              </tr>
            ) : matches.map((row, i) => (
              <tr key={i}>
                <td className="ps-4 fw-bold">{row.description}</td>
                <td className="font-monospace fw-bold text-navy">${row.amount.toFixed(2)}</td>
                <td className="text-muted small">REF-{row.id}</td>
                <td>
                  <span className="badge rounded-pill px-3" style={{ backgroundColor: `${row.color}15`, color: row.color }}>
                    {row.status}
                  </span>
                </td>
                <td className="text-center pe-4">
                  {row.status === 'UNMATCHED' ? (
                    <button 
                      onClick={() => handleQuickPost(row)}
                      disabled={isProcessing}
                      className="btn btn-sm btn-navy d-flex align-items-center gap-2 mx-auto"
                    >
                      <PlusCircle size={14}/> Auto-Adjust
                    </button>
                  ) : (
                    <div className="text-success small fw-bold d-flex align-items-center justify-content-center gap-1">
                      <CheckCircle size={14}/> Verified in DB
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BankReconciliation;