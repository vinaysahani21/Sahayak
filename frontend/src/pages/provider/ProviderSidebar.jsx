import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Dialog from '../../components/ui/Dialog'; // Added the Dialog import

const ProviderSidebar = () => {
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false); // Added state for the modal

    // Triggered when the sidebar button is clicked
    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    // Triggered when the user confirms inside the modal
    const confirmLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/provider/dashboard', icon: 'fa-table-columns' },
        { name: 'My Schedule', path: '/provider/schedule', icon: 'fa-calendar-days' },
        { name: 'Services', path: '/provider/services', icon: 'fa-layer-group' },
        { name: 'Earnings', path: '/provider/earnings', icon: 'fa-wallet' },
        { name: 'Profile', path: '/provider/profile', icon: 'fa-user-tie' },
    ];

    return (
        <>
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl hidden md:flex flex-shrink-0 z-20 relative">
                
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
                    <Link to="/provider/dashboard" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm shadow-lg shadow-brand/20 text-white">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <span>Sahaayak<span className="text-brand">.</span></span>
                        <span className="text-[9px] text-brand font-black ml-1 uppercase bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md tracking-widest mt-1">Pro</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>
                    
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group ${
                                    isActive 
                                    ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <i className={`fa-solid ${link.icon} w-5 text-center text-lg transition-transform group-active:scale-95`}></i>
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-6 border-t border-slate-800 bg-slate-950/30">
                    <button 
                        onClick={handleLogoutClick}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <i className="fa-solid fa-right-from-bracket w-5 text-center text-lg"></i>
                        Secure Logout
                    </button>
                </div>
            </aside>

            {/* ================= MODAL: SECURE LOGOUT ================= */}
            <Dialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} title="Confirm Action">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
                        <i className="fa-solid fa-power-off"></i>
                    </div>
                    <h5 className="font-bold text-slate-900 text-2xl tracking-tight mb-2">Ready to clock out?</h5>
                    <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">
                        You will need to login again to accept new jobs and view your schedule.
                    </p>
                    
                    <div className="flex gap-4">
                        <button 
                            className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors" 
                            onClick={() => setShowLogoutDialog(false)}
                        >
                            Stay Online
                        </button>
                        <button 
                            className="flex-1 bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-colors shadow-lg active:scale-95" 
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

export default ProviderSidebar;