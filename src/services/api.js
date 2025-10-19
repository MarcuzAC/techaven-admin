// services/api.js
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
  
  // ✅ ADDED: Get all users with search and filters
  getUsers: async (params = {}) => {
    const { search, role, status, skip = 0, limit = 100 } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    
    if (search) queryParams.append('search', search);
    if (role) queryParams.append('type', role); // Map 'role' to 'type' for backend
    
    const response = await api.get(`/users?${queryParams}`);
    return response.data;
  },

  // ✅ ADDED: Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // ✅ ADDED: Update user status
  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  }
};

// ------------------------- SHOPS -------------------------
export const shopsAPI = {
  createShop: (data) => api.post('/shops/', data),
  
  // ✅ ADDED: Admin create shop
  createShopAdmin: async (data, userId = null, verified = true) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('verified', verified.toString());
    
    const response = await api.post(`/shops/admin/create?${params}`, data);
    return response.data;
  },
  
  getShops: () => api.get('/shops/'),
  getShop: (id) => api.get(`/shops/${id}`),
  updateShop: (id, data) => api.put(`/shops/${id}`, data),
  
  // ✅ ADDED: Admin update shop
  updateShopAdmin: async (id, data, verified = null) => {
    const params = new URLSearchParams();
    if (verified !== null) params.append('verified', verified.toString());
    
    const response = await api.put(`/shops/admin/${id}?${params}`, data);
    return response.data;
  },
  
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
  getMetrics: async () => {
    try {
      const response = await api.get('/admin/metrics');
      console.log('📊 Metrics API Response:', response.data);
      
      // Handle different response structures
      if (typeof response.data === 'string') {
        console.warn('⚠️ Metrics endpoint returned string instead of JSON');
        // If it's a string, try to parse it as JSON
        try {
          const parsedData = JSON.parse(response.data);
          return parsedData;
        } catch (parseError) {
          console.error('❌ Failed to parse metrics response as JSON:', parseError);
          // Return empty structure if parsing fails
          return {
            data: {
              totalUsers: 0,
              totalProducts: 0,
              totalOrders: 0,
              totalShops: 0,
              totalRevenue: 0,
              pendingShops: 0,
              userGrowth: 0,
              productGrowth: 0,
              orderGrowth: 0,
              shopGrowth: 0,
              revenueGrowth: 0,
              monthlyData: [],
              categoryDistribution: []
            }
          };
        }
      }
      
      // If response.data is already an object but doesn't have the expected structure
      if (response.data && typeof response.data === 'object') {
        // If the data is directly in response.data (not nested under .data)
        if (response.data.totalUsers !== undefined) {
          return { data: response.data };
        }
        // If it's already in the expected { data: { ... } } structure
        if (response.data.data) {
          return response.data;
        }
      }
      
      console.warn('⚠️ Unexpected metrics response structure:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Metrics API Error:', error);
      throw error;
    }
  },
};

export default api;