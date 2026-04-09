import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HomeSearch from '../../components/HomeSearch';
import BottomNav from '../../components/BottomNav';
import BookingNav from '../../components/BookingNav';
import CommonNavbar from '../../components/ui/CommonNavbar';

const UserLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  // --- LOGIC ---
  const showHomeSearch = path === '/user/home';

  const showBookingNav = path ==='/user/my-bookings';

  const showCommonNav = path === '/user/book-service' || path === '/user/saved-addresses';

  const title = () =>{
    if (path === '/user/book-service') return "Confirm Booking";
    if (path === '/user/saved-addresses') return "Saved Addresses";
    return "";
  }

  const hideHeader = 
    path === '/user/search' || 
    path.startsWith('/user/provider/') ||
    path === '/user/book-service' ||
    path.startsWith('/user/booking/') ||
    path === '/user/saved-addresses';

  const hideBottomNav = 
    path.startsWith('/user/provider/') ||
    path === '/user/book-service' ||
    path === '/user/saved-addresses' ||
    path.startsWith('/user/booking/');

  // Pages that need FULL WIDTH (No 120px margin)
  // Usually the Home page looks better full width with its own container, 
  // but if you want 120px everywhere, remove this check.
  const isFullWidthPage = path === '/user/search' || path.startsWith('/user/provider/') || path.startsWith('/user/book-service')  ;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">

      {/* 1. Sticky Top Header */}
      {!hideHeader && <Navbar />}

      {/* 2. Search Bar (Home Only) */}
      {showHomeSearch && <HomeSearch />}

      {showBookingNav && <BookingNav />}

      {showCommonNav && <CommonNavbar title={title()} />}



      {/* 3. Page Content */}
      {/* - px-4: Small padding for Mobile
          - md:px-[120px]: 120px padding for Laptop/Desktop 
          - max-w-[1920px]: Prevents it from stretching too wide on 4k screens
          - mx-auto: Centers everything
      */}
      <div className={`w-full mx-auto ${isFullWidthPage ? '' : 'px-4 md:px-[120px]'}`}>
        <Outlet />
      </div>

      {/* 4. Floating Bottom Nav */}
      {!hideBottomNav && <BottomNav />}

    </div>
  );
};

export default UserLayout;