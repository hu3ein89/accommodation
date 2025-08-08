import React, { useContext, useState, createContext, useEffect } from "react";
import { useReservations } from "./ReservationContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { resetReservations } = useReservations();

  // Check for saved user session on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user data', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData) => {
    if (!userData || !userData.id) {
      console.error('Invalid user data provided to login');
      return;
    }

    const user = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      profileImage: userData.profileImage
    };

    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    // Call resetReservations to clear the badge count
    resetReservations();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const hasAnyRole = (requiredRoles = []) => {
    return requiredRoles.includes(user?.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      hasRole,
      hasAnyRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};