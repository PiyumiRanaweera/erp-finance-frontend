import React, { useState } from 'react';
import axios from 'axios';

const JournalEntryForm = () => {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [lines, setLines] = useState([{ accountCode: '', debit: 0, credit: 0 }]);

    const addLine = () => setLines([...lines, { accountCode: '', debit: 0, credit: 0 }]);

    const handleLineChange = (index, field, value) => {
        const newLines = [...lines];
        newLines[index][field] = value;
        setLines(newLines);
    };

    const totalDebits = lines.reduce((sum, line) => sum + parseFloat(line.debit || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + parseFloat(line.credit || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (totalDebits !== totalCredits) {
            alert("Error: Total Debits must equal Total Credits!");
            return;
        }

        const payload = { description, date, lines };
        try {
            await axios.post('http://localhost:8080/api/journals', payload);
            alert("Journal Entry Saved Successfully!");
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-light">
            <h3>New Journal Entry</h3>
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="form-control mb-2" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control mb-3" />

            <table className="table">
                <thead><tr><th>Account Code</th><th>Debit</th><th>Credit</th></tr></thead>
                <tbody>
                    {lines.map((line, index) => (
                        <tr key={index}>
                            <td><input type="text" placeholder="e.g. 1001" onChange={(e) => handleLineChange(index, 'accountCode', e.target.value)} className="form-control" /></td>
                            <td><input type="number" step="0.01" onChange={(e) => handleLineChange(index, 'debit', e.target.value)} className="form-control" /></td>
                            <td><input type="number" step="0.01" onChange={(e) => handleLineChange(index, 'credit', e.target.value)} className="form-control" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="d-flex justify-content-between">
                <button type="button" onClick={addLine} className="btn btn-secondary">Add Line</button>
                <div className="fw-bold">
                    Balance: {totalDebits.toFixed(2)} / {totalCredits.toFixed(2)}
                </div>
                <button type="submit" className="btn btn-primary" disabled={totalDebits !== totalCredits || totalDebits === 0}>Post Entry</button>
            </div>
        </form>
    );
};

export default JournalEntryForm;