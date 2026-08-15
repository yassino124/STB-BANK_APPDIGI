import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  //baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1', // 💻 Local
  baseURL: import.meta.env.VITE_API_URL || 'https://stb-backend-blno.onrender.com/api/v1', // ☁️ Render Cloud
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
    // Backend wraps most responses in { success, data } — unwrap for convenience
    // But some endpoints (like /ai/chat) return plain objects — keep those as-is
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data &&
      response.data.data !== undefined
    ) {
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
