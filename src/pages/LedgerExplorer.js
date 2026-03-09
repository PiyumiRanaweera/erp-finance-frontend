import React, { useState } from 'react';
import axios from 'axios';
import { Search, ArrowLeft, Download } from 'lucide-react';

const LedgerExplorer = ({ onBack }) => {
    const [accountCode, setAccountCode] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearching(true);
        try {
            // Updated to match the endpoint we set in FinancialController
            const res = await axios.get(`http://localhost:8080/api/finance/ledger/search?accountCode=${accountCode}`);
            setResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Search failed", err);
            setResults([]);
        } finally {
            setSearching(false);
        }
    };

    // Calculate the running balance
    const totalDebit = results.reduce((sum, r) => sum + (r.debit || 0), 0);
    const totalCredit = results.reduce((sum, r) => sum + (r.credit || 0), 0);

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 text-start animate-fade-in bg-white">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button onClick={onBack} className="btn btn-link text-muted p-0">
                    <ArrowLeft size={20}/>
                </button>
                <h5 className="fw-bold text-navy mb-0">Account Explorer (Drill-Down)</h5>
                <button className="btn btn-outline-secondary btn-sm">
                    <Download size={16}/> Export PDF
                </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="row g-2 mb-4">
                <div className="col-md-8">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <Search size={18} className="text-muted"/>
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-start-0 ps-0" 
                            placeholder="Enter Account Code (e.g., 1000, 4001)" 
                            value={accountCode}
                            onChange={(e) => setAccountCode(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <button type="submit" className="btn btn-primary w-100" disabled={searching}>
                        {searching ? 'Analyzing...' : 'Search Ledger'}
                    </button>
                </div>
            </form>

            {/* Results Section */}
            {results.length > 0 ? (
                <div className="table-responsive">
                    <div className="alert alert-info py-2 d-flex justify-content-between align-items-center mb-3">
                        <span className="small fw-bold">Analysis for Account: {accountCode}</span>
                        <span className="small fw-bold">
                            Current Net Balance: ${(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    
                    <table className="table table-sm align-middle">
                        <thead className="table-light">
                            <tr className="extra-small text-muted text-uppercase">
                                <th>Date</th>
                                <th>Reference</th>
                                <th>Dept</th>
                                <th>Description</th>
                                <th className="text-end">Debit</th>
                                <th className="text-end">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((row, i) => (
                                <tr key={i} className="small">
                                    <td className="text-nowrap">{row.date}</td>
                                    <td className="text-muted small">{row.reference || 'N/A'}</td>
                                    <td><span className="badge bg-light text-navy border">{row.dept}</span></td>
                                    <td>{row.description}</td>
                                    <td className="text-end text-success">
                                        {row.debit > 0 ? `$${row.debit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="text-end text-danger">
                                        {row.credit > 0 ? `$${row.credit.toLocaleString()}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !searching && accountCode && (
                    <div className="text-center py-5 text-muted">
                        <p>No transactions found for account <strong>{accountCode}</strong>.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default LedgerExplorer;