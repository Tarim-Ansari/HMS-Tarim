import React, { useState, useEffect, useMemo } from "react";
import {
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiUser,
  FiAlertCircle,
  FiX,
  FiCheckSquare,
  FiSquare,
  FiHeart,
  FiDroplet,
  FiCalendar,
  FiLogOut,
  FiEye,
  FiShield,
  FiInfo,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import PatientDetailModal from "../../components/patients/PatientDetailModal";
import {
  bedApi,
  ipdApi,
  admissionApi,
  vitalsApi,
  nurseTaskApi,
  patientApi,
} from "../../api/service";

const STATUS_CONFIG = {
  AVAILABLE: {
    label: "Available",
    badge: "bg-green-100 text-green-800 border-green-200",
    border: "border-green-300",
    bg: "bg-green-50/50",
    dot: "bg-green-500",
  },
  OCCUPIED: {
    label: "Occupied",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    border: "border-rose-300",
    bg: "bg-rose-50/50",
    dot: "bg-rose-500",
  },
  CLEANING: {
    label: "Cleaning",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    border: "border-amber-300",
    bg: "bg-amber-50/50",
    dot: "bg-amber-500",
  },
  MAINTENANCE: {
    label: "Maintenance",
    badge: "bg-gray-100 text-gray-800 border-gray-200",
    border: "border-gray-300",
    bg: "bg-gray-50/50",
    dot: "bg-gray-500",
  },
};

const PRIORITY_BADGES = {
  URGENT: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-amber-100 text-amber-700 border-amber-200",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
  LOW: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function IPD() {
  const { role, user } = useSelector((state) => state.auth);

  // Active tab: 'beds' | 'vitals' | 'tasks' | 'admissions'
  const [activeTab, setActiveTab] = useState("beds");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [beds, setBeds] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);

  // Filtering & search
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState("ALL"); // ALL | PENDING | COMPLETED

  // Modals
  const [assignBedModal, setAssignBedModal] = useState(null); // bed object
  const [dischargeBedModal, setDischargeBedModal] = useState(null); // bed object
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedPatientForModal, setSelectedPatientForModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [assignForm, setAssignForm] = useState({
    patient: "",
    diagnosis: "",
    notes: "",
  });

  const [vitalForm, setVitalForm] = useState({
    patient: "",
    blood_pressure: "120/80",
    heart_rate: "74",
    temperature: "98.6",
    oxygen_saturation: "98",
    respiratory_rate: "18",
    blood_glucose: "105",
    weight: "70",
    height: "172",
    notes: "Nurse inpatient routine vitals observation",
  });

  const [taskForm, setTaskForm] = useState({
    patient: "",
    task_name: "",
    description: "",
    ward: "ICU",
    bed_number: "",
    scheduled_time: "",
    priority: "HIGH",
  });

  // Load all IPD data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [bedsRes, occRes, vitalsRes, tasksRes, admRes, patRes] =
        await Promise.allSettled([
          bedApi.list(),
          bedApi.occupancy(),
          vitalsApi.list(),
          nurseTaskApi.list(),
          admissionApi.list(),
          patientApi.list(),
        ]);

      const normalize = (res) =>
        res.status === "fulfilled"
          ? Array.isArray(res.value?.data)
            ? res.value.data
            : Array.isArray(res.value?.data?.results)
            ? res.value.data.results
            : Array.isArray(res.value?.results)
            ? res.value.results
            : Array.isArray(res.value)
            ? res.value
            : []
          : [];

      setBeds(normalize(bedsRes));
      if (occRes.status === "fulfilled") {
        setOccupancy(occRes.value?.data || occRes.value || null);
      }
      setVitals(normalize(vitalsRes));
      setTasks(normalize(tasksRes));
      setAdmissions(normalize(admRes));
      setPatients(normalize(patRes));
    } catch (err) {
      toast.error("Failed to load IPD data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered beds
  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchesWard =
        selectedWard === "ALL" ||
        String(b.ward).toUpperCase() === selectedWard.toUpperCase();
      const matchesStatus =
        selectedStatus === "ALL" ||
        String(b.status).toUpperCase() === selectedStatus.toUpperCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        String(b.bed_number).toLowerCase().includes(query) ||
        String(b.ward).toLowerCase().includes(query) ||
        String(b.patient_name || "").toLowerCase().includes(query);

      return matchesWard && matchesStatus && matchesSearch;
    });
  }, [beds, selectedWard, selectedStatus, searchQuery]);

  // Unique wards for filter
  const wardsList = useMemo(() => {
    const set = new Set(beds.map((b) => b.ward).filter(Boolean));
    return Array.from(set);
  }, [beds]);

  // Handle Assign Bed
  const handleAssignBed = async (e) => {
    e.preventDefault();
    if (!assignBedModal || !assignForm.patient) {
      toast.error("Please select a patient to assign");
      return;
    }

    setActionLoading(true);
    try {
      await bedApi.assign(assignBedModal.id, {
        patient: assignForm.patient,
        diagnosis: assignForm.diagnosis,
        notes: assignForm.notes,
      });
      toast.success(
        `Bed ${assignBedModal.bed_number} assigned successfully!`
      );
      setAssignBedModal(null);
      setAssignForm({ patient: "", diagnosis: "", notes: "" });
      await loadData(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to assign bed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Discharge Bed
  const handleDischargeBed = async () => {
    if (!dischargeBedModal) return;

    setActionLoading(true);
    try {
      await bedApi.discharge(dischargeBedModal.id);
      toast.success(
        `Patient discharged from Bed ${dischargeBedModal.bed_number}. Bed is now marked for cleaning.`
      );
      setDischargeBedModal(null);
      await loadData(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to discharge patient"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Mark Available from Cleaning
  const handleMarkAvailable = async (bed) => {
    try {
      await bedApi.update(bed.id, { status: "AVAILABLE" });
      toast.success(`Bed ${bed.bed_number} marked as Available.`);
      await loadData(true);
    } catch (err) {
      toast.error("Failed to update bed status");
    }
  };

  // Handle Record Vital
  const handleCreateVital = async (e) => {
    e.preventDefault();
    if (!vitalForm.patient) {
      toast.error("Please select a patient");
      return;
    }

    setActionLoading(true);
    try {
      await vitalsApi.create(vitalForm);
      toast.success("Vitals logged successfully!");
      setShowVitalModal(false);
      setVitalForm({
        patient: "",
        blood_pressure: "120/80",
        heart_rate: "74",
        temperature: "98.6",
        oxygen_saturation: "98",
        respiratory_rate: "18",
        blood_glucose: "105",
        weight: "70",
        height: "172",
        notes: "Nurse inpatient routine vitals observation",
      });
      await loadData(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to record vitals"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Nurse Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.task_name) {
      toast.error("Please provide a task name");
      return;
    }

    setActionLoading(true);
    try {
      await nurseTaskApi.create(taskForm);
      toast.success("Nursing task created successfully!");
      setShowTaskModal(false);
      setTaskForm({
        patient: "",
        task_name: "",
        description: "",
        ward: "ICU",
        bed_number: "",
        scheduled_time: "",
        priority: "HIGH",
      });
      await loadData(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to create task"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Task Status
  const handleToggleTask = async (taskId) => {
    try {
      await nurseTaskApi.toggle(taskId);
      toast.success("Task status updated");
      await loadData(true);
    } catch (err) {
      toast.error("Failed to update task status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Inpatient (IPD) & Nursing Management"
        subtitle="Live ward occupancy, bed allocation & release, patient vitals monitoring, and nursing shift tasks."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
              title="Refresh live data"
            >
              <FiRefreshCw
                size={14}
                className={refreshing ? "animate-spin text-medicore-600" : ""}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowVitalModal(true)}
              className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3 text-medicore-700 bg-medicore-50 hover:bg-medicore-100 border-medicore-200"
            >
              <FiActivity size={14} />
              <span>+ Record Vitals</span>
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
            >
              <FiCheckSquare size={14} />
              <span>+ Shift Task</span>
            </button>
            <button
              onClick={() => {
                const availableBed = beds.find((b) => b.status === "AVAILABLE");
                if (availableBed) {
                  setAssignBedModal(availableBed);
                } else {
                  toast.error("No beds currently available. Please check occupancy.");
                }
              }}
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
            >
              <FiPlus size={14} />
              <span>Admit Patient</span>
            </button>
          </div>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card p-4 border-l-4 border-medicore-500 bg-gradient-to-br from-white to-medicore-50/30">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Beds
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-gray-900">
              {occupancy?.total_beds ?? beds.length}
            </span>
            <span className="text-xs text-medicore-600 font-medium">100%</span>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-rose-500 bg-gradient-to-br from-white to-rose-50/30">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Occupied
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-rose-600">
              {occupancy?.occupied_beds ??
                beds.filter((b) => b.status === "OCCUPIED").length}
            </span>
            <span className="text-xs text-rose-700 font-medium">Inpatients</span>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-green-500 bg-gradient-to-br from-white to-green-50/30">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Available
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-green-600">
              {occupancy?.available_beds ??
                beds.filter((b) => b.status === "AVAILABLE").length}
            </span>
            <span className="text-xs text-green-700 font-medium">Ready</span>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-amber-500 bg-gradient-to-br from-white to-amber-50/30">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sanitizing
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600">
              {occupancy?.cleaning_beds ??
                beds.filter((b) => b.status === "CLEANING").length}
            </span>
            <span className="text-xs text-amber-700 font-medium">Cleaning</span>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-blue-500 bg-gradient-to-br from-white to-blue-50/30">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Occupancy Rate
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-blue-600">
              {occupancy?.occupancy_rate ?? 0}%
            </span>
            <span className="text-xs text-blue-700 font-medium">Capacity</span>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-indigo-500 bg-gradient-to-br from-white to-indigo-50/30">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Shift Tasks
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-indigo-600">
              {tasks.filter((t) => t.status === "PENDING").length}
            </span>
            <span className="text-xs text-indigo-700 font-medium">Pending</span>
          </div>
        </div>
      </div>

      {/* Ward Breakdown Cards */}
      {occupancy?.ward_breakdown && occupancy.ward_breakdown.length > 0 && (
        <div className="card p-5 bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <FiLayers className="text-medicore-600" />
              <span>Ward-by-Ward Occupancy Distribution</span>
            </h3>
            <span className="text-xs text-gray-500">
              {occupancy.ward_breakdown.length} Dedicated Hospital Wards
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {occupancy.ward_breakdown.map((w) => {
              const pct = w.total > 0 ? Math.round((w.occupied / w.total) * 100) : 0;
              return (
                <div
                  key={w.ward}
                  onClick={() =>
                    setSelectedWard(
                      selectedWard === w.ward ? "ALL" : w.ward
                    )
                  }
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedWard === w.ward
                      ? "border-medicore-500 ring-2 ring-medicore-200 bg-medicore-50/40"
                      : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-800">
                      {w.ward}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        pct > 80
                          ? "bg-rose-100 text-rose-700"
                          : pct > 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        pct > 80
                          ? "bg-rose-500"
                          : pct > 50
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                    <span>
                      {w.occupied}/{w.total} beds
                    </span>
                    <span className="text-green-600 font-medium">
                      {w.available} free
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab("beds")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "beds"
              ? "border-medicore-600 text-medicore-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <FiLayers size={16} />
          <span>Interactive Bed Grid & Allocation ({beds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("vitals")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "vitals"
              ? "border-medicore-600 text-medicore-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <FiActivity size={16} />
          <span>Patient Vitals Tracking ({vitals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "tasks"
              ? "border-medicore-600 text-medicore-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <FiCheckSquare size={16} />
          <span>Nursing Shift Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("admissions")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "admissions"
              ? "border-medicore-600 text-medicore-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <FiUser size={16} />
          <span>Current Admissions ({admissions.length})</span>
        </button>
      </div>

      {/* TAB 1: BEDS & OCCUPANCY GRID */}
      {activeTab === "beds" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="card p-3 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-full sm:w-64">
                <FiSearch className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bed # or patient..."
                  className="bg-transparent text-xs ml-2 outline-none w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <FiX size={14} className="text-gray-400" />
                  </button>
                )}
              </div>

              {/* Ward Filter */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="font-medium">Ward:</span>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="bg-gray-100 border-none rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-800 outline-none"
                >
                  <option value="ALL">All Wards</option>
                  {wardsList.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-gray-100 border-none rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-800 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="text-gray-900 font-bold">{filteredBeds.length}</span> of{" "}
              {beds.length} beds
            </div>
          </div>

          {/* Visual Bed Grid */}
          {loading ? (
            <div className="card p-12 text-center text-gray-400">
              <FiRefreshCw className="animate-spin mx-auto text-medicore-600 mb-2" size={24} />
              <p>Loading bed status & allocation...</p>
            </div>
          ) : filteredBeds.length === 0 ? (
            <div className="card p-12 text-center text-gray-500">
              <FiLayers className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="font-semibold">No beds found matching filters.</p>
              <button
                onClick={() => {
                  setSelectedWard("ALL");
                  setSelectedStatus("ALL");
                  setSearchQuery("");
                }}
                className="btn-secondary text-xs mt-3"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredBeds.map((bed) => {
                const cfg =
                  STATUS_CONFIG[bed.status] || STATUS_CONFIG.AVAILABLE;
                const isOccupied = bed.status === "OCCUPIED";
                const isAvailable = bed.status === "AVAILABLE";
                const isCleaning = bed.status === "CLEANING";

                return (
                  <div
                    key={bed.id}
                    className={`card p-4 border rounded-xl transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${cfg.border} ${cfg.bg}`}
                  >
                    <div>
                      {/* Bed Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`}
                            />
                            <h4 className="font-bold text-gray-900 text-base">
                              {bed.bed_number}
                            </h4>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {bed.ward} • Floor {bed.floor || "1"}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      {/* Type & Rate */}
                      <div className="mt-3 text-xs text-gray-600 flex justify-between border-t border-gray-100 pt-2">
                        <span className="capitalize text-gray-500">
                          {String(bed.bed_type || "Standard").toLowerCase()}
                        </span>
                        <span className="font-semibold text-gray-700">
                          ₹{Number(bed.daily_rate || 0).toLocaleString()}/day
                        </span>
                      </div>

                      {/* Patient Info if Occupied */}
                      {isOccupied && (
                        <div className="mt-3 p-2.5 rounded-lg bg-white border border-rose-100 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">
                              Inpatient
                            </span>
                            {bed.current_admission && (
                              <span className="text-[10px] font-mono text-gray-400">
                                ADM-{bed.current_admission}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-900 mt-1 truncate">
                            {bed.patient_name || "Admitted Patient"}
                          </p>
                        </div>
                      )}

                      {isCleaning && (
                        <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                          <p className="text-[11px] text-amber-700 font-medium">
                            Disinfected & sanitization in progress
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bed Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center gap-1.5">
                      {isAvailable && (
                        <button
                          onClick={() => setAssignBedModal(bed)}
                          className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-2xs flex items-center justify-center gap-1"
                        >
                          <FiPlus size={13} />
                          <span>Assign Patient</span>
                        </button>
                      )}

                      {isOccupied && (
                        <div className="w-full flex gap-1.5">
                          <button
                            onClick={() => {
                              // Open patient detail modal
                              const targetPatient = patients.find(
                                (p) =>
                                  p.id === bed.current_patient ||
                                  p.patient_id === bed.current_patient
                              ) || {
                                id: bed.current_patient,
                                full_name: bed.patient_name,
                              };
                              setSelectedPatientForModal(targetPatient);
                            }}
                            className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors shadow-2xs flex items-center justify-center gap-1"
                            title="View Patient Chart"
                          >
                            <FiEye size={13} />
                            <span>Chart</span>
                          </button>
                          <button
                            onClick={() => setDischargeBedModal(bed)}
                            className="py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1"
                            title="Discharge Patient"
                          >
                            <FiLogOut size={13} />
                            <span>Discharge</span>
                          </button>
                        </div>
                      )}

                      {isCleaning && (
                        <button
                          onClick={() => handleMarkAvailable(bed)}
                          className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs flex items-center justify-center gap-1"
                        >
                          <FiCheck size={13} />
                          <span>Mark Available</span>
                        </button>
                      )}

                      {bed.status === "MAINTENANCE" && (
                        <button
                          onClick={() => handleMarkAvailable(bed)}
                          className="w-full py-1.5 px-3 text-xs font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                          Restore Bed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PATIENT VITALS TRACKING */}
      {activeTab === "vitals" && (
        <div className="space-y-4">
          <div className="card overflow-x-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Clinical Inpatient Vitals Log
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time physiological parameters recorded by nursing staff
                </p>
              </div>
              <button
                onClick={() => setShowVitalModal(true)}
                className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
              >
                <FiPlus size={13} />
                <span>Record Vitals</span>
              </button>
            </div>

            {vitals.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No vitals logged yet. Click "Record Vitals" to add the first entry.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="table-header border-b border-gray-100">
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">BP (mmHg)</th>
                    <th className="px-4 py-3">Pulse (bpm)</th>
                    <th className="px-4 py-3">Temp (°F)</th>
                    <th className="px-4 py-3">SpO2 (%)</th>
                    <th className="px-4 py-3">Resp Rate</th>
                    <th className="px-4 py-3">Blood Sugar</th>
                    <th className="px-4 py-3">Recorded By</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Chart</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vitals.map((v) => {
                    const isSpO2Low = Number(v.oxygen_saturation || 100) < 95;
                    const isHrAbnormal =
                      Number(v.heart_rate || 75) > 100 ||
                      Number(v.heart_rate || 75) < 55;

                    return (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {v.patient_name || `Patient #${v.patient}`}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-gray-700">
                          {v.blood_pressure || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              isHrAbnormal ? "text-amber-600" : "text-gray-800"
                            }`}
                          >
                            {v.heart_rate || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {v.temperature ? `${v.temperature}°F` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full ${
                              isSpO2Low
                                ? "bg-rose-100 text-rose-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {v.oxygen_saturation ? `${v.oxygen_saturation}%` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {v.respiratory_rate ? `${v.respiratory_rate}/min` : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {v.blood_glucose ? `${v.blood_glucose} mg/dL` : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {v.recorded_by_name || "Nurse Staff"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {v.recorded_at
                            ? new Date(v.recorded_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              const targetPatient = patients.find(
                                (p) => p.id === v.patient || p.patient_id === v.patient
                              ) || {
                                id: v.patient,
                                full_name: v.patient_name,
                              };
                              setSelectedPatientForModal(targetPatient);
                            }}
                            className="p-1 rounded text-medicore-600 hover:bg-medicore-50"
                            title="View Chart"
                          >
                            <FiEye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NURSING SHIFT TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Nursing Shift Care Plan & Task Checklist
                </h3>
                <p className="text-xs text-gray-500">
                  Active medication schedules, rounds, vitals assessments, and post-op care
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
                  {["ALL", "PENDING", "COMPLETED"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        taskFilter === f
                          ? "bg-white text-gray-900 shadow-2xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="btn-primary text-xs flex items-center gap-1 py-1.5 px-3"
                >
                  <FiPlus size={13} />
                  <span>+ New Task</span>
                </button>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No shift tasks assigned yet. Click "+ New Task" to schedule nursing care.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tasks
                  .filter((t) => {
                    if (taskFilter === "PENDING") return t.status !== "COMPLETED";
                    if (taskFilter === "COMPLETED") return t.status === "COMPLETED";
                    return true;
                  })
                  .map((task) => {
                    const isCompleted = task.status === "COMPLETED";
                    const pBadge =
                      PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;

                    return (
                      <div
                        key={task.id}
                        className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                          isCompleted ? "bg-gray-50/50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="mt-0.5 text-medicore-600 hover:text-medicore-700 cursor-pointer"
                            title={isCompleted ? "Mark Pending" : "Mark Completed"}
                          >
                            {isCompleted ? (
                              <FiCheckSquare size={18} className="text-green-600" />
                            ) : (
                              <FiSquare size={18} className="text-gray-400" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-sm font-semibold ${
                                  isCompleted
                                    ? "line-through text-gray-400"
                                    : "text-gray-900"
                                }`}
                              >
                                {task.task_name}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pBadge}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
                              {task.patient_name && (
                                <span className="font-medium text-gray-600 flex items-center gap-1">
                                  <FiUser size={12} />
                                  {task.patient_name}
                                </span>
                              )}
                              {(task.ward || task.bed_number) && (
                                <span className="flex items-center gap-1">
                                  <FiLayers size={12} />
                                  {task.ward} {task.bed_number ? `• Bed ${task.bed_number}` : ""}
                                </span>
                              )}
                              {task.scheduled_time && (
                                <span className="flex items-center gap-1">
                                  <FiClock size={12} />
                                  {new Date(task.scheduled_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              isCompleted
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CURRENT INPATIENT ADMISSIONS */}
      {activeTab === "admissions" && (
        <div className="card overflow-x-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Active Inpatient Admissions Log
              </h3>
              <p className="text-xs text-gray-500">
                Official hospital admission registers and clinical tracking
              </p>
            </div>
            <button
              onClick={() => {
                const availableBed = beds.find((b) => b.status === "AVAILABLE");
                if (availableBed) {
                  setAssignBedModal(availableBed);
                } else {
                  toast.error("No beds currently available");
                }
              }}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <FiPlus size={13} />
              <span>Admit Patient</span>
            </button>
          </div>

          {admissions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No active inpatient admissions found.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="table-header border-b border-gray-100">
                  <th className="px-4 py-3">Admission ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Ward / Bed</th>
                  <th className="px-4 py-3">Admitted Date</th>
                  <th className="px-4 py-3">Diagnosis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-medicore-600">
                      ADM-{adm.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {adm.patient_name || `Patient #${adm.patient}`}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {adm.ward || "Ward"} • Bed {adm.bed_number || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {adm.admission_date
                        ? new Date(adm.admission_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                      {adm.diagnosis || "Under Observation"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          adm.status === "ADMITTED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const targetPatient = patients.find(
                              (p) =>
                                p.id === adm.patient ||
                                p.patient_id === adm.patient
                            ) || {
                              id: adm.patient,
                              full_name: adm.patient_name,
                            };
                            setSelectedPatientForModal(targetPatient);
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-medicore-50 text-medicore-700 hover:bg-medicore-100"
                        >
                          View Chart
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL 1: ASSIGN BED / ADMIT PATIENT */}
      {assignBedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-medicore-50 to-white">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Assign Bed {assignBedModal.bed_number}
                </h3>
                <p className="text-xs text-gray-500">
                  {assignBedModal.ward} • Daily Rate: ₹
                  {Number(assignBedModal.daily_rate || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setAssignBedModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignBed} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Patient to Admit *
                </label>
                <select
                  required
                  value={assignForm.patient}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, patient: e.target.value })
                  }
                  className="input-field text-xs w-full"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => {
                    const name =
                      p.full_name ||
                      [p.first_name, p.last_name].filter(Boolean).join(" ") ||
                      p.patient_id;
                    return (
                      <option key={p.id || p.patient_id} value={p.id || p.patient_id}>
                        {name} ({p.patient_id || p.id}) - {p.gender || "Patient"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Primary Diagnosis / Reason *
                </label>
                <input
                  type="text"
                  required
                  value={assignForm.diagnosis}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      diagnosis: e.target.value,
                    })
                  }
                  placeholder="e.g. Acute Appendicitis, Post-Operative Care"
                  className="input-field text-xs w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admission Notes & Nursing Instructions
                </label>
                <textarea
                  rows={3}
                  value={assignForm.notes}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, notes: e.target.value })
                  }
                  placeholder="Any special nursing care notes, dietary restrictions, etc."
                  className="input-field text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAssignBedModal(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <FiRefreshCw size={13} className="animate-spin" />
                  ) : (
                    <FiCheck size={13} />
                  )}
                  <span>Confirm Bed Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISCHARGE BED CONFIRMATION */}
      {dischargeBedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-fade-in text-center">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <FiLogOut size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Confirm Inpatient Discharge?
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              You are about to discharge patient{" "}
              <strong className="text-gray-800">
                {dischargeBedModal.patient_name || "Admitted Patient"}
              </strong>{" "}
              from <strong className="text-gray-800">Bed {dischargeBedModal.bed_number}</strong> ({dischargeBedModal.ward}).
              The bed will be transitioned to Sanitation/Cleaning.
            </p>

            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDischargeBedModal(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDischargeBed}
                disabled={actionLoading}
                className="btn-danger text-xs flex items-center gap-1"
              >
                {actionLoading ? (
                  <FiRefreshCw size={13} className="animate-spin" />
                ) : (
                  <FiCheck size={13} />
                )}
                <span>Confirm Discharge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD PATIENT VITALS */}
      {showVitalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-medicore-50 to-white">
              <div className="flex items-center gap-2">
                <FiActivity className="text-medicore-600" size={18} />
                <h3 className="font-bold text-gray-900 text-base">
                  Record Inpatient Physiological Vitals
                </h3>
              </div>
              <button
                onClick={() => setShowVitalModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVital} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Patient *
                </label>
                <select
                  required
                  value={vitalForm.patient}
                  onChange={(e) =>
                    setVitalForm({ ...vitalForm, patient: e.target.value })
                  }
                  className="input-field text-xs w-full"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => {
                    const name =
                      p.full_name ||
                      [p.first_name, p.last_name].filter(Boolean).join(" ") ||
                      p.patient_id;
                    return (
                      <option key={p.id || p.patient_id} value={p.id || p.patient_id}>
                        {name} ({p.patient_id || p.id})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="text"
                    value={vitalForm.blood_pressure}
                    onChange={(e) =>
                      setVitalForm({
                        ...vitalForm,
                        blood_pressure: e.target.value,
                      })
                    }
                    placeholder="120/80"
                    className="input-field text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={vitalForm.heart_rate}
                    onChange={(e) =>
                      setVitalForm({
                        ...vitalForm,
                        heart_rate: e.target.value,
                      })
                    }
                    placeholder="72"
                    className="input-field text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Body Temperature (°F)
                  </label>
                  <input
                    type="text"
                    value={vitalForm.temperature}
                    onChange={(e) =>
                      setVitalForm({
                        ...vitalForm,
                        temperature: e.target.value,
                      })
                    }
                    placeholder="98.6"
                    className="input-field text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Oxygen Saturation / SpO2 (%)
                  </label>
                  <input
                    type="number"
                    value={vitalForm.oxygen_saturation}
                    onChange={(e) =>
                      setVitalForm({
                        ...vitalForm,
                        oxygen_saturation: e.target.value,
                      })
                    }
                    placeholder="98"
                    className="input-field text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Respiratory Rate (/min)
                  </label>
                  <input
                    type="number"
                    value={vitalForm.respiratory_rate}
                    onChange={(e) =>
                      setVitalForm({
                        ...vitalForm,
                        respiratory_rate: e.target.value,
                      })
                    }
                    placeholder="18"
                    className="input-field text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Blood Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={vitalForm.blood_glucose}
                    onChange={(e) =>
                      setVitalForm({
                        ...vitalForm,
                        blood_glucose: e.target.value,
                      })
                    }
                    placeholder="100"
                    className="input-field text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nurse Clinical Observation Notes
                </label>
                <textarea
                  rows={2}
                  value={vitalForm.notes}
                  onChange={(e) =>
                    setVitalForm({ ...vitalForm, notes: e.target.value })
                  }
                  placeholder="Patient conscious, oriented, no acute distress."
                  className="input-field text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowVitalModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <FiRefreshCw size={13} className="animate-spin" />
                  ) : (
                    <FiCheck size={13} />
                  )}
                  <span>Save Vitals Reading</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW NURSING SHIFT TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-2">
                <FiCheckSquare className="text-indigo-600" size={18} />
                <h3 className="font-bold text-gray-900 text-base">
                  Schedule Nursing Care Shift Task
                </h3>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Task Name / Action *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.task_name}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, task_name: e.target.value })
                  }
                  placeholder="e.g. Administer IV Antibiotic, Wound Dressing"
                  className="input-field text-xs w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Associated Patient (Optional)
                </label>
                <select
                  value={taskForm.patient}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, patient: e.target.value })
                  }
                  className="input-field text-xs w-full"
                >
                  <option value="">-- No specific patient / General Ward task --</option>
                  {patients.map((p) => {
                    const name =
                      p.full_name ||
                      [p.first_name, p.last_name].filter(Boolean).join(" ") ||
                      p.patient_id;
                    return (
                      <option key={p.id || p.patient_id} value={p.id || p.patient_id}>
                        {name} ({p.patient_id || p.id})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ward
                  </label>
                  <select
                    value={taskForm.ward}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, ward: e.target.value })
                    }
                    className="input-field text-xs w-full"
                  >
                    {wardsList.length > 0 ? (
                      wardsList.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="ICU">ICU</option>
                        <option value="General Ward">General Ward</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Private">Private</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bed Number
                  </label>
                  <input
                    type="text"
                    value={taskForm.bed_number}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, bed_number: e.target.value })
                    }
                    placeholder="e.g. ICU-01"
                    className="input-field text-xs w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                    className="input-field text-xs w-full"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    value={taskForm.scheduled_time}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        scheduled_time: e.target.value,
                      })
                    }
                    className="input-field text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Care Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  placeholder="Verify allergy chart before administering dose."
                  className="input-field text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <FiRefreshCw size={13} className="animate-spin" />
                  ) : (
                    <FiCheck size={13} />
                  )}
                  <span>Create Shift Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PATIENT DETAIL MODAL INTEGRATION */}
      {selectedPatientForModal && (
        <PatientDetailModal
          patient={selectedPatientForModal}
          isOpen={Boolean(selectedPatientForModal)}
          onClose={() => setSelectedPatientForModal(null)}
          onPatientUpdated={() => loadData(true)}
        />
      )}
    </div>
  );
}
