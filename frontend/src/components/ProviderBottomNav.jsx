import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/BottomNav.css'; // Reuse existing styles

const ProviderBottomNav = () => {
  return (
    <div className="bottom-nav-dock">
      <NavLink to="/provider/dashboard" className="nav-dock-item" data-label="Job Center">
        <i className="bi bi-grid-fill"></i>
      </NavLink>
      <NavLink to="/provider/schedule" className="nav-dock-item" data-label="Schedule">
        <i className="bi bi-calendar-week"></i>
      </NavLink>
      <NavLink to="/provider/profile" className="nav-dock-item" data-label="Profile">
        <i className="bi bi-person-circle"></i>
      </NavLink>
    </div>
  );
};

export default ProviderBottomNav;