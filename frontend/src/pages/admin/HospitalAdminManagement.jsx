
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiXCircle,
  FiEdit,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiHome,
  FiUsers,
  FiActivity,
  FiMoreVertical,
  
} from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader";
import { authApi, hospitalApi } from "../../api/service";


const initial = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  hospital: "",
  branch: "",
};

export default function HospitalAdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verify OTP in Super User dashboard
  const [otpAdmin, setOtpAdmin] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const [a, h] = await Promise.all([
        authApi.hospitalAdmins(),
        hospitalApi.list(),
      ]);

      setAdmins(a.data || []);
      setHospitals(h.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.hospitalAdminCreate({
        ...form,
        hospital: Number(form.hospital),
        branch: form.branch ? Number(form.branch) : null,
      });

      toast.success(
        res.message || "Hospital Admin created. OTP sent."
      );

      setOpen(false);
      setForm(initial);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    setLoading(true);

    try {
      const r = await authApi.hospitalAdminApprove(id);
      toast.success(r.message);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async (id) => {
    try {
      const r = await authApi.hospitalAdminResendOtp(id);
      toast.success(r.message);
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Edit
  const editAdmin = async (admin) => {
    const first_name = window.prompt(
      "Enter first name:",
      admin.first_name || ""
    );

    if (first_name === null) return;

    const last_name = window.prompt(
      "Enter last name:",
      admin.last_name || ""
    );

    if (last_name === null) return;

    const phone = window.prompt(
      "Enter phone:",
      admin.phone || ""
    );

    if (phone === null) return;

    setLoading(true);

    try {
      const res = await authApi.hospitalAdminUpdate(
        admin.id,
        {
          first_name,
          last_name,
          phone,
        }
      );

      toast.success(
        res.message || "Hospital Admin updated successfully."
      );

      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Activate / Deactivate
  const toggleAdminStatus = async (admin) => {
    // Email must be verified first
    if (!admin.is_email_verified) {
      toast.error(
        "Please verify the admin email before changing account status."
      );
      return;
    }

    const action = admin.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this Hospital Admin?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await authApi.hospitalAdminSetStatus(
        admin.id,
        !admin.is_active
      );

      toast.success(
        res.message ||
          `Hospital Admin ${action}d successfully.`
      );

      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteAdmin = async (admin) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${admin.username}?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await authApi.hospitalAdminDelete(
        admin.id
      );

      toast.success(
        res.message || "Hospital Admin deleted successfully."
      );

      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify email OTP by Super User
  const verifyAdminOtp = async (e) => {
    e.preventDefault();

    if (!otpAdmin || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);

    try {
      const res = await authApi.hospitalAdminVerifyOtp({
        email: otpAdmin.email,
        otp: otp,
      });

      toast.success(
        res.message || "OTP verified successfully."
      );

      setOtpAdmin(null);
      setOtp("");
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: admins.length,
      pending: admins.filter(
        (a) => !a.is_approved
      ).length,
      verified: admins.filter(
        (a) => a.is_email_verified
      ).length,
      active: admins.filter(
        (a) => a.is_active && a.is_approved
      ).length,
    }),
    [admins]
  );

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <PageHeader
        title="Hospital Admin Management"
        subtitle="Create, verify, approve and manage hospital administrators"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Total */}
        <div className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiUsers className="text-blue-600 text-xl" />
            </div>

            <span className="text-xs font-medium text-gray-400">
              TOTAL
            </span>
          </div>

          <p className="text-3xl font-bold text-gray-800 mt-4">
            {stats.total}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Hospital Administrators
          </p>
        </div>

        {/* Pending */}
        <div className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <FiClock className="text-amber-600 text-xl" />
            </div>

            <span className="text-xs font-medium text-gray-400">
              PENDING
            </span>
          </div>

          <p className="text-3xl font-bold text-gray-800 mt-4">
            {stats.pending}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Awaiting approval
          </p>
        </div>

        {/* Verified */}
        <div className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FiMail className="text-emerald-600 text-xl" />
            </div>

            <span className="text-xs font-medium text-gray-400">
              VERIFIED
            </span>
          </div>

          <p className="text-3xl font-bold text-gray-800 mt-4">
            {stats.verified}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Email verified
          </p>
        </div>

        {/* Active */}
        <div className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
              <FiActivity className="text-violet-600 text-xl" />
            </div>

            <span className="text-xs font-medium text-gray-400">
              ACTIVE
            </span>
          </div>

          <p className="text-3xl font-bold text-gray-800 mt-4">
            {stats.active}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Active administrators
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="px-5 py-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FiShield className="text-blue-600" />
                </div>

                <h2 className="font-semibold text-gray-800 text-lg">
                  Administrator Accounts
                </h2>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Manage hospital administrator verification,
                approval and account access.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                <FiRefreshCw
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition"
              >
                <FiPlus />
                Create Hospital Admin
              </button>

            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Admin",
                  "Hospital",
                  "Email",
                  "Email Status",
                  "Approval",
                  "Account",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {admins.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-gray-50/80 transition"
                >

                  {/* Admin */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
                        {(
                          a.full_name ||
                          a.username ||
                          "A"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="font-semibold text-gray-800">
                          {a.full_name || a.username}
                        </div>

                        <div className="text-xs text-gray-400 mt-0.5">
                          @{a.username}
                        </div>
                      </div>

                    </div>
                  </td>

                  {/* Hospital */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiHome className="text-gray-400" />
                      {a.hospital_name || "—"}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4">
                    <div className="text-gray-700">
                      {a.email}
                    </div>
                  </td>

                  {/* Email Status */}
                  <td className="px-5 py-4">
                    {a.is_email_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <FiCheckCircle />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                        <FiClock />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Approval */}
                  <td className="px-5 py-4">
                    {a.is_approved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        <FiCheckCircle />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                        <FiClock />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Account */}
                  <td className="px-5 py-4">
                    {a.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => editAdmin(a)}
                        disabled={loading}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition disabled:opacity-40"
                        title="Edit Admin"
                      >
                        <FiEdit size={16} />
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleAdminStatus(a)
                        }
                        disabled={
                          loading ||
                          !a.is_email_verified
                        }
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                          !a.is_email_verified
                            ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                            : a.is_active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={
                          !a.is_email_verified
                            ? "Verify email first"
                            : a.is_active
                            ? "Deactivate Admin"
                            : "Activate Admin"
                        }
                      >
                        {a.is_active ? (
                          <FiUserX size={17} />
                        ) : (
                          <FiUserCheck size={17} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deleteAdmin(a)}
                        disabled={loading}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                        title="Delete Admin"
                      >
                        <FiTrash2 size={16} />
                      </button>

                      {/* Verify OTP */}
                      {!a.is_email_verified && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpAdmin(a);
                              setOtp("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                            title="Verify Email OTP"
                          >
                            <FiShield size={14} />
                            Verify
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              resend(a.id)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs font-medium hover:bg-gray-50 transition"
                            title="Resend OTP"
                          >
                            <FiRefreshCw size={14} />
                            Resend
                          </button>
                        </>
                      )}

                      {/* Approve */}
                      {a.is_email_verified &&
                        !a.is_approved && (
                          <button
                            type="button"
                            onClick={() =>
                              approve(a.id)
                            }
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                            title="Approve Admin"
                          >
                            <FiCheckCircle size={14} />
                            Approve
                          </button>
                        )}

                      {/* Login Enabled */}
                      {a.is_approved && (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium ml-1"
                          title="Admin can login"
                        >
                          <FiCheckCircle />
                          Enabled
                        </span>
                      )}

                    </div>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>

          {/* Empty State */}
          {!admins.length && (
            <div className="py-16 text-center">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FiUsers className="text-gray-400 text-2xl" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                No Hospital Admins Found
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Create your first Hospital Admin to get started.
              </p>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                <FiPlus />
                Create Hospital Admin
              </button>

            </div>
          )}
        </div>
      </div>

      {/* Create Hospital Admin Modal */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-start">

                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <FiShield />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Create Hospital Admin
                      </h2>

                      <p className="text-sm text-gray-500 mt-0.5">
                        Create a new administrator account.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    An OTP will be sent to the admin's email
                    after account creation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                >
                  ×
                </button>

              </div>
            </div>

            <form
              onSubmit={create}
              className="p-6 grid sm:grid-cols-2 gap-5"
            >

              <label>
                <span className="label-text">
                  Username
                </span>

                <input
                  className="input-field"
                  name="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                <span className="label-text">
                  Email
                </span>

                <input
                  className="input-field"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                <span className="label-text">
                  First Name
                </span>

                <input
                  className="input-field"
                  name="first_name"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      first_name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span className="label-text">
                  Last Name
                </span>

                <input
                  className="input-field"
                  name="last_name"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      last_name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span className="label-text">
                  Phone
                </span>

                <input
                  className="input-field"
                  name="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span className="label-text">
                  Temporary Password
                </span>

                <input
                  className="input-field"
                  type="password"
                  name="password"
                  minLength={8}
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label className="sm:col-span-2">
                <span className="label-text">
                  Hospital
                </span>

                <select
                  className="input-field"
                  value={form.hospital}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hospital: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select hospital
                  </option>

                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.hospital_code})
                    </option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-5 border-t border-gray-200">

                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  <FiPlus />
                  {loading
                    ? "Creating..."
                    : "Create Admin"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {otpAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <FiMail size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Verify Email
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Hospital Admin OTP verification
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOtpAdmin(null);
                    setOtp("");
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  ×
                </button>

              </div>
            </div>

            <form
              onSubmit={verifyAdminOtp}
              className="p-6"
            >

              <div className="text-center mb-6">

                <p className="text-sm text-gray-500">
                  Enter the 6-digit verification code
                  sent to
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {otpAdmin.email}
                </p>

              </div>

              <label>
                <span className="label-text">
                  Verification Code
                </span>

                <input
                  className="input-field text-center tracking-[0.5em] text-xl font-semibold"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="000000"
                  autoFocus
                  required
                />
              </label>

              <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <FiShield className="mt-0.5 flex-shrink-0" />
                  Verify the email before activating or
                  approving this administrator account.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                  onClick={() => {
                    setOtpAdmin(null);
                    setOtp("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    verifyingOtp ||
                    otp.length !== 6
                  }
                >
                  <FiCheckCircle />

                  {verifyingOtp
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

