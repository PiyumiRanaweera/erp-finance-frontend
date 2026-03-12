import React, { useState } from 'react';
import { Save, Plus, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

const JournalEntryForm = ({ onBack }) => {
    // 1. State initialized to match your Hotel Backend Model
    const [entry, setEntry] = useState({
        description: '',
        department: 'Rooms', // Default to Rooms
        referenceNo: '',    // For Folio or Invoice IDs
        entryDate: new Date().toISOString().split('T')[0],
        status: 'POSTED',
        lines: [
            { accountCode: '1000', accountCategory: 'ASSET', debit: 0, credit: 0 },
            { accountCode: '4000', accountCategory: 'REVENUE', debit: 0, credit: 0 }
        ]
    });

    // 2. Dynamic line management
    const addLine = () => {
        setEntry({
            ...entry,
            lines: [...entry.lines, { accountCode: '', accountCategory: 'REVENUE', debit: 0, credit: 0 }]
        });
    };

    const removeLine = (index) => {
        if (entry.lines.length <= 2) {
            toast.error("Double-entry requires at least two lines!");
            return;
        }
        const newLines = entry.lines.filter((_, i) => i !== index);
        setEntry({ ...entry, lines: newLines });
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...entry.lines];
        newLines[index][field] = value;
        setEntry({ ...entry, lines: newLines });
    };

    // 3. Calculation for Balance Validation
    const totalDebits = entry.lines.reduce((sum, line) => sum + parseFloat(line.debit || 0), 0);
    const totalCredits = entry.lines.reduce((sum, line) => sum + parseFloat(line.credit || 0), 0);
    const isBalanced = totalDebits === totalCredits && totalDebits > 0;

    // 4. Submit to Spring Boot Backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isBalanced) {
            toast.error("Entry out of balance! Debits must equal Credits.");
            return;
        }

        try {
            // Updated endpoint to match your @RequestMapping("/api") + @PostMapping("/finance/entries")
            await api.post('/api/finance/entries', entry);
            toast.success("Transaction Posted Successfully!");
            if (onBack) setTimeout(onBack, 1500); // Return to dashboard after success
        } catch (error) {
            console.error("Post failed:", error);
            toast.error("Failed to post entry. Check console.");
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-start animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={onBack} className="btn btn-outline-secondary btn-sm rounded-circle p-2">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h4 className="fw-bold text-navy mb-0">Post Hotel Transaction</h4>
                        <p className="text-muted small mb-0">General Ledger Recording</p>
                    </div>
                </div>
                {isBalanced && <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                    <CheckCircle2 size={14}/> In Balance
                </span>}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Header Section */}
                <div className="row g-3 mb-4 p-3 bg-light rounded-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Transaction Description</label>
                        <input type="text" placeholder="e.g. Daily Room Sales Summary" value={entry.description} 
                               onChange={(e) => setEntry({...entry, description: e.target.value})} required className="form-control" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted">Department</label>
                        <select className="form-select" value={entry.department} onChange={(e) => setEntry({...entry, department: e.target.value})}>
                            <option value="Rooms">Rooms</option>
                            <option value="F&B">Food & Beverage</option>
                            <option value="Spa">Spa & Wellness</option>
                            <option value="Laundry">Laundry Service</option>
                            <option value="Admin">Administration</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted">Reference No</label>
                        <input type="text" placeholder="Folio / Receipt" value={entry.referenceNo} 
                               onChange={(e) => setEntry({...entry, referenceNo: e.target.value})} className="form-control" />
                    </div>
                </div>

                {/* Lines Table */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr className="small text-uppercase text-muted">
                                <th style={{ width: '25%' }}>Account Code</th>
                                <th style={{ width: '25%' }}>Category</th>
                                <th style={{ width: '20%' }}>Debit ($)</th>
                                <th style={{ width: '20%' }}>Credit ($)</th>
                                <th style={{ width: '10%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {entry.lines.map((line, index) => (
                                <tr key={index}>
                                    <td>
                                        <input type="text" placeholder="e.g. 1000" value={line.accountCode}
                                               onChange={(e) => handleLineChange(index, 'accountCode', e.target.value)} required className="form-control" />
                                    </td>
                                    <td>
                                        <select className="form-select" value={line.accountCategory}
                                                onChange={(e) => handleLineChange(index, 'accountCategory', e.target.value)}>
                                            <option value="ASSET">ASSET (1xxx)</option>
                                            <option value="LIABILITY">LIABILITY (2xxx)</option>
                                            <option value="EQUITY">EQUITY (3xxx)</option>
                                            <option value="REVENUE">REVENUE (4xxx)</option>
                                            <option value="EXPENSE">EXPENSE (5xxx)</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" step="0.01" value={line.debit}
                                               onChange={(e) => handleLineChange(index, 'debit', e.target.value)} className="form-control" />
                                    </td>
                                    <td>
                                        <input type="number" step="0.01" value={line.credit}
                                               onChange={(e) => handleLineChange(index, 'credit', e.target.value)} className="form-control" />
                                    </td>
                                    <td className="text-center">
                                        <button type="button" onClick={() => removeLine(index)} className="btn btn-outline-danger btn-sm border-0">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <button type="button" onClick={addLine} className="btn btn-outline-primary d-flex align-items-center gap-2">
                        <Plus size={18} /> Add Account Line
                    </button>
                    
                    <div className="text-end me-4">
                        <div className="small text-muted text-uppercase">Total Balance</div>
                        <div className={`h4 fw-bold mb-0 ${isBalanced ? 'text-success' : 'text-danger'}`}>
                            ${totalDebits.toFixed(2)} / ${totalCredits.toFixed(2)}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary px-5 py-2 shadow d-flex align-items-center gap-2" 
                            disabled={!isBalanced}>
                        <Save size={18} /> Post to Ledger
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JournalEntryForm;