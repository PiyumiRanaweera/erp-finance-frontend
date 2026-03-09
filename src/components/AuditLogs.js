import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, ShieldCheck,
  RotateCcw, Database,
  Download, Activity, ShieldAlert, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  // 1. Enhanced Fetch Logs Logic
  const fetchLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // Updated to match the backend endpoint /api/audit-logs
      const res = await axios.get('http://localhost:8080/api/audit-logs');
      setLogs(res.data);
      setDbStatus('Online');
      if (!isSilent) toast.success("Audit trail synchronized");
    } catch (err) {
      setDbStatus('Offline');
      if (!isSilent) toast.error("Live sync failed: Backend unreachable");
      
      // Fallback dummy data for development visualization
      if (logs.length === 0) {
        setLogs([
          { id: 1, severity: 'HIGH', action: "SYSTEM_OFFLINE", performedBy: "Kernel", timestamp: new Date().toISOString(), details: "Database connection lost or API down" }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [logs.length]);

  // 2. Auto-Refresh Logic (Runs every 30 seconds if enabled)
  useEffect(() => {
    fetchLogs();
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(() => fetchLogs(true), 30000); 
    }
    return () => clearInterval(interval);
  }, [fetchLogs, isAutoRefresh]);

  // 3. Refined PDF Export Logic
  const exportToPDF = () => {
    if (filteredLogs.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const doc = new jsPDF();
    
    // Add Branding & Title
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('ERP MASTER', 14, 15);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Official System Audit Report', 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Total Records in Report: ${filteredLogs.length}`, 14, 38);

    // Table Mapping
    const tableColumn = ["SEVERITY", "ACTION TYPE", "DESCRIPTION", "USER", "TIMESTAMP"];
    const tableRows = filteredLogs.map(log => [
      log.severity?.toUpperCase() || 'INFO',
      log.action || 'N/A',
      log.details || 'No details provided',
      log.performedBy || 'System',
      new Date(log.timestamp).toLocaleString()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [33, 37, 41], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        2: { cellWidth: 70 }, // Description column gets more space
      },
      didParseCell: function(data) {
          if (data.column.index === 0 && data.cell.section === 'body') {
              if (data.cell.raw === 'CRITICAL' || data.cell.raw === 'HIGH') {
                  data.cell.styles.textColor = [225, 29, 72];
              }
          }
      }
    });

    doc.save(`Audit_Log_Export_${new Date().getTime()}.pdf`);
    toast.success("PDF exported successfully");
  };

  // 4. Filter Logic (Memoized calculation happens automatically on render)
  const filteredLogs = logs.filter(log => 
    (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (log.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (log.performedBy?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (severity) => {
    const styles = {
      CRITICAL: { bg: '#fef2f2', text: '#991b1b', icon: <ShieldAlert size={12}/> },
      HIGH: { bg: '#fff1f2', text: '#e11d48', icon: <ShieldAlert size={12}/> },
      INFO: { bg: '#f0fdf4', text: '#166534', icon: <ShieldCheck size={12}/> },
    };
    const style = styles[severity?.toUpperCase()] || styles.INFO;
    return (
      <span style={{ 
        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        backgroundColor: style.bg, color: style.text, border: `1px solid ${style.text}20`
      }}>
        {style.icon} {severity || 'INFO'}
      </span>
    );
  };

  return (
    <div className="p-4 bg-light min-vh-100 text-start" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <ClipboardList className="text-primary" size={24} /> Audit Trail & Compliance
          </h4>
          <p className="text-muted small mb-0">System security logs and event history</p>
        </div>

        <div className="d-flex gap-2">
            <div className="position-relative">
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              <input 
                  type="text" 
                  placeholder="Search logs..." 
                  className="form-control form-control-sm border-0 shadow-sm ps-5"
                  style={{ width: '280px', height: '40px', borderRadius: '10px' }}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setIsAutoRefresh(!isAutoRefresh)} 
              className={`btn ${isAutoRefresh ? 'btn-primary' : 'btn-white bg-white'} border shadow-sm rounded-3 d-flex align-items-center gap-2`}
              title="Toggle Auto Refresh"
            >
              <RefreshCw size={18} className={isAutoRefresh ? 'animate-spin' : ''} />
              <span className="small fw-bold">{isAutoRefresh ? "Auto" : "Manual"}</span>
            </button>

            <button onClick={() => fetchLogs()} className="btn btn-white bg-white border shadow-sm rounded-3">
                <RotateCcw size={18} className={loading ? 'spin-animation' : ''} />
            </button>

            <button 
                onClick={exportToPDF}
                className="btn btn-dark shadow-sm d-flex align-items-center gap-2 rounded-3 px-3 fw-bold"
            >
                <Download size={16} /> Export PDF
            </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Logs', val: logs.length, icon: <Activity />, color: '#0d6efd' },
          { label: 'Database Status', val: dbStatus, icon: <Database />, color: dbStatus === 'Online' ? '#198754' : '#dc3545' }
        ].map((card, i) => (
          <div key={i} className="col-md-3">
            <div className="card border-0 shadow-sm p-3 rounded-4 h-100 bg-white border-start border-4" style={{borderColor: card.color}}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ color: card.color }}>{card.icon}</span>
                <small className="text-uppercase fw-bold text-muted" style={{fontSize: '10px'}}>{card.label}</small>
              </div>
              <h4 className="fw-bold mb-0">{card.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="text-muted small text-uppercase">
                  <th className="ps-4 py-3">Severity</th>
                  <th>Action Type</th>
                  <th>Description</th>
                  <th>User</th>
                  <th className="pe-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="border-bottom-0">
                      <td className="ps-4">{getSeverityBadge(log.severity)}</td>
                      <td className="fw-bold">{log.action}</td>
                      <td className="text-muted small">{log.details}</td>
                      <td className="fw-medium">{log.performedBy}</td>
                      <td className="pe-4 small text-muted">
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-dark">{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted italic">
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>

      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AuditLogs;