import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUserPlus,
  FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import toast from "react-hot-toast";
import { api } from "../../api/client";

const ROLE_DISPLAY_NAMES = {
  SUPER_USER: "Super User",
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
  PHARMACIST: "Pharmacist",
  LAB_TECHNICIAN: "Lab Technician",
  ACCOUNTANT: "Accountant",
  PATIENT: "Patient",
};

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const identifier = formData.usernameOrEmail.trim();
    if (!identifier) {
      toast.error("Please enter your username or email address.");
      return false;
    }

    if (identifier.length < 3) {
      toast.error("Please enter a valid username or email.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await api.login(
        formData.usernameOrEmail.trim(),
        formData.password
      );

      const userObj = res.user || {
        username: formData.usernameOrEmail.trim(),
        email: formData.usernameOrEmail.trim(),
        role: "PATIENT",
      };

      const userRole = String(userObj.role || "PATIENT").trim().toUpperCase();
      const roleDisplayName = ROLE_DISPLAY_NAMES[userRole] || userRole;

      // Log the user into their respective profile directly from database
      dispatch(
        login({
          user: {
            name: userObj.first_name
              ? `${userObj.first_name} ${userObj.last_name || ""}`.trim()
              : userObj.username || userObj.email || "User",
            ...userObj,
          },
          role: userRole,
          token: res.access,
          refresh: res.refresh,
        })
      );

      toast.success(
        `Welcome back, ${userObj.first_name || userObj.username}! Signed in as ${roleDisplayName}.`
      );
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-medicore-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* =====================================================
          LEFT BRANDING PANEL (Desktop)
      ===================================================== */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-1/2 relative z-10 p-10 xl:p-14 flex-col justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medicore-500 to-blue-600 flex items-center justify-center shadow-lg shadow-medicore-500/25">
            <HiOutlineShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">MediCore</h1>
            <p className="text-xs text-slate-400">Enterprise Hospital Management System</p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-semibold shadow-lg">
            <HiOutlineShieldCheck className="w-4 h-4 text-medicore-400" />
            Unified Healthcare Platform
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mt-6">
            Smart Healthcare.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medicore-400 via-cyan-400 to-teal-400">
              Connected Care.
            </span>
          </h2>

          <p className="text-slate-400 text-base xl:text-lg mt-6 max-w-lg leading-relaxed">
            A single authenticated gateway for doctors, nurses, hospital administrators,
            pharmacists, laboratory specialists, and patients. Sign in with your credentials to
            access your profile automatically.
          </p>

          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-3.5 mt-8">
            {[
              "Automated Role Routing",
              "Real-time IPD & Bed Grid",
              "Live Clinical EMR Records",
              "Enterprise JWT Security",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                <FiCheckCircle className="text-emerald-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Patient Quick Action Card */}
          <div className="mt-10 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Visiting as a new patient?</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Create an account to schedule visits and view medical reports online.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-semibold shadow-md transition-all hover:scale-105 flex-shrink-0"
            >
              <FiUserPlus size={14} />
              Register
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500">
          © 2026 MediCore Enterprise HMS. All rights reserved.
        </div>
      </div>

      {/* =====================================================
          RIGHT CREDENTIALS FORM PANEL
      ===================================================== */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medicore-500 to-blue-600 flex items-center justify-center">
                <HiOutlineShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MediCore</h1>
                <p className="text-xs text-slate-400">Enterprise HMS</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
            {/* Header */}
            <div className="px-7 sm:px-9 pt-8 pb-5 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Enter your credentials to access your profile.
              </p>
            </div>

            {/* Form */}
            <div className="px-7 sm:px-9 py-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username or Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Username or Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="usernameOrEmail"
                      autoComplete="username"
                      required
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:bg-white focus:border-medicore-500 focus:ring-4 focus:ring-medicore-500/10"
                      placeholder="Enter username or email"
                      value={formData.usernameOrEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
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
                      required
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-11 text-sm text-gray-800 outline-none transition focus:bg-white focus:border-medicore-500 focus:ring-4 focus:ring-medicore-500/10"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-medicore-600 focus:ring-medicore-500"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-medicore-600 hover:text-medicore-700"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r from-medicore-600 to-blue-600 hover:from-medicore-700 hover:to-blue-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={17} />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FiArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* Patient Registration Callout */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-2 text-center">
                <p className="text-xs text-gray-500">
                  New to MediCore and need an appointment?
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold transition"
                >
                  <FiUserPlus size={14} />
                  Patient Registration
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 sm:px-9 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <FiShield size={12} />
              Role and permissions automatically detected from database
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