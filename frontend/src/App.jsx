import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import UserLayout from "./pages/customer/UserLayout";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Registration from "./pages/auth/UserRegister";
import ProviderRegister from "./pages/auth/ProviderRegister";

// Customer Pages
import Home from "./pages/customer/Home";
import SearchPage from "./pages/customer/SearchPage";
import SavedAddresses from "./pages/customer/SavedAddresses";
import ProfilePage from "./pages/customer/ProfilePage";
import BookingPage from "./pages/customer/BookingPage";
import ProviderProfile from "./pages/provider/ProviderProfile";
import MyBookings from "./pages/customer/MyBookings";
import BookingTimeline from "./pages/customer/BookingTimeline";

// Provider Pages
import ProviderSchedule from "./pages/provider/ProviderSchedule";
import MyServices from "./pages/provider/MyServices";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderLayout from "./pages/provider/ProviderLayout";
import ProviderDetails from "./pages/customer/ProviderDetails";
import ProviderEarnings from "./pages/provider/ProviderEarnings";

//Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProviders from './pages/admin/ManageProviders';
import ManageCustomers from './pages/admin/ManageCustomers';
import ManageCategories from './pages/admin/ManageCategories';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayouts from './pages/admin/AdminPayouts';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES (No Navbar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Registration />} />
        <Route path="/provider/register" element={<ProviderRegister />} />

        {/* PROTECTED USER ROUTES  */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="book-service" element={<BookingPage />} />
          <Route path="provider/:id" element={<ProviderDetails />} />
          <Route path="booking/:id" element={<BookingTimeline />} />
          <Route path="saved-addresses" element={<SavedAddresses />} />
        </Route>

        {/* PROTECTED PROVIDER ROUTES */}
        <Route path="/provider/" element={<ProviderLayout />}>
          <Route path="dashboard" element={<ProviderDashboard />} />
          <Route path="schedule" element={<ProviderSchedule />} />
          <Route path="services" element={<MyServices />} />
          <Route path="earnings" element={<ProviderEarnings />} />
          <Route path="profile" element={<ProviderProfile />} />

        </Route>

        {/* /* --- ADMIN ROUTES --- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="providers" element={<ManageProviders />} />
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payouts" element={<AdminPayouts />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
