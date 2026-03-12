import React, { useState, useEffect } from 'react';
import { Plus, Play, RefreshCw, AlertCircle, Clock, FileText, Users, Eye, CheckCircle, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/client';

const AccountsPayable = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({ totalOutstanding: 0, overdueBills: 0, totalInvoices: 0, activeVendors: 0 });
    const [formData, setFormData] = useState({ 
        vendor: '', 
        invoiceNo: '', 
        invoiceDate: new Date().toISOString().split('T')[0], // Default to today
        dueDate: '', 
        amount: '', 
        status: 'PENDING' 
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, sumRes] = await Promise.all([
                api.get('/api/ap/invoices'),
                api.get('/api/ap/summary')
            ]);
            setInvoices(invRes.data);
            setStats(sumRes.data);
        } catch (err) { 
            toast.error("Server connection failed"); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Single Payment Logic
    const handlePayInvoice = async (id) => {
        try {
            await api.post(`/api/ap/pay/${id}`);
            toast.success("Invoice paid successfully");
            fetchData();
        } catch (err) {
            toast.error("Payment failed");
        }
    };

    const handleBatchPay = async () => {
        try {
            await api.post('/api/ap/batch-pay', selectedIds);
            toast.success(`Paid ${selectedIds.length} invoices`);
            setSelectedIds([]);
            fetchData();
        } catch (err) { 
            toast.error("Batch payment failed"); 
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validation to prevent 500 errors
            if (!formData.dueDate) {
                toast.error("Please select a Due Date");
                return;
            }

            await api.post('/api/ap/invoices', formData);
            toast.success("Invoice recorded successfully");
            setShowModal(false);
            setFormData({ vendor: '', invoiceNo: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', amount: '', status: 'PENDING' });
            fetchData();
        } catch (err) { 
            const errorMsg = err.response?.data || "Failed to add invoice";
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Check console for DB errors");
            console.error(err);
        }
    };

    return (
        <div className="p-4 bg-light min-vh-100 text-start">
            <Toaster position="top-right" />
            
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1 text-dark">Accounts Payable</h4>
                    <p className="text-muted small mb-0">Control liabilities and outgoing cash flow</p>
                </div>
                <div className="d-flex gap-2">
                    {selectedIds.length > 0 && (
                        <button onClick={handleBatchPay} className="btn btn-success shadow-sm d-flex align-items-center gap-2">
                            <Play size={18}/> Pay Selected ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={() => setShowModal(true)} className="btn btn-dark shadow-sm d-flex align-items-center gap-2">
                        <Plus size={18}/> New AP Entry
                    </button>
                    <button onClick={fetchData} className="btn btn-white border shadow-sm">
                        <RefreshCw size={18} className={loading ? 'fa-spin' : ''}/>
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="row g-3 mb-4">
                <KPICard label="Total Outstanding" val={`$${stats.totalOutstanding?.toLocaleString()}`} color="danger" icon={<AlertCircle/>}/>
                <KPICard label="Overdue Bills" val={stats.overdueBills} color="warning" icon={<Clock/>}/>
                <KPICard label="Total Invoices" val={stats.totalInvoices} color="primary" icon={<FileText/>}/>
                <KPICard label="Active Vendors" val={stats.activeVendors} color="success" icon={<Users/>}/>
            </div>

            {/* Invoices Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        onChange={(e) => setSelectedIds(e.target.checked ? invoices.filter(i => i.status !== 'PAID').map(i => i.id) : [])}
                                    />
                                </th>
                                <th>Vendor</th>
                                <th>Invoice #</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No invoices found.</td></tr>
                            ) : (
                                invoices.map(inv => (
                                    <tr key={inv.id} className={selectedIds.includes(inv.id) ? 'table-primary' : ''}>
                                        <td className="ps-4">
                                            {inv.status !== 'PAID' && (
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(inv.id)} 
                                                    className="form-check-input" 
                                                    onChange={() => toggleSelect(inv.id)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <div className="fw-bold">{inv.vendor}</div>
                                            <div className="text-muted" style={{fontSize: '11px'}}>ID: {inv.id}</div>
                                        </td>
                                        <td className="text-muted">{inv.invoiceNo}</td>
                                        <td>{inv.dueDate}</td>
                                        <td className="fw-bold">${inv.amount?.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${inv.status === 'PAID' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex gap-1 justify-content-center">
                                                <button className="btn btn-sm btn-outline-secondary p-1" title="View Details"><Eye size={16}/></button>
                                                {inv.status !== 'PAID' && (
                                                    <button 
                                                        onClick={() => handlePayInvoice(inv.id)} 
                                                        className="btn btn-sm btn-outline-success p-1" 
                                                        title="Mark as Paid"
                                                    >
                                                        <CheckCircle size={16}/>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Entry Modal */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 p-3 shadow-lg">
                            <form onSubmit={handleAddSubmit}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="fw-bold">New Vendor Invoice</h5>
                                    <X className="cursor-pointer text-muted" onClick={() => setShowModal(false)}/>
                                </div>
                                <div className="modal-body row g-3">
                                    <div className="col-12">
                                        <label className="small fw-bold mb-1">Vendor Name</label>
                                        <input required className="form-control" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})}/>
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
                                        <label className="small fw-bold mb-1">Invoice Date</label>
                                        <input required type="date" className="form-control" value={formData.invoiceDate} onChange={e => setFormData({...formData, invoiceDate: e.target.value})}/>
                                    </div>
                                    <div className="col-6">
                                        <label className="small fw-bold mb-1">Due Date</label>
                                        <input required type="date" className="form-control" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}/>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-dark px-4">Post to Ledger</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ label, val, color, icon }) => (
    <div className="col-md-3">
        <div className={`card border-0 shadow-sm p-3 rounded-4 h-100 border-start border-4 border-${color} bg-white`}>
            <div className="d-flex justify-content-between mb-1">
                <small className="text-uppercase fw-bold text-muted" style={{fontSize: '10px'}}>{label}</small>
                <div className={`text-${color}`}>{icon}</div>
            </div>
            <h3 className="fw-bold mb-0">{val}</h3>
        </div>
    </div>
);

export default AccountsPayable;