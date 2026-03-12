import React, { useState, useEffect } from 'react';
import {
  Plus, Download, Eye,
  CheckCircle, Clock, Users, RefreshCw, TrendingUp, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/client';

const AccountsReceivable = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({ totalOutstanding: 0, overdue: 0, collectedMTD: 0, activeCustomers: 0 });
    
    const [formData, setFormData] = useState({
        customer: '',
        invoiceNo: '',
        amount: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'PENDING'
    });

    const fetchARData = async () => {
        try {
            setLoading(true);
            const [invRes, sumRes] = await Promise.all([
                api.get('/api/ar/invoices'),
                api.get('/api/ar/summary')
            ]);
            
            setInvoices(invRes.data);
            setStats(sumRes.data);
            setIsLive(true);
        } catch (err) {
            console.error("Backend unreachable, using mock data...");
            handleMockData();
            setIsLive(false);
        } finally {
            setLoading(false);
        }
    };

    const handleMockData = () => {
        const mock = [
            { id: 1, customer: "Global Retailers", invoiceNo: "REC-901", invoiceDate: "2023-11-10", dueDate: "2023-12-10", amount: 15400.00, status: "PENDING" },
            { id: 2, customer: "Horizon Tech", invoiceNo: "REC-902", invoiceDate: "2023-10-15", dueDate: "2023-11-15", amount: 2850.00, status: "OVERDUE" },
            { id: 3, customer: "City Logistics", invoiceNo: "REC-903", invoiceDate: "2023-11-20", dueDate: "2023-12-20", amount: 6200.75, status: "PENDING" }
        ];
        setInvoices(mock);
        setStats({ totalOutstanding: 24450.75, overdue: 1, collectedMTD: 42500, activeCustomers: 3 });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/ar/invoices', formData);
            toast.success("Customer Invoice Generated");
            setShowModal(false);
            setFormData({ customer: '', invoiceNo: '', amount: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', status: 'PENDING' });
            fetchARData();
        } catch (err) {
            toast.error("Failed to save invoice");
        }
    };

    const handleMarkAsPaid = async (id) => {
        try {
            await api.post(`/api/ar/pay/${id}`);
            toast.success("Payment Received");
            fetchARData();
        } catch (err) {
            toast.error("Could not update status");
        }
    };

    // --- NEW EXPORT LOGIC ---
    const handleExport = () => {
        if (invoices.length === 0) {
            toast.error("No data available to export");
            return;
        }

        const headers = ["Customer,Invoice No,Date,Due Date,Amount,Status"];
        const rows = invoices.map(inv => 
            `"${inv.customer}","${inv.invoiceNo}","${inv.invoiceDate || inv.date}","${inv.dueDate}",${inv.amount},"${inv.status}"`
        );

        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `AR_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Exporting CSV...");
    };

    useEffect(() => { fetchARData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                    <h4 className="fw-bold text-dark mb-0">Accounts Receivable</h4>
                    <p className="text-muted small mb-0">Manage customer credit and incoming revenue</p>
                </div>
                <div className="d-flex gap-2">
                    <button onClick={() => setShowModal(true)} className="btn btn-primary shadow-sm d-flex align-items-center gap-2">
                        <Plus size={18}/> New Invoice
                    </button>
                    {/* UPDATED EXPORT BUTTON */}
                    <button onClick={handleExport} className="btn btn-white border shadow-sm d-flex align-items-center gap-2">
                        <Download size={18}/> Export
                    </button>
                    <button onClick={fetchARData} className="btn btn-white border shadow-sm">
                        <RefreshCw size={18} className={loading ? 'spin-anim' : ''}/>
                    </button>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <KPICard label="Total Outstanding" val={`$${stats.totalOutstanding?.toLocaleString()}`} icon={<TrendingUp className="text-primary"/>} />
                <KPICard label="Overdue" val={stats.overdue} icon={<Clock className="text-danger"/>} />
                <KPICard label="Collected (MTD)" val={`$${stats.collectedMTD?.toLocaleString()}`} icon={<CheckCircle className="text-success"/>} />
                <KPICard label="Active Customers" val={stats.activeCustomers} icon={<Users className="text-primary"/>} />
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
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
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{inv.customer}</div>
                                        <div className="text-muted" style={{fontSize: '10px'}}>REF: {inv.id}</div>
                                    </td>
                                    <td className="text-muted">{inv.invoiceNo}</td>
                                    <td>{inv.invoiceDate || inv.date}</td>
                                    <td>{inv.dueDate}</td>
                                    <td className="fw-bold">${inv.amount?.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 ${
                                            inv.status === 'PAID' ? 'bg-success-subtle text-success' : 
                                            inv.status === 'OVERDUE' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button className="btn btn-sm btn-light border p-1"><Eye size={14}/></button>
                                            {inv.status !== 'PAID' && (
                                                <button onClick={() => handleMarkAsPaid(inv.id)} className="btn btn-sm btn-outline-success p-1" title="Mark as Collected">
                                                    <CheckCircle size={14}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* NEW INVOICE MODAL */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 p-3 shadow-lg">
                            <form onSubmit={handleAddSubmit}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="fw-bold text-dark">Issue New Invoice</h5>
                                    <X className="cursor-pointer text-muted" onClick={() => setShowModal(false)}/>
                                </div>
                                <div className="modal-body row g-3">
                                    <div className="col-12">
                                        <label className="small fw-bold mb-1">Customer Name</label>
                                        <input required className="form-control" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})}/>
                                    </div>
                                    <div className="col-6">
                                        <label className="small fw-bold mb-1">Invoice Number</label>
                                        <input required className="form-control" value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value})}/>
                                    </div>
                                    <div className="col-6">
                                        <label className="small fw-bold mb-1">Total Amount</label>
                                        <input required type="number" step="0.01" className="form-control" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}/>
                                    </div>
                                    <div className="col-6">
                                        <label className="small fw-bold mb-1">Billing Date</label>
                                        <input required type="date" className="form-control" value={formData.invoiceDate} onChange={e => setFormData({...formData, invoiceDate: e.target.value})}/>
                                    </div>
                                    <div className="col-6">
                                        <label className="small fw-bold mb-1">Due Date</label>
                                        <input required type="date" className="form-control" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}/>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Generate Invoice</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
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
            <h3 className="fw-bold mb-0 text-dark">{val}</h3>
        </div>
    </div>
);

export default AccountsReceivable;