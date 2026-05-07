import { api } from './axios';

const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

export const flightApi = {
  // ── Public Endpoints ────────────────────────────────────────────────────────

  searchFlights: async (params) => {
    const { data } = await api.get('/flights/search', { params });
    return toSnakeCase(data?.data || data?.flights || []);
  },

  searchAirports: async (search) => {
    const { data } = await api.get('/flights/airports', {
      params: { search },
    });
    return toSnakeCase(data?.data || []);
  },

  getAirlines: async () => {
    const { data } = await api.get('/flights/airlines');
    return toSnakeCase(data?.data || []);
  },

  getAircraftTypes: async () => {
    const { data } = await api.get('/flights/aircraft-types');
    return toSnakeCase(data?.data || []);
  },

  getFlightDetails: async (instanceId) => {
    const { data } = await api.get(`/flights/${instanceId}`);
    return toSnakeCase(data?.data || data);
  },

  getFares: async (instanceId) => {
    const { data } = await api.get(`/flights/${instanceId}/fares`);
    return toSnakeCase(data?.data || data?.fares || []);
  },

  getSeats: async (instanceId) => {
    const { data } = await api.get(`/flights/${instanceId}/seats`);
    return toSnakeCase(data?.data || data);
  },

  getAncillaries: async (instanceId) => {
    const { data } = await api.get(`/flights/${instanceId}/ancillaries`);
    return toSnakeCase(data?.data || data);
  },

  getFarePrediction: async (instanceId) => {
    const { data } = await api.get(`/flights/${instanceId}/fare-prediction`);
    return toSnakeCase(data?.data || data);
  },

  createBooking: async (bookingData) => {
    const { data } = await api.post('/flights/bookings', bookingData);
    return toSnakeCase(data?.data || data);
  },

  getBookingById: async (bookingId) => {
    const { data } = await api.get(`/flights/bookings/${bookingId}`);
    return toSnakeCase(data?.data || data);
  },

  getBookingByPnr: async (pnr) => {
    const { data } = await api.get(`/flights/bookings/pnr/${pnr}`);
    return toSnakeCase(data?.data || data);
  },

  confirmBooking: async (bookingId) => {
    const { data } = await api.post(`/flights/bookings/${bookingId}/confirm`);
    return toSnakeCase(data?.data || data);
  },

  cancelBooking: async (bookingId, reason) => {
    const { data } = await api.post(`/flights/bookings/${bookingId}/cancel`, { reason });
    return toSnakeCase(data?.data || data);
  },

  getBookingHistory: async () => {
    const { data } = await api.get('/flights/bookings/user/history');
    return toSnakeCase(data?.data || data);
  },

  getETicket: async (bookingId) => {
    const { data } = await api.get(`/flights/bookings/${bookingId}/ticket`);
    return toSnakeCase(data?.data || data);
  },

  getFlightStatus: async (pnr) => {
    const { data } = await api.get(`/flights/status/${pnr}`);
    return toSnakeCase(data?.data || data);
  },

  // ── Admin Endpoints ────────────────────────────────────────────────────────

  admin: {
    getAllBookings: async () => {
      const { data } = await api.get('/flights/admin/bookings');
      return toSnakeCase(data?.bookings || []);
    },

    updateBookingStatus: async (bookingId, status) => {
      const { data } = await api.put(`/flights/admin/bookings/${bookingId}/status`, { status });
      return toSnakeCase(data);
    },

    getAllFlightTemplates: async () => {
      const { data } = await api.get('/flights/admin/flights');
      return toSnakeCase(data?.flights || []);
    },

    createFlight: async (flightData) => {
      const { data } = await api.post('/flights/admin/flights', flightData);
      return toSnakeCase(data);
    },

    updateFlight: async (flightId, updates) => {
      const { data } = await api.put(`/flights/admin/flights/${flightId}`, updates);
      return toSnakeCase(data);
    },

    deleteFlight: async (flightId) => {
      const { data } = await api.delete(`/flights/admin/flights/${flightId}`);
      return toSnakeCase(data);
    },

    updateFares: async (instanceId, economyPrice, businessPrice) => {
      const { data } = await api.patch(`/flights/admin/flights/${instanceId}/fares`, { 
        economy_price: economyPrice, 
        business_price: businessPrice 
      });
      return toSnakeCase(data);
    },

    cancelFlightInstance: async (instanceId, reason) => {
      const { data } = await api.put(`/flights/admin/instances/${instanceId}/cancel`, { reason });
      return toSnakeCase(data);
    },
  },
};

