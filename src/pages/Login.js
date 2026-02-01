import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck } from 'lucide-react';

const Login = ({ setAuth }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // For now, we use a hardcoded check to get you moving fast.
        // Later, we connect this to: fetch('http://localhost:8080/api/auth/login')
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
            localStorage.setItem('isLoggedIn', 'true');
            setAuth(true);
            navigate('/dashboard');
        } else {
            alert("Invalid Credentials!");
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fe' }}>
            <div style={{ width: '400px', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ background: '#1a237e', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                        <ShieldCheck color="white" size={32} />
                    </div>
                    <h2 style={{ color: '#1a237e', margin: 0 }}>ERP MASTER</h2>
                    <p style={{ color: '#9fa8da', fontSize: '12px' }}>Secure Financial Portal</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                            <input 
                                type="text" 
                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none' }}
                                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                            <input 
                                type="password" 
                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none' }}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button type="submit" style={{ width: '100%', background: '#1a237e', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;