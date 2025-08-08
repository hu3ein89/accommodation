import { useState, useEffect } from 'react';
import {
  getUserFavorites,
  toggleFavorite as apiToggleFavorite
} from '../api/jsonServer';

export const useFavorites = (userId) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshFavorites = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getUserFavorites(userId);
      setFavorites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (hotelId) => {
    if (!userId) {
      throw new Error('User  not authenticated');
    }
    try {
      setLoading(true);
      const result = await apiToggleFavorite(userId, hotelId);
      if (result.action === 'added') {
        setFavorites(prev => [...prev, { hotelId }]);
      } else {
        setFavorites(prev => prev.filter(fav => fav.hotelId !== hotelId));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [userId]);

  return { 
    favorites, 
    loading, 
    error, 
    toggleFavorite,
    isFavorite: (hotelId) => favorites.some(fav => fav.hotelId === hotelId)
  };
};
