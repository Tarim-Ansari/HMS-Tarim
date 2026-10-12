

import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
  FiUsers,
  FiBriefcase,
  FiHeart,
  FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import toast from "react-hot-toast";
import { api } from "../../api/client";

/* =========================================================
 * PORTAL CONFIGURATION
 * ========================================================= */

const PORTALS = {
  PATIENT: {
    key: "PATIENT",
    title: "Patient",
    subtitle: "Access your appointments, reports & health records",
    icon: FiHeart,
    color: "from-sky-500 to-cyan-600",
    lightColor: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
    expectedRoles: ["PATIENT"],
  },

  STAFF: {
    key: "STAFF",
    title: "Staff",
    subtitle: "Access your hospital staff workspace",
    icon: FiUsers,
    color: "from-violet-500 to-purple-600",
    lightColor: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    expectedRoles: [
      "DOCTOR",
      "NURSE",
      "LAB_TECHNICIAN",
      "PHARMACIST",
      "ACCOUNTANT",
      "RECEPTIONIST",
    ],
  },

  HOSPITAL_ADMIN: {
    key: "HOSPITAL_ADMIN",
    title: "Hospital Admin",
    subtitle: "Manage your hospital operations & staff",
    icon: FiBriefcase,
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    expectedRoles: ["HOSPITAL_ADMIN"],
  },

  SUPER_USER: {
    key: "SUPER_USER",
    title: "Super User",
    subtitle: "Full enterprise-level hospital management access",
    icon: FiShield,
    color: "from-amber-500 to-orange-600",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    expectedRoles: ["SUPER_USER", "SUPER_ADMIN"],
  },
};

const STAFF_ROLES = [
  {
    value: "DOCTOR",
    label: "Doctor",
    description: "Clinical & patient care",
  },
  {
    value: "NURSE",
    label: "Nurse",
    description: "Nursing & patient care",
  },
  {
    value: "LAB_TECHNICIAN",
    label: "Lab Technician",
    description: "Laboratory operations",
  },
  {
    value: "PHARMACIST",
    label: "Pharmacist",
    description: "Pharmacy & medicines",
  },
  {
    value: "ACCOUNTANT",
    label: "Accountant",
    description: "Billing & finance",
  },
  {
    value: "RECEPTIONIST",
    label: "Receptionist",
    description: "Front desk & appointments",
  },
];

/* =========================================================
 * COMPONENT
 * ========================================================= */

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [portal, setPortal] = useState("");
  const [staffRole, setStaffRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  /* =========================================================
   * CURRENT PORTAL
   * ========================================================= */

  const selectedPortal = useMemo(() => {
    return PORTALS[portal] || null;
  }, [portal]);

  /* =========================================================
   * INPUT HANDLERS
   * ========================================================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
   * PORTAL CHANGE
   * ========================================================= */

  const handlePortalChange = (portalKey) => {
    setPortal(portalKey);

    // Staff role reset when switching portal
    if (portalKey !== "STAFF") {
      setStaffRole("");
    }

    // Reset credentials when switching portal
    setFormData({
      email: "",
      password: "",
    });

    setShowPassword(false);
  };

  /* =========================================================
   * BACK TO PORTAL SELECTION
   * ========================================================= */

  const handleBack = () => {
    setPortal("");
    setStaffRole("");
    setFormData({
      email: "",
      password: "",
    });
    setShowPassword(false);
  };

  /* =========================================================
   * VALIDATION
   * ========================================================= */

  const validateForm = () => {
    if (!portal) {
      toast.error("Please select how you want to login.");
      return false;
    }

    if (portal === "STAFF" && !staffRole) {
      toast.error("Please select your staff role.");
      return false;
    }

    const email = formData.email.trim();

    if (!email) {
      toast.error("Please enter your email or user ID.");
      return false;
    }

    if (email.length < 3) {
      toast.error("Please enter a valid email or user ID.");
      return false;
    }

    if (!formData.password) {
      toast.error("Please enter your password.");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return false;
    }

    return true;
  };

  /* =========================================================
   * LOGIN
   * ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      /*
       * Existing login logic remains the same.
       *
       * We are intentionally NOT changing api.login()
       * arguments here so your existing backend remains compatible.
       */
      const res = await api.login(
        formData.email.trim(),
        formData.password,
      );

      const userObj = res.user || {
        email: formData.email.trim(),
        role: "SUPER_ADMIN",
      };

      const returnedRole = String(userObj.role || "")
        .trim()
        .toUpperCase();

      /* =====================================================
       * ROLE VALIDATION
       * ===================================================== */

      if (selectedPortal) {
        const allowedRoles = selectedPortal.expectedRoles || [];

        if (
          allowedRoles.length > 0 &&
          !allowedRoles.includes(returnedRole)
        ) {
          toast.error(
            `This account is not registered as ${selectedPortal.title}.`,
          );

          setLoading(false);
          return;
        }
      }

      if (portal === "STAFF" && staffRole) {
        if (returnedRole !== staffRole) {
          const selectedStaff = STAFF_ROLES.find(
            (item) => item.value === staffRole,
          );

          toast.error(
            `This account is not registered as ${selectedStaff?.label || staffRole}.`,
          );

          setLoading(false);
          return;
        }
      }

      /* =====================================================
       * EXISTING REDUX LOGIN LOGIC
       * ===================================================== */

      dispatch(
        login({
          user: {
            name: userObj.first_name
              ? `${userObj.first_name} ${userObj.last_name || ""}`.trim()
              : userObj.username || userObj.email || "User",
            ...userObj,
          },

          role: userObj.role || "SUPER_ADMIN",

          token: res.access,

          refresh: res.refresh,
        }),
      );

      toast.success("Logged in successfully!");

      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
   * PORTAL SELECTION SCREEN
   * ========================================================= */

  if (!portal) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-medicore-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="px-6 lg:px-12 py-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-medicore-500 to-blue-600 flex items-center justify-center shadow-lg shadow-medicore-500/20">
                <HiOutlineShieldCheck className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  MediCore
                </h1>

                <p className="text-xs text-slate-400">
                  Enterprise Hospital Management System
                </p>
              </div>
            </div>
          </header>

          {/* Selection */}
          <main className="flex-1 flex items-center justify-center px-5 py-10">
            <div className="w-full max-w-5xl">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs mb-5">
                  <FiActivity className="text-medicore-400" />
                  Secure Healthcare Portal
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  How would you like to{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-medicore-400 to-cyan-400">
                    login?
                  </span>
                </h2>

                <p className="text-slate-400 mt-4 max-w-xl mx-auto">
                  Select your account type to continue to the
                  appropriate MediCore workspace.
                </p>
              </div>

              {/* Portal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(PORTALS).map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handlePortalChange(item.key)}
                      className="group text-left bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-5`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-white">
                        {item.title}
                      </h3>

                      <p className="text-sm text-slate-400 mt-2 min-h-[42px]">
                        {item.subtitle}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Continue
                        </span>

                        <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition">
                          <FiArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Security */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400" />
                  Secure authentication
                </span>

                <span className="flex items-center gap-2">
                  <FiLock className="text-sky-400" />
                  JWT protected
                </span>

                <span className="flex items-center gap-2">
                  <FiShield className="text-violet-400" />
                  Enterprise security
                </span>
              </div>
            </div>
          </main>

          <footer className="text-center py-5 text-xs text-slate-600">
            © 2026 MediCore Enterprise HMS. All rights reserved.
          </footer>
        </div>
      </div>
    );
  }

  /* =========================================================
   * LOGIN SCREEN
   * ========================================================= */

  const PortalIcon = selectedPortal.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-medicore-600/20 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* =====================================================
          LEFT BRANDING PANEL
      ===================================================== */}

      <div className="hidden lg:flex lg:w-[46%] xl:w-1/2 relative z-10 p-10 xl:p-14 flex-col justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 backdrop-blur flex items-center justify-center">
            <HiOutlineShieldCheck className="w-7 h-7 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              MediCore
            </h1>

            <p className="text-sm text-slate-400">
              Enterprise HMS
            </p>
          </div>
        </div>

        {/* Main */}
        <div className="max-w-xl">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${selectedPortal.color} text-white text-xs font-medium shadow-lg`}
          >
            <PortalIcon size={14} />
            {selectedPortal.title} Portal
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mt-6">
            Smart Healthcare.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medicore-400 to-cyan-400">
              Connected Care.
            </span>
          </h2>

          <p className="text-slate-400 text-lg mt-6 max-w-lg leading-relaxed">
            A unified platform for clinical, administrative,
            financial and patient-care operations.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              "Secure Access",
              "Real-time Operations",
              "Centralized Records",
              "Enterprise Analytics",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <FiCheckCircle className="text-emerald-400" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-600">
          © 2026 MediCore Enterprise HMS
        </div>
      </div>

      {/* =====================================================
          RIGHT LOGIN PANEL
      ===================================================== */}

      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-7">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-medicore-500 to-blue-600 flex items-center justify-center">
                <HiOutlineShieldCheck className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  MediCore
                </h1>

                <p className="text-xs text-slate-400">
                  Enterprise HMS
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
            {/* Card Header */}
            <div className="px-7 sm:px-9 pt-7 pb-5 border-b border-gray-100">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition mb-6"
              >
                <FiArrowLeft size={16} />
                Change login type
              </button>

              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPortal.color} flex items-center justify-center shadow-lg`}
                >
                  <PortalIcon className="w-6 h-6 text-white" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                    Login as
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPortal.title}
                  </h2>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                {selectedPortal.subtitle}
              </p>
            </div>

            {/* Form */}
            <div className="px-7 sm:px-9 py-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Staff Role */}
                {portal === "STAFF" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Staff Role
                      <span className="text-red-500 ml-1">*</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {STAFF_ROLES.map((role) => {
                        const active = staffRole === role.value;

                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setStaffRole(role.value)}
                            className={`text-left rounded-xl border p-3 transition-all ${
                              active
                                ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  active
                                    ? "text-violet-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {role.label}
                              </span>

                              {active && (
                                <FiCheckCircle className="text-violet-600" />
                              )}
                            </div>

                            <p className="text-[11px] text-gray-400 mt-1">
                              {role.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {!staffRole && (
                      <p className="text-xs text-gray-400 mt-2">
                        Please select your staff role before login.
                      </p>
                    )}
                  </div>
                )}

                {/* User ID / Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    User ID / Email
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative">
                    <FiMail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />

                    <input
                      type="text"
                      name="email"
                      autoComplete="username"
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:bg-white focus:border-medicore-500 focus:ring-4 focus:ring-medicore-500/10"
                      placeholder="Enter your email or user ID"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative">
                    <FiLock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-11 text-sm text-gray-800 outline-none transition focus:bg-white focus:border-medicore-500 focus:ring-4 focus:ring-medicore-500/10"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-medicore-600 focus:ring-medicore-500"
                    />

                    <span className="text-xs sm:text-sm text-gray-500">
                      Remember me
                    </span>
                  </label>

                  {/* <a
                    href="/forgot-password"
                    className="text-xs sm:text-sm font-semibold text-medicore-600 hover:text-medicore-700"
                  >
                    Forgot Password?
                  </a> */}
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r ${selectedPortal.color} hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw
                        className="animate-spin"
                        size={18}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FiArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* =================================================
                  PORTAL ACTION BUTTONS
              ================================================= */}

              <div className="mt-6 pt-6 border-t border-gray-100">
                {portal === "PATIENT" && (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/forgot-password"
                      className="h-11 rounded-xl border border-gray-200 hover:border-sky-200 hover:bg-sky-50 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600 hover:text-sky-700 transition"
                    >
                      Forgot Password
                    </a>

                    <a
                      href="/register"
                      className="h-11 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 flex items-center justify-center text-xs sm:text-sm font-semibold text-sky-700 transition"
                    >
                      Patient Registration
                    </a>
                  </div>
                )}

                {portal === "HOSPITAL_ADMIN" && (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/forgot-password"
                      className="h-11 rounded-xl border border-gray-200 hover:border-emerald-50 hover:bg-emerald-50 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600 hover:text-emerald-700 transition"
                    >
                      Forgot Password
                    </a>

                    <a
                      href="/hospital-admin/verify"
                      className="h-11 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-xs sm:text-sm font-semibold text-emerald-700 transition"
                    >
                      Verify Email OTP
                    </a>
                  </div>
                )}

                {portal === "SUPER_USER" && (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/forgot-password"
                      className="h-11 rounded-xl border border-gray-200 hover:border-amber-50 hover:bg-amber-50 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600 hover:text-amber-700 transition"
                    >
                      Forgot Password
                    </a>

                    <a
                      href="/superuser/register"
                      className="h-11 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 flex items-center justify-center text-xs sm:text-sm font-semibold text-amber-700 transition"
                    >
                      Register Super User
                    </a>
                  </div>
                )}

                {portal === "STAFF" && (
                  <a
                    href="/forgot-password"
                    className="h-11 w-full rounded-xl border border-gray-200 hover:border-violet-200 hover:bg-violet-50 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600 hover:text-violet-700 transition"
                  >
                    Forgot Password
                  </a>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-7 sm:px-9 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <FiLock size={13} />
                Your connection is secured with enterprise authentication
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-5">
            © 2026 MediCore Enterprise HMS
          </p>
        </div>
      </div>
    </div>
  );
}