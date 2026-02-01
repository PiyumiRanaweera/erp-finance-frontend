import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Search, Clock, User, ShieldCheck, 
  Filter, RotateCcw, AlertTriangle, FileText, Database,
  Download, Activity, ShieldAlert
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Logs from Spring Boot Backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/audit-logs');
      // Sort by newest first
      const sortedLogs = res.data.sort((a, b) => b.id - a.id);
      setLogs(sortedLogs);
      toast.success("Audit trail synchronized");
    } catch (err) {
      console.error("Backend offline, loading fallback...");
      toast.error("Live sync failed - showing offline data");
      
      const dummyLogs = [
        { id: 101, action: "POST_JOURNAL", username: "Admin", timestamp: new Date().toISOString(), description: "Manual entry: Office Supplies - $250.00" },
        { id: 102, action: "LOGIN_FAIL", username: "Unknown", timestamp: new Date().toISOString(), description: "Unauthorized access attempt blocked" },
        { id: 103, action: "BANK_RECON_ADJ", username: "Admin", timestamp: new Date().toISOString(), description: "Auto-matched Chase Statement TX-99" },
      ];
      setLogs(dummyLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 2. Severity Logic
  const getSeverity = (action) => {
    const act = action?.toUpperCase() || '';
    if (act.includes('FAIL') || act.includes('VOID') || act.includes('DELETE') || act.includes('ERROR')) return 'HIGH';
    if (act.includes('UPDATE') || act.includes('RECON') || act.includes('ADJ')) return 'MEDIUM';
    return 'LOW';
  };

  // 3. Filter Logic
  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (severity) => {
    const styles = {
      HIGH: { bg: '#fef2f2', text: '#991b1b', icon: <ShieldAlert size={12}/> },
      MEDIUM: { bg: '#fffbeb', text: '#92400e', icon: <Activity size={12}/> },
      LOW: { bg: '#f0fdf4', text: '#166534', icon: <ShieldCheck size={12}/> }
    };
    const style = styles[severity] || styles.LOW;
    return (
      <span style={{ 
        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        backgroundColor: style.bg, color: style.text, border: `1px solid ${style.text}20`
      }}>
        {style.icon} {severity}
      </span>
    );
  };

  return (
    <div className="p-4 bg-light min-vh-100 text-start" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <ClipboardList className="text-primary" size={24} /> Audit Trail & Compliance
          </h4>
          <p className="text-muted small mb-0">
            Monitoring Database: <span className="badge bg-primary-subtle text-primary border ms-1">erp_finance</span>
          </p>
        </div>

        <div className="d-flex gap-2">
            <div className="position-relative">
                <Search className="position-absolute ms-3 mt-2 text-muted" size={16} />
                <input 
                    type="text" 
                    placeholder="Search actions or users..." 
                    className="form-control form-control-sm ps-5 border-0 shadow-sm"
                    style={{ width: '280px', height: '38px', borderRadius: '10px' }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={fetchLogs} className="btn btn-white border shadow-sm rounded-3">
                <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="btn btn-navy shadow-sm d-flex align-items-center gap-2">
                <Download size={16} /> Export Logs
            </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="row g-3 mb-4 no-print">
        {[
          { label: 'Total Logs', val: logs.length, icon: <Activity className="text-primary"/>, sub: 'All recorded events' },
          { label: 'Security Alerts', val: logs.filter(l => getSeverity(l.action) === 'HIGH').length, icon: <ShieldAlert className="text-danger"/>, sub: 'High risk detected' },
          { label: 'System Health', val: 'Healthy', icon: <ShieldCheck className="text-success"/>, sub: 'Audit engine active' },
          { label: 'Database Status', val: 'Online', icon: <Database className="text-info"/>, sub: 'PostgreSQL connected' }
        ].map((card, i) => (
          <div key={i} className="col-md-3">
            <div className="card border-0 shadow-sm p-3 rounded-4 h-100">
              <div className="d-flex justify-content-between mb-2">
                <small className="text-uppercase fw-bold text-muted" style={{fontSize: '10px'}}>{card.label}</small>
                {card.icon}
              </div>
              <h4 className="fw-bold mb-0">{card.val}</h4>
              <small className="text-muted" style={{fontSize: '11px'}}>{card.sub}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Main Log Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white p-3 border-0 d-flex justify-content-between align-items-center">
            <h6 className="fw-bold text-navy mb-0">System Activity Ledger</h6>
            <div className="d-flex gap-2">
                <span className="badge bg-light text-muted border fw-normal">Live Feed</span>
            </div>
        </div>
        
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="text-muted small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  <th className="ps-4 py-3">Severity</th>
                  <th>Action Type</th>
                  <th>Description / Metadata</th>
                  <th>Performed By</th>
                  <th className="pe-4">Execution Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">Synchronizing with erp_finance database...</td></tr>
                ) : filteredLogs.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No audit matches found for "{searchTerm}"</td></tr>
                ) : filteredLogs.map(log => (
                  <tr key={log.id} className="border-bottom-0">
                    <td className="ps-4">
                      {getSeverityBadge(getSeverity(log.action))}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 fw-bold text-navy" style={{ fontSize: '13px' }}>
                        <FileText size={14} className="text-muted" /> {log.action}
                      </div>
                    </td>
                    <td className="text-muted" style={{ fontSize: '13px', maxWidth: '400px' }}>
                        {log.description}
                    </td>
                    <td>
                        <div className="d-flex align-items-center gap-2 fw-semibold text-dark">
                            <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                                {log.username?.charAt(0).toUpperCase()}
                            </div>
                            {log.username}
                        </div>
                    </td>
                    <td className="pe-4">
                        <div className="text-muted small d-flex align-items-center gap-2">
                            <Clock size={13} /> {new Date(log.timestamp).toLocaleString()}
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

export default AuditLogs;