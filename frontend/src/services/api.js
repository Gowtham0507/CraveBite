import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !apiBaseUrl) {
    // Keep UI usable even when deployment env vars are missing.
    // API calls will fail until VITE_API_BASE_URL is configured.
    console.warn('VITE_API_BASE_URL is missing in production. Falling back to localhost API URL.');
}

const API_URL = apiBaseUrl || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error?.response?.data?.message || error?.response?.data?.error || 'Request failed. Please try again.';
        return Promise.reject(new Error(message));
    }
);

export default api;
