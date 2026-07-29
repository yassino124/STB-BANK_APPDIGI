import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stb_rh_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Backend wraps response in { success, data }
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Basic handling: if unauthorized, clear token and redirect to login
      localStorage.removeItem('stb_rh_token');
      localStorage.removeItem('stb_rh_user');
      window.location.href = '/login';
      toast.error('Session expirée, veuillez vous reconnecter.');
    }
    return Promise.reject(error);
  }
);

export default api;
