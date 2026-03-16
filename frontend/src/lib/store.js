import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // We only save the user info. The token is safe in the browser's cookies!
      setAuth: (user) => set({
        user,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'tripneo-auth', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);