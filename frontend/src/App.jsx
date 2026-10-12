import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./store";
import MainLayout from "./components/layout/MainLayout";

// Live Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Patients from "./pages/patients/Patients";
import PatientRegister from "./pages/patients/PatientRegister";
import Appointments from "./pages/appointments/Appointments";
import Doctors from "./pages/doctors/Doctors";
import Nurses from "./pages/nurses/Nurses";
import EMR from "./pages/emr/EMR";
import Telemedicine from "./pages/telemedicine/Telemedicine";
import Laboratory from "./pages/laboratory/Laboratory";
import Pharmacy from "./pages/pharmacy/Pharmacy";
import Billing from "./pages/billing/Billing";
import IPD from "./pages/ipd/IPD";
import Emergency from "./pages/emergency/Emergency";
import HospitalManagement from "./pages/admin/HospitalManagement";
import BranchManagement from "./pages/admin/BranchManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import HospitalAdminManagement from "./pages/admin/HospitalAdminManagement";
import SuperUserRegister from "./pages/auth/SuperUserRegister";
import HospitalAdminVerify from "./pages/auth/HospitalAdminVerify";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";

/**
 * Strict Protected Route
 * Enforces authentication and exact role authorization per route.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If no allowedRoles specified, accessible to all authenticated roles (e.g. /dashboard)
  if (!allowedRoles || allowedRoles.length === 0) {
    return <MainLayout>{children}</MainLayout>;
  }

  const currentRole = String(role || "").trim().toUpperCase();
  const isSuperUser =
    currentRole === "SUPER_USER" || currentRole === "SUPER_ADMIN";

  const isAllowed =
    (isSuperUser &&
      (allowedRoles.includes("SUPER_USER") ||
        allowedRoles.includes("SUPER_ADMIN"))) ||
    allowedRoles.some((r) => r.toUpperCase() === currentRole);

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/superuser/register" element={<SuperUserRegister />} />
      <Route path="/hospital-admin/verify" element={<HospitalAdminVerify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Dashboard: All authenticated roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Super User / Super Admin Only */}
      <Route
        path="/hospitals"
        element={
          <ProtectedRoute allowedRoles={["SUPER_USER", "SUPER_ADMIN"]}>
            <HospitalManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital-admins"
        element={
          <ProtectedRoute allowedRoles={["SUPER_USER", "SUPER_ADMIN"]}>
            <HospitalAdminManagement />
          </ProtectedRoute>
        }
      />

      {/* Hospital Infrastructure: Super User & Hospital Admin */}
      <Route
        path="/branches"
        element={
          <ProtectedRoute
            allowedRoles={["SUPER_USER", "SUPER_ADMIN", "HOSPITAL_ADMIN"]}
          >
            <BranchManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute
            allowedRoles={["SUPER_USER", "SUPER_ADMIN", "HOSPITAL_ADMIN"]}
          >
            <DepartmentManagement />
          </ProtectedRoute>
        }
      />

      {/* Patient Directory */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "DOCTOR",
              "NURSE",
              "RECEPTIONIST",
            ]}
          >
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/register"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "RECEPTIONIST",
            ]}
          >
            <PatientRegister />
          </ProtectedRoute>
        }
      />

      {/* Appointments */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "DOCTOR",
              "RECEPTIONIST",
              "PATIENT",
            ]}
          >
            <Appointments />
          </ProtectedRoute>
        }
      />

      {/* Doctors & Nurses Directories */}
      <Route
        path="/doctors"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "DOCTOR",
              "RECEPTIONIST",
            ]}
          >
            <Doctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurses"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "NURSE",
              "RECEPTIONIST",
            ]}
          >
            <Nurses />
          </ProtectedRoute>
        }
      />

      {/* Clinical Care: EMR & Telemedicine */}
      <Route
        path="/emr"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "DOCTOR",
              "PATIENT",
            ]}
          >
            <EMR />
          </ProtectedRoute>
        }
      />
      <Route
        path="/telemedicine"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "DOCTOR",
              "PATIENT",
            ]}
          >
            <Telemedicine />
          </ProtectedRoute>
        }
      />

      {/* Inpatient Care (IPD) & Emergency */}
      <Route
        path="/ipd"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "NURSE",
              "DOCTOR",
            ]}
          >
            <IPD />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "NURSE",
              "DOCTOR",
            ]}
          >
            <Emergency />
          </ProtectedRoute>
        }
      />

      {/* Diagnostics: Laboratory */}
      <Route
        path="/laboratory"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "LAB_TECHNICIAN",
              "DOCTOR",
            ]}
          >
            <Laboratory />
          </ProtectedRoute>
        }
      />

      {/* Medication & Pharmacy */}
      <Route
        path="/pharmacy"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "PHARMACIST",
              "DOCTOR",
            ]}
          >
            <Pharmacy />
          </ProtectedRoute>
        }
      />

      {/* Finance & Invoicing */}
      <Route
        path="/billing"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_USER",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "ACCOUNTANT",
            ]}
          >
            <Billing />
          </ProtectedRoute>
        }
      />

      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </Provider>
  );
}
