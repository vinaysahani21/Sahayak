import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Store admin data in localStorage with the role 'admin'
                localStorage.setItem('user', JSON.stringify({
                    ...data.data,
                    role: 'admin'
                }));
                // Redirect to the master dashboard
                navigate('/admin/dashboard');
            } else {
                setError(data.message || 'Invalid login credentials.');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError('Server connection failed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-4 relative overflow-hidden">
            
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
                {/* Header Area */}
                <div className="bg-slate-900 p-8 text-center border-b border-slate-800 relative">
                    <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-brand/30">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Sahaayak <span className="text-brand">Workspace</span></h2>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Authorized Personnel Only</p>
                </div>

                {/* Form Area */}
                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100 animate-fade-in">
                            <i className="fa-solid fa-circle-exclamation text-lg"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Admin Email</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <i className="fa-solid fa-envelope"></i>
                                </span>
                                <input 
                                    type="email" 
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all"
                                    placeholder="admin@sahayak.com"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <i className="fa-solid fa-lock"></i>
                                </span>
                                <input 
                                    type="password" 
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none text-slate-900 font-medium bg-slate-50 transition-all"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg mt-4 flex justify-center items-center gap-2 ${
                                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand hover:bg-blue-700 shadow-brand/20 active:scale-[0.98]'
                            }`}
                        >
                            {loading ? <i className="fa-solid fa-circle-notch fa-spin text-xl"></i> : 'Secure Login'}
                        </button>
                    </form>
                </div>
                
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <i className="fa-solid fa-lock mr-1"></i> 256-bit Encrypted Session
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;