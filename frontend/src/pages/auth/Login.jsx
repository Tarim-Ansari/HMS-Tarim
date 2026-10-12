import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
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
  FiLogIn,
  FiUserPlus,
  FiDroplet,
  FiShoppingCart,
  FiDollarSign,
} from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import toast from "react-hot-toast";
import { api } from "../../api/client";

/* =========================================================
 * ROLE CONFIGURATIONS (ALL 9 BACKEND ROLES)
 * ========================================================= */

const ROLES = [
  {
    key: "DOCTOR",
    title: "Doctor",
    subtitle: "Clinical care, patient consultations & prescriptions",
    icon: FiHeart,
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    expectedRoles: ["DOCTOR"],
  },
  {
    key: "NURSE",
    title: "Nurse",
    subtitle: "Inpatient bed care, vitals tracking & shift checklist",
    icon: FiActivity,
    gradient: "from-blue-500 to-cyan-600",
    lightBg: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    expectedRoles: ["NURSE"],
  },
  {
    key: "HOSPITAL_ADMIN",
    title: "Hospital Admin",
    subtitle: "Manage hospital branches, departments & operational staff",
    icon: FiBriefcase,
    gradient: "from-indigo-500 to-purple-600",
    lightBg: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    expectedRoles: ["HOSPITAL_ADMIN"],
  },
  {
    key: "SUPER_USER",
    title: "Super User",
    subtitle: "Enterprise-level governance, hospital creation & admins",
    icon: FiShield,
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    expectedRoles: ["SUPER_USER", "SUPER_ADMIN"],
  },
  {
    key: "PATIENT",
    title: "Patient",
    subtitle: "Access appointments, medical reports & health history",
    icon: FiUser,
    gradient: "from-sky-500 to-cyan-500",
    lightBg: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
    expectedRoles: ["PATIENT"],
  },
  {
    key: "RECEPTIONIST",
    title: "Receptionist",
    subtitle: "Front desk intake, patient onboarding & scheduling",
    icon: FiUsers,
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    expectedRoles: ["RECEPTIONIST"],
  },
  {
    key: "PHARMACIST",
    title: "Pharmacist",
    subtitle: "Pharmacy dispensing, prescriptions & medicine catalog",
    icon: FiShoppingCart,
    gradient: "from-rose-500 to-pink-600",
    lightBg: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    expectedRoles: ["PHARMACIST"],
  },
  {
    key: "LAB_TECHNICIAN",
    title: "Lab Technician",
    subtitle: "Diagnostic laboratory tests, sample processing & reports",
    icon: FiDroplet,
    gradient: "from-teal-500 to-emerald-600",
    lightBg: "bg-teal-50",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    expectedRoles: ["LAB_TECHNICIAN"],
  },
  {
    key: "ACCOUNTANT",
    title: "Accountant",
    subtitle: "Patient billing, invoice generation & revenue tracking",
    icon: FiDollarSign,
    gradient: "from-yellow-500 to-amber-600",
    lightBg: "bg-yellow-50",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-200",
    expectedRoles: ["ACCOUNTANT"],
  },
];

/* =========================================================
 * COMPONENT
 * ========================================================= */

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Navigation steps: "landing" -> "select-role" -> "credentials"
  const [step, setStep] = useState("landing");
  const [selectedRoleKey, setSelectedRoleKey] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const selectedRole = useMemo(() => {
    return ROLES.find((r) => r.key === selectedRoleKey) || null;
  }, [selectedRoleKey]);

  /* =========================================================
   * HANDLERS
   * ========================================================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectRole = (roleKey) => {
    setSelectedRoleKey(roleKey);
    setFormData({ email: "", password: "" });
    setShowPassword(false);
    setStep("credentials");
  };

  const handleBackToLanding = () => {
    setStep("landing");
    setSelectedRoleKey("");
    setFormData({ email: "", password: "" });
    setShowPassword(false);
  };

  const handleBackToRoles = () => {
    setStep("select-role");
    setFormData({ email: "", password: "" });
    setShowPassword(false);
  };

  /* =========================================================
   * VALIDATION & SUBMIT
   * ========================================================= */

  const validateForm = () => {
    if (!selectedRoleKey) {
      toast.error("Please select a role to sign in.");
      return false;
    }

    const email = formData.email.trim();
    if (!email) {
      toast.error("Please enter your email or username.");
      return false;
    }

    if (email.length < 3) {
      toast.error("Please enter a valid email or username.");
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
        formData.email.trim(),
        formData.password
      );

      const userObj = res.user || {
        email: formData.email.trim(),
        role: "SUPER_ADMIN",
      };

      const returnedRole = String(userObj.role || "")
        .trim()
        .toUpperCase();

      // Check role authorization against selected role
      if (selectedRole) {
        const allowedRoles = selectedRole.expectedRoles || [];
        const isMatched = allowedRoles.includes(returnedRole);

        if (!isMatched) {
          const matchedConfig = ROLES.find((r) =>
            r.expectedRoles.includes(returnedRole)
          );
          const actualRoleTitle = matchedConfig
            ? matchedConfig.title
            : returnedRole;

          toast.error(
            `Access Denied: This account is registered as ${actualRoleTitle}, not as ${selectedRole.title}. Please sign in with the correct role.`
          );
          setLoading(false);
          return;
        }
      }

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
        })
      );

      toast.success(`Welcome back, ${selectedRole?.title || "User"}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
   * 1. LANDING PAGE VIEW (Single Login + Patient Register)
   * ========================================================= */

  if (step === "landing") {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col justify-between">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-medicore-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        {/* Top Header */}
        <header className="relative z-10 px-6 lg:px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-medicore-500 to-blue-600 flex items-center justify-center shadow-lg shadow-medicore-500/25">
                <HiOutlineShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">MediCore</h1>
                <p className="text-xs text-slate-400">Enterprise Hospital Management System</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online & Secure
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-4xl mx-auto text-center">
            {/* Title & Description */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Hospital Operations,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-medicore-400 via-cyan-400 to-teal-400">
                Unified & Connected.
              </span>
            </h2>

            <p className="text-slate-400 mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              MediCore provides integrated clinical management, patient care, inpatient beds,
              pharmacy, and administrative controls in one unified platform.
            </p>

            {/* Primary Action Buttons / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
              {/* Single Login Card / Button */}
              <button
                type="button"
                onClick={() => setStep("select-role")}
                className="group relative text-left bg-gradient-to-b from-white/[0.08] to-white/[0.03] hover:from-white/[0.12] hover:to-white/[0.06] border border-white/15 hover:border-medicore-400/50 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-medicore-500/20 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-medicore-500 to-blue-600 flex items-center justify-center shadow-lg shadow-medicore-500/30 mb-6 group-hover:scale-105 transition-transform">
                    <FiLogIn className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-medicore-300 transition-colors">
                    Hospital Login
                  </h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    Access your staff, doctor, nurse, or administrative workspace with role authentication.
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-medicore-400">
                    Select Role & Sign In
                  </span>
                  <div className="w-9 h-9 rounded-full bg-medicore-500/20 group-hover:bg-medicore-500 flex items-center justify-center transition-colors">
                    <FiArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Patient Register Card / Button */}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="group relative text-left bg-gradient-to-b from-white/[0.08] to-white/[0.03] hover:from-white/[0.12] hover:to-white/[0.06] border border-white/15 hover:border-emerald-400/50 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 group-hover:scale-105 transition-transform">
                    <FiUserPlus className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Patient Register
                  </h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    New to MediCore? Create your patient account to book appointments and view records online.
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Create Patient Account
                  </span>
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 flex items-center justify-center transition-colors">
                    <FiArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400" />
                Multi-Role Authorization
              </span>
              <span className="flex items-center gap-2">
                <FiLock className="text-sky-400" />
                JWT Secure Authentication
              </span>
              <span className="flex items-center gap-2">
                <FiShield className="text-violet-400" />
                HIPAA & Enterprise Compliant
              </span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center py-6 text-xs text-slate-500 border-t border-white/5">
          © 2026 MediCore Enterprise HMS. All rights reserved.
        </footer>
      </div>
    );
  }

  /* =========================================================
   * 2. ROLE SELECTION VIEW (After clicking Hospital Login)
   * ========================================================= */

  if (step === "select-role") {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col justify-between">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-medicore-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Header with Back button */}
        <header className="relative z-10 px-6 lg:px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={handleBackToLanding}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs sm:text-sm font-medium transition"
            >
              <FiArrowLeft size={16} />
              Back to Home
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-medicore-500 to-blue-600 flex items-center justify-center">
                <HiOutlineShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-white hidden sm:inline">MediCore</span>
            </div>
          </div>
        </header>

        {/* Role Grid */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Select Your Role to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-medicore-400 to-cyan-400">
                  Login
                </span>
              </h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
                Choose your specific account role to sign in to your authorized workspace.
              </p>
            </div>

            {/* 9 Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleSelectRole(role.key)}
                    className="group text-left bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Portal
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-medicore-300 transition-colors">
                        {role.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 min-h-[34px] leading-relaxed">
                        {role.subtitle}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                      <span>Sign in as {role.title}</span>
                      <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/15 flex items-center justify-center transition">
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center py-5 text-xs text-slate-600">
          © 2026 MediCore Enterprise HMS. All rights reserved.
        </footer>
      </div>
    );
  }

  /* =========================================================
   * 3. CREDENTIALS SIGN-IN VIEW (For the selected role)
   * ========================================================= */

  const RoleIcon = selectedRole?.icon || FiUser;

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-medicore-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Left Branding Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-1/2 relative z-10 p-10 xl:p-14 flex-col justify-between">
        {/* Header Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 backdrop-blur flex items-center justify-center">
            <HiOutlineShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">MediCore</h1>
            <p className="text-sm text-slate-400">Enterprise HMS</p>
          </div>
        </div>

        {/* Dynamic Role Hero info */}
        <div className="max-w-xl">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r ${selectedRole?.gradient || "from-medicore-500 to-blue-600"} text-white text-xs font-semibold shadow-lg`}
          >
            <RoleIcon size={14} />
            {selectedRole?.title} Portal
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mt-6">
            Smart Healthcare.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medicore-400 to-cyan-400">
              Connected Care.
            </span>
          </h2>

          <p className="text-slate-400 text-base xl:text-lg mt-6 max-w-lg leading-relaxed">
            {selectedRole?.subtitle}. Dedicated workspace equipped with live backend synchronization
            and strict role-based data protection.
          </p>

          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              "Role-Specific Clearance",
              "Real-time IPD & Wards",
              "Live Clinical Records",
              "Secure Audit Logs",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                <FiCheckCircle className="text-emerald-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-600">
          © 2026 MediCore Enterprise HMS
        </div>
      </div>

      {/* Right Login Panel */}
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

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
            {/* Header */}
            <div className="px-7 sm:px-9 pt-7 pb-5 border-b border-gray-100">
              <button
                type="button"
                onClick={handleBackToRoles}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-medicore-600 transition mb-5"
              >
                <FiArrowLeft size={15} />
                Change role selection
              </button>

              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedRole?.gradient || "from-medicore-500 to-blue-600"} flex items-center justify-center shadow-lg text-white`}
                >
                  <RoleIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
                    Signing in as
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedRole?.title}
                  </h2>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                {selectedRole?.subtitle}
              </p>
            </div>

            {/* Form */}
            <div className="px-7 sm:px-9 py-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email / Username */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Email or Username <span className="text-red-500">*</span>
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
                      required
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:bg-white focus:border-medicore-500 focus:ring-4 focus:ring-medicore-500/10"
                      placeholder="Enter username or email"
                      value={formData.email}
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
                      placeholder="Enter your password"
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

                {/* Remember & Options */}
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
                  className={`w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r ${selectedRole?.gradient || "from-medicore-600 to-blue-600"} hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={17} />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In as {selectedRole?.title}
                      <FiArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* Contextual Links */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                {selectedRoleKey === "PATIENT" && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Don't have a patient account?{" "}
                      <Link
                        to="/register"
                        className="font-semibold text-sky-600 hover:text-sky-700 underline"
                      >
                        Register as Patient
                      </Link>
                    </p>
                  </div>
                )}

                {selectedRoleKey === "HOSPITAL_ADMIN" && (
                  <div className="text-center">
                    <Link
                      to="/hospital-admin/verify"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Need to verify OTP? Complete Hospital Admin Verification
                    </Link>
                  </div>
                )}

                {selectedRoleKey === "SUPER_USER" && (
                  <div className="text-center">
                    <Link
                      to="/superuser/register"
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                    >
                      Register New Super User (Requires Secret Key)
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 sm:px-9 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <FiLock size={12} />
              Secured with JWT and role authorization verification
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