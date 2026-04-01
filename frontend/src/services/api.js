import axios from 'axios';

// API ka base URL — .env mein set karo
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// axios instance — saari requests ke liye ek jaisi settings
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// har response ke baad — success pe data lo, error pe clean message nikalo
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const diagnosisAPI = {
  diagnose: (symptoms) => api.post('/diagnose', { symptoms }),
  getHistory: (page = 1, limit = 10) => api.get(`/history?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
};
