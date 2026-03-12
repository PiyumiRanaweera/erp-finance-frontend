import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus, Calendar, Search,
  FileText, BarChart2, ShieldCheck, RefreshCcw,
  Printer, List
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../api/client';

const GeneralLedger = () => {
    const [activeTab, setActiveTab] = useState('journal-entries');
    const [journalData, setJournalData] = useState([]);
    const [ledgerDetails, setLedgerDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Month-End state
    const now = new Date();
    const [closeYear, setCloseYear] = useState(now.getFullYear());
    const [closeMonth, setCloseMonth] = useState(now.getMonth() + 1);
    const [closing, setClosing] = useState(false);
    const [closeResult, setCloseResult] = useState(null);
    const [closeHistory, setCloseHistory] = useState([]);
    const [periodStatus, setPeriodStatus] = useState(null);

    // 1. Fetch all financial data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Journal Headers (for Journal Entries tab)
            const journalRes = await api.get('/api/journals');
            setJournalData(journalRes.data);

            // Fetch Flattened Ledger Lines (for Ledger Details tab)
            const ledgerRes = await api.get('/api/finance/ledger/all');
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

    // Month-End: fetch period status when year/month changes
    useEffect(() => {
        if (activeTab === 'period-closing') {
            fetchPeriodStatus();
            fetchCloseHistory();
        }
    }, [activeTab, closeYear, closeMonth]);

    const fetchPeriodStatus = async () => {
        try {
            const res = await api.get(`/api/month-end/status?year=${closeYear}&month=${closeMonth}`);
            setPeriodStatus(res.data);
        } catch { setPeriodStatus(null); }
    };

    const fetchCloseHistory = async () => {
        try {
            const res = await api.get('/api/month-end/history');
            setCloseHistory(res.data);
        } catch { setCloseHistory([]); }
    };

    const handleRunMonthEnd = async () => {
        if (!window.confirm(`Are you sure you want to close the period ${closeMonth}/${closeYear}? This will lock all posted entries and create closing journal entries.`)) return;
        setClosing(true);
        setCloseResult(null);
        try {
            const res = await api.post('/api/month-end/close', {
                year: closeYear,
                month: closeMonth,
                closedBy: 'Admin User'
            });
            setCloseResult(res.data);
            toast.success(`Period ${res.data.periodLabel} closed successfully!`);
            fetchPeriodStatus();
            fetchCloseHistory();
            fetchData(); // refresh journal data to show locked status
        } catch (err) {
            const msg = err.response?.data?.error || 'Month-end close failed.';
            toast.error(msg);
        } finally {
            setClosing(false);
        }
    };

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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
                                                <span className={`badge px-3 rounded-pill ${
                                                    j.status === 'CLOSED' ? 'bg-danger-subtle text-danger' :
                                                    j.status === 'CANCELLED' ? 'bg-warning-subtle text-warning' :
                                                    'bg-success-subtle text-success'
                                                }`}>{j.status || 'POSTED'}</span>
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
                        <div className="p-4">
                            {/* Period Selector */}
                            <div className="row justify-content-center mb-4">
                                <div className="col-md-8">
                                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                                        <div className="mb-3 d-inline-block mx-auto p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                                            <ShieldCheck size={40} />
                                        </div>
                                        <h5 className="fw-bold">Financial Period Lockdown</h5>
                                        <p className="text-muted small mb-4">
                                            Closing the period will lock all posted entries and generate a closing journal entry transferring net income to Retained Earnings.
                                        </p>

                                        {/* Year/Month Selector */}
                                        <div className="d-flex justify-content-center gap-3 mb-4">
                                            <select className="form-select w-auto shadow-sm" value={closeYear} onChange={e => setCloseYear(Number(e.target.value))}>
                                                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                            <select className="form-select w-auto shadow-sm" value={closeMonth} onChange={e => setCloseMonth(Number(e.target.value))}>
                                                {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                            </select>
                                        </div>

                                        {/* Period Status Badge */}
                                        {periodStatus && (
                                            <div className="mb-3">
                                                {periodStatus.closed ? (
                                                    <span className="badge bg-danger-subtle text-danger px-4 py-2 rounded-pill fw-bold" style={{fontSize: '0.85rem'}}>
                                                        Period Already Closed
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-success-subtle text-success px-4 py-2 rounded-pill fw-bold" style={{fontSize: '0.85rem'}}>
                                                        Period Open — Ready to Close
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Run Button */}
                                        <button
                                            className="btn btn-primary px-5 py-2 fw-bold shadow"
                                            onClick={handleRunMonthEnd}
                                            disabled={closing || (periodStatus && periodStatus.closed)}
                                        >
                                            {closing ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                                            ) : (
                                                'Run Month-End Process'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Close Result Summary */}
                            {closeResult && (
                                <div className="row justify-content-center mb-4">
                                    <div className="col-md-8">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-4 border-success">
                                            <h6 className="fw-bold text-success mb-3">✓ Period Closed: {closeResult.periodLabel}</h6>
                                            <div className="row g-3">
                                                <div className="col-md-3">
                                                    <div className="text-muted small fw-bold text-uppercase">Revenue</div>
                                                    <div className="fw-bold text-success fs-5">${Number(closeResult.totalRevenue).toLocaleString()}</div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="text-muted small fw-bold text-uppercase">Expenses</div>
                                                    <div className="fw-bold text-danger fs-5">${Number(closeResult.totalExpenses).toLocaleString()}</div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="text-muted small fw-bold text-uppercase">Net Income</div>
                                                    <div className={`fw-bold fs-5 ${Number(closeResult.netIncome) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        ${Number(closeResult.netIncome).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="text-muted small fw-bold text-uppercase">Entries Locked</div>
                                                    <div className="fw-bold fs-5 text-primary">{closeResult.entriesLocked}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Close History Table */}
                            {closeHistory.length > 0 && (
                                <div className="row justify-content-center">
                                    <div className="col-md-10">
                                        <h6 className="fw-bold text-muted mb-3 text-uppercase small">Closing History</h6>
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0 bg-white rounded-4 overflow-hidden shadow-sm">
                                                <thead className="bg-light text-muted small text-uppercase">
                                                    <tr>
                                                        <th className="ps-4">Period</th>
                                                        <th className="text-end">Revenue</th>
                                                        <th className="text-end">Expenses</th>
                                                        <th className="text-end">Net Income</th>
                                                        <th className="text-center">Entries</th>
                                                        <th>Closed By</th>
                                                        <th className="pe-4">Closed At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {closeHistory.map((h) => (
                                                        <tr key={h.id}>
                                                            <td className="ps-4 fw-bold">{h.periodLabel}</td>
                                                            <td className="text-end text-success">${Number(h.totalRevenue).toLocaleString()}</td>
                                                            <td className="text-end text-danger">${Number(h.totalExpenses).toLocaleString()}</td>
                                                            <td className={`text-end fw-bold ${Number(h.netIncome) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                ${Number(h.netIncome).toLocaleString()}
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="badge bg-primary-subtle text-primary rounded-pill">{h.entriesLocked}</span>
                                                            </td>
                                                            <td>{h.closedBy}</td>
                                                            <td className="pe-4 text-muted small">{new Date(h.closedAt).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneralLedger;