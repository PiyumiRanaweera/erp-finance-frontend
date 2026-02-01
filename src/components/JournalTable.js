import React, { useState, useEffect, useRef } from 'react';

const JournalTable = ({ onDataLoaded, refreshTrigger }) => { 
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    // Start loading
    setLoading(true);
    
    fetch('http://localhost:8080/api/accounts/balances')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(data => {
        setLines(data);
        if (onDataLoaded) onDataLoaded(data); 
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [refreshTrigger, onDataLoaded]); // Now it knows what to watch

  if (loading) return (
    <div className="p-8 text-center text-blue-600 font-medium italic">
       Searching PostgreSQL for ledger records...
    </div>
  );
  
  if (error) return (
    <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg">
      <strong>Connection Error:</strong> {error}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Account Balances</h2>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wider">
            <th className="px-4 py-3 border-b">Account Code</th>
            <th className="px-4 py-3 border-b text-right">Current Balance</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((item, index) => (
            <tr key={index} className="hover:bg-blue-50 transition-colors border-b last:border-none">
              <td className="px-4 py-4 font-medium text-gray-700">
                {item.accountCode}
              </td>
              <td className={`px-4 py-4 text-right font-mono font-bold ${
                item.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                ${item.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JournalTable;