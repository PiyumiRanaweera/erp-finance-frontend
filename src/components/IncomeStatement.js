import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileDown, RefreshCw, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const IncomeStatement = ({ onBack }) => {
    // Initial state updated to match the Java DTO field names exactly
    const [data, setData] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        accountBreakdown: {} // Keyed by Account Code from the Map
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Updated URL to match the backend Report Controller structure
            const response = await axios.get(`${API_BASE_URL}/api/finance/reports/income-statement`);
            console.log("P&L Data received:", response.data);
            
            setData(response.data || { 
                totalRevenue: 0, 
                totalExpenses: 0, 
                netProfit: 0, 
                accountBreakdown: {} 
            });
        } catch (error) {
            console.error("Error fetching P&L data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Utility for high-precision currency display (BigDecimal compatibility)
    const formatMoney = (val) => {
        return (val || 0).toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    // PDF Generation Logic
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();

        doc.setFontSize(22);
        doc.setTextColor(26, 35, 126); // Navy Blue
        doc.text("SOFTWAREPLUS FINANCE", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Statement of Income (P&L)", 14, 28);
        doc.text(`Generated: ${date}`, 14, 33);
        doc.line(14, 38, 196, 38);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total Revenue: $${formatMoney(data.totalRevenue)}`, 14, 48);
        doc.text(`Total Expenses: $${formatMoney(data.totalExpenses)}`, 14, 55);
        
        doc.setFont("helvetica", "bold");
        const isProfitable = data.netProfit >= 0;
        doc.setTextColor(isProfitable ? [22, 101, 52] : [185, 28, 28]); 
        doc.text(`NET INCOME: $${formatMoney(data.netProfit)}`, 14, 65);

        // Data Table Mapping
        const tableRows = Object.entries(data.accountBreakdown).map(([code, balance]) => [
            code,
            code.startsWith('4') ? 'Income' : 'Expense',
            balance < 0 
                ? `(${formatMoney(Math.abs(balance))})` 
                : `$${formatMoney(balance)}`
        ]);

        doc.autoTable({
            startY: 75,
            head: [['Account Description', 'Category', 'Balance']],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [26, 35, 126] },
            columnStyles: { 2: { halign: 'right' } }
        });

        doc.save(`Income_Statement_${date}.pdf`);
    };

    if (loading) return (
        <div className="p-5 text-center">
            <RefreshCw className="animate-spin text-primary mx-auto mb-2" />
            <p>Processing Ledger Balances...</p>
        </div>
    );

    const breakdownEntries = Object.entries(data?.accountBreakdown || {});

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-start animate-fade-in">
            {/* Header Area */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={onBack} className="btn btn-outline-secondary btn-sm rounded-circle shadow-sm">
                        <ArrowLeft size={16} />
                    </button>
                    <h3 className="fw-bold text-navy mb-0">Income Statement</h3>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-light border" onClick={fetchData} title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                    <button className="btn btn-primary" onClick={handleExportPDF}>
                        <FileDown size={18} className="me-2" /> Export PDF
                    </button>
                </div>
            </div>

            {/* SUMMARY CARD */}
            <div className={`card border-0 mb-4 p-4 rounded-4 ${data.netProfit >= 0 ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                <div className="row align-items-center">
                    <div className="col">
                        <small className="text-uppercase fw-bold text-muted d-block mb-1">Bottom Line (Net Income)</small>
                        <h1 className={`display-5 fw-bold mb-0 ${data.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                            ${formatMoney(data.netProfit)}
                        </h1>
                    </div>
                    <div className="col-auto text-end text-muted">
                        <p className="mb-0 fw-medium">Revenue: ${formatMoney(data.totalRevenue)}</p>
                        <p className="mb-0 fw-medium">Expenses: -${formatMoney(data.totalExpenses)}</p>
                    </div>
                </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="card border shadow-none rounded-4 overflow-hidden">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr className="small text-muted uppercase">
                            <th className="ps-4">Account Code / Name</th>
                            <th>Type</th>
                            <th className="text-end pe-4">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {breakdownEntries.length > 0 ? (
                            breakdownEntries.map(([account, balance]) => {
                                const isIncome = account.startsWith('4');
                                return (
                                    <tr key={account}>
                                        <td className="fw-medium text-navy ps-4">{account}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${isIncome ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                {isIncome ? 'Income' : 'Expense'}
                                            </span>
                                        </td>
                                        <td className={`text-end fw-bold pe-4 ${!isIncome ? 'text-danger' : 'text-success'}`}>
                                            {balance < 0 
                                                ? `(${formatMoney(Math.abs(balance))})` 
                                                : `$${formatMoney(balance)}`
                                            }
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center py-5 text-muted">No financial activity recorded for this period.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="table-light fw-bold border-top">
                        <tr>
                            <td colSpan="2" className="ps-4">Net Result</td>
                            <td className={`text-end pe-4 ${data.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                ${formatMoney(data.netProfit)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default IncomeStatement;