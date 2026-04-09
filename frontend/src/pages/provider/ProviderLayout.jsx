import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import ProviderSidebar from './ProviderSidebar';

const ProviderLayout = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Protect the route: Only allow providers
  if (!user || user.role !== 'provider') {
      return <Navigate to="/login" replace />;
  }

  return (
    // Fixed: Changed h-screen to h-[100dvh] for perfect mobile browser rendering
    <div className="flex h-[100dvh] bg-[#F8FAFC] overflow-hidden font-sans selection:bg-brand/20 selection:text-brand">
      
      {/* Sidebar now manages its own desktop/mobile states */}
      <ProviderSidebar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
        user={user} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">
        
        {/* --- MOBILE HEADER (Hidden on Desktop) --- */}
        <div className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white shadow-md shadow-brand/20">
                <i className="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <span className="font-black text-slate-900 tracking-tight text-xl">Sahaayak<span className="text-brand">.</span></span>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-bars text-lg"></i>
          </button>
        </div>

        {/* --- OUTLET WRAPPER --- */}
        {/* Added smooth scrolling and proper padding for the content inside */}
        <main className="flex-1 overflow-y-auto animate-fade-in scroll-smooth relative">
          <Outlet />
        </main>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {/* Darkens the background when the mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

    </div>
  );
};

export default ProviderLayout;