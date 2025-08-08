import React, { createContext, useState, useEffect, useContext } from 'react';

const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [pendingReservations, setPendingReservations] = useState(() => {
    const stored = localStorage.getItem('pendingReservations');
    return stored ? parseInt(stored, 10) : 0;
  });

  // Fetch pending reservations from JSON Server
  const fetchPendingReservations = async () => {
    try {
      const response = await fetch('http://localhost:3000/reservations?status=pending');
      const data = await response.json();
      return data.length;
    } catch (error) {
      console.error('Failed to fetch pending reservations:', error);
      return pendingReservations; // Return current value if fetch fails
    }
  };


  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await fetchPendingReservations();
      setPendingReservations(count);
    }, 5000); 

    fetchPendingReservations().then(setPendingReservations);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    localStorage.setItem('pendingReservations', pendingReservations.toString());
  }, [pendingReservations]);

  const incrementReservations = () => {
    setPendingReservations(prev => prev + 1);
  };

  const decrementReservations = () => {
    setPendingReservations(prev => Math.max(0, prev - 1));
  };

  const resetReservations = () => {
    setPendingReservations(0);
  };

  return (
    <ReservationContext.Provider 
      value={{ 
        pendingReservations,
        incrementReservations,
        decrementReservations,
        resetReservations
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservations = () => useContext(ReservationContext);