import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import ProviderSidebar from './ProviderSidebar';

const ProviderLayout = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Protect the route: Only allow providers
  if (!user || user.role !== 'provider') {
      return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans selection:bg-brand selection:text-white">
      
      {/* Sidebar (Hidden on mobile, block on md+) */}
      <ProviderSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* The Outlet renders Dashboard, Profile, etc. inside this scrollable div */}
        <main className="flex-1 overflow-y-auto animate-fade-in scroll-smooth">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default ProviderLayout;