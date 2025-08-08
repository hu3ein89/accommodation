import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { getUserByEmail, updateUserLogin } from '../api/jsonServer';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  
  const { user, isAuthenticated, login, logout } = context;
  const navigate = useNavigate();


  /**
   * Handles user login with credentials
   * @param {Object} credentials - Login credentials { email, password }
   * @returns {Promise<Object>} - Returns user data on success, throws error on failure
   */
  const handleLogin = async (credentials) => {
    try {
      // Validate input
      if (!credentials?.email || !credentials?.password) {
        throw new Error('ایمیل و رمز عبور الزامی هستند');
      }

      // Get user from API
      const userData = await getUserByEmail(credentials.email);
      
      if (!userData) {
        throw new Error('کاربری با این ایمیل یافت نشد');
      }
      
      // Validate password
      if (userData.password !== credentials.password) {
        throw new Error('رمز عبور اشتباه است');
      }

      // Update last login time
      await updateUserLogin(userData.id, {
        lastLogin: new Date().toISOString()
      });

      // Login user in context
      login({
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profileImage
      });

      // Show success notification
      notification.success({
        message: 'ورود با موفقیت انجام شد',
        description: `خوش آمدید ${userData.firstName || 'کاربر'}`
      });

      // Redirect based on role
      const routes = {
        'Admin': '/admin-dashboard',
        'Hotel Manager': '/admin-dashboard',
        'Guest': '/user-dashboard'
      };

      navigate(routes[userData.role] || '/');
      return userData;
    } catch (error) {
      notification.error({
        message: 'خطا در عملیات ورود',
        description: error.message || 'مشکلی در ورود پیش آمده است'
      });
      throw error;
    }
  };

  /**
   * Handles user logout
   */
  const handleLogout = () => {
    logout();
    notification.success({
      message: 'خروج موفق',
      description: 'شما با موفقیت از سیستم خارج شدید'
    });
    navigate('/login');
  };

  /**
   * Checks if user has a specific role
   * @param {string} requiredRole - The role to check against
   * @returns {boolean} - True if user has the required role
   */
  const hasRole = (requiredRole) => {
    if (!isAuthenticated || !user) return false;
    return user.role === requiredRole;
  };

  /**
   * Checks if user has any of the specified roles
   * @param {Array<string>} requiredRoles - Array of roles to check against
   * @returns {boolean} - True if user has any of the required roles
   */
  const hasAnyRole = (requiredRoles = []) => {
    if (!isAuthenticated || !user) return false;
    return requiredRoles.includes(user.role);
  };

  return {
    // State
    user,
    isAuthenticated,
    
    // Methods
    login: handleLogin,
    logout: handleLogout,
    hasRole,
    hasAnyRole,
    
    // Aliases for convenience
    isLoggedIn: isAuthenticated,
    currentUser: user
  };
};