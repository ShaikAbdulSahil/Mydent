/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  addToFavorite,
  getFavorites,
  removeFavoriteItem,
} from '../api/fav-api';
import { AuthContext } from './AuthContext';

const FavoriteContext = createContext<any>(null);

export const FavoriteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favorites, setFavorites] = useState<any[]>([]);

  const {token} = useContext(AuthContext)
  const fetchFavorites = async () => {
    try {
      if(!token) return;
      const res = await getFavorites();
      setFavorites(res.data);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if(!token) return;
    const isFav = favorites.some((fav) => fav.product._id === productId);

    try {
      if (isFav) {
        await removeFavoriteItem(productId); // ✅ use this directly
        setFavorites((prev) =>
          prev.filter((fav) => fav.product._id !== productId),
        );
      } else {
        const res = await addToFavorite(productId);
        setFavorites((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [token]);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoriteContext);
