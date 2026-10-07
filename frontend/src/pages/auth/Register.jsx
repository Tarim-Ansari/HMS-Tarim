
import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiShield,
} from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import toast from "react-hot-toast";
import { authApi } from "../../api/service";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // PASSWORD RULES
  // =========================================================

  const passwordRules = useMemo(
    () => [
      {
        label: "At least 10 characters",
        valid: formData.password.length >= 10,
      },
      {
        label: "One uppercase letter",
        valid: /[A-Z]/.test(formData.password),
      },
      {
        label: "One lowercase letter",
        valid: /[a-z]/.test(formData.password),
      },
      {
        label: "One number",
        valid: /\d/.test(formData.password),
      },
      {
        label: "One special character",
        valid: /[^A-Za-z0-9]/.test(formData.password),
      },
      {
        label: "No spaces",
        valid:
          formData.password.length > 0 &&
          !/\s/.test(formData.password),
      },
    ],
    [formData.password]
  );

  const validPasswordRules = passwordRules.filter(
    (rule) => rule.valid
  ).length;

  const strongPassword =
    validPasswordRules === passwordRules.length;

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = formData.username.trim();
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.replace(/\D/g, "");

    if (!firstName) {
      toast.error("First name is required");
      return;
    }

    if (!username) {
      toast.error("Username is required");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (phone.length !== 10) {
      toast.error("Enter a valid 10 digit phone number");
      return;
    }

    // Strong password frontend validation
    if (!strongPassword) {
      toast.error("Please create a strong password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username,
        first_name: firstName,
        last_name: lastName,
        email,
        mobile_number: `+91${phone}`,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      await authApi.patientRegister(payload);

      sessionStorage.setItem(
        "patientVerificationEmail",
        email
      );

      toast.success(
        "Registration successful. OTP sent to your email."
      );

      navigate(
        `/verify-otp?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      toast.error(
        error?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // COMMON STYLES
  // =========================================================

  const inputClass =
    "w-full h-12 rounded-xl border border-slate-200 bg-white " +
    "pl-11 pr-4 text-sm text-slate-900 " +
    "placeholder:text-slate-400 outline-none " +
    "transition-all duration-200 " +
    "focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 " +
    "text-slate-400 pointer-events-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">

          {/* =====================================================
              LEFT PANEL
          ===================================================== */}

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-10 lg:flex lg:flex-col lg:justify-between">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

            <div className="relative z-10">

              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
                <HiOutlineShieldCheck
                  className="text-white"
                  size={32}
                />
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                MediCore HMS
              </p>

              <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
                Your healthcare
                <br />
                journey starts here.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
                Create your secure patient account and access
                appointments, medical records and healthcare
                services from one place.
              </p>

            </div>

            {/* Benefits */}

            <div className="relative z-10 space-y-4">

              {[
                "Secure patient account",
                "Email verification with OTP",
                "Easy access to healthcare services",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <FiCheck size={15} />
                  </span>

                  {item}
                </div>
              ))}

            </div>
          </div>

          {/* =====================================================
              RIGHT FORM
          ===================================================== */}

          <div className="bg-slate-50 p-5 sm:p-8 lg:p-10">

            <div className="mx-auto max-w-xl">

              {/* Header */}

              <div className="mb-8">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 lg:hidden">
                  <HiOutlineShieldCheck size={25} />
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  Patient Registration
                </p>

                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Create Patient Account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Register securely to access MediCore HMS.
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* =================================================
                    BASIC INFORMATION
                ================================================= */}

                <div>

                  <h3 className="mb-4 text-sm font-bold text-slate-800">
                    Personal Information
                  </h3>

                  <div className="space-y-4">

                    {/* Username */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Username
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <FiUser
                          size={18}
                          className={iconClass}
                        />

                        <input
                          type="text"
                          name="username"
                          placeholder="Enter username"
                          value={formData.username}
                          onChange={handleChange}
                          autoComplete="username"
                          className={inputClass}
                          required
                        />

                      </div>
                    </div>

                    {/* First + Last */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          First Name
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <div className="relative">

                          <FiUser
                            size={18}
                            className={iconClass}
                          />

                          <input
                            type="text"
                            name="firstName"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={inputClass}
                            required
                          />

                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Last Name
                        </label>

                        <input
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`${inputClass} pl-4`}
                        />
                      </div>

                    </div>

                    {/* Email */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email Address
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <FiMail
                          size={18}
                          className={iconClass}
                        />

                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="email"
                          className={inputClass}
                          required
                        />

                      </div>

                    </div>

                    {/* Phone */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Mobile Number
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <FiPhone
                          size={18}
                          className={iconClass}
                        />

                        <input
                          type="tel"
                          name="phone"
                          placeholder="10 digit mobile number"
                          maxLength={10}
                          inputMode="numeric"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            }))
                          }
                          className={inputClass}
                          required
                        />

                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Enter your 10 digit Indian mobile number.
                      </p>

                    </div>

                  </div>
                </div>

                {/* =================================================
                    SECURITY
                ================================================= */}

                <div>

                  <h3 className="mb-4 text-sm font-bold text-slate-800">
                    Account Security
                  </h3>

                  <div className="space-y-4">

                    {/* Password */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Password
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <FiLock
                          size={18}
                          className={iconClass}
                        />

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          className={`${inputClass} pr-12`}
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (prev) => !prev
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          {showPassword ? (
                            <FiEyeOff size={18} />
                          ) : (
                            <FiEye size={18} />
                          )}
                        </button>

                      </div>

                      {/* Password Strength */}

                      {formData.password.length > 0 && (
                        <div className="mt-3">

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-xs font-medium text-slate-500">
                              Password strength
                            </span>

                            <span
                              className={`text-xs font-bold ${
                                validPasswordRules <= 2
                                  ? "text-red-500"
                                  : validPasswordRules <= 4
                                  ? "text-amber-500"
                                  : "text-emerald-600"
                              }`}
                            >
                              {validPasswordRules <= 2
                                ? "Weak"
                                : validPasswordRules <= 4
                                ? "Medium"
                                : "Strong"}
                            </span>

                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">

                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                validPasswordRules <= 2
                                  ? "w-1/3 bg-red-500"
                                  : validPasswordRules <= 4
                                  ? "w-2/3 bg-amber-500"
                                  : "w-full bg-emerald-500"
                              }`}
                            />

                          </div>

                        </div>
                      )}

                      {/* Rules */}

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">

                        {passwordRules.map((rule) => (
                          <div
                            key={rule.label}
                            className={`flex items-center gap-2 text-xs transition ${
                              rule.valid
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >

                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                rule.valid
                                  ? "bg-emerald-100"
                                  : "bg-slate-100"
                              }`}
                            >
                              {rule.valid ? (
                                <FiCheck size={10} />
                              ) : (
                                <FiX size={10} />
                              )}
                            </span>

                            {rule.label}

                          </div>
                        ))}

                      </div>

                    </div>

                    {/* Confirm Password */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Confirm Password
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <FiLock
                          size={18}
                          className={iconClass}
                        />

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          className={`${inputClass} pr-12 ${
                            formData.confirmPassword.length > 0
                              ? passwordsMatch
                                ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10"
                                : "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : ""
                          }`}
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (prev) => !prev
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          {showConfirmPassword ? (
                            <FiEyeOff size={18} />
                          ) : (
                            <FiEye size={18} />
                          )}
                        </button>

                      </div>

                      {formData.confirmPassword.length > 0 && (
                        <p
                          className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                            passwordsMatch
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {passwordsMatch ? (
                            <>
                              <FiCheck />
                              Passwords match
                            </>
                          ) : (
                            <>
                              <FiX />
                              Passwords do not match
                            </>
                          )}
                        </p>
                      )}

                    </div>

                  </div>
                </div>

                {/* =================================================
                    TERMS
                ================================================= */}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">

                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    required
                  />

                  <span className="text-xs leading-5 text-slate-500 sm:text-sm">

                    I agree to the{" "}

                    <a
                      href="#"
                      className="font-semibold text-amber-600 hover:text-amber-700"
                    >
                      Terms of Service
                    </a>{" "}

                    and{" "}

                    <a
                      href="#"
                      className="font-semibold text-amber-600 hover:text-amber-700"
                    >
                      Privacy Policy
                    </a>

                  </span>

                </label>

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Patient Account"}
                </button>

              </form>

              {/* Login */}

              <div className="mt-6 text-center">

                <p className="text-sm text-slate-500">

                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="font-semibold text-amber-600 transition hover:text-amber-700"
                  >
                    Sign In
                  </Link>

                </p>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}