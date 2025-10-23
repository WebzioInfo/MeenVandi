import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to attach Authorization header from non-httpOnly storage (if present)
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: return the full axios response so callers can use response.data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // preserve original error response when possible
    const err = error?.response ? error : new Error(error.message || 'Request failed');
    return Promise.reject(err);
  }
);
api.defaults.withCredentials = true;


// Domain APIs (comfortable set of methods and aliases expected by stores)
export const stopAPI = {
  list: () => api.get('/stops'),
  getAll: () => api.get('/stops'),
  request: (payload: any) => api.post('/stops/request', payload),
  getPending: () => api.get('/stops/pending'),
  getActive: () => api.get('/stops/active'),
  getByVehicle: (vehicleId: string | number) => api.get(`/stops/vehicle/${vehicleId}`),
  getById: (id: string | number) => api.get(`/stops/${id}`),
  create: (payload: any) => api.post('/stops', payload),
};

export const routeAPI = {
  list: () => api.get('/routes'),
  getAll: () => api.get('/routes'),
  byId: (id: string | number) => api.get(`/routes/${id}`),
  getById: (id: string | number) => api.get(`/routes/${id}`),
};

export const vehicleAPI = {
  list: () => api.get('/vehicles'),
  getAll: () => api.get('/vehicles'),
  byId: (id: string | number) => api.get(`/vehicles/${id}`),
  getById: (id: string | number) => api.get(`/vehicles/${id}`),
  getOnline: () => api.get('/vehicles/online'),
  getNearby: (lat: number, lng: number, radius = 5) => api.get(`/vehicles/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  getByType: (type: string) => api.get(`/vehicles/type/${type}`),
  updateLocation: (id: string | number, payload: any) => api.patch(`/vehicles/${id}/location`, payload),
  toggleSound: (id: string | number, enabled: boolean) => api.patch(`/vehicles/${id}/sound/${enabled}`),
  updateStatus: (id: string | number, status: string) => api.patch(`/vehicles/${id}/status/${status}`),
};

export const orderAPI = {
  list: () => api.get('/orders'),
  getAll: () => api.get('/orders'),
  create: (payload: any) => api.post('/orders', payload),
  getById: (id: string | number) => api.get(`/orders/${id}`),
  getByVehicle: (vehicleId: string | number) => api.get(`/orders/vehicle/${vehicleId}`),
  getByUser: (userId: string | number) => api.get(`/orders/user/${userId}`),
};

export const inventoryAPI = {
  list: () => api.get('/inventory'),
  getAll: () => api.get('/inventory'),
  getByVehicle: (vehicleId: string | number) => api.get(`/inventory/vehicle/${vehicleId}`),
};

export const paymentAPI = {
  list: () => api.get('/payments'),
  create: (payload: any) => api.post('/payments', payload),
  getById: (id: string | number) => api.get(`/payments/${id}`),
};

export const userAPI = {
  list: () => api.get('/users'),
  getAll: () => api.get('/users'),
  create: (payload: any) => api.post('/users', payload),
  getById: (id: string | number) => api.get(`/users/${id}`),
};
