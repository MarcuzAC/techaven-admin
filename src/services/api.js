import axios from 'axios';

const API_BASE_URL = 'https://techaven-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 🔐 Add Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚫 Handle Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ------------------------- AUTH -------------------------
// Admin Authentication API
export const authAPI = {
  // 🔐 Login using form-urlencoded
  login: async ({ email, password }) => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Save token after login
    if (response.data?.access_token) {
      localStorage.setItem('admin_token', response.data.access_token);
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    return Promise.resolve();
  },

  getProfile: () => api.get('/auth/me'),
};


// ------------------------- USERS -------------------------
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getUser: (id) => api.get(`/users/${id}`),
};

// ------------------------- SHOPS -------------------------
export const shopsAPI = {
  createShop: (data) => api.post('/shops/', data),
  getShops: () => api.get('/shops/'),
  getShop: (id) => api.get(`/shops/${id}`),
  updateShop: (id, data) => api.put(`/shops/${id}`, data),
  getPending: () => api.get('/admin/shops/pending'),
  verifyShop: (id) => api.post(`/admin/shops/${id}/verify`),
};

// ------------------------- PRODUCTS -------------------------
export const productsAPI = {
  createProduct: (data) => api.post('/products/', data),
  getProducts: () => api.get('/products/'),
  getProduct: (id) => api.get(`/products/${id}`),
  uploadImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ------------------------- ORDERS -------------------------
export const ordersAPI = {
  getOrders: () => api.get('/orders/'),
  createOrder: (data) => api.post('/orders/', data),
  getOrder: (id) => api.get(`/orders/${id}`),
};

// ------------------------- PROMOTIONS -------------------------
export const promotionsAPI = {
  getPromotions: () => api.get('/promotions/'),
  createPromotion: (data) => api.post('/promotions/', data),
};

// ------------------------- ADMIN METRICS -------------------------
export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
};

export default api;