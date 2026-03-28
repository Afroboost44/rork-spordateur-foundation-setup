import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

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
  
  const loginMutation = trpc.auth.userLogin.useMutation();

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserState(parsed);
        console.log('[AUTH] User loaded from storage:', parsed.email);
      } else {
        console.log('[AUTH] No user found in storage, logging in with test user...');
        try {
          const loginResult = await loginMutation.mutateAsync({
            email: 'user1@spordateur.com',
            password: 'password123',
          });
          
          const userData = {
            id: loginResult.id,
            email: loginResult.email,
            name: loginResult.name,
          };
          
          setUserState(userData);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
          console.log('[AUTH] Test user logged in successfully:', userData.id);
        } catch (loginError: any) {
          console.error('[AUTH] Auto-login failed:', loginError);
          if (loginError.message?.includes('Database not configured')) {
            console.log('[AUTH] Database not configured. Please set up the database first.');
          } else {
            console.log('[AUTH] Please run: npx prisma db seed');
          }
        }
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
