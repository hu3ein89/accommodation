import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { NotificationContext } from './context/NotificationContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Unauthorized from './components/Unauthorized';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import HotelDetails from './components/HotelDetails';
import HotelListPage from './pages/HotelListPage';
import HomePage from './components/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import PaymentPage from './pages/PaymentPage';
import ForgotPassword from './components/Auth/ForgetPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { fetchUserReservations } from './api/jsonServer';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { user } = useAuth();
  const { notification } = AntApp.useApp();

  useEffect(() => {
    const handleRouteError = (error) => {
      if (error.message.includes('Failed to load resource')) {
        window.location.reload();
      }
    };
    window.addEventListener('error', handleRouteError);
    return () => window.removeEventListener('error', handleRouteError);
  }, []);

  useEffect(() => {
    const syncReservationCount = async () => {
      if (!user?.id) {
        return;
      }

      try {
        // Show loading state
        notification.open({
          key: 'reservation-sync',
          message: 'در حال به روز رسانی رزروها...',
          duration: 0,
        });

        const userReservations = await fetchUserReservations(user.id);

        // Validate response structure
        if (!Array.isArray(userReservations)) {
          throw new Error('Invalid reservations data format');
        }


        notification.success({
          key: 'reservation-sync',
          message: 'رزروها با موفقیت به روز شد',
          duration: 2,
        });
      } catch (error) {
        console.error("Failed to sync reservation count:", error);

        notification.error({
          key: 'reservation-sync',
          message: 'خطا در به روز رسانی رزروها',
          description: 'لطفاً بعداً مجدداً تلاش کنید',
          duration: 3,
        });
      }
    };

    syncReservationCount();

    // Cleanup notification on unmount
    return () => {
      notification.destroy('reservation-sync');
    };
  }, [user, notification]);

  return (
    <NotificationContext.Provider value={notification}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hotels" element={<HotelListPage />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/user-dashboard/*"
          element={
            <ProtectedRoute roles={["Guest"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute roles={["Guest", "Admin", "Hotel Manager"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute roles={["Admin", "Hotel Manager"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* 404 Route */}
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </NotificationContext.Provider>
  );
};

export default App;