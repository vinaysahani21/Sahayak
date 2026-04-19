import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // SECURITY CHECK: Kick out if not logged in OR if not an admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />; 
    }

    return (
        <div className="flex h-[100dvh] bg-[#F8FAFC] overflow-hidden font-sans selection:bg-brand/20 selection:text-brand">
            
            {/* Sidebar manages its own mobile/desktop states via props */}
            <AdminSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">
                
                {/* --- MOBILE HEADER (Hidden on Desktop) --- */}
                <div className="md:hidden flex items-center justify-between bg-slate-950 border-b border-slate-800 px-4 py-3 shrink-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-md shadow-brand/20">
                            <i className="fa-solid fa-shield-halved text-sm"></i>
                        </div>
                        <span className="font-black tracking-tight text-xl">Sahaayak<span className="text-brand">.</span></span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)} 
                        className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
                    >
                        <i className="fa-solid fa-bars text-lg"></i>
                    </button>
                </div>

                {/* The dynamic page content loads here */}
                <main className="flex-1 overflow-y-auto animate-fade-in scroll-smooth relative">
                    <Outlet />
                </main>
            </div>

            {/* --- MOBILE OVERLAY --- */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

        </div>
    );
};

export default AdminLayout;