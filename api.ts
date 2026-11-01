import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------- Auth ----------
export const login = (email: string, password: string) =>
  api.post("/api/v1/auth/login", { email, password });

export const getMe = () => api.get("/api/v1/auth/me");

export const changePassword = (current_password: string, new_password: string) =>
  api.post("/api/v1/auth/change-password", { current_password, new_password });

// ---------- Users ----------
export const listUsers = () => api.get("/api/v1/users");
export const createUser = (data: any) => api.post("/api/v1/users", data);
export const getUser = (id: string) => api.get(`/api/v1/users/${id}`);
export const updateUser = (id: string, data: any) => api.put(`/api/v1/users/${id}`, data);

// ---------- Inquiries ----------
export const listInquiries = (params?: any) =>
  api.get("/api/v1/inquiries", { params });
export const createInquiry = (data: any) => api.post("/api/v1/inquiries", data);
export const getInquiry = (id: string) => api.get(`/api/v1/inquiries/${id}`);
export const updateInquiry = (id: string, data: any) =>
  api.put(`/api/v1/inquiries/${id}`, data);
export const deleteInquiry = (id: string) => api.delete(`/api/v1/inquiries/${id}`);
export const assignInquiry = (id: string, assigned_to: string) =>
  api.post(`/api/v1/inquiries/${id}/assign`, undefined, { params: { assigned_to } });
export const getInquiryActivities = (id: string) =>
  api.get(`/api/v1/inquiries/${id}/activities`);

// ---------- Students ----------
export const listStudents = (params?: any) =>
  api.get("/api/v1/students", { params });
export const createStudent = (data: any) => api.post("/api/v1/students", data);
export const getStudent = (id: string) => api.get(`/api/v1/students/${id}`);
export const updateStudent = (id: string, data: any) =>
  api.put(`/api/v1/students/${id}`, data);
export const deleteStudent = (id: string) =>
  api.delete(`/api/v1/students/${id}`);

// ---------- Courses ----------
export const listCourses = (params?: any) =>
  api.get("/api/v1/courses", { params });
export const createCourse = (data: any) => api.post("/api/v1/courses", data);
export const getCourse = (id: string) => api.get(`/api/v1/courses/${id}`);
export const updateCourse = (id: string, data: any) =>
  api.put(`/api/v1/courses/${id}`, data);
export const deleteCourse = (id: string) =>
  api.delete(`/api/v1/courses/${id}`);

// ---------- Follow-ups ----------
export const listFollowUps = (params?: any) =>
  api.get("/api/v1/follow-ups", { params });
export const createFollowUp = (data: any) => api.post("/api/v1/follow-ups", data);
export const completeFollowUp = (id: string, outcome?: string) =>
  api.patch(`/api/v1/follow-ups/${id}/complete`, undefined, { params: { outcome } });
export const updateFollowUp = (id: string, data: any) =>
  api.put(`/api/v1/follow-ups/${id}`, data);

// ---------- Dashboard ----------
export const getDashboardAnalytics = (params?: any) =>
  api.get("/api/v1/dashboard/analytics", { params });

// ---------- Reports ----------
export const getConversionsReport = (params?: any) =>
  api.get("/api/v1/reports/conversions", { params });
