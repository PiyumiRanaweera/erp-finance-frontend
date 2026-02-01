import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Download, Search, Eye, 
  CheckCircle, Clock, Users, RefreshCw, TrendingUp
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AccountsReceivable = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [stats, setStats] = useState({ totalPending: 0, overdue: 0, collectedThisMonth: 0, customerCount: 0 });

    // 1. Rename to handleMockData to avoid ESLint Hook errors
    const handleMockData = () => {
        const mock = [
            { id: 1, customer: "Global Retailers", invoiceNo: "REC-901", date: "2023-11-10", dueDate: "2023-12-10", amount: 15400.00, status: "Pending" },
            { id: 2, customer: "Horizon Tech", invoiceNo: "REC-902", date: "2023-10-15", dueDate: "2023-11-15", amount: 2850.00, status: "Overdue" },
            { id: 3, customer: "City Logistics", invoiceNo: "REC-903", date: "2023-11-20", dueDate: "2023-12-20", amount: 6200.75, status: "Pending" }
        ];
        setInvoices(mock);
        calculateKPIs(mock);
    };

    const calculateKPIs = (data) => {
        const total = data.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const overdue = data.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + (inv.amount || 0), 0);
        setStats({
            totalPending: total,
            overdue: overdue,
            collectedThisMonth: 42500.00,
            customerCount: new Set(data.map(inv => inv.customer)).size
        });
    };

    const fetchARData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/ar/invoices');
            
            if (response.data && response.data.length > 0) {
                setInvoices(response.data);
                calculateKPIs(response.data);
                setIsLive(true);
            } else {
                handleMockData(); // Called renamed function
            }
        } catch (err) {
            console.log("Using fallback data...");
            handleMockData(); // Called renamed function
            setIsLive(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchARData(); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-4 bg-light min-vh-100 text-start">
            <Toaster position="top-right" />
            
            <div className="d-flex justify-content-end mb-2">
                <span className={`badge ${isLive ? 'bg-success' : 'bg-warning'} d-flex align-items-center gap-1`}>
                   {isLive ? '● PostgreSQL Live' : '○ Demo Mode (AR)'}
                </span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-navy mb-0">Accounts Receivable</h4>
                    <p className="text-muted small mb-0">Manage customer credit and incoming revenue</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-navy shadow-sm d-flex align-items-center gap-2"><Plus size={18}/> New Invoice</button>
                    <button className="btn btn-white border shadow-sm d-flex align-items-center gap-2"><Download size={18}/> Export</button>
                    <button onClick={fetchARData} className="btn btn-white border shadow-sm">
                        <RefreshCw size={18} className={loading ? 'spin' : ''}/>
                    </button>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <KPICard label="Total Outstanding" val={`$${stats.totalPending.toLocaleString()}`} icon={<TrendingUp className="text-primary"/>} />
                <KPICard label="Overdue" val={`$${stats.overdue.toLocaleString()}`} icon={<Clock className="text-danger"/>} />
                <KPICard label="Collected (MTD)" val={`$${stats.collectedThisMonth.toLocaleString()}`} icon={<CheckCircle className="text-success"/>} />
                <KPICard label="Active Customers" val={stats.customerCount} icon={<Users className="text-navy"/>} />
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">Customer</th>
                                <th>Invoice No.</th>
                                <th>Date</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id} style={{fontSize: '13px'}}>
                                    <td className="ps-4 fw-bold text-navy">{inv.customer}</td>
                                    <td className="text-muted">{inv.invoiceNo}</td>
                                    <td>{inv.date}</td>
                                    <td>{inv.dueDate}</td>
                                    <td className="fw-bold">${inv.amount?.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 ${inv.status === 'Overdue' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <button className="btn btn-sm btn-light border"><Eye size={14}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ label, val, icon }) => (
    <div className="col-md-3">
        <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
            <div className="d-flex justify-content-between mb-3">
                <small className="text-uppercase fw-bold text-muted" style={{fontSize: '10px'}}>{label}</small>
                {icon}
            </div>
            <h3 className="fw-bold mb-0 text-navy">{val}</h3>
        </div>
    </div>
);

export default AccountsReceivable;