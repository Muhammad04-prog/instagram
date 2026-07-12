import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://instagram-api.softclub.tj',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ig_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ig_token');
        // Extract locale from the URL path to redirect to the correct login route
        const pathname = window.location.pathname;
        const match = pathname.match(/^\/(ru|tg|en)\b/);
        const locale = match ? match[1] : 'ru';
        window.location.href = `/${locale}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
