import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Plus, Eye, Home, Truck, Monitor, 
  Settings, BarChart3, RefreshCw, Shield, X, Trash2, Search, Filter
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const FixedAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [stats, setStats] = useState({ totalValue: 0, depreciation: 0, activeAssets: 0, netBookValue: 0 });

    const [formData, setFormData] = useState({
        assetName: '',
        category: 'Vehicle',
        purchaseDate: new Date().toISOString().split('T')[0],
        cost: '',
        accumulatedDepreciation: 0
    });

    const calculateKPIs = (data) => {
        const cost = data.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
        const dep = data.reduce((sum, item) => sum + (Number(item.accumulatedDepreciation) || 0), 0);
        setStats({
            totalValue: cost,
            depreciation: dep,
            netBookValue: cost - dep,
            activeAssets: data.length
        });
    };

    // Fetch Logic
    const fetchAssets = useCallback(async (query = "") => {
        try {
            setLoading(true);
            const url = query 
                ? `http://localhost:8080/api/assets/all?search=${encodeURIComponent(query)}` 
                : 'http://localhost:8080/api/assets/all';
            
            const response = await axios.get(url);
            if (response.data) {
                setAssets(response.data);
                calculateKPIs(response.data);
                setIsLive(true);
            }
        } catch (err) {
            console.error("Backend unreachable");
            setIsLive(false);
            toast.error("Could not connect to database");
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect for Search Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAssets(searchTerm);
        }, 300); // Wait 300ms after user stops typing

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchAssets]);

    const handleRegister = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            cost: parseFloat(formData.cost) || 0,
            accumulatedDepreciation: parseFloat(formData.accumulatedDepreciation) || 0
        };

        try {
            await axios.post('http://localhost:8080/api/assets/register', submissionData);
            toast.success('Asset registered successfully!');
            setShowModal(false);
            fetchAssets(searchTerm); 
            setFormData({ assetName: '', category: 'Vehicle', purchaseDate: new Date().toISOString().split('T')[0], cost: '', accumulatedDepreciation: 0 });
        } catch (err) {
            toast.error('Failed to save to database.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this asset?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/assets/${id}`);
            toast.success('Asset deleted');
            fetchAssets(searchTerm);
        } catch (err) {
            toast.error('Could not delete asset');
        }
    };

    // Filter Logic
    const filteredAssets = categoryFilter === "All Categories" 
        ? assets 
        : assets.filter(asset => asset.category === categoryFilter);

    const getIcon = (category) => {
        switch(category) {
            case 'Vehicle': return <Truck size={18} className="text-primary"/>;
            case 'Property': return <Home size={18} className="text-success"/>;
            default: return <Monitor size={18} className="text-info"/>;
        }
    };

    return (
        <div className="p-4 bg-light min-vh-100 text-start">
            <Toaster position="top-right" />
            
            {/* Header Status */}
            <div className="d-flex justify-content-end mb-2">
                <span className={`badge rounded-pill ${isLive ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} border`}>
                   {isLive ? '● PostgreSQL Live' : '○ Demo Mode'}
                </span>
            </div>

            {/* Title Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-navy mb-0">Fixed Assets Management</h4>
                    <p className="text-muted small">Comprehensive asset lifecycle tracking</p>
                </div>
                <div className="d-flex gap-2">
                    <button onClick={() => setShowModal(true)} className="btn btn-navy d-flex align-items-center gap-2 shadow-sm px-4">
                        <Plus size={18}/> Register Asset
                    </button>
                    <button onClick={() => fetchAssets(searchTerm)} className="btn btn-white border shadow-sm">
                        <RefreshCw size={18} className={loading ? 'spin' : ''}/>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                <KPICard label="Original Cost" val={`$${stats.totalValue.toLocaleString()}`} icon={<Shield className="text-primary"/>} />
                <KPICard label="Accum. Depreciation" val={`$${stats.depreciation.toLocaleString()}`} icon={<Settings className="text-warning"/>} />
                <KPICard label="Net Book Value" val={`$${stats.netBookValue.toLocaleString()}`} icon={<BarChart3 className="text-success"/>} />
                <KPICard label="Total Assets" val={stats.activeAssets} icon={<Home className="text-navy"/>} />
            </div>

            {/* Search and Filters Bar */}
            <div className="card border-0 shadow-sm rounded-4 mb-3 p-3 bg-white">
                <div className="row g-2 align-items-center">
                    <div className="col-md-6 position-relative">
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input 
                            type="text" 
                            className="form-control ps-5 py-2 border-0 bg-light" 
                            placeholder="Search assets by name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3 ms-auto">
                        <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded">
                            <Filter size={16} className="text-muted" />
                            <select 
                                className="form-select form-select-sm border-0 bg-transparent shadow-none" 
                                style={{fontSize: '13px'}}
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option>All Categories</option>
                                <option>Vehicle</option>
                                <option>Property</option>
                                <option>IT Hardware</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3">Asset Name</th>
                                <th>Category</th>
                                <th>Purchase Date</th>
                                <th>Cost</th>
                                <th>Accum. Dep.</th>
                                <th>Net Value</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && assets.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5"><RefreshCw className="spin text-muted" /> Loading assets...</td></tr>
                            ) : filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                                <tr key={asset.id} style={{fontSize: '13px'}}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            {getIcon(asset.category)}
                                            <span className="fw-bold text-navy">{asset.assetName}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-light text-dark border px-2 py-1">{asset.category}</span></td>
                                    <td>{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                                    <td>${(Number(asset.cost) || 0).toLocaleString()}</td>
                                    <td className="text-danger">-${(Number(asset.accumulatedDepreciation) || 0).toLocaleString()}</td>
                                    <td className="text-success fw-bold">${((Number(asset.cost) || 0) - (Number(asset.accumulatedDepreciation) || 0)).toLocaleString()}</td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-1">
                                            <button className="btn btn-sm btn-light border" title="View Details"><Eye size={14}/></button>
                                            <button 
                                                onClick={() => handleDelete(asset.id)} 
                                                className="btn btn-sm btn-outline-danger border"
                                                title="Delete Asset"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <div className="mb-2"><Search size={40} className="opacity-25" /></div>
                                        No assets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content p-0 shadow-lg border-0 rounded-4 overflow-hidden animate-fade-in">
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                            <h5 className="fw-bold mb-0">Register New Asset</h5>
                            <X size={24} className="cursor-pointer text-muted" onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleRegister} className="p-4">
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Asset Name</label>
                                <input required className="form-control form-control-lg fs-6" value={formData.assetName} onChange={(e) => setFormData({...formData, assetName: e.target.value})} placeholder="e.g. Delivery Van" />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Category</label>
                                    <select className="form-select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                        <option>Vehicle</option>
                                        <option>Property</option>
                                        <option>IT Hardware</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Purchase Date</label>
                                    <input type="date" className="form-control" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Original Cost ($)</label>
                                    <input type="number" required className="form-control" placeholder="0.00" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Accum. Depreciation ($)</label>
                                    <input type="number" className="form-control" placeholder="0.00" value={formData.accumulatedDepreciation} onChange={(e) => setFormData({...formData, accumulatedDepreciation: e.target.value})} />
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-3">
                                <button type="button" className="btn btn-light border w-50 py-2" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-navy w-50 py-2">Confirm Registration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1050; backdrop-filter: blur(2px); }
                .modal-content { background: white; width: 550px; }
                .btn-navy { background: #1a237e; color: white; border: none; transition: 0.2s; }
                .btn-navy:hover { background: #121858; color: white; transform: translateY(-1px); }
                .text-navy { color: #1a237e; }
                .btn-white:hover { background: #f8f9fa; }
                .spin { animation: spin 1s linear infinite; }
                .cursor-pointer { cursor: pointer; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const KPICard = ({ label, val, icon }) => (
    <div className="col-md-3">
        <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white transition-hover">
            <div className="d-flex justify-content-between mb-3">
                <small className="text-uppercase fw-bold text-muted" style={{fontSize: '10px', letterSpacing: '0.5px'}}>{label}</small>
                {icon}
            </div>
            <h3 className="fw-bold mb-0 text-navy">{val}</h3>
        </div>
    </div>
);

export default FixedAssets;