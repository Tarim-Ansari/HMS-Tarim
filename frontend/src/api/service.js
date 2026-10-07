/**
 * MediCore HMS - API Services
 *
 * Domain-specific API methods.
 *
 * client.js  -> HTTP/JWT infrastructure
 * service.js -> Application/domain endpoints
 */

import { api } from "./client";

/* =========================================================
 * GENERIC CRUD
 * ========================================================= */

const crud = (base) => ({
  list: (params) =>
    api.get(base, {
      params,
    }),

  get: (id) => api.get(`${base}${id}/`),

  create: (data) => api.post(base, data),

  update: (id, data) => api.patch(`${base}${id}/`, data),

  remove: (id) => api.delete(`${base}${id}/`),
});

/* =========================================================
 * AUTH
 * ========================================================= */

export const authApi = {
  login: api.login,

  me: api.getCurrentUser,

  logout: api.logout,

  patientRegister: (data) => api.post("/accounts/patient/register/", data),

  forgotPassword: (email) => api.post("/accounts/forgot-password/", { email }),

  resetPassword: (data) => api.post("/accounts/reset-password/", data),

  superuserRequestOtp: (data) =>
    api.post("/accounts/superuser/request-otp/", data),

  superuserRegister: (data) => api.post("/accounts/superuser/register/", data),

  hospitalAdminCreate: (data) =>
    api.post("/accounts/hospital-admin/create/", data),

  hospitalAdminVerifyOtp: (data) =>
    api.post("/accounts/hospital-admin/verify-otp/", data),

  hospitalAdminApprove: (id, data = {}) =>
    api.patch(`/accounts/hospital-admin/${id}/approve/`, data),

  hospitalAdminResendOtp: (id) =>
    api.post(`/accounts/hospital-admin/${id}/resend-otp/`),

  hospitalAdmins: (params) => api.get("/accounts/hospital-admins/", { params }),

  // admin action button pending backend api
  hospitalAdminUpdate: (id, data) =>
    api.patch(`/accounts/hospital-admin/${id}/`, data),

  hospitalAdminDelete: (id) => api.delete(`/accounts/hospital-admin/${id}/`),

  hospitalAdminSetStatus: (id, is_active) =>
    api.patch(`/accounts/hospital-admin/${id}/status/`, { is_active }),
};

/* =========================================================
 * PATIENTS
 * ========================================================= */

export const patientApi = {
  list: (params) =>
    api.get("/patients/", {
      params,
    }),

  get: (id) => api.get(`/patients/${id}/`),

  create: (data) =>
    api.post("/patients/", data, {
      skipAuth: true,
    }),

  update: (id, data) => api.patch(`/patients/${id}/`, data),

  verifypatOTP: (data) =>
    api.post("/accounts/patient/verify-otp/", data, {
      skipAuth: true,
    }),

  remove: (id) => api.delete(`/patients/${id}/`),
};

/* =========================================================
 * HOSPITALS
 * ========================================================= */

export const hospitalApi = {
  list: (params) => api.get("/hospitals/hospitals/", { params }),

  get: (id) => api.get(`/hospitals/hospitals/${id}/`),

  create: (data) => api.post("/hospitals/hospitals/", data),

  update: (id, data) => api.patch(`/hospitals/hospitals/${id}/`, data),

  remove: (id) => api.delete(`/hospitals/hospitals/${id}/`),
};

/* =========================================================
 * ORGANIZATION
 * ========================================================= */

export const branchApi = crud("/branches/");

export const departmentApi = crud("/departments/");

/* =========================================================
 * STAFF / CLINICAL
 * ========================================================= */

export const doctorApi = crud("/doctors/");

export const nurseApi = crud("/nurses/");

/* =========================================================
 * APPOINTMENTS
 * ========================================================= */

export const appointmentApi = crud("/appointments/");

/* =========================================================
 * LABORATORY
 * ========================================================= */

export const labApi = crud("/laboratory/");

/* =========================================================
 * PHARMACY
 * ========================================================= */

export const medicineApi = crud("/pharmacy/medicines/");

export const prescriptionApi = crud("/pharmacy/prescriptions/");

/* =========================================================
 * BILLING
 * ========================================================= */

export const billingApi = crud("/billing/");

/* =========================================================
 * EMR
 * ========================================================= */

export const emrApi = crud("/emr/");

/* =========================================================
 * IPD
 * ========================================================= */

export const ipdApi = crud("/ipd/");

/* =========================================================
 * EMERGENCY
 * ========================================================= */

export const emergencyApi = crud("/emergency/");

/* =========================================================
 * TELEMEDICINE
 * ========================================================= */

export const telemedicineApi = crud("/telemedicine/");

/* =========================================================
 * STAFF MANAGEMENT
 * ========================================================= */

export const staffApi = {
  list: (params) => api.get("/accounts/staff/", { params }),

  create: (data) => api.post("/accounts/staff/create/", data),

  get: (id) => api.get(`/accounts/staff/${id}/`),

  update: (id, data) => api.patch(`/accounts/staff/${id}/`, data),

  setStatus: (id, is_active) =>
    api.patch(`/accounts/staff/${id}/status/`, {
      is_active,
    }),

  hospitalAdmins: (params) => api.get("/accounts/hospital-admins/", { params }),
};

/* =========================================================
 * DASHBOARD HELPERS
 * ========================================================= */

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.results)) {
    return payload.data.results;
  }

  return [];
};

const getNextUrl = (payload) => {
  return payload?.next || payload?.data?.next || null;
};

const getAllPages = async (listMethod, params = {}) => {
  let payload = await listMethod(params);

  let items = [...normalizeList(payload)];

  let next = getNextUrl(payload);

  const seen = new Set();

  while (next && !seen.has(next)) {
    seen.add(next);

    payload = await api.get(next);

    items = [...items, ...normalizeList(payload)];

    next = getNextUrl(payload);
  }

  return items;
};

export const dashboardApi = {
  patients: (params) =>
    getAllPages(patientApi.list, params),

  hospitals: (params) =>
    getAllPages(hospitalApi.list, params),

  branches: (params) =>
    getAllPages(branchApi.list, params),

  departments: (params) =>
    getAllPages(departmentApi.list, params),

  doctors: (params) =>
    getAllPages(doctorApi.list, params),

  nurses: (params) =>
    getAllPages(nurseApi.list, params),

  appointments: (params) =>
    getAllPages(appointmentApi.list, params),

  billing: (params) =>
    getAllPages(billingApi.list, params),

  staff: (params) =>
    getAllPages(staffApi.list, params),
};
/* =========================================================
 * DEFAULT EXPORT
 * ========================================================= */

export default {
  api,

  authApi,

  patientApi,
  hospitalApi,

  branchApi,
  departmentApi,

  doctorApi,
  nurseApi,
  dashboardApi,

  appointmentApi,

  labApi,

  medicineApi,
  prescriptionApi,

  billingApi,

  emrApi,

  ipdApi,

  emergencyApi,

  telemedicineApi,

  staffApi,
};
