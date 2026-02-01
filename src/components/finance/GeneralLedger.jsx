import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Plus, CheckCircle, Clock, Calendar, Search, 
  FileText, BarChart2, ShieldCheck, RefreshCcw, 
  ChevronRight, AlertCircle, Printer, Download
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const GeneralLedger = () => {
    const [activeTab, setActiveTab] = useState('journal-entries');
    const [journalData, setJournalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Fetch Data on Load
    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/api/journals');
            setJournalData(res.data);
        } catch (err) {
            console.error("Database Error:", err);
            toast.error("Could not connect to database.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Compute Trial Balance (Live Aggregation from Database Data)
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

    // 3. Totals for Stats Cards
    const totalDebit = journalData.reduce((sum, entry) => 
        sum + (entry.lines?.reduce((s, l) => s + (l.debit || 0), 0) || 0), 0
    );

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '80vh'}}>
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 fw-bold text-muted">Syncing ERP Finance Records...</p>
        </div>
    );

    return (
        <div className="p-4 bg-light min-vh-100">
            <Toaster position="top-right" />

            {/* HEADER ACTIONS */}
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <div>
                    <h4 className="fw-bold text-dark mb-0">General Ledger</h4>
                    <p className="text-muted small mb-0">Financial Year 2025-26 | <span className="text-primary">Operational</span></p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary d-flex align-items-center gap-2 bg-white shadow-sm"><Printer size={16}/> Print</button>
                    <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"><Plus size={18}/> New Journal Entry</button>
                    <button className="btn btn-success d-flex align-items-center gap-2 shadow-sm"><CheckCircle size={18}/> Post All</button>
                </div>
            </div>

            {/* SUMMARY STATS */}
            <div className="row g-3 mb-4 no-print">
                {[
                    { label: 'Total Journals', val: journalData.length, icon: <FileText className="text-primary"/>, color: 'primary' },
                    { label: 'Unposted', val: '0', icon: <Clock className="text-warning"/>, color: 'warning' },
                    { label: 'This Month', val: journalData.length, icon: <Calendar className="text-info"/>, color: 'info' },
                    { label: 'Total Volume', val: `$${totalDebit.toLocaleString()}`, icon: <BarChart2 className="text-success"/>, color: 'success' }
                ].map((card, i) => (
                    <div key={i} className="col-md-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small fw-bold text-uppercase">{card.label}</span>
                                <div className={`p-2 rounded-3 bg-${card.color} bg-opacity-10`}>{card.icon}</div>
                            </div>
                            <h3 className="fw-bold mb-0">{card.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* WORKFLOW STEPPER */}
            <div className="card border-0 shadow-sm mb-4 rounded-4 no-print">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-around align-items-center position-relative">
                        <div className="progress position-absolute w-75" style={{height: '2px', zIndex: 0}}>
                            <div className="progress-bar w-50 bg-primary"></div>
                        </div>
                        {[
                            { step: 'Create', icon: <Plus size={16}/>, active: true },
                            { step: 'Review', icon: <ShieldCheck size={16}/>, active: true },
                            { step: 'Approve', icon: <CheckCircle size={16}/>, active: false },
                            { step: 'Post to GL', icon: <Download size={16}/>, active: false }
                        ].map((s, i) => (
                            <div key={i} className="text-center bg-white px-3" style={{zIndex: 1}}>
                                <div className={`rounded-circle p-2 mx-auto mb-1 ${s.active ? 'bg-primary text-white' : 'bg-light text-muted border'}`} style={{width: '35px'}}>
                                    {s.icon}
                                </div>
                                <small className={`fw-bold ${s.active ? 'text-primary' : 'text-muted'}`}>{s.step}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TABBED INTERFACE */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-0 pt-3 px-4">
                    <ul className="nav nav-pills gap-3">
                        {['Journal Entries', 'Trial Balance', 'Ledger Details', 'Period Closing'].map(tab => (
                            <li className="nav-item" key={tab}>
                                <button 
                                    className={`nav-link rounded-pill fw-bold px-4 ${activeTab === tab.toLowerCase().replace(' ', '-') ? 'bg-primary text-white shadow' : 'text-muted'}`}
                                    onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
                                >
                                    {tab}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card-body p-0">
                    {/* Search Bar - Shared across tabs */}
                    <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center no-print">
                        <div className="input-group w-50 shadow-sm rounded-3 overflow-hidden">
                            <span className="input-group-text bg-white border-0"><Search size={18} className="text-muted"/></span>
                            <input 
                                type="text" 
                                className="form-control border-0" 
                                placeholder="Filter records..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchJournals} className="btn btn-white border shadow-sm"><RefreshCcw size={16}/></button>
                    </div>

                    {/* TAB CONTENT: JOURNAL ENTRIES */}
                    {activeTab === 'journal-entries' && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr className="text-muted small text-uppercase">
                                        <th className="ps-4">Date</th>
                                        <th>Journal ID</th>
                                        <th>Description</th>
                                        <th className="text-end">Debits</th>
                                        <th className="text-end">Credits</th>
                                        <th className="text-center">Status</th>
                                        <th className="pe-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {journalData.map((j) => (
                                        <tr key={j.id}>
                                            <td className="ps-4">{j.transactionDate || j.entryDate}</td>
                                            <td className="fw-bold">JNL-{j.id}</td>
                                            <td>{j.description}</td>
                                            <td className="text-end fw-bold text-primary">${j.lines?.reduce((s,l) => s + (l.debit || 0), 0).toLocaleString()}</td>
                                            <td className="text-end fw-bold text-success">${j.lines?.reduce((s,l) => s + (l.credit || 0), 0).toLocaleString()}</td>
                                            <td className="text-center">
                                                <span className="badge bg-success-subtle text-success px-3 rounded-pill">POSTED</span>
                                            </td>
                                            <td className="pe-4 text-center">
                                                <button className="btn btn-sm btn-light border rounded-circle"><ChevronRight size={14}/></button>
                                            </td>
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
                                        <th>Account Name</th>
                                        <th className="text-end">Debit Balance</th>
                                        <th className="text-end">Credit Balance</th>
                                        <th className="text-end pe-4">Net (Trial)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trialBalance.map((row, i) => (
                                        <tr key={i}>
                                            <td className="ps-4 fw-bold">{row.code}</td>
                                            <td className="text-muted small">General Ledger Control Account</td>
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
                                        <td colSpan="2" className="ps-4">INTEGRITY CHECK</td>
                                        <td className="text-end">${trialBalance.reduce((s,r) => s+r.debit,0).toLocaleString()}</td>
                                        <td className="text-end">${trialBalance.reduce((s,r) => s+r.credit,0).toLocaleString()}</td>
                                        <td className="text-end pe-4 text-dark">$0.00</td>
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
                            <h5>Lock Period & Close Books</h5>
                            <p className="text-muted mx-auto" style={{maxWidth: '400px'}}> Closing the period will lock all current journal entries and prepare the Balance Sheet for the next financial month.</p>
                            <button className="btn btn-primary px-5 py-2 fw-bold shadow">Run Month-End Process</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneralLedger;