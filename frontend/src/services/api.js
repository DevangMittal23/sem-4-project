import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
};

export const activityService = {
  getAll: () => api.get('/activities/'),
  getById: (id) => api.get(`/activities/${id}`),
  submit: (data) => api.post('/activities/submit', data),
  getMySubmissions: () => api.get('/activities/submissions/me'),
};

export const dashboardService = {
  getData: () => api.get('/dashboard/'),
};

export const analyticsService = {
  getCompletionChart: () => api.get('/analytics/completion-chart'),
  getDomainEngagement: () => api.get('/analytics/domain-engagement'),
  getConsistencyScore: () => api.get('/analytics/consistency-score'),
  getEngagementScore: () => api.get('/analytics/engagement-score'),
};

export const recommendationService = {
  generate: () => api.get('/recommendations/generate'),
};

export const adminService = {
  createActivity: (data) => api.post('/admin/activities', data),
  updateActivity: (id, data) => api.put(`/admin/activities/${id}`, data),
  deleteActivity: (id) => api.delete(`/admin/activities/${id}`),
  getUserProgress: () => api.get('/admin/user-progress'),
};

export default api;
