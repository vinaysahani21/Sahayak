import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';
import Dialog from '../../components/ui/Dialog';

const ProviderSidebar = ({ isOpen, setIsOpen, user }) => {
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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

    // Helper to get premium fallback image
    const getProfileImage = (imgStr) => {
        if (!imgStr || imgStr.includes('default')) return `https://ui-avatars.com/api/?name=${user?.name || 'Pro'}&background=334155&color=fff`;
        return imgStr.startsWith('http') ? imgStr : `${API_BASE_URL}${imgStr}`;
    };

    return (
        <>
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-800 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* --- LOGO AREA --- */}
                <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-slate-800/60 bg-slate-950/30 shrink-0">
                    <Link to="/provider/dashboard" className="text-2xl font-black tracking-tight text-white flex items-center gap-2" onClick={() => setIsOpen(false)}>
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm shadow-lg shadow-brand/20 text-white">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <span>Sahaayak<span className="text-brand">.</span></span>
                        <span className="text-[9px] text-brand font-black ml-1 uppercase bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md tracking-widest mt-1">Pro</span>
                    </Link>

                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* --- NAVIGATION LINKS --- */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
                    
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)} // Close menu on mobile click
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group ${
                                    isActive 
                                    ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <i className={`fa-solid ${link.icon} w-5 text-center text-lg transition-transform duration-300 group-hover:scale-110`}></i>
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* --- BOTTOM ACTIONS (Profile & Logout) --- */}
                <div className="p-4 border-t border-slate-800/60 bg-slate-950/30 shrink-0">
                    
                    {/* Mini Profile Card */}
                    {/* <div className="flex items-center gap-3 px-2 mb-4">
                        <img 
                            src={getProfileImage(user?.profile_img)} 
                            alt={user?.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'Professional'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{user?.profession || 'Service Partner'}</p>
                        </div>
                    </div> */}

                    <button 
                        onClick={() => setShowLogoutDialog(true)}
                        className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                    >
                        <i className="fa-solid fa-right-from-bracket w-5 text-center text-lg group-hover:-translate-x-1 transition-transform"></i>
                        Secure Logout
                    </button>
                </div>
            </aside>

            {/* ================= MODAL: SECURE LOGOUT ================= */}
            <Dialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} title="Confirm Action">
                <div className="text-center p-2">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-red-100">
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

export default ProviderSidebar;