import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Play, RefreshCw, AlertCircle, Clock, Calendar, Users, Eye, Camera 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AccountsPayable = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [stats, setStats] = useState({ totalDue: 0, overdue: 0, dueThisWeek: 0, vendorCount: 0 });

    // RENAME: Changed from useMockData to handleMockData to fix ESLint error
    const handleMockData = () => {
        const mock = [
            { id: 1, vendor: "Office Supplies Ltd", invoiceNo: "INV-001", date: "2023-10-01", dueDate: "2023-10-31", amount: 1250.50, status: "Overdue" },
            { id: 2, vendor: "Tech Solutions Inc", invoiceNo: "INV-002", date: "2023-10-05", dueDate: "2023-11-04", amount: 3500.00, status: "Overdue" },
            { id: 3, vendor: "Utilities Corp", invoiceNo: "INV-003", date: "2023-09-25", dueDate: "2023-10-25", amount: 850.75, status: "Overdue" }
        ];
        setInvoices(mock);
        calculateKPIs(mock);
    };

    const calculateKPIs = (data) => {
        const total = data.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const overdue = data.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + (inv.amount || 0), 0);
        setStats({
            totalDue: total,
            overdue: overdue,
            dueThisWeek: total * 0.4,
            vendorCount: new Set(data.map(inv => inv.vendor)).size
        });
    };

    const fetchAPData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/ap/invoices');
            
            if (response.data && response.data.length > 0) {
                setInvoices(response.data);
                calculateKPIs(response.data);
                setIsLive(true);
            } else {
                handleMockData(); 
            }
        } catch (err) {
            handleMockData();
            setIsLive(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchAPData(); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-4 bg-light min-vh-100 text-start">
            <Toaster position="top-right" />
            
            <div className="d-flex justify-content-end mb-2">
                <span className={`badge ${isLive ? 'bg-success' : 'bg-warning'} d-flex align-items-center gap-1`}>
                   {isLive ? '● PostgreSQL Live' : '○ Demo Mode (AP)'}
                </span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-navy mb-0">Accounts Payable</h4>
                <div className="d-flex gap-2">
                    <button className="btn btn-navy shadow-sm d-flex align-items-center gap-2"><Plus size={18}/> Add Invoice</button>
                    <button className="btn btn-success shadow-sm d-flex align-items-center gap-2"><Play size={18}/> Process Payments</button>
                    <button onClick={fetchAPData} className="btn btn-white border shadow-sm">
                        <RefreshCw size={18} className={loading ? 'spin' : ''}/>
                    </button>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <KPICard label="Total Due" val={`$${stats.totalDue.toLocaleString()}`} icon={<AlertCircle className="text-danger"/>} />
                <KPICard label="Overdue" val={`$${stats.overdue.toLocaleString()}`} icon={<Clock className="text-warning"/>} />
                <KPICard label="Due This Week" val={`$${stats.dueThisWeek.toLocaleString()}`} icon={<Calendar className="text-primary"/>} />
                <KPICard label="Vendors" val={stats.vendorCount} icon={<Users className="text-success"/>} />
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">Vendor</th>
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
                                    <td className="ps-4 fw-bold text-navy">{inv.vendor}</td>
                                    <td className="text-muted">{inv.invoiceNo}</td>
                                    <td>{inv.date}</td>
                                    <td>{inv.dueDate}</td>
                                    <td className="fw-bold">${inv.amount?.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 ${inv.status === 'Overdue' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn btn-sm btn-light border"><Camera size={14}/></button>
                                            <button className="btn btn-sm btn-light border"><Eye size={14}/></button>
                                        </div>
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

export default AccountsPayable;