import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // 1. Import useLocation

const Header = () => {
  const location = useLocation(); // 2. Get the current route
  
  // Mock User Data
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest' };

  // 3. Check if we are on the Home page
  // (Make sure this path matches exactly what is in your App.jsx routes)
  const isHomePage = location.pathname === '/user/home' || location.pathname === '/user/my-bookings';

  return (
    <header 
      // 4. Conditionally apply shadow and border
      className={`sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md py-3 transition-shadow duration-300 
        ${isHomePage ? '' : 'shadow-sm border-b border-gray-100'} 
      `}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">

        {/* --- Left: Brand Logo --- */}
        <Link to="/user/home" className="no-underline group">
          <h3 className="text-2xl font-bold font-display tracking-tight text-brand m-0 group-hover:opacity-80 transition-opacity">
            Sahaayak<span className="text-primary">.</span>
          </h3>
        </Link>

        {/* --- Right: Profile Section --- */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-xs text-gray-500 font-medium">Welcome,</span>
            <span className="font-bold text-gray-900 text-sm">{user.name}</span>
          </div>
          
          <Link to="/user/profile">
            <div
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white cursor-pointer hover:bg-blue-600 transition-colors text-sm"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;