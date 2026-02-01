import React, { useState } from 'react';
import { Database, Download, UploadCloud, History, ShieldCheck, AlertCircle, HardDrive, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const BackupRestore = () => {
    const [backups, setBackups] = useState([
        { id: 1, name: 'Initial_Setup_Backup', date: '2026-01-15 08:00', size: '2.4 MB', status: 'Healthy' },
        { id: 2, name: 'EOY_2025_Final', date: '2025-12-31 23:59', size: '15.8 MB', status: 'Verified' },
        { id: 3, name: 'Pre_Update_Snapshot', date: '2026-01-18 14:20', size: '4.1 MB', status: 'Healthy' }
    ]);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleCreateBackup = () => {
        setIsBackingUp(true);
        const loadingToast = toast.loading("Encrypting and Compressing Database...");
        
        // Simulating the backend backup process
        setTimeout(() => {
            const newBackup = {
                id: backups.length + 1,
                name: `Manual_Snapshot_${new Date().toISOString().slice(0,10)}`,
                date: new Date().toLocaleString(),
                size: '4.2 MB',
                status: 'Healthy'
            };
            setBackups([newBackup, ...backups]);
            setIsBackingUp(false);
            toast.success("Backup Stored Successfully!", { id: loadingToast });
        }, 2000);
    };

    const handleRestore = (name) => {
        const confirm = window.confirm(`CRITICAL: Are you sure you want to restore to [${name}]? Current unsaved data will be overwritten.`);
        if (confirm) {
            toast.promise(
                new Promise((resolve) => setTimeout(resolve, 3000)),
                {
                    loading: 'Restoring Database Integrity...',
                    success: 'System Restored to Selected Point!',
                    error: 'Restore Failed.',
                }
            );
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Database size={32} color="#1a237e" /> Data Disaster Recovery
                </h1>
                <p style={{ color: '#64748b' }}>Securely manage database snapshots and system restoration</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                
                {/* Left Side: Backup History */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Restore Points</h3>
                        <History size={18} color="#64748b" />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '15px 20px' }}>Snapshot Name</th>
                                <th style={{ padding: '15px 20px' }}>Date</th>
                                <th style={{ padding: '15px 20px' }}>Size</th>
                                <th style={{ padding: '15px 20px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backups.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: '600', fontSize: '14px' }}>{b.name}</td>
                                    <td style={{ padding: '15px 20px', color: '#64748b', fontSize: '13px' }}>{b.date}</td>
                                    <td style={{ padding: '15px 20px', color: '#64748b', fontSize: '13px' }}>{b.size}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <button 
                                            onClick={() => handleRestore(b.name)}
                                            style={{ background: 'none', border: 'none', color: '#1a237e', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                        >
                                            RESTORE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right Side: Actions & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#1a237e', padding: '25px', borderRadius: '16px', color: 'white' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Global Backup</h3>
                        <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '20px' }}>Instantly create a secure snapshot of all journals, ledgers, and audit logs.</p>
                        <button 
                            disabled={isBackingUp}
                            onClick={handleCreateBackup}
                            style={{ 
                                width: '100%', background: 'white', color: '#1a237e', border: 'none', 
                                padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            {isBackingUp ? <RefreshCcw className="animate-spin" /> : <UploadCloud size={18}/>}
                            Generate Backup
                        </button>
                    </div>

                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#64748b' }}>SYSTEM HEALTH</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#15803d', fontWeight: 'bold', marginBottom: '10px' }}>
                            <ShieldCheck size={20} /> Encrypted (AES-256)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#15803d', fontWeight: 'bold' }}>
                            <HardDrive size={20} /> Storage: 82% Free
                        </div>
                    </div>

                    <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '12px', border: '1px solid #fef3c7', display: 'flex', gap: '10px' }}>
                        <AlertCircle color="#b45309" size={24} />
                        <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                            Restoring will disconnect all active users and roll back the database. Use with caution.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupRestore;