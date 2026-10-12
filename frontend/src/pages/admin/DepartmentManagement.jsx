
import React, { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiEye,
  FiFileText,
  FiFilter,
  FiHash,
  FiLayers,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
  FiDownload,
  FiPower,
} from "react-icons/fi";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import { departmentApi, branchApi } from "../../api/service";

/* =========================================================
   DEPARTMENT MANAGEMENT
   ---------------------------------------------------------
   API handled through service.js:

   branchApi.list()
   departmentApi.list()
   departmentApi.get()
   departmentApi.create()
   departmentApi.update()
   departmentApi.remove()

   Features:
   - Premium dashboard
   - Statistics
   - Search
   - Branch filter
   - Status filter
   - Pagination
   - Refresh
   - View details
   - Edit
   - Activate
   - Deactivate
   - Delete
   - Create / Edit modal
   - Excel export placeholder
   - PDF export placeholder
   - Responsive table
   ========================================================= */


/* =========================================================
   BASIC CONFIGURATION
   ========================================================= */

const ITEMS_PER_PAGE = 8;

const emptyForm = {
  branch: "",
  name: "",
  code: "",
  description: "",
  status: "ACTIVE",

  /*
    ========================================================
    FUTURE FIELDS
    ========================================================

    Add these only after Django model + serializer
    supports them.

    departmentHead: "",
    phone: "",
    email: "",
    floor: "",
    roomNumber: "",
    extension: "",
    workingHours: "",
    emergencyAvailable: false,
    logo: null,
    notes: "",
  */
};


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;

  return data?.results || data?.data || [];
};


const getStatus = (department) => {
  return String(
    department?.status || "INACTIVE"
  ).toUpperCase();
};


const isActive = (department) => {
  return getStatus(department) === "ACTIVE";
};


const formatDate = (value) => {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};


const getStatusClass = (status) => {
  const normalized = String(
    status || ""
  ).toUpperCase();

  if (normalized === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (normalized === "PENDING") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }

  return "bg-gray-100 text-gray-600 border border-gray-200";
};


/* =========================================================
   COMPONENT
   ========================================================= */

export default function DepartmentManagement() {
  /* =======================================================
     DATA STATE
     ======================================================= */

  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [actionLoadingId, setActionLoadingId] =
    useState(null);


  /* =======================================================
     FILTER STATE
     ======================================================= */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);


  /* =======================================================
     MODAL / VIEW STATE
     ======================================================= */

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState(null);

  const [form, setForm] = useState(emptyForm);


  /* =======================================================
     LOAD BRANCHES
     -------------------------------------------------------
     service.js:
     branchApi = crud("/branches/")
     ======================================================= */

  const loadBranches = async () => {
    const data = await branchApi.list();

    setBranches(normalizeList(data));
  };


  /* =======================================================
     LOAD DEPARTMENTS
     -------------------------------------------------------
     service.js:
     departmentApi = crud("/departments/")

     IMPORTANT:
     crud.list(params) automatically creates query params.
     ======================================================= */

  const loadDepartments = async () => {
    setLoading(true);

    try {
      const params = {};

      if (branchFilter) {
        params.branch = branchFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const data = await departmentApi.list(params);

      setDepartments(normalizeList(data));
    } catch (error) {
      toast.error(
        error.message ||
          "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     INITIAL BRANCH LOAD
     ======================================================= */

  useEffect(() => {
    loadBranches().catch((error) => {
      toast.error(
        error.message ||
          "Failed to load branches."
      );
    });
  }, []);


  /* =======================================================
     SEARCH / FILTER
     -------------------------------------------------------
     250ms debounce
     ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDepartments();
    }, 250);

    return () => clearTimeout(timer);
  }, [
    search,
    branchFilter,
    statusFilter,
  ]);


  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
     ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    branchFilter,
    statusFilter,
  ]);


  /* =======================================================
     STATISTICS
     ======================================================= */

  const totalDepartments =
    departments.length;


  const activeCount = useMemo(
    () =>
      departments.filter(
        (department) =>
          getStatus(department) === "ACTIVE"
      ).length,
    [departments]
  );


  const inactiveCount = useMemo(
    () =>
      departments.filter(
        (department) =>
          getStatus(department) === "INACTIVE"
      ).length,
    [departments]
  );


  const pendingCount = useMemo(
    () =>
      departments.filter(
        (department) =>
          getStatus(department) === "PENDING"
      ).length,
    [departments]
  );


  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalDepartments / ITEMS_PER_PAGE
    )
  );


  const paginatedDepartments = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return departments.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [
    departments,
    currentPage,
  ]);


  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);


  /* =======================================================
     CREATE DEPARTMENT
     ======================================================= */

  const openCreate = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,

      branch:
        branchFilter ||
        branches.find(
          (branch) =>
            String(
              branch.status || "ACTIVE"
            ).toUpperCase() === "ACTIVE"
        )?.id ||
        "",
    });

    setShowModal(true);
  };


  /* =======================================================
     EDIT DEPARTMENT
     ======================================================= */

  const openEdit = (department) => {
    setEditingId(department.id);

    setForm({
      branch: department.branch || "",
      name: department.name || "",
      code: department.code || "",
      description:
        department.description || "",
      status:
        department.status || "ACTIVE",
    });

    setShowModal(true);
  };


  /* =======================================================
     VIEW DEPARTMENT
     -------------------------------------------------------
     service.js:
     departmentApi.get(id)
     ======================================================= */

  const openView = async (department) => {
    try {
      const data =
        await departmentApi.get(
          department.id
        );

      setSelectedDepartment(
        data?.data || data
      );
    } catch {
      /*
        If detail API fails, show existing row data.
      */

      setSelectedDepartment(
        department
      );
    }
  };


  /* =======================================================
     CLOSE DETAIL VIEW
     ======================================================= */

  const closeView = () => {
    setSelectedDepartment(null);
  };


  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm({
      ...emptyForm,
    });
  };


  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleInputChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =======================================================
     SAVE DEPARTMENT
     -------------------------------------------------------
     CREATE:
     departmentApi.create(payload)

     UPDATE:
     departmentApi.update(id, payload)
     ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.branch) {
      toast.error(
        "Please select a branch."
      );
      return;
    }

    if (!form.name.trim()) {
      toast.error(
        "Department name is required."
      );
      return;
    }

    if (!form.code.trim()) {
      toast.error(
        "Department code is required."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        branch: Number(form.branch),
        name: form.name.trim(),
        code: form.code
          .trim()
          .toUpperCase(),
        description:
          form.description.trim(),
        status: form.status,
      };

      if (editingId) {
        await departmentApi.update(
          editingId,
          payload
        );

        toast.success(
          "Department updated successfully."
        );
      } else {
        await departmentApi.create(
          payload
        );

        toast.success(
          "Department created successfully."
        );
      }

      setShowModal(false);
      setEditingId(null);
      setForm({
        ...emptyForm,
      });

      await loadDepartments();
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to save department."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     ACTIVATE / DEACTIVATE
     -------------------------------------------------------
     departmentApi.update(id, {
       status: "ACTIVE"
     })

     departmentApi.update(id, {
       status: "INACTIVE"
     })
     ======================================================= */

  const changeStatus = async (
    department,
    nextStatus
  ) => {
    setActionLoadingId(
      department.id
    );

    try {
      await departmentApi.update(
        department.id,
        {
          status: nextStatus,
        }
      );

      toast.success(
        nextStatus === "ACTIVE"
          ? "Department activated successfully."
          : "Department deactivated successfully."
      );

      /*
        Update local state immediately.
      */

      setDepartments((previous) =>
        previous.map((item) =>
          item.id === department.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      /*
        Update opened detail page.
      */

      setSelectedDepartment(
        (previous) =>
          previous?.id ===
          department.id
            ? {
                ...previous,
                status: nextStatus,
              }
            : previous
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to change department status."
      );
    } finally {
      setActionLoadingId(null);
    }
  };


  const activateDepartment = (
    department
  ) => {
    changeStatus(
      department,
      "ACTIVE"
    );
  };


  const deactivateDepartment = (
    department
  ) => {
    changeStatus(
      department,
      "INACTIVE"
    );
  };


  /* =======================================================
     DELETE
     -------------------------------------------------------
     departmentApi.remove(id)
     ======================================================= */

  const handleDelete = async (
    department
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${department.name}"?`
      );

    if (!confirmed) return;

    setActionLoadingId(
      department.id
    );

    try {
      await departmentApi.remove(
        department.id
      );

      toast.success(
        "Department deleted successfully."
      );

      setDepartments((previous) =>
        previous.filter(
          (item) =>
            item.id !==
            department.id
        )
      );

      if (
        selectedDepartment?.id ===
        department.id
      ) {
        setSelectedDepartment(null);
      }
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to delete department."
      );
    } finally {
      setActionLoadingId(null);
    }
  };


  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        loadBranches(),
        loadDepartments(),
      ]);

      toast.success(
        "Department data refreshed."
      );
    } catch {
      toast.error(
        "Unable to refresh department data."
      );
    } finally {
      setRefreshing(false);
    }
  };


  /* =======================================================
     CLEAR FILTERS
     ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setBranchFilter("");
    setCurrentPage(1);
  };


  /* =======================================================
     EXPORT - EXCEL
     -------------------------------------------------------
     TODO / FUTURE IMPLEMENTATION

     npm install xlsx

     Do not add this package until you want actual
     Excel export functionality.
     ======================================================= */

  const handleExportExcel = () => {
    /*
      TODO:

      import * as XLSX from "xlsx";

      const rows = departments.map((department) => ({
        Code: department.code,
        Department: department.name,
        Branch:
          department.branch_name ||
          `Branch #${department.branch}`,
        Hospital:
          department.hospital_name || "",
        Description:
          department.description || "",
        Status: department.status,
      }));

      const worksheet =
        XLSX.utils.json_to_sheet(rows);

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Departments"
      );

      XLSX.writeFile(
        workbook,
        "departments.xlsx"
      );
    */

    toast(
      "Excel export is ready to connect.",
      {
        icon: "📊",
      }
    );
  };


  /* =======================================================
     EXPORT - PDF
     -------------------------------------------------------
     TODO / FUTURE IMPLEMENTATION

     npm install jspdf jspdf-autotable
     ======================================================= */

  const handleExportPDF = () => {
    /*
      TODO:

      import jsPDF from "jspdf";
      import autoTable from "jspdf-autotable";

      const doc = new jsPDF();

      doc.text(
        "MediCore HMS - Departments",
        14,
        15
      );

      autoTable(doc, {
        startY: 25,
        head: [[
          "Code",
          "Department",
          "Branch",
          "Hospital",
          "Status"
        ]],
        body: departments.map((department) => [
          department.code,
          department.name,
          department.branch_name ||
            `Branch #${department.branch}`,
          department.hospital_name || "—",
          department.status,
        ]),
      });

      doc.save("departments.pdf");
    */

    toast(
      "PDF export is ready to connect.",
      {
        icon: "📄",
      }
    );
  };


  /* =======================================================
     DETAIL PAGE
     ======================================================= */

  if (selectedDepartment) {
    const department =
      selectedDepartment;

    return (
      <div className="space-y-6">

        {/* DETAIL HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <button
              onClick={closeView}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-medicore-700 mb-3 transition"
            >
              <FiArrowLeft size={16} />
              Back to Departments
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {department.name}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Department details and management
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() =>
                openEdit(department)
              }
              className="btn-secondary flex items-center gap-2"
            >
              <FiEdit2 size={16} />
              Edit
            </button>

            {isActive(department) ? (
              <button
                onClick={() =>
                  deactivateDepartment(
                    department
                  )
                }
                disabled={
                  actionLoadingId ===
                  department.id
                }
                className="px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <FiPower size={16} />
                Deactivate
              </button>
            ) : (
              <button
                onClick={() =>
                  activateDepartment(
                    department
                  )
                }
                disabled={
                  actionLoadingId ===
                  department.id
                }
                className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <FiCheckCircle
                  size={16}
                />
                Activate
              </button>
            )}
          </div>
        </div>


        {/* DETAIL HERO */}

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-medicore-900 text-white p-6 md:p-8">

          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5" />

          <div className="absolute -left-10 -bottom-20 w-56 h-56 rounded-full bg-white/5" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6">

            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <FiLayers size={30} />
            </div>

            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-2xl font-bold">
                  {department.name}
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                    department.status
                  )}`}
                >
                  {department.status ||
                    "INACTIVE"}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-300">

                <span className="flex items-center gap-2">
                  <FiHash size={14} />
                  {department.code ||
                    "No code"}
                </span>

                <span className="flex items-center gap-2">
                  <FiMapPin size={14} />
                  {department.branch_name ||
                    `Branch #${department.branch}`}
                </span>

                <span className="flex items-center gap-2">
                  <FiActivity size={14} />
                  {department.hospital_name ||
                    "Hospital"}
                </span>

              </div>
            </div>
          </div>
        </div>


        {/* DETAIL INFORMATION CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiHash size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Department Code
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {department.code ||
                    "—"}
                </p>
              </div>
            </div>
          </div>


          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiMapPin size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Branch
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {department.branch_name ||
                    `Branch #${department.branch}`}
                </p>
              </div>
            </div>
          </div>


          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiUsers size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Hospital
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {department.hospital_name ||
                    "—"}
                </p>
              </div>
            </div>
          </div>


          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiClock size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {department.status ||
                    "—"}
                </p>
              </div>
            </div>
          </div>

        </div>


        {/* DESCRIPTION */}

        <div className="card">

          <div className="flex items-center gap-2 mb-4">
            <FiFileText className="text-medicore-600" />

            <h3 className="font-bold text-gray-800">
              Department Description
            </h3>
          </div>

          <p className="text-sm text-gray-600 leading-7">
            {department.description ||
              "No description has been added for this department."}
          </p>

        </div>


        {/* SYSTEM INFORMATION */}

        <div className="card">

          <h3 className="font-bold text-gray-800 mb-5">
            System Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <div>
              <p className="text-xs text-gray-400">
                Department ID
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-1">
                #{department.id ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Created
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-1">
                {formatDate(
                  department.created_at
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Last Updated
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-1">
                {formatDate(
                  department.updated_at
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Current Status
              </p>

              <span
                className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                  department.status
                )}`}
              >
                {department.status ||
                  "INACTIVE"}
              </span>
            </div>

          </div>

        </div>


        {/* EDIT MODAL */}

        {showModal && (
          <DepartmentModal
            form={form}
            editingId={editingId}
            saving={saving}
            branches={branches}
            onSubmit={handleSubmit}
            onClose={closeModal}
            onChange={handleInputChange}
          />
        )}

      </div>
    );
  }


  /* =======================================================
     MAIN DEPARTMENT PAGE
     ======================================================= */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <PageHeader
        title="Department Management"
        subtitle="Create, manage and monitor hospital departments branch-wise."
        action={
          <div className="flex flex-wrap gap-2">

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2"
              title="Refresh"
            >
              <FiRefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>


            {/* EXCEL */}

            <button
              onClick={handleExportExcel}
              className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-2 text-sm font-medium transition"
            >
              <FiDownload size={16} />
              Excel
            </button>


            {/* PDF */}

            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 flex items-center gap-2 text-sm font-medium transition"
            >
              <FiDownload size={16} />
              PDF
            </button>


            {/* ADD */}

            <button
              onClick={openCreate}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus size={16} />
              Add Department
            </button>

          </div>
        }
      />


      {/* STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* TOTAL */}

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white shadow-sm">

          <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-xs text-slate-300">
                Total Departments
              </p>

              <p className="text-3xl font-bold mt-2">
                {totalDepartments}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                All registered departments
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <FiLayers size={20} />
            </div>

          </div>
        </div>


        {/* ACTIVE */}

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-5 text-white shadow-sm">

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-xs text-emerald-100">
                Active Departments
              </p>

              <p className="text-3xl font-bold mt-2">
                {activeCount}
              </p>

              <p className="text-xs text-emerald-100 mt-2">
                Currently operational
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <FiCheckCircle size={20} />
            </div>

          </div>
        </div>


        {/* PENDING */}

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-sm">

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-xs text-amber-100">
                Pending
              </p>

              <p className="text-3xl font-bold mt-2">
                {pendingCount}
              </p>

              <p className="text-xs text-amber-100 mt-2">
                Awaiting activation
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <FiClock size={20} />
            </div>

          </div>
        </div>


        {/* INACTIVE */}

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 p-5 text-white shadow-sm">

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-xs text-gray-300">
                Inactive
              </p>

              <p className="text-3xl font-bold mt-2">
                {inactiveCount}
              </p>

              <p className="text-xs text-gray-300 mt-2">
                Currently disabled
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <FiAlertCircle size={20} />
            </div>

          </div>
        </div>

      </div>


      {/* SEARCH + FILTERS */}

      <div className="card">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">

          <div>
            <h3 className="font-bold text-gray-800">
              Department Directory
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Search, filter and manage departments.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FiFilter size={14} />
            Advanced Filters
          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

          {/* SEARCH */}

          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">

            <FiSearch
              className="text-gray-400 shrink-0"
              size={17}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search department, code, branch..."
              className="bg-transparent border-none outline-none ml-2 w-full text-sm text-gray-700"
            />

          </div>


          {/* BRANCH FILTER */}

          <select
            value={branchFilter}
            onChange={(event) =>
              setBranchFilter(
                event.target.value
              )
            }
            className="input-field text-sm"
          >
            <option value="">
              All Branches
            </option>

            {branches.map(
              (branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.name}
                </option>
              )
            )}

          </select>


          {/* STATUS FILTER */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="input-field text-sm"
          >
            <option value="">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

          </select>


          {/* CLEAR */}

          <button
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-600 font-medium transition"
          >
            Clear Filters
          </button>

        </div>

      </div>


      {/* TABLE */}

      <div className="card overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

          <div>
            <h3 className="font-bold text-gray-800">
              Departments
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Showing{" "}
              {totalDepartments === 0
                ? 0
                : (currentPage - 1) *
                    ITEMS_PER_PAGE +
                  1}{" "}
              -{" "}
              {Math.min(
                currentPage *
                  ITEMS_PER_PAGE,
                totalDepartments
              )}{" "}
              of{" "}
              {totalDepartments}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <FiLayers size={14} />
            Department List
          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="table-header">

                <th className="px-4 py-3">
                  Code
                </th>

                <th className="px-4 py-3">
                  Department
                </th>

                <th className="px-4 py-3">
                  Branch
                </th>

                <th className="px-4 py-3">
                  Hospital
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Created
                </th>

                <th className="px-4 py-3 text-right">
                  Actions
                </th>

              </tr>
            </thead>


            <tbody className="divide-y divide-gray-100">

              {/* LOADING */}

              {loading && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">

                      <FiRefreshCw
                        className="animate-spin text-medicore-600 mb-3"
                        size={24}
                      />

                      <p className="text-sm text-gray-500">
                        Loading departments...
                      </p>

                    </div>
                  </td>
                </tr>
              )}


              {/* EMPTY */}

              {!loading &&
                paginatedDepartments.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-14 text-center"
                    >
                      <div className="flex flex-col items-center">

                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                          <FiLayers size={24} />
                        </div>

                        <p className="font-semibold text-gray-700">
                          No departments found
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Try changing your search or filters.
                        </p>

                      </div>
                    </td>
                  </tr>
                )}


              {/* DATA */}

              {!loading &&
                paginatedDepartments.map(
                  (department) => {

                    const active =
                      isActive(
                        department
                      );

                    const actionLoading =
                      actionLoadingId ===
                      department.id;

                    return (
                      <tr
                        key={
                          department.id
                        }
                        className="hover:bg-gray-50/80 transition"
                      >

                        {/* CODE */}

                        <td className="px-4 py-4">

                          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-medicore-700 bg-medicore-50 border border-medicore-100 px-2.5 py-1.5 rounded-lg">
                            <FiHash
                              size={11}
                            />

                            {department.code ||
                              "—"}
                          </span>

                        </td>


                        {/* DEPARTMENT */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medicore-100 to-medicore-50 text-medicore-700 flex items-center justify-center shrink-0">
                              <FiLayers
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-sm text-gray-800 truncate">
                                {department.name}
                              </p>

                              <p className="text-xs text-gray-400 mt-1 truncate max-w-[220px]">
                                {department.description ||
                                  "No description"}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* BRANCH */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <FiMapPin
                              className="text-gray-400"
                              size={14}
                            />

                            <span className="text-sm text-gray-600">
                              {department.branch_name ||
                                `Branch #${department.branch}`}
                            </span>

                          </div>

                        </td>


                        {/* HOSPITAL */}

                        <td className="px-4 py-4">

                          <span className="text-sm text-gray-600">
                            {department.hospital_name ||
                              "—"}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold ${getStatusClass(
                              department.status
                            )}`}
                          >

                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                active
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />

                            {department.status ||
                              "INACTIVE"}

                          </span>

                        </td>


                        {/* CREATED */}

                        <td className="px-4 py-4">

                          <span className="text-xs text-gray-500">
                            {formatDate(
                              department.created_at
                            )}
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-4 py-4">

                          <div className="flex justify-end items-center gap-1.5">

                            {/* VIEW */}

                            <button
                              onClick={() =>
                                openView(
                                  department
                                )
                              }
                              className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                              title="View"
                            >
                              <FiEye
                                size={15}
                              />
                            </button>


                            {/* EDIT */}

                            <button
                              onClick={() =>
                                openEdit(
                                  department
                                )
                              }
                              className="w-9 h-9 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
                              title="Edit"
                            >
                              <FiEdit2
                                size={15}
                              />
                            </button>


                            {/* ACTIVATE */}

                            <button
                              onClick={() =>
                                activateDepartment(
                                  department
                                )
                              }
                              disabled={
                                active ||
                                actionLoading
                              }
                              className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Activate"
                            >
                              <FiCheckCircle
                                size={15}
                              />
                            </button>


                            {/* DEACTIVATE */}

                            <button
                              onClick={() =>
                                deactivateDepartment(
                                  department
                                )
                              }
                              disabled={
                                !active ||
                                actionLoading
                              }
                              className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Deactivate"
                            >
                              <FiPower
                                size={15}
                              />
                            </button>


                            {/* DELETE */}

                            <button
                              onClick={() =>
                                handleDelete(
                                  department
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition disabled:opacity-30"
                              title="Delete"
                            >
                              <FiTrash2
                                size={15}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

            </tbody>

          </table>

        </div>


        {/* PAGINATION */}

        {!loading &&
          totalDepartments > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-100">

              <p className="text-xs text-gray-500">
                Page{" "}
                <span className="font-semibold text-gray-700">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {totalPages}
                </span>
              </p>


              <div className="flex items-center gap-1">

                {/* PREVIOUS */}

                <button
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        page - 1
                    )
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft
                    size={16}
                  />
                </button>


                {/* NUMBERED PAGES */}

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition ${
                      currentPage === page
                        ? "bg-medicore-600 text-white shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>

                ))}


                {/* NEXT */}

                <button
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        page + 1
                    )
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronRight
                    size={16}
                  />
                </button>

              </div>

            </div>
          )}

      </div>


      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <DepartmentModal
          form={form}
          editingId={editingId}
          saving={saving}
          branches={branches}
          onSubmit={handleSubmit}
          onClose={closeModal}
          onChange={handleInputChange}
        />
      )}

    </div>
  );
}


/* =========================================================
   DEPARTMENT MODAL
   ========================================================= */

function DepartmentModal({
  form,
  editingId,
  saving,
  branches,
  onSubmit,
  onClose,
  onChange,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden">

        {/* MODAL HEADER */}

        <div className="relative bg-gradient-to-r from-slate-900 to-medicore-900 text-white px-6 py-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <FiLayers
                  size={21}
                />
              </div>

              <div>

                <h3 className="text-lg font-bold">
                  {editingId
                    ? "Edit Department"
                    : "Create New Department"}
                </h3>

                <p className="text-xs text-slate-300 mt-1">
                  {editingId
                    ? "Update department information"
                    : "Add a new department to your branch"}
                </p>

              </div>

            </div>


            <button
              onClick={onClose}
              disabled={saving}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition disabled:opacity-50"
            >
              <FiX
                size={19}
              />
            </button>

          </div>

        </div>


        {/* FORM */}

        <form
          onSubmit={onSubmit}
          className="p-6 overflow-y-auto max-h-[calc(92vh-90px)]"
        >

          {/* BASIC INFORMATION */}

          <div className="mb-6">

            <div className="flex items-center gap-2 mb-4">

              <div className="w-7 h-7 rounded-lg bg-medicore-50 text-medicore-600 flex items-center justify-center">
                <FiFileText
                  size={14}
                />
              </div>

              <div>

                <h4 className="text-sm font-bold text-gray-800">
                  Basic Information
                </h4>

                <p className="text-[11px] text-gray-400">
                  Department identity and branch assignment
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* BRANCH */}

              <div className="md:col-span-2">

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Branch *
                </label>

                <select
                  required
                  name="branch"
                  value={form.branch}
                  onChange={onChange}
                  className="input-field text-sm"
                >

                  <option value="">
                    Select Branch
                  </option>

                  {branches.map(
                    (branch) => (
                      <option
                        key={branch.id}
                        value={branch.id}
                      >
                        {branch.name}

                        {branch.hospital_name
                          ? ` — ${branch.hospital_name}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* DEPARTMENT NAME */}

              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Department Name *
                </label>

                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="input-field text-sm"
                  placeholder="Cardiology"
                />

              </div>


              {/* CODE */}

              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Department Code *
                </label>

                <input
                  required
                  name="code"
                  value={form.code}
                  onChange={onChange}
                  className="input-field text-sm uppercase"
                  placeholder="CARD"
                />

              </div>


              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Description
                </label>

                <textarea
                  name="description"
                  rows="4"
                  value={
                    form.description
                  }
                  onChange={onChange}
                  className="input-field text-sm resize-none"
                  placeholder="Enter department description, services, specialty, etc..."
                />

              </div>

            </div>

          </div>


          {/* STATUS */}

          <div className="border-t border-gray-100 pt-5 mb-6">

            <div className="flex items-center gap-2 mb-4">

              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiActivity
                  size={14}
                />
              </div>

              <div>

                <h4 className="text-sm font-bold text-gray-800">
                  Department Status
                </h4>

                <p className="text-[11px] text-gray-400">
                  Control department availability
                </p>

              </div>

            </div>


            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="input-field text-sm"
            >

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              {/* Future backend status */}

              <option value="PENDING">
                Pending
              </option>

            </select>

          </div>


          {/* =================================================
              FUTURE DEPARTMENT INFORMATION
              =================================================

              Add after backend serializer/model support:

              - Department Head
              - Department Email
              - Department Phone
              - Floor
              - Room Number
              - Extension
              - Working Hours
              - Emergency Availability
              - Department Logo
              - Additional Notes
              - Department Documents
          */}

          {/*
            TODO:

            <input
              name="email"
              placeholder="department@hospital.com"
            />

            <input
              name="phone"
              placeholder="+91 XXXXX XXXXX"
            />

            <input
              name="floor"
              placeholder="2nd Floor"
            />

            <input
              name="roomNumber"
              placeholder="Room 204"
            />

            <input
              name="extension"
              placeholder="EXT-204"
            />

            <input
              type="file"
              name="logo"
            />
          */}


          {/* =================================================
              FUTURE LOCATION DETAILS
              =================================================

              - Building
              - Floor
              - Room Number
              - Block
              - Landmark
              - Internal Extension
              - Department Map Location
          */}


          {/* FORM FOOTER */}

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              type="submit"
              className="btn-primary min-w-[170px]"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Department"
                : "Create Department"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

