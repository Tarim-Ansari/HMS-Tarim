
import React, { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiMapPin,
  FiPhone,
  FiMail,
  FiX,
  FiLayers,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPower,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiMoreVertical,
  FiGlobe,
  FiFileText,
} from "react-icons/fi";

import PageHeader from "../../components/common/PageHeader";
import toast from "react-hot-toast";
import { api } from "../../api/client";

const initialBranches = [
  {
    id: 1,
    hospital: 1,
    hospital_name: "Apollo Multispeciality Hospital",
    name: "Apollo Pune Main Campus",
    branch_code: "PUNE-MAIN",
    phone: "+91 20 6767 8901",
    email: "pune.main@apollo.com",
    city: "Pune",
    state: "Maharashtra",
    status: "ACTIVE",
  },
  {
    id: 2,
    hospital: 1,
    hospital_name: "Apollo Multispeciality Hospital",
    name: "Apollo Hinjewadi Clinic",
    branch_code: "PUNE-HINJ",
    phone: "+91 20 6767 8902",
    email: "hinjewadi@apollo.com",
    city: "Pune",
    state: "Maharashtra",
    status: "ACTIVE",
  },
];

const emptyForm = {
  hospital: "",
  name: "",
  branchCode: "",
  phone: "",
  email: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  status: "ACTIVE",

  // Future fields - backend integration can be added later.
  logo: "",
  website: "",
  description: "",
  landmark: "",
  registrationNumber: "",
};

const ITEMS_PER_PAGE = 8;

export default function BranchManagement() {
  const [branches, setBranches] = useState(initialBranches);
  const [hospitals, setHospitals] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [hospitalFilter, setHospitalFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState(emptyForm);

  /*
   * ---------------------------------------------------------
   * LOAD DATA
   * Existing API logic preserved.
   * ---------------------------------------------------------
   */

  const loadBranches = async () => {
    try {
      const data = await api.get("/branches/");

      const list = Array.isArray(data)
        ? data
        : data?.results || data?.data || [];

      if (list.length > 0) {
        setBranches(list);
      }
    } catch (error) {
      console.error("Failed to load branches:", error);
    }
  };

  const loadHospitals = async () => {
    try {
      const data = await api.get("/hospitals/hospitals/");

      const list = Array.isArray(data)
        ? data
        : data?.data || data?.results || [];

      setHospitals(list);

      if (list.length > 0) {
        const activeHospital = list.find(
          (hospital) => hospital.status === "ACTIVE"
        );

        setFormData((prev) => ({
          ...prev,
          hospital:
            prev.hospital ||
            activeHospital?.id ||
            list[0]?.id ||
            "",
        }));
      }
    } catch (error) {
      console.error("Failed to load hospitals:", error);
    }
  };

  const loadData = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        loadBranches(),
        loadHospitals(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /*
   * ---------------------------------------------------------
   * STATS
   * ---------------------------------------------------------
   */

  const stats = useMemo(() => {
    const total = branches.length;

    const active = branches.filter(
      (branch) => branch.status === "ACTIVE"
    ).length;

    const inactive = branches.filter(
      (branch) => branch.status === "INACTIVE"
    ).length;

    const pending = branches.filter(
      (branch) =>
        branch.status === "PENDING" ||
        branch.status === "PENDING_APPROVAL"
    ).length;

    return {
      total,
      active,
      inactive,
      pending,
    };
  }, [branches]);

  /*
   * ---------------------------------------------------------
   * FORM
   * ---------------------------------------------------------
   */

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    const firstActiveHospital = hospitals.find(
      (hospital) => hospital.status === "ACTIVE"
    );

    setFormData({
      ...emptyForm,
      hospital: firstActiveHospital?.id || "",
    });
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);

    setFormData({
      hospital: branch.hospital || "",
      name: branch.name || "",
      branchCode: branch.branch_code || "",
      phone: branch.phone || "",
      email: branch.email || "",
      addressLine1: branch.address_line_1 || "",
      city: branch.city || "",
      state: branch.state || "",
      postalCode: branch.postal_code || "",
      status: branch.status || "ACTIVE",

      // Future fields
      logo: branch.logo || "",
      website: branch.website || "",
      description: branch.description || "",
      landmark: branch.landmark || "",
      registrationNumber:
        branch.registration_number || "",
    });

    setShowModal(true);
  };

  /*
   * ---------------------------------------------------------
   * CREATE / UPDATE
   * Existing payload logic preserved.
   * ---------------------------------------------------------
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const payload = {
      hospital:
        formData.hospital ||
        hospitals[0]?.id ||
        1,

      name: formData.name,

      branch_code: formData.branchCode
        .trim()
        .toUpperCase(),

      phone: formData.phone.replace(
        /[^0-9]/g,
        ""
      ),

      email: formData.email.trim(),

      address_line_1:
        formData.addressLine1,

      city: formData.city,

      state: formData.state,

      postal_code:
        formData.postalCode,

      status: formData.status,

      /*
       * Future backend fields:
       *
       * logo: formData.logo,
       * website: formData.website,
       * description: formData.description,
       * landmark: formData.landmark,
       * registration_number:
       *   formData.registrationNumber,
       */
    };

    try {
      if (editingBranch) {
        const result = await api.patch(
          `/branches/${editingBranch.id}/`,
          payload
        );

        const updatedBranch =
          result?.data || result;

        setBranches((prev) =>
          prev.map((branch) =>
            branch.id === editingBranch.id
              ? {
                  ...branch,
                  ...updatedBranch,
                }
              : branch
          )
        );

        toast.success(
          "Branch updated successfully!"
        );
      } else {
        const result = await api.post(
          "/branches/",
          payload
        );

        const newBranch =
          result?.data || result;

        setBranches((prev) => [
          newBranch,
          ...prev,
        ]);

        toast.success(
          "Branch added and saved to database!"
        );
      }

      setShowModal(false);
      setEditingBranch(null);
      resetForm();
    } catch (err) {
      toast.error(
        err.message ||
          `Failed to ${
            editingBranch ? "update" : "add"
          } branch.`
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * VIEW
   * ---------------------------------------------------------
   */

  const openView = (branch) => {
    setSelectedBranch(branch);
    setShowDetails(true);
  };

  /*
   * ---------------------------------------------------------
   * ACTIVATE / DEACTIVATE
   * ---------------------------------------------------------
   */

  const handleStatusChange = async (branch) => {
    const isActive =
      branch.status === "ACTIVE";

    const nextStatus = isActive
      ? "INACTIVE"
      : "ACTIVE";

    const action = isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${branch.name}"?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const result = await api.patch(
        `/branches/${branch.id}/`,
        {
          status: nextStatus,
        }
      );

      const updatedBranch =
        result?.data || result;

      setBranches((prev) =>
        prev.map((item) =>
          item.id === branch.id
            ? {
                ...item,
                ...updatedBranch,
                status:
                  updatedBranch?.status ||
                  nextStatus,
              }
            : item
        )
      );

      setSelectedBranch((prev) =>
        prev?.id === branch.id
          ? {
              ...prev,
              ...updatedBranch,
              status:
                updatedBranch?.status ||
                nextStatus,
            }
          : prev
      );

      toast.success(
        `Branch ${action}d successfully.`
      );
    } catch (err) {
      toast.error(
        err.message ||
          `Failed to ${action} branch.`
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  const handleDelete = async (branch) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${branch.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await api.delete(
        `/branches/${branch.id}/`
      );

      setBranches((prev) =>
        prev.filter(
          (item) => item.id !== branch.id
        )
      );

      if (selectedBranch?.id === branch.id) {
        setSelectedBranch(null);
        setShowDetails(false);
      }

      toast.success(
        "Branch deleted successfully."
      );
    } catch (err) {
      toast.error(
        err.message ||
          "Failed to delete branch."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * FILTER
   * ---------------------------------------------------------
   */

  const filteredBranches = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return branches.filter((branch) => {
      const matchSearch =
        branch.name
          ?.toLowerCase()
          .includes(searchValue) ||
        branch.branch_code
          ?.toLowerCase()
          .includes(searchValue) ||
        branch.city
          ?.toLowerCase()
          .includes(searchValue) ||
        branch.hospital_name
          ?.toLowerCase()
          .includes(searchValue);

      const matchStatus =
        statusFilter === "ALL" ||
        branch.status === statusFilter;

      const matchHospital =
        hospitalFilter === "ALL" ||
        String(branch.hospital) ===
          String(hospitalFilter);

      return (
        matchSearch &&
        matchStatus &&
        matchHospital
      );
    });
  }, [
    branches,
    search,
    statusFilter,
    hospitalFilter,
  ]);

  /*
   * ---------------------------------------------------------
   * PAGINATION
   * ---------------------------------------------------------
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBranches.length /
        ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedBranches =
    filteredBranches.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const handleFilterChange = (setter) => {
    setter(...arguments);
    setCurrentPage(1);
  };

  /*
   * ---------------------------------------------------------
   * DETAIL PAGE
   * ---------------------------------------------------------
   */

  if (showDetails && selectedBranch) {
    return (
      <BranchDetailsPage
        branch={selectedBranch}
        onBack={() => {
          setShowDetails(false);
          setSelectedBranch(null);
        }}
        onEdit={() => {
          setShowDetails(false);
          openEditModal(selectedBranch);
        }}
        onStatusChange={() =>
          handleStatusChange(selectedBranch)
        }
        onDelete={() =>
          handleDelete(selectedBranch)
        }
        loading={loading}
      />
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN PAGE
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Branch Management"
        subtitle="Manage hospital campuses, branches and operational locations"
        action={
          <button
            onClick={openCreateModal}
            className="btn-primary text-sm flex items-center gap-2 shadow-sm"
          >
            <FiPlus size={16} />
            Add Branch
          </button>
        }
      />

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Branches"
          value={stats.total}
          description="Registered locations"
          icon={FiLayers}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Active Branches"
          value={stats.active}
          description="Currently operational"
          icon={FiCheckCircle}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Inactive Branches"
          value={stats.inactive}
          description="Currently disabled"
          icon={FiClock}
          iconClass="bg-red-50 text-red-600"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          description="Awaiting approval"
          icon={FiClock}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Hospital Branches
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Manage branch information, status and
                operational details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-10 w-full sm:w-[280px] focus-within:border-medicore-400 focus-within:ring-2 focus-within:ring-medicore-100">
                <FiSearch
                  size={16}
                  className="text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search branch..."
                  className="bg-transparent outline-none border-none ml-2 w-full text-sm"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>

              {/* Hospital filter */}
              <select
                value={hospitalFilter}
                onChange={(e) => {
                  setHospitalFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                className="input-field h-10 text-sm min-w-[170px]"
              >
                <option value="ALL">
                  All Hospitals
                </option>

                {hospitals.map((hospital) => (
                  <option
                    key={hospital.id}
                    value={hospital.id}
                  >
                    {hospital.name}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                className="input-field h-10 text-sm min-w-[130px]"
              >
                <option value="ALL">
                  All Status
                </option>
                <option value="ACTIVE">
                  Active
                </option>
                <option value="INACTIVE">
                  Inactive
                </option>
                <option value="PENDING">
                  Pending
                </option>
              </select>

              {/* Refresh */}
              <button
                type="button"
                onClick={loadData}
                disabled={refreshing}
                className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                title="Refresh"
              >
                <FiRefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Branch
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Hospital
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Location
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Contact
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedBranches.map((branch) => {
                const active =
                  branch.status === "ACTIVE";

                return (
                  <tr
                    key={branch.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* Branch */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-medicore-50 text-medicore-600 flex items-center justify-center shrink-0">
                          <FiLayers size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            {branch.name}
                          </p>

                          <span className="inline-flex mt-1 font-mono text-[10px] font-bold text-medicore-700 bg-medicore-50 px-2 py-0.5 rounded-md">
                            {branch.branch_code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Hospital */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FiHome
                          size={14}
                          className="text-gray-400"
                        />

                        <span className="text-sm text-gray-700">
                          {branch.hospital_name ||
                            "Hospital #" +
                              branch.hospital}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FiMapPin
                          size={14}
                          className="text-gray-400"
                        />

                        {branch.city
                          ? `${branch.city}, ${
                              branch.state || ""
                            }`
                          : "N/A"}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {branch.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <FiPhone
                              size={12}
                              className="text-gray-400"
                            />
                            {branch.phone}
                          </div>
                        )}

                        {branch.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <FiMail
                              size={12}
                              className="text-gray-400"
                            />
                            <span className="truncate max-w-[170px]">
                              {branch.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          branch.status ||
                          "ACTIVE"
                        }
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionButton
                          title="View Branch"
                          onClick={() =>
                            openView(branch)
                          }
                        >
                          <FiEye size={15} />
                        </ActionButton>

                        <ActionButton
                          title="Edit Branch"
                          onClick={() =>
                            openEditModal(branch)
                          }
                        >
                          <FiEdit2 size={15} />
                        </ActionButton>

                        <ActionButton
                          title={
                            active
                              ? "Deactivate Branch"
                              : "Activate Branch"
                          }
                          disabled={loading}
                          className={
                            active
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }
                          onClick={() =>
                            handleStatusChange(
                              branch
                            )
                          }
                        >
                          <FiPower size={15} />
                        </ActionButton>

                        <ActionButton
                          title="Delete Branch"
                          disabled={loading}
                          className="text-red-500 hover:bg-red-50"
                          onClick={() =>
                            handleDelete(branch)
                          }
                        >
                          <FiTrash2 size={15} />
                        </ActionButton>

                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
                        >
                          <FiMoreVertical
                            size={16}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!paginatedBranches.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                        <FiLayers size={24} />
                      </div>

                      <p className="font-semibold text-gray-700">
                        No branches found
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        Try changing your search
                        or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            PAGINATION
        ================================================== */}

        {filteredBranches.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) *
                  ITEMS_PER_PAGE +
                  1}
              </span>{" "}
              -
              <span className="font-semibold text-gray-700">
                {" "}
                {Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,
                  filteredBranches.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filteredBranches.length}
              </span>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={15} />
              </button>

              {pageNumbers.map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                    currentPage === page
                      ? "bg-medicore-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-medicore-50 text-medicore-600 flex items-center justify-center">
                  {editingBranch ? (
                    <FiEdit2 size={18} />
                  ) : (
                    <FiLayers size={18} />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {editingBranch
                      ? "Edit Branch"
                      : "Create New Branch"}
                  </h3>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingBranch
                      ? "Update branch information and operational details."
                      : "Add a new hospital campus or physical branch."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <FiX size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              {/* Basic */}
              <div>
                <SectionTitle title="Branch Information" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      label="Select Hospital"
                      required
                    >
                      <select
                        required
                        name="hospital"
                        value={
                          formData.hospital
                        }
                        onChange={
                          handleInputChange
                        }
                        className="input-field text-sm"
                      >
                        <option value="">
                          Select active hospital
                        </option>

                        {hospitals
                          .filter(
                            (hospital) =>
                              hospital.status ===
                                "ACTIVE" ||
                              String(
                                hospital.id
                              ) ===
                                String(
                                  editingBranch?.hospital
                                )
                          )
                          .map((hospital) => (
                            <option
                              key={hospital.id}
                              value={
                                hospital.id
                              }
                            >
                              {hospital.name} (
                              {
                                hospital.hospital_code
                              }
                              )
                            </option>
                          ))}
                      </select>

                      <p className="text-[11px] text-gray-400 mt-1.5">
                        Only active hospitals can
                        receive new branches.
                      </p>
                    </FormField>
                  </div>

                  <FormField
                    label="Branch Name"
                    required
                  >
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={
                        handleInputChange
                      }
                      placeholder="e.g. Pune Central Branch"
                      className="input-field text-sm"
                    />
                  </FormField>

                  <FormField
                    label="Branch Code"
                    required
                  >
                    <input
                      required
                      name="branchCode"
                      value={
                        formData.branchCode
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="e.g. PUNE-01"
                      className="input-field text-sm uppercase"
                    />
                  </FormField>

                  <FormField label="Phone">
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={
                        handleInputChange
                      }
                      placeholder="+91 XXXXX XXXXX"
                      className="input-field text-sm"
                    />
                  </FormField>

                  <FormField label="Email">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={
                        handleInputChange
                      }
                      placeholder="branch@hospital.com"
                      className="input-field text-sm"
                    />
                  </FormField>
                </div>
              </div>

              {/* Location */}
              <div>
                <SectionTitle title="Location Details" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField label="Address">
                      <input
                        name="addressLine1"
                        value={
                          formData.addressLine1
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Street / Campus address"
                        className="input-field text-sm"
                      />
                    </FormField>
                  </div>

                  <FormField label="City">
                    <input
                      name="city"
                      value={formData.city}
                      onChange={
                        handleInputChange
                      }
                      placeholder="City"
                      className="input-field text-sm"
                    />
                  </FormField>

                  <FormField label="State">
                    <input
                      name="state"
                      value={formData.state}
                      onChange={
                        handleInputChange
                      }
                      placeholder="State"
                      className="input-field text-sm"
                    />
                  </FormField>

                  <FormField label="Postal Code">
                    <input
                      name="postalCode"
                      value={
                        formData.postalCode
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Pincode"
                      className="input-field text-sm"
                    />
                  </FormField>

                  <FormField label="Landmark">
                    <input
                      name="landmark"
                      value={
                        formData.landmark
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Nearby landmark"
                      className="input-field text-sm"
                    />
                  </FormField>
                </div>
              </div>

              {/* Future / Extra */}
              <div>
                <SectionTitle title="Additional Information" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Website">
                    <input
                      name="website"
                      value={
                        formData.website
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="https://hospital.com"
                      className="input-field text-sm"
                    />
                  </FormField>

                  <FormField label="Registration Number">
                    <input
                      name="registrationNumber"
                      value={
                        formData.registrationNumber
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Hospital registration number"
                      className="input-field text-sm"
                    />
                  </FormField>

                  <div className="md:col-span-2">
                    <FormField label="Hospital Logo">
                      <input
                        name="logo"
                        value={formData.logo}
                        onChange={
                          handleInputChange
                        }
                        placeholder="Logo URL / file - backend integration later"
                        className="input-field text-sm"
                      />

                      {/* TODO:
                          Later replace this with
                          image/file upload.
                      */}
                    </FormField>
                  </div>

                  <div className="md:col-span-2">
                    <FormField label="Branch Description">
                      <textarea
                        name="description"
                        value={
                          formData.description
                        }
                        onChange={
                          handleInputChange
                        }
                        rows={3}
                        placeholder="Short description about this branch..."
                        className="input-field text-sm resize-none"
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-sm min-w-[130px]"
                >
                  {loading
                    ? "Saving..."
                    : editingBranch
                    ? "Update Branch"
                    : "Save Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   BRANCH DETAILS PAGE
============================================================ */

function BranchDetailsPage({
  branch,
  onBack,
  onEdit,
  onStatusChange,
  onDelete,
  loading,
}) {
  const active =
    branch.status === "ACTIVE";

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm"
            title="Back"
          >
            <FiChevronLeft size={19} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">
                Branch Details
              </h1>

              <StatusBadge
                status={
                  branch.status || "ACTIVE"
                }
              />
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Complete information for{" "}
              <span className="font-semibold text-gray-700">
                {branch.name}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <FiEdit2 size={14} />
            Edit
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onStatusChange}
            className={`text-sm px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              active
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <FiPower size={14} />

            {active
              ? "Deactivate"
              : "Activate"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold flex items-center gap-2"
          >
            <FiTrash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-medicore-50/80 to-white">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-medicore-600">
              <FiLayers size={34} />
            </div>

            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
                Branch
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {branch.name}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-mono text-xs font-bold text-medicore-700 bg-white border border-medicore-100 px-2.5 py-1 rounded-lg">
                  {branch.branch_code}
                </span>

                <span className="text-xs text-gray-500">
                  {branch.hospital_name ||
                    `Hospital #${branch.hospital}`}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-gray-400">
                Current Status
              </p>

              <p
                className={`text-lg font-bold mt-1 ${
                  active
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {active
                  ? "Operational"
                  : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Organization */}
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <SectionTitle title="Branch Information" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailBox
              label="Branch Name"
              value={branch.name}
              icon={FiLayers}
            />

            <DetailBox
              label="Branch Code"
              value={branch.branch_code}
              icon={FiFileText}
            />

            <DetailBox
              label="Hospital"
              value={
                branch.hospital_name ||
                `Hospital #${branch.hospital}`
              }
              icon={FiHome}
            />

            <DetailBox
              label="Status"
              value={
                branch.status || "ACTIVE"
              }
              icon={FiCheckCircle}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <SectionTitle title="Contact" />

          <div className="space-y-4">
            <ContactRow
              icon={FiPhone}
              label="Phone"
              value={branch.phone}
            />

            <ContactRow
              icon={FiMail}
              label="Email"
              value={branch.email}
            />

            <ContactRow
              icon={FiGlobe}
              label="Website"
              value={
                branch.website ||
                "Not available"
              }
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <SectionTitle title="Location Details" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailBox
            label="Address"
            value={
              branch.address_line_1
            }
            icon={FiMapPin}
          />

          <DetailBox
            label="City"
            value={branch.city}
            icon={FiMapPin}
          />

          <DetailBox
            label="State"
            value={branch.state}
            icon={FiMapPin}
          />

          <DetailBox
            label="Postal Code"
            value={branch.postal_code}
            icon={FiMapPin}
          />
        </div>
      </div>

      {/* Extra */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <SectionTitle title="Additional Information" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailBox
            label="Registration Number"
            value={
              branch.registration_number
            }
            icon={FiFileText}
          />

          <DetailBox
            label="Landmark"
            value={branch.landmark}
            icon={FiMapPin}
          />

          <DetailBox
            label="Description"
            value={branch.description}
            icon={FiFileText}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {value}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const normalized =
    status || "ACTIVE";

  const styles = {
    ACTIVE:
      "bg-emerald-50 text-emerald-700",
    INACTIVE:
      "bg-red-50 text-red-700",
    PENDING:
      "bg-amber-50 text-amber-700",
    PENDING_APPROVAL:
      "bg-amber-50 text-amber-700",
  };

  const labels = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    PENDING: "Pending",
    PENDING_APPROVAL:
      "Pending Approval",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
        styles[normalized] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />

      {labels[normalized] ||
        normalized}
    </span>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-full bg-medicore-600" />

      <h3 className="text-sm font-bold text-gray-800">
        {title}
      </h3>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function DetailBox({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-400">
        {Icon && <Icon size={14} />}

        <span className="text-[10px] uppercase tracking-wider font-bold">
          {label}
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-700 mt-2 break-words">
        {value || "Not available"}
      </p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
          {label}
        </p>

        <p className="text-sm font-medium text-gray-700 mt-0.5 break-words">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}


