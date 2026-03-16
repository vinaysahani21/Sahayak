import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  
  // Helper to define active/inactive styles dynamically
  const getNavItemClass = ({ isActive }) => {
    const baseClass = "flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative group";
    const activeClass = "text-primary -translate-y-1"; // Active: Blue & slightly lifted
    const inactiveClass = "text-gray-400 hover:text-gray-600 hover:-translate-y-0.5"; // Inactive: Grey
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    // Wrapper: Fixed at bottom, Glassmorphism, Floating Dock style
    // "md:hidden" ensures this only shows on Mobile/Tablet (Standard UX)
    <div className="fixed bottom-4 left-4 right-4 z-50">
      
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl h-16 flex justify-around items-center px-2 max-w-md mx-auto ring-1 ring-black/5">
        
        {/* 1. Home */}
        <NavLink to="/user/home" className={getNavItemClass}>
          {({ isActive }) => (
            <>
              <i className={`fa-solid fa-house text-xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform`}></i>
              <span className="text-[10px] font-bold tracking-wide">Home</span>
              {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
            </>
          )}
        </NavLink>

        {/* 2. Search */}
        <NavLink to="/user/search" className={getNavItemClass}>
          {({ isActive }) => (
            <>
              <i className={`fa-solid fa-magnifying-glass text-xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform`}></i>
              <span className="text-[10px] font-bold tracking-wide">Explore</span>
              {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
            </>
          )}
        </NavLink>

        {/* 3. My Bookings */}
        <NavLink to="/user/my-bookings" className={getNavItemClass}>
          {({ isActive }) => (
            <>
              <i className={`fa-solid fa-calendar-check text-xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform`}></i>
              <span className="text-[10px] font-bold tracking-wide">Bookings</span>
              {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
            </>
          )}
        </NavLink>

        {/* 4. Profile */}
        <NavLink to="/user/profile" className={getNavItemClass}>
          {({ isActive }) => (
            <>
              <i className={`fa-solid fa-user text-xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform`}></i>
              <span className="text-[10px] font-bold tracking-wide">Profile</span>
              {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
            </>
          )}
        </NavLink>

      </div>
    </div>
  );
};

export default BottomNav;