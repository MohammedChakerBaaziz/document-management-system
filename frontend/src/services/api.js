import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (username, password) => {
    return api.post('/api/auth/signin', { username, password });
  },
  register: (username, email, password) => {
    return api.post('/api/auth/signup', { username, email, password });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// User services
export const userService = {
  getAllUsers: () => {
    return api.get('/api/users');
  },
  getUserById: (id) => {
    return api.get(`/api/users/${id}`);
  },
  createUser: (userData) => {
    return api.post('/api/users', userData);
  },
  updateUser: (id, userData) => {
    return api.put(`/api/users/${id}`, userData);
  },
  deleteUser: (id) => {
    return api.delete(`/api/users/${id}`);
  },
  assignDepartments: (userId, departmentIds) => {
    return api.post('/api/users/assign-departments', { userId, departmentIds });
  },
  getUserDepartments: (userId) => {
    return api.get(`/api/users/${userId}/departments`);
  },
};

// Department services
export const departmentService = {
  getAllDepartments: () => {
    return api.get('/api/departments');
  },
  getDepartmentById: (id) => {
    return api.get(`/api/departments/${id}`);
  },
  createDepartment: (departmentData) => {
    return api.post('/api/departments', departmentData);
  },
  updateDepartment: (id, departmentData) => {
    return api.put(`/api/departments/${id}`, departmentData);
  },
  deleteDepartment: (id) => {
    return api.delete(`/api/departments/${id}`);
  },
  getDepartmentUsers: (id) => {
    return api.get(`/api/departments/${id}/users`);
  },
};

// Document Category services
export const categoryService = {
  getAllCategories: () => {
    return api.get('/api/categories');
  },
  getCategoryById: (id) => {
    return api.get(`/api/categories/${id}`);
  },
  createCategory: (categoryData) => {
    return api.post('/api/categories', categoryData);
  },
  updateCategory: (id, categoryData) => {
    return api.put(`/api/categories/${id}`, categoryData);
  },
  deleteCategory: (id) => {
    return api.delete(`/api/categories/${id}`);
  },
};

// Document services
export const documentService = {
  getAllDocuments: () => {
    return api.get('/api/documents');
  },
  getDocumentById: (id) => {
    return api.get(`/api/documents/${id}`);
  },
  getDocumentsByDepartment: (departmentId) => {
    return api.get(`/api/documents/department/${departmentId}`);
  },
  getDocumentsByDepartments: (departmentIds) => {
    return api.get('/api/documents/departments', { params: { departmentIds } });
  },
  getDocumentsByCategory: (categoryId) => {
    return api.get(`/api/documents/category/${categoryId}`);
  },
  getDocumentsByUser: (userId) => {
    return api.get(`/api/documents/user/${userId}`);
  },
  searchDocuments: (query) => {
    return api.get('/api/documents/search', { params: { query } });
  },
  createDocument: (documentData) => {
    return api.post('/api/documents', documentData);
  },
  updateDocument: (id, documentData) => {
    return api.put(`/api/documents/${id}`, documentData);
  },
  deleteDocument: (id) => {
    return api.delete(`/api/documents/${id}`);
  },
};

// Storage services
export const storageService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/api/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getDownloadUrl: (fileKey) => {
    return api.get(`/api/storage/download-url/${fileKey}`);
  },
};

// Translation services
export const translationService = {
  translateText: (text) => {
    return api.post('/api/translate', { text });
  },
};

export default api;
