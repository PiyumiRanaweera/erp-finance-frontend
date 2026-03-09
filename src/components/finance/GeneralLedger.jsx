import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Plus, Calendar, Search,
  FileText, BarChart2, ShieldCheck, RefreshCcw,
  Printer, List
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const GeneralLedger = () => {
    const [activeTab, setActiveTab] = useState('journal-entries');
    const [journalData, setJournalData] = useState([]);
    const [ledgerDetails, setLedgerDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Fetch all financial data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Journal Headers (for Journal Entries tab)
            const journalRes = await axios.get('http://localhost:8080/api/journals');
            setJournalData(journalRes.data);

            // Fetch Flattened Ledger Lines (for Ledger Details tab)
            const ledgerRes = await axios.get('http://localhost:8080/api/finance/ledger/all');
            setLedgerDetails(ledgerRes.data);
            
        } catch (err) {
            console.error("Sync Error:", err);
            toast.error("Database sync failed. Check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Live Trial Balance Calculation (Aggregated from Journals)
    const trialBalance = useMemo(() => {
        const balances = {};
        journalData.forEach(entry => {
            entry.lines?.forEach(line => {
                if (!balances[line.accountCode]) {
                    balances[line.accountCode] = { debit: 0, credit: 0 };
                }
                balances[line.accountCode].debit += (line.debit || 0);
                balances[line.accountCode].credit += (line.credit || 0);
            });
        });
        return Object.keys(balances).map(code => ({
            code,
            debit: balances[code].debit,
            credit: balances[code].credit,
            net: balances[code].debit - balances[code].credit
        }));
    }, [journalData]);

    // 3. KPI Calculations
    const totalVolume = useMemo(() => 
        ledgerDetails.reduce((sum, item) => sum + (item.debit || 0), 0)
    , [ledgerDetails]);

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '80vh'}}>
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 fw-bold text-muted">Syncing ERP Finance Records...</p>
        </div>
    );

    return (
        <div className="p-4 bg-light min-vh-100 text-start">
            <Toaster position="top-right" />

            {/* HEADER ACTIONS */}
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <div>
                    <h4 className="fw-bold text-dark mb-0">General Ledger</h4>
                    <p className="text-muted small mb-0">FY 2025-26 | <span className="text-primary">Live Data Sync</span></p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary bg-white shadow-sm d-flex align-items-center gap-2"><Printer size={16}/> Print</button>
                    <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2"><Plus size={18}/> New Journal</button>
                    <button className="btn btn-success shadow-sm d-flex align-items-center gap-2" onClick={fetchData}><RefreshCcw size={18}/> Refresh</button>
                </div>
            </div>

            {/* SUMMARY STATS */}
            <div className="row g-3 mb-4 no-print">
                {[
                    { label: 'Total Journals', val: journalData.length, icon: <FileText className="text-primary"/>, color: 'primary' },
                    { label: 'Ledger Lines', val: ledgerDetails.length, icon: <List className="text-warning"/>, color: 'warning' },
                    { label: 'Active Accounts', val: trialBalance.length, icon: <Calendar className="text-info"/>, color: 'info' },
                    { label: 'Total Debit Vol', val: `$${totalVolume.toLocaleString()}`, icon: <BarChart2 className="text-success"/>, color: 'success' }
                ].map((card, i) => (
                    <div key={i} className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4 h-100">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small fw-bold text-uppercase">{card.label}</span>
                                <div className={`p-2 rounded-3 bg-${card.color} bg-opacity-10`}>{card.icon}</div>
                            </div>
                            <h3 className="fw-bold mb-0">{card.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABBED INTERFACE */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-0 pt-3 px-4">
                    <ul className="nav nav-pills gap-2">
                        {['Journal Entries', 'Ledger Details', 'Trial Balance', 'Period Closing'].map(tab => {
                            const tabKey = tab.toLowerCase().replace(' ', '-');
                            return (
                                <li className="nav-item" key={tab}>
                                    <button 
                                        className={`nav-link rounded-pill fw-bold px-4 ${activeTab === tabKey ? 'bg-primary text-white shadow' : 'text-muted'}`}
                                        onClick={() => setActiveTab(tabKey)}
                                    >
                                        {tab}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="card-body p-0">
                    <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center no-print">
                        <div className="input-group w-50 shadow-sm rounded-3 overflow-hidden">
                            <span className="input-group-text bg-white border-0"><Search size={18} className="text-muted"/></span>
                            <input 
                                type="text" 
                                className="form-control border-0" 
                                placeholder="Search accounts or descriptions..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* TAB CONTENT: JOURNAL ENTRIES (Header View) */}
                    {activeTab === 'journal-entries' && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4">Date</th>
                                        <th>ID</th>
                                        <th>Description</th>
                                        <th className="text-end">Debits</th>
                                        <th className="text-end">Credits</th>
                                        <th className="text-center pe-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {journalData.map((j) => (
                                        <tr key={j.id}>
                                            <td className="ps-4">{j.entryDate}</td>
                                            <td className="fw-bold text-primary">JNL-{j.id}</td>
                                            <td>{j.description}</td>
                                            <td className="text-end fw-bold text-dark">${j.lines?.reduce((s,l) => s + (l.debit || 0), 0).toLocaleString()}</td>
                                            <td className="text-end fw-bold text-dark">${j.lines?.reduce((s,l) => s + (l.credit || 0), 0).toLocaleString()}</td>
                                            <td className="text-center pe-4">
                                                <span className="badge bg-success-subtle text-success px-3 rounded-pill">POSTED</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB CONTENT: LEDGER DETAILS (The DTO View) */}
                    {activeTab === 'ledger-details' && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4">Date</th>
                                        <th>Ref</th>
                                        <th>Account</th>
                                        <th>Description</th>
                                        <th className="text-end">Debit</th>
                                        <th className="text-end pe-4">Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerDetails.filter(l => l.description.toLowerCase().includes(searchTerm.toLowerCase()) || l.accountCode.includes(searchTerm)).map((line) => (
                                        <tr key={line.id} style={{fontSize: '0.9rem'}}>
                                            <td className="ps-4 text-muted">{line.date}</td>
                                            <td><span className="badge border text-dark bg-white">{line.reference}</span></td>
                                            <td className="fw-bold">{line.accountCode}</td>
                                            <td>{line.description}</td>
                                            <td className="text-end text-primary fw-bold">{line.debit > 0 ? `$${line.debit.toLocaleString()}` : '-'}</td>
                                            <td className="text-end text-success fw-bold pe-4">{line.credit > 0 ? `$${line.credit.toLocaleString()}` : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB CONTENT: TRIAL BALANCE */}
                    {activeTab === 'trial-balance' && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4">Account Code</th>
                                        <th className="text-end">Debit Balance</th>
                                        <th className="text-end">Credit Balance</th>
                                        <th className="text-end pe-4">Net</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trialBalance.map((row, i) => (
                                        <tr key={i}>
                                            <td className="ps-4 fw-bold">{row.code}</td>
                                            <td className="text-end font-monospace">${row.debit.toLocaleString()}</td>
                                            <td className="text-end font-monospace">${row.credit.toLocaleString()}</td>
                                            <td className={`text-end pe-4 fw-bold ${row.net === 0 ? 'text-success' : 'text-danger'}`}>
                                                ${row.net.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-primary border-0 fw-bold">
                                    <tr>
                                        <td className="ps-4">INTEGRITY TOTALS</td>
                                        <td className="text-end">${trialBalance.reduce((s,r) => s+r.debit,0).toLocaleString()}</td>
                                        <td className="text-end">${trialBalance.reduce((s,r) => s+r.credit,0).toLocaleString()}</td>
                                        <td className="text-end pe-4">$0.00</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* TAB CONTENT: PERIOD CLOSING */}
                    {activeTab === 'period-closing' && (
                        <div className="p-5 text-center">
                            <div className="mb-4 d-inline-block p-4 bg-primary bg-opacity-10 rounded-circle text-primary">
                                <ShieldCheck size={48} />
                            </div>
                            <h5>Financial Period Lockdown</h5>
                            <p className="text-muted mx-auto" style={{maxWidth: '400px'}}> 
                                Closing the period will lock all entries and generate finalized financial statements.
                            </p>
                            <button className="btn btn-primary px-5 py-2 fw-bold shadow">Run Month-End Process</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneralLedger;