'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types';
import { DEMO_USERS } from '@/lib/auth';

interface AuthStoreWithHydration extends AuthState {
  isHydrated: boolean;
  setIsHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStoreWithHydration>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      setIsHydrated: (value: boolean) => set({ isHydrated: value }),
      login: (email: string, password: string): boolean => {
        const found = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (!found) return false;
        const { password: _, ...user } = found;
        set({ user, isAuthenticated: true });
        return true;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'sika-auth',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);