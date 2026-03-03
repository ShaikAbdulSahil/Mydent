/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getToken, saveToken, clearToken, setGuestMode, isGuestMode, clearAllAuth } from '../utils/storage';

interface AuthContextProps {
  token: string | null;
  isGuest: boolean;
  login: (token: string) => void;
  logout: () => void;
  continueAsGuest: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  isGuest: false,
  login: () => { },
  logout: () => { },
  continueAsGuest: () => { },
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAuthState = async () => {
      const storedToken = await getToken();
      const guestMode = await isGuestMode();

      if (storedToken) {
        setToken(storedToken);
        setIsGuest(false);
      } else if (guestMode) {
        setIsGuest(true);
      }

      setLoading(false);
    };
    loadAuthState();
  }, []);

  const login = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
    setIsGuest(false);
  };

  const logout = async () => {
    await clearAllAuth();
    setToken(null);
    setIsGuest(false);
  };

  const continueAsGuest = async () => {
    await setGuestMode(true);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider value={{ token, isGuest, login, logout, continueAsGuest, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
