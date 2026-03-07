import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  addSkill: (data) => api.post('/user/skills', data),
  deleteSkill: (id) => api.delete(`/user/skills/${id}`),
  addLink: (data) => api.post('/user/links', data),
  deleteLink: (id) => api.delete(`/user/links/${id}`),
  addInterest: (data) => api.post('/user/interests', data),
  deleteInterest: (id) => api.delete(`/user/interests/${id}`),
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
  getSkillGrowth: () => api.get('/analytics/skill-growth'),
  getUserEngagement: () => api.get('/analytics/user-engagement'),
  getEventTimeline: () => api.get('/analytics/event-timeline'),
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

export const activityLifecycleService = {
  startActivity: (activityId) => api.post(`/activities/start/${activityId}`),
  pauseActivity: (activityId) => api.post(`/activities/pause/${activityId}`),
  resumeActivity: (activityId) => api.post(`/activities/resume/${activityId}`),
  completeActivity: (data) => api.post('/activities/complete', data),
  getUserProgress: () => api.get('/activities/user-progress'),
  getActivityStatus: (activityId) => api.get(`/activities/status/${activityId}`),
};

export const behaviorService = {
  getBehaviorSummary: () => api.get('/behavior/behavior-summary'),
};

export default api;
