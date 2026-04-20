import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // We prefer HttpOnly cookie auth, but keep token as Bearer fallback when returned.
      setAuth: ({ user, token = null }) => set({
        user,
        token,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),

      // Global UI state for Login Modal
      isAuthModalOpen: false,
      setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
    }),
    {
      name: 'tripneo-auth', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

export const useBookingStore = create(
  persist(
    (set) => ({
      searchQuery: null,
      selectedFlight: null,
      selectedFare: null,
      selectedSeats: [],
      passengers: [],
      activeBooking: null, // Holds the live BookingResponse object which contains PNR and expires_at

      setSearchQuery: (query) => set({ 
        searchQuery: {
          ...query,
          adults: query.adults || 1,
          children: query.children || 0,
          infants: query.infants || 0,
          cabinClass: query.cabinClass || 'ECONOMY',
          tripType: query.tripType || 'one_way',
          passengers: (query.adults || 1) + (query.children || 0) + (query.infants || 0)
        } 
      }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedFare: (fare) => set({ selectedFare: fare }),
      setSelectedSeats: (seats) => set({ selectedSeats: seats }),
      setPassengers: (passengers) => set({ passengers: passengers }),
      setActiveBooking: (booking) => set({ activeBooking: booking }),

      clearBookingFlow: () => set({
        selectedFlight: null,
        selectedFare: null,
        selectedSeats: [],
        passengers: [],
        activeBooking: null,
      }),
    }),
    {
      name: 'tripneo-booking-flow',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
