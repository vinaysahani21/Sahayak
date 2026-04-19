import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Dialog from '../../components/ui/Dialog';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const user = JSON.parse(localStorage.getItem('user')) || {};

    const confirmLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard Overview', path: '/admin/dashboard', icon: 'fa-chart-pie' },
        { name: 'Identity Management', path: '/admin/customers', icon: 'fa-users' },
        { name: 'Provider Network', path: '/admin/providers', icon: 'fa-user-tie' },
        { name: 'Service Catalog', path: '/admin/categories', icon: 'fa-layer-group' },
        { name: 'Master Ledger', path: '/admin/bookings', icon: 'fa-clipboard-list' },
        { name: 'Payouts & Finance', path: '/admin/payouts', icon: 'fa-money-bill-transfer' },
    ];

    return (
        <>
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-300 flex flex-col h-full shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-800/60 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* --- LOGO AREA --- */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/60 bg-slate-950 shrink-0">
                    <Link to="/admin/dashboard" className="text-2xl font-black tracking-tight text-white flex items-center gap-3" onClick={() => setIsOpen?.(false)}>
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm shadow-lg shadow-brand/20">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <span>Sahaayak<span className="text-brand">.</span></span>
                    </Link>

                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setIsOpen?.(false)}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* --- NAVIGATION LINKS --- */}
                {/* Notice the custom Tailwind classes here to violently hide the scrollbar while keeping scroll functionality */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Command Center</p>

                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen?.(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group ${
                                    isActive
                                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                }`
                            }
                        >
                            <i className={`fa-solid ${link.icon} w-5 text-center text-lg transition-transform duration-300 group-hover:scale-110`}></i>
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* --- BOTTOM COMMAND MODULE --- */}
                <div className="p-4 border-t border-slate-800/60 bg-slate-950 shrink-0">
                    <div className="bg-slate-900 rounded-2xl p-3 flex items-center justify-between border border-slate-800/60 shadow-inner">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative shrink-0">
                                <img
                                    src={user.profile_img || `https://ui-avatars.com/api/?name=Admin&background=2563EB&color=fff`}
                                    alt="Admin"
                                    className="w-10 h-10 rounded-xl object-cover shadow-sm"
                                />
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                            </div>
                            <div className="overflow-hidden pr-2">
                                <p className="text-sm font-black text-white leading-tight truncate">{user.name || 'Super Admin'}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">System Root</p>
                            </div>
                        </div>
                        
                        {/* Logout Icon Button */}
                        <button 
                            onClick={() => setShowLogoutDialog(true)}
                            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-transparent flex items-center justify-center transition-all shrink-0 active:scale-95"
                            title="Lock Workspace"
                        >
                            <i className="fa-solid fa-power-off"></i>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ================= MODAL: SECURE LOGOUT ================= */}
            <Dialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} title="System Security">
                <div className="text-center p-2">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-red-100">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Lock Workspace?</h4>
                    <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto leading-relaxed">
                        You are about to end your admin session. You will need to re-authenticate to access the control center.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" 
                            onClick={() => setShowLogoutDialog(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="flex-1 py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 active:scale-95 transition-all" 
                            onClick={confirmLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AdminSidebar;