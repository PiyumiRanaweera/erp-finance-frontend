import React, { useState } from 'react';
import { Plus, Trash2, Save, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const NewJournalEntry = () => {
  const [lines, setLines] = useState([
    { id: Date.now(), account: '', debit: 0, credit: 0 },
    { id: Date.now() + 1, account: '', debit: 0, credit: 0 }
  ]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPosting, setIsPosting] = useState(false);

  // Totals Calculation
  const totalDebits = lines.reduce((sum, line) => sum + parseFloat(line.debit || 0), 0);
  const totalCredits = lines.reduce((sum, line) => sum + parseFloat(line.credit || 0), 0);
  const difference = Math.abs(totalDebits - totalCredits);
  
  // Validation: Must have description, be balanced, and have at least 2 lines
  const isBalanced = 
    totalDebits === totalCredits && 
    totalDebits > 0 && 
    description.trim().length > 0 && 
    lines.length >= 2;

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const removeLine = (index) => {
    if (lines.length > 2) {
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
    } else {
      toast.error("Accounting rules require at least two line items.");
    }
  };

  const handlePostTransaction = async () => {
    if (!isBalanced) return;

    setIsPosting(true);

    // Payload structure updated to match your Spring Boot JournalEntry model exactly
    const payload = {
      description: description,
      transactionDate: date,
      status: "POSTED",
      lines: lines.map(line => ({
        accountCode: line.account,
        debit: parseFloat(line.debit || 0),
        credit: parseFloat(line.credit || 0)
      }))
    };

    try {
      // URL FIX: Changed to /api/journals to match your @RequestMapping("/api/journals")
      const response = await fetch('http://localhost:8080/api/journals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Transaction successfully posted to the Ledger!');
        // Reset form
        setLines([
          { id: Date.now(), account: '', debit: 0, credit: 0 },
          { id: Date.now() + 1, account: '', debit: 0, credit: 0 }
        ]);
        setDescription('');
      } else {
        const errorText = await response.text();
        toast.error(`Post Failed: ${errorText}`);
      }
    } catch (error) {
      toast.error('Connection Error: Please ensure your Spring Boot server is running.');
      console.error("Post Error:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>ERP Master: New Entry</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Record a manual financial transaction to the General Ledger</p>
        </div>
        <button 
          onClick={handlePostTransaction}
          disabled={!isBalanced || isPosting}
          style={{ 
            backgroundColor: isBalanced ? '#1a237e' : '#cbd5e1', 
            color: 'white', padding: '12px 24px', borderRadius: '8px', 
            border: 'none', fontWeight: 'bold', cursor: isBalanced ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s'
          }}
        >
          {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isPosting ? 'Connecting to Ledger...' : 'Post Transaction'}
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        
        <div style={{ 
          padding: '15px 30px', 
          backgroundColor: isBalanced ? '#f0fdf4' : '#fffbeb', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: '10px',
          color: isBalanced ? '#166534' : '#92400e',
          fontSize: '14px', fontWeight: '600'
        }}>
          {isBalanced ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {isBalanced ? "Entry is balanced." : `Out of Balance: $${difference.toFixed(2)} difference.`}
        </div>

        <div style={{ padding: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '40px' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>TRANSACTION DESCRIPTION</label>
              <input 
                type="text" 
                placeholder="e.g., Office Supplies Purchase" 
                style={inputStyle}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>TRANSACTION DATE</label>
              <input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>Account Name / Code</th>
                <th style={{ padding: '12px', color: '#64748b', fontSize: '12px', width: '180px' }}>Debit ($)</th>
                <th style={{ padding: '12px', color: '#64748b', fontSize: '12px', width: '180px' }}>Credit ($)</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={line.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '10px' }}>
                    <select 
                      value={line.account}
                      onChange={(e) => updateLine(index, 'account', e.target.value)}
                      style={tableInputStyle}
                    >
                      <option value="">Select Account...</option>
                      <option value="1000">1000 - Cash</option>
                      <option value="1200">1200 - Accounts Receivable</option>
                      <option value="2000">2000 - Accounts Payable</option>
                      <option value="6001">6001 - Rent Expense</option>
                      <option value="6005">6005 - Utilities Expense</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={line.debit || ''}
                      onChange={(e) => updateLine(index, 'debit', e.target.value)}
                      style={tableInputStyle} 
                    />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={line.credit || ''}
                      onChange={(e) => updateLine(index, 'credit', e.target.value)}
                      style={tableInputStyle} 
                    />
                  </td>
                  <td>
                    <button onClick={() => removeLine(index)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button 
            onClick={() => setLines([...lines, { id: Date.now(), account: '', debit: 0, credit: 0 }])}
            style={{ 
              marginTop: '20px', background: 'none', border: '1px dashed #cbd5e1', 
              color: '#64748b', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Plus size={16} /> Add Line Item
          </button>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '25px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '40px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>TOTAL DEBITS</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>${totalDebits.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>TOTAL CREDITS</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>${totalCredits.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#64748b' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' };
const tableInputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' };

export default NewJournalEntry;