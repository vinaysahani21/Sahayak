import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest' };

  // Check if we are on pages that shouldn't show the standard shadow/border
  const isHomePage = location.pathname === '/user/home' || location.pathname === '/user/my-bookings';

  return (
    <header className={`sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl transition-all duration-300 ${isHomePage ? '' : 'border-b border-slate-100 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">

        {/* --- Brand Logo --- */}
        <Link to="/user/home" className="flex items-center gap-2 group transition-all">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
             <i className="fa-solid fa-shield-halved text-sm"></i>
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">
            Sahaayak<span className="text-brand">.</span>
          </h3>
        </Link>

        {/* --- Right Actions --- */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome</span>
            <span className="font-bold text-slate-900 text-sm leading-none">{user.name}</span>
          </div>
          
          <Link to="/user/profile" className="relative group">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white group-hover:bg-brand transition-all">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;