import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Dialog from '../../components/ui/Dialog';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const user = JSON.parse(localStorage.getItem('user')) || {};

    const confirmLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-chart-pie' },
        { name: 'Manage Providers', path: '/admin/providers', icon: 'fa-user-tie' },
        { name: 'Manage Customers', path: '/admin/customers', icon: 'fa-users' },
        { name: 'Service Categories', path: '/admin/categories', icon: 'fa-layer-group' },
        { name: 'Master Bookings', path: '/admin/bookings', icon: 'fa-clipboard-list' },
        { name: 'Payouts & Finance', path: '/admin/payouts', icon: 'fa-money-bill-transfer' },
    ];

    return (
        <>
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl hidden md:flex flex-shrink-0 z-20 relative">

                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
                    <Link to="/admin/dashboard" className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm shadow-lg shadow-brand/20">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <span>Sahaayak<span className="text-brand">.</span></span>
                    </Link>
                </div>

                {/* Admin Profile Quick View */}
                <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
                    <img
                        src={user.profile_img ? user.profile_img : `https://ui-avatars.com/api/?name=Admin&background=2563EB&color=fff`}
                        alt="Admin"
                        className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover"
                    />
                    <div>
                        <p className="text-sm font-bold text-white leading-tight">{user.name || 'Super Admin'}</p>
                        <p className="text-[10px] font-bold text-brand uppercase tracking-wider">System Root</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Main Menu</p>

                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <i className={`fa-solid ${link.icon} w-5 text-center text-lg`}></i>
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                    <button 
                        onClick={() => setShowLogoutDialog(true)}
                        className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                    >
                        <i className="fa-solid fa-right-from-bracket w-5 text-center text-lg group-hover:-translate-x-1 transition-transform"></i>
                        Secure Logout
                    </button>
                </div>
            </aside>

            {/* logout Dialod modal */}
            <Dialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} title="Confirm Action">
                <div className="text-center p-2">
                    <div className="w-20 h-10 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-red-100">
                        <i className="fa-solid fa-power-off"></i>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Clocking out?</h4>
                    <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto leading-relaxed">
                        You will need to sign back in to accept new jobs and manage your upcoming schedule.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" 
                            onClick={() => setShowLogoutDialog(false)}
                        >
                            Stay Online
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