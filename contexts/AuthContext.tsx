import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@spordateur_user';

export const [AuthProvider, useAuth] = createContextHook<AuthContextValue>(() => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserState(parsed);
        console.log('[AUTH] User loaded from storage:', parsed.email);
      } else {
        console.log('[AUTH] No user found in storage, using default test user');
        const defaultUser = {
          id: 'user1@spordateur.com',
          email: 'user1@spordateur.com',
          name: 'Test User',
        };
        setUserState(defaultUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
      }
    } catch (error) {
      console.error('[AUTH] Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      console.log('[AUTH] User saved to storage:', newUser.email);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[AUTH] User removed from storage');
    }
  };

  const logout = async () => {
    await setUser(null);
  };

  return {
    user,
    isLoading,
    setUser,
    logout,
  };
});
