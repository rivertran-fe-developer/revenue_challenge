import axios from "axios";

const BASE_URL = 
  process.env.NODE_ENV === "development" 
    ? "http://localhost:5001/api" 
    : process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;