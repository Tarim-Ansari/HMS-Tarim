
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import { authApi } from "../../api/service";

export default function SuperUserRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    secret_key: "",
    otp: "",
    password: "",
    confirm_password: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showSecret, setShowSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // PASSWORD VALIDATION
  // --------------------------------------------------

  const passwordRules = useMemo(
    () => [
      {
        label: "At least 10 characters",
        valid: form.password.length >= 10,
      },
      {
        label: "One uppercase letter",
        valid: /[A-Z]/.test(form.password),
      },
      {
        label: "One lowercase letter",
        valid: /[a-z]/.test(form.password),
      },
      {
        label: "One number",
        valid: /\d/.test(form.password),
      },
      {
        label: "One special character",
        valid: /[^A-Za-z0-9]/.test(form.password),
      },
      {
        label: "No spaces",
        valid: form.password.length > 0 && !/\s/.test(form.password),
      },
    ],
    [form.password]
  );

  const validPasswordRules = passwordRules.filter(
    (rule) => rule.valid
  ).length;

  const strongPassword = validPasswordRules === passwordRules.length;

  const passwordsMatch =
    form.confirm_password.length > 0 &&
    form.password === form.confirm_password;

  // --------------------------------------------------
  // OTP REQUEST
  // --------------------------------------------------

  const requestOtp = async () => {
    const email = form.email.trim().toLowerCase();
    const secretKey = form.secret_key.trim();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!secretKey) {
      toast.error("Please enter the registration secret key.");
      return;
    }

    setLoading(true);

    try {
      await authApi.superuserRequestOtp({
        email,
        secret_key: secretKey,
      });

      setOtpSent(true);

      toast.success("OTP sent to your email address.");
    } catch (error) {
      toast.error(
        error?.message || "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORM SUBMIT
  // --------------------------------------------------

  const submit = async (e) => {
    e.preventDefault();

    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();
    const otp = form.otp.trim();

    if (!username) {
      toast.error("Username is required.");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }

    if (!email) {
      toast.error("Email is required.");
      return;
    }

    if (!otpSent) {
      toast.error("Please request OTP first.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits.");
      return;
    }

    if (!strongPassword) {
      toast.error("Please create a strong password.");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // IMPORTANT:
      // Backend SuperUserRegisterSerializer accepts only:
      // username, email, password, confirm_password, otp
      //
      // secret_key is ONLY used while requesting OTP.

      await authApi.superuserRegister({
        username,
        email,
        otp,
        password: form.password,
        confirm_password: form.confirm_password,
      });

      toast.success(
        "Super User registered successfully. You can now login."
      );

      navigate("/login");
    } catch (error) {
      toast.error(
        error?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // COMMON INPUT STYLE
  // --------------------------------------------------

  const inputClass =
    "w-full h-12 rounded-xl border border-slate-200 bg-white " +
    "pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 " +
    "outline-none transition-all duration-200 " +
    "focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 " +
    "text-slate-400 pointer-events-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">

          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-10 lg:flex lg:flex-col lg:justify-between">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
                <FiShield className="text-3xl text-white" />
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                MediCore HMS
              </p>

              <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
                Create your
                <br />
                Super User account.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
                Super User access provides complete control over the
                hospital management system. Keep your credentials secure.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              {[
                "Secure OTP based verification",
                "Strong password protection",
                "Administrative level access",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <FiCheck size={15} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDE / FORM
          ================================================== */}

          <div className="bg-slate-50 p-5 sm:p-8 lg:p-10">

            <div className="mx-auto max-w-xl">

              {/* Header */}

              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 lg:hidden">
                  <FiShield size={24} />
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  Administrator Registration
                </p>

                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Create Super User
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Complete the details below to create your Super User
                  account.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-6">

                {/* ==================================================
                    ACCOUNT INFORMATION
                ================================================== */}

                <div>
                  <h3 className="mb-4 text-sm font-bold text-slate-800">
                    Account Information
                  </h3>

                  <div className="space-y-4">

                    {/* Username */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Username
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiUser size={18} className={iconClass} />

                        <input
                          type="text"
                          name="username"
                          value={form.username}
                          onChange={change}
                          placeholder="Enter username"
                          autoComplete="username"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Email */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email Address
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiMail size={18} className={iconClass} />

                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={change}
                          placeholder="Enter email address"
                          autoComplete="email"
                          className={inputClass}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* ==================================================
                    OTP VERIFICATION
                ================================================== */}

                <div>
                  <h3 className="mb-4 text-sm font-bold text-slate-800">
                    Email Verification
                  </h3>

                  <div className="space-y-4">

                    {/* Secret Key */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Registration Secret Key
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiKey size={18} className={iconClass} />

                        <input
                          type={showSecret ? "text" : "password"}
                          name="secret_key"
                          value={form.secret_key}
                          onChange={change}
                          placeholder="Enter registration secret key"
                          className={`${inputClass} pr-12`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowSecret((prev) => !prev)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          {showSecret ? (
                            <FiEyeOff size={18} />
                          ) : (
                            <FiEye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* OTP */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email OTP
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <FiShield size={18} className={iconClass} />

                          <input
                            type="text"
                            name="otp"
                            value={form.otp}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);

                              setForm((prev) => ({
                                ...prev,
                                otp: value,
                              }));
                            }}
                            placeholder="Enter 6-digit OTP"
                            inputMode="numeric"
                            maxLength={6}
                            className={inputClass}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={requestOtp}
                          disabled={loading}
                          className="h-12 min-w-[105px] rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loading
                            ? "Sending..."
                            : otpSent
                            ? "Resend OTP"
                            : "Send OTP"}
                        </button>
                      </div>

                      {otpSent && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                          <FiCheck />
                          OTP sent successfully. Check your email.
                        </p>
                      )}
                    </div>

                  </div>
                </div>

                {/* ==================================================
                    PASSWORD
                ================================================== */}

                <div>
                  <h3 className="mb-4 text-sm font-bold text-slate-800">
                    Account Security
                  </h3>

                  <div className="space-y-4">

                    {/* Password */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Password
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiLock size={18} className={iconClass} />

                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={change}
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          className={`${inputClass} pr-12`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
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

                      {/* Password strength */}

                      {form.password.length > 0 && (
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

                      {/* Password Rules */}

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
                              className={`flex h-4 w-4 items-center justify-center rounded-full ${
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
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiLock size={18} className={iconClass} />

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="confirm_password"
                          value={form.confirm_password}
                          onChange={change}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          className={`${inputClass} pr-12 ${
                            form.confirm_password.length > 0
                              ? passwordsMatch
                                ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10"
                                : "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : ""
                          }`}
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

                      {form.confirm_password.length > 0 && (
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

                {/* ==================================================
                    SUBMIT
                ================================================== */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !otpSent ||
                    !strongPassword ||
                    !passwordsMatch
                  }
                  className="flex h-13 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Super User Account"}
                </button>

                {/* Login */}

                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-amber-600 transition hover:text-amber-700"
                    >
                      Login
                    </Link>
                  </p>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}