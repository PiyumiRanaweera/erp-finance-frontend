import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Eye, Home, Truck, Monitor, 
  Settings, BarChart3, RefreshCw, Shield 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const FixedAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [stats, setStats] = useState({ totalValue: 0, depreciation: 0, activeAssets: 0, netBookValue: 0 });

    const handleMockData = () => {
        const mock = [
            { id: 1, name: "Company Delivery Truck", category: "Vehicle", purchaseDate: "2023-01-15", cost: 45000.00, depreciation: 9000.00, status: "Active" },
            { id: 2, name: "Main Office Building", category: "Property", purchaseDate: "2020-05-10", cost: 250000.00, depreciation: 15000.00, status: "Active" },
            { id: 3, name: "Server Infrastructure", category: "IT Hardware", purchaseDate: "2023-08-20", cost: 12000.00, depreciation: 2400.00, status: "Active" }
        ];
        setAssets(mock);
        calculateKPIs(mock);
    };

    const calculateKPIs = (data) => {
        const cost = data.reduce((sum, item) => sum + item.cost, 0);
        const dep = data.reduce((sum, item) => sum + item.depreciation, 0);
        setStats({
            totalValue: cost,
            depreciation: dep,
            netBookValue: cost - dep,
            activeAssets: data.length
        });
    };

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/assets');
            if (response.data && response.data.length > 0) {
                setAssets(response.data);
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
        fetchAssets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            
            <div className="d-flex justify-content-end mb-2">
                <span className={`badge ${isLive ? 'bg-success' : 'bg-warning'} d-flex align-items-center gap-1`}>
                   {isLive ? '● PostgreSQL Live' : '○ Demo Mode (Assets)'}
                </span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-navy mb-0">Fixed Assets Management</h4>
                    <p className="text-muted small mb-0">Track lifecycle and depreciation of company assets</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-navy shadow-sm d-flex align-items-center gap-2"><Plus size={18}/> Register Asset</button>
                    <button className="btn btn-white border shadow-sm d-flex align-items-center gap-2"><BarChart3 size={18}/> Report</button>
                    <button onClick={fetchAssets} className="btn btn-white border shadow-sm">
                        <RefreshCw size={18} className={loading ? 'spin' : ''}/>
                    </button>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <KPICard label="Original Cost" val={`$${stats.totalValue.toLocaleString()}`} icon={<Shield className="text-primary"/>} />
                <KPICard label="Accum. Depreciation" val={`$${stats.depreciation.toLocaleString()}`} icon={<Settings className="text-warning"/>} />
                <KPICard label="Net Book Value" val={`$${stats.netBookValue.toLocaleString()}`} icon={<BarChart3 className="text-success"/>} />
                <KPICard label="Total Assets" val={stats.activeAssets} icon={<Home className="text-navy"/>} />
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">Asset Name</th>
                                <th>Category</th>
                                <th>Purchase Date</th>
                                <th>Cost</th>
                                <th>Accum. Depreciation</th>
                                <th>Net Value</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map((asset) => (
                                <tr key={asset.id} style={{fontSize: '13px'}}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            {getIcon(asset.category)}
                                            <span className="fw-bold text-navy">{asset.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-light text-dark border">{asset.category}</span></td>
                                    <td>{asset.purchaseDate}</td>
                                    <td className="fw-bold">${asset.cost?.toLocaleString()}</td>
                                    <td className="text-danger">-${asset.depreciation?.toLocaleString()}</td>
                                    <td className="text-success fw-bold">${(asset.cost - asset.depreciation).toLocaleString()}</td>
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

export default FixedAssets;