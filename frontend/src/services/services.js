import API from './api';

export const authService = {
  login: (data) => API.post('/auth/login', data),
  signup: (data) => API.post('/auth/signup', data),
  getMe: () => API.get('/auth/me'),
};

export const patientService = {
  getAll: (params) => API.get('/patients', { params }),
  getById: (id) => API.get(`/patients/${id}`),
  create: (data) => API.post('/patients', data),
  update: (id, data) => API.put(`/patients/${id}`, data),
  remove: (id) => API.delete(`/patients/${id}`),
};

export const doctorService = {
  getAll: (params) => API.get('/doctors', { params }),
  getAllList: () => API.get('/doctors/all'),
  getById: (id) => API.get(`/doctors/${id}`),
  create: (data) => API.post('/doctors', data),
  update: (id, data) => API.put(`/doctors/${id}`, data),
  remove: (id) => API.delete(`/doctors/${id}`),
};

export const appointmentService = {
  getAll: (params) => API.get('/appointments', { params }),
  getById: (id) => API.get(`/appointments/${id}`),
  create: (data) => API.post('/appointments', data),
  update: (id, data) => API.put(`/appointments/${id}`, data),
  updateStatus: (id, data) => API.patch(`/appointments/${id}/status`, data),
  remove: (id) => API.delete(`/appointments/${id}`),
};

export const billingService = {
  getAll: (params) => API.get('/billing', { params }),
  getById: (id) => API.get(`/billing/${id}`),
  create: (data) => API.post('/billing', data),
  update: (id, data) => API.put(`/billing/${id}`, data),
  updatePaymentStatus: (id, data) => API.patch(`/billing/${id}/status`, data),
  remove: (id) => API.delete(`/billing/${id}`),
};

export const medicineService = {
  getAll: (params) => API.get('/medicines', { params }),
  getAllList: () => API.get('/medicines/all'),
  getById: (id) => API.get(`/medicines/${id}`),
  create: (data) => API.post('/medicines', data),
  update: (id, data) => API.put(`/medicines/${id}`, data),
  remove: (id) => API.delete(`/medicines/${id}`),
};

export const prescriptionService = {
  getAll: (params) => API.get('/prescriptions', { params }),
  getById: (id) => API.get(`/prescriptions/${id}`),
  create: (data) => API.post('/prescriptions', data),
  update: (id, data) => API.put(`/prescriptions/${id}`, data),
  remove: (id) => API.delete(`/prescriptions/${id}`),
};

export const departmentService = {
  getAll: () => API.get('/departments'),
  create: (data) => API.post('/departments', data),
  update: (id, data) => API.put(`/departments/${id}`, data),
  remove: (id) => API.delete(`/departments/${id}`),
};

export const dashboardService = {
  getStats: () => API.get('/dashboard/stats'),
  getRecentAppointments: () => API.get('/dashboard/recent-appointments'),
  getAppointmentChart: () => API.get('/dashboard/appointment-chart'),
  getRevenueChart: () => API.get('/dashboard/revenue-chart'),
};
