
import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiMail,
  FiShield,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";
import { authApi } from "../../api/service";

export default function HospitalAdminVerify() {
  const [form, setForm] = useState({
    email: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;

    if (name === "otp") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 6);

      setForm((prev) => ({
        ...prev,
        [name]: onlyNumbers,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const otp = form.otp.trim();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      await authApi.hospitalAdminVerifyOtp({
        email,
        otp,
      });

      setDone(true);

      toast.success(
        "Email verified. Waiting for Super User approval."
      );
    } catch (err) {
      toast.error(
        err?.message || "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">

          {/* ==================================================
              LEFT BRANDING PANEL
          ================================================== */}

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-10 lg:flex lg:flex-col lg:justify-between">

            {/* Decorative circles */}

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

            {/* Branding */}

            <div className="relative z-10">

              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
                <FiShield
                  className="text-white"
                  size={30}
                />
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                MediCore HMS
              </p>

              <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
                Verify your
                <br />
                Hospital Admin account.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
                Verify your registered email address using the OTP
                provided during Hospital Admin account creation.
              </p>

            </div>

            {/* Verification steps */}

            <div className="relative z-10 space-y-4">

              <div className="flex items-center gap-3 text-sm text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <FiMail size={15} />
                </span>

                <span>
                  Verify registered email
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <FiShield size={15} />
                </span>

                <span>
                  Secure OTP verification
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <FiCheck size={15} />
                </span>

                <span>
                  Wait for Super User approval
                </span>
              </div>

            </div>
          </div>

          {/* ==================================================
              RIGHT FORM
          ================================================== */}

          <div className="bg-slate-50 p-5 sm:p-8 lg:p-10">

            <div className="mx-auto max-w-xl">

              {/* Header */}

              <div className="mb-8">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 lg:hidden">
                  <FiShield size={24} />
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  Account Verification
                </p>

                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Hospital Admin Verification
                </h2>

                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Enter your registered email and the 6-digit OTP
                  sent to you by the Super User.
                </p>

              </div>

              {/* ==================================================
                  SUCCESS STATE
              ================================================== */}

              {done ? (
                <div className="space-y-6">

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <FiCheck
                        size={32}
                        className="text-emerald-600"
                      />
                    </div>

                    <div className="text-center">

                      <h3 className="text-lg font-bold text-emerald-900">
                        Email Verified Successfully
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-700">
                        Your email address has been verified successfully.
                        Your Hospital Admin account is now waiting for
                        approval from the Super User.
                      </p>

                    </div>
                  </div>

                  {/* Status card */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <FiShield size={20} />
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Approval Pending
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          You will be able to login once the Super User
                          approves your Hospital Admin account.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Login button */}

                  <Link
                    to="/login"
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600"
                  >
                    Go to Login
                  </Link>

                </div>
              ) : (

                /* ==================================================
                    VERIFICATION FORM
                ================================================== */

                <form
                  onSubmit={submit}
                  className="space-y-6"
                >

                  {/* Email */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email Address
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">

                      <FiMail
                        size={18}
                        className={iconClass}
                      />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={change}
                        placeholder="Enter your registered email"
                        autoComplete="email"
                        className={inputClass}
                        required
                      />

                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Use the same email address that was used when
                      your Hospital Admin account was created.
                    </p>

                  </div>

                  {/* OTP */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Verification OTP
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">

                      <FiShield
                        size={18}
                        className={iconClass}
                      />

                      <input
                        type="text"
                        name="otp"
                        value={form.otp}
                        onChange={change}
                        placeholder="Enter 6-digit OTP"
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="one-time-code"
                        className={`${inputClass} tracking-[0.3em] font-semibold`}
                        required
                      />

                    </div>

                    <div className="mt-2 flex items-center justify-between">

                      <p className="text-xs text-slate-400">
                        Enter the 6-digit OTP received in your email.
                      </p>

                      <span
                        className={`text-xs font-semibold ${
                          form.otp.length === 6
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {form.otp.length}/6
                      </span>

                    </div>

                  </div>

                  {/* Security information */}

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <FiShield size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          Secure Verification
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          Your OTP is used only to verify your email
                          address. Never share your OTP with anyone.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading || form.otp.length !== 6}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiShield size={17} />
                        Verify Email
                      </>
                    )}
                  </button>

                  {/* Back to login */}

                  <div className="text-center">

                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-amber-600"
                    >
                      <FiArrowLeft size={15} />
                      Back to Login
                    </Link>

                  </div>

                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}