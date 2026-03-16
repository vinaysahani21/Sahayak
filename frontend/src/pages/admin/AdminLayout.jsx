import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // SECURITY CHECK: Kick out if not logged in OR if not an admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            
            {/* Sidebar (Always visible on desktop) */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {/* Mobile Header (Shows only on small screens) */}
                <header className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20">
                    <div className="text-white font-bold flex items-center gap-2">
                        <i className="fa-solid fa-shield-halved text-brand"></i> Sahaayak Admin
                    </div>
                    {/* In a full version, you'd add a hamburger menu toggle here */}
                    <button className="text-slate-300 hover:text-white">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                </header>

                {/* The dynamic page content (Dashboard, Users, etc.) loads here */}
                <main className="flex-1 overflow-y-auto animate-fade-in scroll-smooth">
                    <Outlet />
                </main>
            </div>

        </div>
    );
};

export default AdminLayout;