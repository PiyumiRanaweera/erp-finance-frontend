import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer, FileDown, RefreshCw } from 'lucide-react';

const IncomeStatement = () => {
    const [data, setData] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        accountBreakdown: {}
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/finance/reports/income-statement');
            setData(response.data);
        } catch (error) {
            console.error("Error fetching P&L data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-5 text-center">Loading Financial Statement...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">Profit & Loss Statement</h3>
                <div className="d-flex gap-2">
                    <button className="btn btn-light border" onClick={fetchData}><RefreshCw size={18} /></button>
                    <button className="btn btn-light border"><Printer size={18} /> Print</button>
                    <button className="btn btn-primary"><FileDown size={18} /> Export PDF</button>
                </div>
            </div>

            {/* NET PROFIT CARD */}
            <div className="card shadow-sm border-0 mb-4 p-4">
                <small className="text-uppercase fw-bold text-muted">Net Profit</small>
                <h1 className="display-4 fw-bold text-success">
                    ${data.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h1>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="card shadow-sm border-0">
                <table className="table table-hover mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Account</th>
                            <th>Type</th>
                            <th className="text-end">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data.accountBreakdown).map(([account, balance]) => (
                            <tr key={account}>
                                <td className="fw-medium">{account}</td>
                                <td>
                                    <span className={`badge ${account.startsWith('4') ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                        {account.startsWith('4') ? 'Income' : 'Expense'}
                                    </span>
                                </td>
                                <td className={`text-end fw-bold ${balance < 0 ? 'text-danger' : ''}`}>
                                    {balance < 0 ? `($${Math.abs(balance).toLocaleString()})` : `$${balance.toLocaleString()}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-light fw-bold">
                        <tr>
                            <td colSpan="2">Calculated Net Profit</td>
                            <td className="text-end text-success">${data.netProfit.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default IncomeStatement;