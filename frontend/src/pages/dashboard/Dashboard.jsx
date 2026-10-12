
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";

import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiLayers,
  FiHeart,
  FiAlertTriangle,
  FiDroplet,
  FiShoppingCart,
  FiTrendingUp,
  FiArrowRight,
  FiFileText,
  FiClock,
  FiHome,
  FiActivity,
  FiUserCheck,
  FiUserPlus,
  FiRefreshCw,
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiDownload,
  FiX,
  FiCheckSquare,
  FiSquare,
  FiCheck,
  FiEye,
  FiPlus,
  FiLogOut,
} from "react-icons/fi";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import PatientDetailModal from "../../components/patients/PatientDetailModal";

import {
  dashboardApi,
  patientApi,
  appointmentApi,
  prescriptionApi,
  emrApi,
  bedApi,
  nurseTaskApi,
  vitalsApi,
} from "../../api/service";

import {
  statsData,
  appointments,
  revenueData,
  patientFlowData,
  bedOccupancy,
  departments,
} from "../../utils/mockData";


// =========================================================
// COLORS
// =========================================================

const COLORS = [
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];


// =========================================================
// HELPERS
// =========================================================

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  return [];
};


const getItemName = (item) =>
  item?.name ||
  item?.full_name ||
  item?.patient_name ||
  item?.hospital_name ||
  item?.branch_name ||
  item?.username ||
  item?.email ||
  "N/A";


const getItemDate = (item) =>
  item?.created_at ||
  item?.createdAt ||
  item?.date_joined ||
  item?.registration_date ||
  item?.date ||
  item?.created ||
  null;


// =========================================================
// TEMPORARY DATA
// =========================================================
//
// Appointment / Doctor / Nurse / Billing APIs is pending
//aftar createing the APIs, we can remove this mock data and use live data from backend

// =========================================================

const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Dr. Amit Kumar",
    department: "Cardiology",
    status: "Active",
  },
  {
    id: 2,
    name: "Dr. Neha Verma",
    department: "Neurology",
    status: "Active",
  },
  {
    id: 3,
    name: "Dr. Raj Mehta",
    department: "Orthopedics",
    status: "Active",
  },
  {
    id: 4,
    name: "Dr. Sneha Sharma",
    department: "Pediatrics",
    status: "Active",
  },
  {
    id: 5,
    name: "Dr. Rahul Singh",
    department: "Dermatology",
    status: "Active",
  },
];


const MOCK_NURSES = [
  {
    id: 1,
    name: "Anjali Sharma",
    department: "Emergency",
    status: "Active",
  },
  {
    id: 2,
    name: "Pooja Singh",
    department: "ICU",
    status: "Active",
  },
  {
    id: 3,
    name: "Neha Gupta",
    department: "General Ward",
    status: "Active",
  },
  {
    id: 4,
    name: "Kiran Yadav",
    department: "OPD",
    status: "Active",
  },
];


const MOCK_RECEPTIONISTS = [
  {
    id: 1,
    name: "Riya Sharma",
    branch: "Main Branch",
    status: "Active",
  },
  {
    id: 2,
    name: "Komal Singh",
    branch: "City Branch",
    status: "Active",
  },
  {
    id: 3,
    name: "Priya Gupta",
    branch: "North Branch",
    status: "Active",
  },
];


// =========================================================
// DASHBOARD ROUTER
// =========================================================

export default function Dashboard() {
  const { role, user } = useSelector((state) => state.auth);
  const currentRole = String(role || "").trim().toLowerCase();

  if (currentRole === "doctor") {
    return <DoctorDashboard user={user} />;
  }

  if (currentRole === "patient") {
    return <PatientDashboard user={user} />;
  }

  if (currentRole === "receptionist") {
    return <ReceptionistDashboard user={user} />;
  }

  if (currentRole === "nurse") {
    return <NurseDashboard user={user} />;
  }

  if (currentRole === "lab_technician") {
    return <LabTechnicianDashboard user={user} />;
  }

  if (currentRole === "pharmacist") {
    return <PharmacistDashboard user={user} />;
  }

  if (currentRole === "accountant") {
    return <AccountantDashboard user={user} />;
  }

  return <AdminDashboard user={user} />;
}


// =========================================================
// ADMIN DASHBOARD
// =========================================================

function AdminDashboard({ user }) {

  const [branches, setBranches] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeCard, setActiveCard] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  // =======================================================
  // REAL API
  // =======================================================

  const loadDashboard = async (initial = false) => {

    try {

      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      /*
       * ==================================================
       * LIVE APIs
       * ==================================================
       *
       * Only these 3 APIs are currently connected.
       */

      const [
        branchResponse,
        hospitalResponse,
        patientResponse,
      ] = await Promise.all([
        dashboardApi.branches(),
        dashboardApi.hospitals(),
        dashboardApi.patients(),
      ]);

      setBranches(
        normalizeList(branchResponse)
      );

      setHospitals(
        normalizeList(hospitalResponse)
      );

      setPatients(
        normalizeList(patientResponse)
      );


      /*
       * ==================================================
       * APPOINTMENT API - DISABLED
       * ==================================================
       *
       * Backend API ready hone par:
       *
       * const response =
       *     await dashboardApi.appointments();
       *
       * ==================================================
       */


      /*
       * ==================================================
       * DOCTOR API - DISABLED
       * ==================================================
       *
       * const response =
       *     await dashboardApi.doctors();
       *
       * ==================================================
       */


      /*
       * ==================================================
       * NURSE API - DISABLED
       * ==================================================
       *
       * const response =
       *     await dashboardApi.nurses();
       *
       * ==================================================
       */


      /*
       * ==================================================
       * BILLING API - DISABLED
       * ==================================================
       *
       * const response =
       *     await dashboardApi.billing();
       *
       * ==================================================
       */

    } catch (error) {

      console.error(
        "Dashboard API Error:",
        error
      );

      toast.error(
        "Live dashboard data load nahi ho paya."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  useEffect(() => {

    loadDashboard(true);

    const interval = setInterval(() => {
      loadDashboard(false);
    }, 30000);

    return () => clearInterval(interval);

  }, []);


  // =======================================================
  // REAL PATIENT MONTHLY DATA
  // =======================================================

  const realPatientMonthlyData = useMemo(() => {

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months.map(
      (month, monthIndex) => {

        const count =
          patients.filter((patient) => {

            const date =
              getItemDate(patient);

            if (!date) {
              return false;
            }

            const parsed =
              new Date(date);

            return (
              parsed.getMonth() ===
              monthIndex
            );

          }).length;

        return {
          month,
          patients: count,
        };

      }
    );

  }, [patients]);


  // =======================================================
  // REAL ORGANIZATION DATA
  // =======================================================

  const organizationData = [
    {
      name: "Hospitals",
      value: hospitals.length,
    },
    {
      name: "Branches",
      value: branches.length,
    },
  ];


  // =======================================================
  // DAILY REVENUE
  // =======================================================

  /*
   * Billing API abhi disabled hai.
   *
   * Isliye existing mockData se revenue.
   *
   * API ready hone par yahan billing API ka
   * calculation laga dena.
   */

  const dailyRevenue =
    statsData.dailyRevenue;


  // =======================================================
  // DETAIL DATA
  // =======================================================

  const detailData = useMemo(() => {

    if (!activeCard) {
      return [];
    }

    let data = [];

    if (activeCard === "branches") {
      data = branches;
    }

    if (activeCard === "hospitals") {
      data = hospitals;
    }

    if (activeCard === "patients") {
      data = patients;
    }

    if (activeCard === "appointments") {
      data = appointments;
    }

    if (activeCard === "doctors") {
      data = MOCK_DOCTORS;
    }

    if (activeCard === "nurses") {
      data = MOCK_NURSES;
    }

    if (activeCard === "receptionists") {
      data = MOCK_RECEPTIONISTS;
    }

    return data.filter((item) => {

      const text =
        JSON.stringify(item)
          .toLowerCase();

      const matchesSearch =
        !search ||
        text.includes(
          search.toLowerCase()
        );

      const status =
        String(
          item?.status ||
          (item?.is_active
            ? "active"
            : "")
        ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      const itemDate =
        getItemDate(item)
          ?.slice?.(0, 10);

      const matchesFrom =
        !fromDate ||
        !itemDate ||
        itemDate >= fromDate;

      const matchesTo =
        !toDate ||
        !itemDate ||
        itemDate <= toDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );

    });

  }, [
    activeCard,
    branches,
    hospitals,
    patients,
    search,
    statusFilter,
    fromDate,
    toDate,
  ]);


  // =======================================================
  // EXPORT EXCEL
  // =======================================================

  const exportExcel = () => {

    if (!detailData.length) {
      toast.error(
        "Export ke liye data nahi hai."
      );

      return;
    }

    const worksheet =
      XLSX.utils.json_to_sheet(
        detailData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Data"
    );

    XLSX.writeFile(
      workbook,
      `${activeCard}-data.xlsx`
    );

    toast.success(
      "Excel exported successfully."
    );
  };


  // =======================================================
  // EXPORT PDF
  // =======================================================

  const exportPDF = () => {

    if (!detailData.length) {
      toast.error(
        "Export ke liye data nahi hai."
      );

      return;
    }

    const doc =
      new jsPDF();

    const rows =
      detailData.map(
        (item, index) => [
          index + 1,
          getItemName(item),
          item?.status ||
            (item?.is_active
              ? "Active"
              : "N/A"),
          getItemDate(item) ||
            "N/A",
        ]
      );

    doc.text(
      `${activeCard} Report`,
      14,
      15
    );

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "#",
          "Name",
          "Status",
          "Date",
        ],
      ],
      body: rows,
    });

    doc.save(
      `${activeCard}-report.pdf`
    );

    toast.success(
      "PDF exported successfully."
    );
  };


  // =======================================================
  // DETAIL SCREEN
  // =======================================================

  if (activeCard) {

    const titles = {
      branches: "Branch Details",
      hospitals: "Hospital Details",
      patients: "Patient Details",
      appointments:
        "Appointment Details",
      doctors: "Doctor Details",
      nurses: "Nurse Details",
      receptionists:
        "Receptionist Details",
    };

    return (
      <div>

        <PageHeader
          title={
            titles[activeCard]
          }
          subtitle="Search, filter and export records"
          action={
            <button
              onClick={() => {
                setActiveCard(null);
                setSearch("");
                setStatusFilter("all");
                setFromDate("");
                setToDate("");
              }}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm text-white"
            >
              <FiArrowLeft />
              Back
            </button>
          }
        />


        {/* FILTER */}

        <div className="card mb-6">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

            <div className="relative">

              <FiSearch
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search..."
                className="w-full rounded-xl border px-10 py-3 outline-none focus:border-blue-500"
              />

            </div>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-xl border px-3 py-3"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="pending">
                Pending
              </option>
            </select>


            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="rounded-xl border px-3 py-3"
            />


            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="rounded-xl border px-3 py-3"
            />


            <button
              onClick={() => {
                setSearch("");
                setStatusFilter(
                  "all"
                );
                setFromDate("");
                setToDate("");
              }}
              className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3"
            >
              <FiX />
              Clear
            </button>

          </div>


          <div className="mt-4 flex gap-3">

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white"
            >
              <FiDownload />
              Excel
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white"
            >
              <FiDownload />
              PDF
            </button>

            <span className="ml-auto flex items-center gap-2 text-sm text-gray-500">
              <FiFilter />
              {detailData.length} records
            </span>

          </div>

        </div>


        {/* TABLE */}

        <div className="card overflow-hidden">

          {detailData.length === 0 ? (

            <div className="flex min-h-[250px] flex-col items-center justify-center text-gray-400">

              <FiSearch size={40} />

              <p className="mt-3">
                No data found
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="table-header">

                    <th className="px-4 py-3">
                      #
                    </th>

                    <th className="px-4 py-3">
                      Name
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y">

                  {detailData.map(
                    (item, index) => (

                      <tr
                        key={
                          item?.id ||
                          index
                        }
                        className="hover:bg-gray-50"
                      >

                        <td className="px-4 py-3">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {getItemName(
                            item
                          )}
                        </td>

                        <td className="px-4 py-3">

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">

                            {item?.status ||
                              "Active"}

                          </span>

                        </td>

                        <td className="px-4 py-3 text-sm text-gray-500">

                          {getItemDate(
                            item
                          )
                            ? new Date(
                                getItemDate(
                                  item
                                )
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "N/A"}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    );
  }


  // =======================================================
  // MAIN ADMIN UI
  // =======================================================

  return (
    <div>

      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${
          user?.name ||
          user?.first_name ||
          "Admin"
        }. Here's what's happening at your hospital today.`}
        action={
          <button
            onClick={() =>
              loadDashboard(false)
            }
            className="btn-primary text-sm"
          >
            <span className="flex items-center gap-2">

              <FiRefreshCw
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </span>
          </button>
        }
      />


      {/* =================================================
          NEW 8 LIVE / MOCK CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">


        <DashboardCard
          title="Total Branch"
          value={
            loading
              ? "..."
              : branches.length
          }
          icon={<FiHome />}
          gradient="from-blue-600 to-cyan-500"
          onClick={() =>
            setActiveCard("branches")
          }
        />


        <DashboardCard
          title="Total Hospital"
          value={
            loading
              ? "..."
              : hospitals.length
          }
          icon={<FiActivity />}
          gradient="from-violet-600 to-purple-500"
          onClick={() =>
            setActiveCard("hospitals")
          }
        />


        <DashboardCard
          title="Total Patients"
          value={
            loading
              ? "..."
              : patients.length
          }
          icon={<FiUsers />}
          gradient="from-emerald-600 to-green-500"
          onClick={() =>
            setActiveCard("patients")
          }
        />


        <DashboardCard
          title="Total Appointments"
          value={
            appointments.length
          }
          icon={<FiCalendar />}
          gradient="from-orange-600 to-amber-500"
          mock
          onClick={() =>
            setActiveCard(
              "appointments"
            )
          }
        />


        <DashboardCard
          title="Total Doctors"
          value={
            MOCK_DOCTORS.length
          }
          icon={<FiUserCheck />}
          gradient="from-pink-600 to-rose-500"
          mock
          onClick={() =>
            setActiveCard("doctors")
          }
        />


        <DashboardCard
          title="Daily Revenue"
          value={`₹${(
            dailyRevenue / 1000
          ).toFixed(0)}K`}
          icon={<FiDollarSign />}
          gradient="from-indigo-600 to-blue-500"
          mock
        />


        <DashboardCard
          title="Total Nurses"
          value={
            MOCK_NURSES.length
          }
          icon={<FiUsers />}
          gradient="from-teal-600 to-cyan-500"
          mock
          onClick={() =>
            setActiveCard("nurses")
          }
        />


        <DashboardCard
          title="Total Receptionists"
          value={
            MOCK_RECEPTIONISTS.length
          }
          icon={<FiUserPlus />}
          gradient="from-fuchsia-600 to-pink-500"
          mock
          onClick={() =>
            setActiveCard(
              "receptionists"
            )
          }
        />

      </div>


      {/* =================================================
          ORIGINAL CHARTS
      ================================================= */}


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">


        {/* =================================================
            REVENUE CHART
            MOCK FOR NOW
        ================================================= */}

        <div className="lg:col-span-2 card">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h3 className="text-lg font-semibold text-gray-800">
                Revenue Overview
              </h3>

              <p className="text-sm text-gray-500">
                Monthly revenue vs expenses
              </p>

            </div>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
              Billing API Pending
            </span>

          </div>


          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <AreaChart
              data={revenueData}
            >

              <defs>

                <linearGradient
                  id="dashboardRevenue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="5%"
                    stopColor="#0ea5e9"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="95%"
                    stopColor="#0ea5e9"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>


              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="month"
              />

              <YAxis
                tickFormatter={(v) =>
                  `${(
                    v / 100000
                  ).toFixed(0)}L`
                }
              />

              <Tooltip
                formatter={(v) =>
                  `₹${(
                    v / 100000
                  ).toFixed(1)}L`
                }
              />

              <Legend />


              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                fill="url(#dashboardRevenue)"
                strokeWidth={2}
                name="Revenue"
              />


              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Expenses"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>


        {/* =================================================
            BED OCCUPANCY
            MOCK FOR NOW
        ================================================= */}

        <div className="card">

          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Bed Occupancy
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Current ward status
          </p>


          <ResponsiveContainer
            width="100%"
            height={220}
          >

            <PieChart>

              <Pie
                data={bedOccupancy}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="occupied"
                nameKey="ward"
              >

                {bedOccupancy.map(
                  (_, idx) => (

                    <Cell
                      key={idx}
                      fill={
                        COLORS[
                          idx %
                            COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>


          <div className="grid grid-cols-2 gap-2 mt-2">

            {bedOccupancy
              .slice(0, 4)
              .map(
                (ward, idx) => (

                  <div
                    key={
                      ward.ward
                    }
                    className="flex items-center gap-2"
                  >

                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[
                            idx %
                              COLORS.length
                          ],
                      }}
                    />

                    <span className="text-xs text-gray-600">
                      {ward.ward}
                    </span>

                  </div>

                )
              )}

          </div>

        </div>

      </div>


      {/* =================================================
          PATIENT FLOW + APPOINTMENTS
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">


        {/* PATIENT FLOW */}

        <div className="card">

          <div className="mb-4">

            <h3 className="text-lg font-semibold text-gray-800">
              Patient Flow
            </h3>

            <p className="text-sm text-gray-500">
              Weekly patient visits
            </p>

          </div>


          <ResponsiveContainer
            width="100%"
            height={250}
          >

            <BarChart
              data={patientFlowData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="day"
              />

              <YAxis />

              <Tooltip />

              <Legend />


              <Bar
                dataKey="opd"
                fill="#0ea5e9"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
                name="OPD"
              />

              <Bar
                dataKey="ipd"
                fill="#10b981"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
                name="IPD"
              />

              <Bar
                dataKey="emergency"
                fill="#ef4444"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
                name="Emergency"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* APPOINTMENTS */}

        <div className="card">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h3 className="text-lg font-semibold text-gray-800">
                Today's Appointments
              </h3>

              <p className="text-sm text-gray-500">
                Temporary data
              </p>

            </div>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
              API Pending
            </span>

          </div>


          <div className="space-y-3 max-h-[280px] overflow-y-auto">

            {appointments
              .slice(0, 5)
              .map((apt) => (

                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">

                      <span className="text-sm font-medium text-blue-700">
                        {apt.patient?.charAt(
                          0
                        )}
                      </span>

                    </div>


                    <div>

                      <p className="text-sm font-medium text-gray-800">
                        {apt.patient}
                      </p>

                      <p className="text-xs text-gray-500">
                        {apt.doctor} •{" "}
                        {apt.department}
                      </p>

                    </div>

                  </div>


                  <div className="text-right">

                    <p className="text-sm font-medium">
                      {apt.time}
                    </p>

                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      {apt.status}
                    </span>

                  </div>

                </div>

              ))}

          </div>

        </div>

      </div>


      {/* =================================================
          REAL PATIENT TREND + REAL ORGANIZATION
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">


        {/* REAL PATIENT TREND */}

        <div className="card">

          <div className="mb-4">

            <h3 className="text-lg font-semibold text-gray-800">
              Patient Trends
            </h3>

            <p className="text-sm text-gray-500">
              Based on live Patient API
            </p>

          </div>


          {realPatientMonthlyData.some(
            (item) =>
              item.patients > 0
          ) ? (

            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <LineChart
                data={
                  realPatientMonthlyData
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  name="Patients"
                />

              </LineChart>

            </ResponsiveContainer>

          ) : (

            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
              Patient API me registration date available nahi hai.
            </div>

          )}

        </div>


        {/* REAL HOSPITAL / BRANCH */}

        <div className="card">

          <div className="mb-4">

            <h3 className="text-lg font-semibold text-gray-800">
              Hospital & Branch Overview
            </h3>

            <p className="text-sm text-gray-500">
              Based on live Hospital & Branch API
            </p>

          </div>


          {organizationData.some(
            (item) =>
              item.value > 0
          ) ? (

            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <PieChart>

                <Pie
                  data={
                    organizationData
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  dataKey="value"
                  nameKey="name"
                  label
                >

                  {organizationData.map(
                    (entry, index) => (

                      <Cell
                        key={
                          entry.name
                        }
                        fill={
                          COLORS[
                            index
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          ) : (

            <div className="flex h-[280px] items-center justify-center text-gray-400">
              Hospital / Branch data nahi mila.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          RECENT PATIENTS
          REAL API
      ================================================= */}

      <div className="card mb-6">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h3 className="text-lg font-semibold text-gray-800">
              Recent Patients
            </h3>

            <p className="text-sm text-gray-500">
              Latest patients from live API
            </p>

          </div>

          <button
            onClick={() =>
              setActiveCard(
                "patients"
              )
            }
            className="flex items-center gap-1 text-sm font-medium text-blue-600"
          >
            View All
            <FiArrowRight
              size={14}
            />
          </button>

        </div>


        <div className="overflow-x-auto">

          {patients.length === 0 ? (

            <div className="py-10 text-center text-gray-400">
              No patient data found.
            </div>

          ) : (

            <table className="w-full">

              <thead>

                <tr className="table-header">

                  <th className="px-4 py-3">
                    ID
                  </th>

                  <th className="px-4 py-3">
                    Patient
                  </th>

                  <th className="px-4 py-3">
                    Date
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {patients
                  .slice(0, 6)
                  .map(
                    (patient, index) => (

                      <tr
                        key={
                          patient.id ||
                          index
                        }
                        className="hover:bg-gray-50"
                      >

                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {patient.id ||
                            index + 1}
                        </td>


                        <td className="px-4 py-3">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">

                              <span className="text-xs font-medium">
                                {getItemName(
                                  patient
                                ).charAt(
                                  0
                                )}
                              </span>

                            </div>

                            <span className="text-sm font-medium text-gray-800">
                              {getItemName(
                                patient
                              )}
                            </span>

                          </div>

                        </td>


                        <td className="px-4 py-3 text-sm text-gray-500">

                          {getItemDate(
                            patient
                          )
                            ? new Date(
                                getItemDate(
                                  patient
                                )
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "N/A"}

                        </td>


                        <td className="px-4 py-3">

                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                            Active
                          </span>

                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          )}

        </div>

      </div>


      {/* =================================================
          DEPARTMENT PERFORMANCE
          MOCK UNTIL DEPARTMENT/BILLING API
      ================================================= */}

      <div className="card">

        <div className="mb-4">

          <h3 className="text-lg font-semibold text-gray-800">
            Department Revenue
          </h3>

          <p className="text-sm text-gray-500">
            Temporary data until Billing API is ready
          </p>

        </div>


        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {departments
            .slice(0, 6)
            .map(
              (dept, idx) => (

                <div
                  key={
                    dept.name
                  }
                >

                  <div className="mb-1 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span>
                        {dept.icon}
                      </span>

                      <span className="text-sm font-medium text-gray-700">
                        {dept.name}
                      </span>

                    </div>

                    <span className="text-sm text-gray-500">
                      ₹
                      {(
                        dept.revenue /
                        1000
                      ).toFixed(
                        0
                      )}
                      K
                    </span>

                  </div>


                  <div className="h-2 w-full rounded-full bg-gray-100">

                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (dept.revenue /
                            520000) *
                            100
                        )}%`,
                        backgroundColor:
                          COLORS[
                            idx %
                              COLORS.length
                          ],
                      }}
                    />

                  </div>

                </div>

              )
            )}

        </div>

      </div>

    </div>
  );
}


// =========================================================
// DASHBOARD CARD
// =========================================================

function DashboardCard({
  title,
  value,
  icon,
  gradient,
  onClick,
  mock = false,
}) {

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-left text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl`}
    >

      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

      <div className="relative">

        <div className="mb-5 flex items-center justify-between">

          <div className="rounded-xl bg-white/20 p-3">
            {icon}
          </div>

          <div className="flex items-center gap-2">

            {mock && (
              <span className="rounded-full bg-white/20 px-2 py-1 text-[10px]">
                MOCK
              </span>
            )}

            <FiArrowRight
              className="transition group-hover:translate-x-1"
            />

          </div>

        </div>


        <p className="text-sm text-white/80">
          {title}
        </p>

        <h2 className="mt-1 text-3xl font-bold">
          {value}
        </h2>

      </div>

    </button>
  );
}


// =========================================================
// OTHER ROLE DASHBOARDS
// =========================================================

function NurseDashboard({ user }) {
  const [occupancy, setOccupancy] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [taskFilter, setTaskFilter] = useState("PENDING");

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const [occRes, taskRes, vitRes] = await Promise.allSettled([
        bedApi.occupancy(),
        nurseTaskApi.list(),
        vitalsApi.list(),
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

      if (occRes.status === "fulfilled") {
        setOccupancy(occRes.value?.data || occRes.value || null);
      }
      setTasks(normalize(taskRes));
      setVitals(normalize(vitRes));
    } catch (e) {
      toast.error("Failed to load nursing dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      await nurseTaskApi.toggle(taskId);
      toast.success("Task updated");
      await loadData(true);
    } catch (e) {
      toast.error("Failed to update task");
    }
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== "COMPLETED").length;
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "PENDING") return t.status !== "COMPLETED";
    if (taskFilter === "COMPLETED") return t.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nurse Station & Inpatient Dashboard"
        subtitle={`Welcome, ${
          user?.first_name || user?.username || "Nurse"
        }. Real-time ward bed occupancy, vital signs monitoring, and nursing shift care.`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
              title="Refresh"
            >
              <FiRefreshCw
                size={14}
                className={refreshing ? "animate-spin text-medicore-600" : ""}
              />
              <span>Refresh</span>
            </button>
            <Link
              to="/ipd"
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
            >
              <FiLayers size={14} />
              <span>Bed Management (IPD)</span>
            </Link>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Bed Occupancy Rate"
          value={`${occupancy?.occupancy_rate ?? 0}%`}
          subtitle={`${occupancy?.occupied_beds ?? 0} of ${
            occupancy?.total_beds ?? 0
          } beds occupied`}
          icon={<FiLayers />}
          color="blue"
        />

        <StatCard
          title="Available Ready Beds"
          value={occupancy?.available_beds ?? 0}
          subtitle={`${occupancy?.cleaning_beds ?? 0} in cleaning/sanitation`}
          icon={<FiHeart />}
          color="green"
        />

        <StatCard
          title="Pending Shift Tasks"
          value={pendingTasksCount}
          subtitle={`${tasks.length} total assigned today`}
          icon={<FiCheckSquare />}
          color="orange"
        />

        <StatCard
          title="Vitals Logged Today"
          value={vitals.length}
          subtitle="Routine physiological observations"
          icon={<FiActivity />}
          color="purple"
        />
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Wards & Shift Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ward Occupancy Overview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Ward Inpatient Occupancy
                </h3>
                <p className="text-xs text-gray-500">
                  Capacity distribution across clinical wards
                </p>
              </div>
              <Link
                to="/ipd"
                className="text-xs font-semibold text-medicore-600 hover:text-medicore-800 flex items-center gap-1"
              >
                <span>View Bed Map</span>
                <FiArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-400">
                <FiRefreshCw className="animate-spin mx-auto mb-2" size={20} />
                Loading ward status...
              </div>
            ) : occupancy?.ward_breakdown && occupancy.ward_breakdown.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {occupancy.ward_breakdown.map((w) => {
                  const pct =
                    w.total > 0 ? Math.round((w.occupied / w.total) * 100) : 0;
                  return (
                    <div
                      key={w.ward}
                      className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">
                          {w.ward}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
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
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
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
                      <div className="flex items-center justify-between mt-2.5 text-[11px] text-gray-500">
                        <span>
                          {w.occupied}/{w.total} beds
                        </span>
                        <span className="text-green-600 font-semibold">
                          {w.available} free
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No ward data available.</p>
            )}
          </div>

          {/* Nurse Shift Tasks Checklist */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Nursing Shift Tasks Checklist
                </h3>
                <p className="text-xs text-gray-500">
                  Medication rounds, vitals assessments, and patient care duties
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
                  {["PENDING", "ALL", "COMPLETED"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        taskFilter === f
                          ? "bg-white text-gray-900 shadow-2xs font-semibold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <Link
                  to="/ipd"
                  className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
                >
                  <FiPlus size={12} />
                  <span>New</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-400">
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FiCheckCircle
                  className="mx-auto text-green-500 mb-2"
                  size={24}
                />
                <p className="text-xs font-semibold text-gray-700">
                  All tasks caught up for this view!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTasks.slice(0, 6).map((task) => {
                  const isCompleted = task.status === "COMPLETED";
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                        isCompleted ? "bg-gray-50/40" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 text-medicore-600 hover:text-medicore-700 cursor-pointer"
                        >
                          {isCompleted ? (
                            <FiCheckSquare
                              size={18}
                              className="text-green-600"
                            />
                          ) : (
                            <FiSquare size={18} className="text-gray-400" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isCompleted
                                ? "line-through text-gray-400"
                                : "text-gray-900"
                            }`}
                          >
                            {task.task_name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                            {task.patient_name && (
                              <span className="font-medium text-gray-600">
                                {task.patient_name}
                              </span>
                            )}
                            {(task.ward || task.bed_number) && (
                              <span>
                                {task.ward} {task.bed_number ? `• Bed ${task.bed_number}` : ""}
                              </span>
                            )}
                            {task.scheduled_time && (
                              <span>
                                {new Date(task.scheduled_time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          task.priority === "URGENT"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : task.priority === "HIGH"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Quick Navigation & Recent Vitals */}
        <div className="space-y-6">
          {/* Quick Nursing Shortcuts */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
              Quick Nurse Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/ipd"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-medicore-300 hover:bg-medicore-50/50 transition-all text-gray-700 hover:text-medicore-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-medicore-100 text-medicore-700">
                    <FiLayers size={16} />
                  </div>
                  <div>
                    <p className="font-bold">Bed Management & IPD</p>
                    <p className="text-[11px] text-gray-400 font-normal">
                      Assign beds, discharge, occupancy
                    </p>
                  </div>
                </div>
                <FiArrowRight />
              </Link>

              <Link
                to="/patients"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-gray-700 hover:text-blue-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <p className="font-bold">Patient Directory</p>
                    <p className="text-[11px] text-gray-400 font-normal">
                      Search medical charts & records
                    </p>
                  </div>
                </div>
                <FiArrowRight />
              </Link>

              <Link
                to="/emergency"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-gray-700 hover:text-rose-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <FiAlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="font-bold">Emergency Ward</p>
                    <p className="text-[11px] text-gray-400 font-normal">
                      Triage & critical intake
                    </p>
                  </div>
                </div>
                <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Recent Vitals Stream */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Recent Inpatient Vitals
              </h3>
              <Link
                to="/ipd"
                className="text-xs font-semibold text-medicore-600 hover:text-medicore-800"
              >
                All
              </Link>
            </div>

            {vitals.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No vitals recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {vitals.slice(0, 4).map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 truncate">
                        {v.patient_name || `Patient #${v.patient}`}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {v.recorded_at
                          ? new Date(v.recorded_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-600">
                      <span>BP: <strong className="text-gray-800">{v.blood_pressure || "—"}</strong></span>
                      <span>Pulse: <strong className="text-gray-800">{v.heart_rate || "—"} bpm</strong></span>
                      <span>SpO2: <strong className="text-gray-800">{v.oxygen_saturation || "—"}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// =========================================================
// LAB
// =========================================================

function LabTechnicianDashboard({
  user,
}) {

  return (
    <div>

      <PageHeader
        title="Lab Dashboard"
        subtitle={`Welcome, ${
          user?.name ||
          "Lab Technician"
        }. Manage tests and upload reports.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">

        <StatCard
          title="Tests Today"
          value={
            statsData.labTestsToday
          }
          icon={<FiDroplet />}
          color="blue"
        />

        <StatCard
          title="Pending Reports"
          value={6}
          icon={<FiFileText />}
          color="orange"
        />

        <StatCard
          title="Reports Uploaded"
          value={22}
          icon={<FiClock />}
          color="green"
        />

      </div>

    </div>
  );
}


// =========================================================
// PHARMACIST
// =========================================================

function PharmacistDashboard({
  user,
}) {

  return (
    <div>

      <PageHeader
        title="Pharmacy Dashboard"
        subtitle={`Welcome, ${
          user?.name ||
          "Pharmacist"
        }. Inventory control and medicine billing.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <StatCard
          title="Orders Today"
          value={
            statsData.pharmacyOrders
          }
          icon={<FiShoppingCart />}
          color="blue"
        />

        <StatCard
          title="Low Stock Items"
          value={7}
          icon={<FiLayers />}
          color="red"
        />

        <StatCard
          title="Bills Generated"
          value={31}
          icon={<FiDollarSign />}
          color="green"
        />

      </div>

    </div>
  );
}


// =========================================================
// ACCOUNTANT
// =========================================================

function AccountantDashboard({
  user,
}) {

  return (
    <div>

      <PageHeader
        title="Finance Dashboard"
        subtitle={`Welcome, ${
          user?.name ||
          "Accountant"
        }. Billing and revenue tracking.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <StatCard
          title="Daily Revenue"
          value={`₹${(
            statsData.dailyRevenue /
            1000
          ).toFixed(0)}K`}
          icon={<FiDollarSign />}
          color="purple"
        />

        <StatCard
          title="Pending Bills"
          value={14}
          icon={<FiFileText />}
          color="orange"
        />

        <StatCard
          title="Bills Cleared Today"
          value={38}
          icon={<FiClock />}
          color="green"
        />

        <StatCard
          title="Insurance Claims"
          value={9}
          icon={<FiLayers />}
          color="blue"
        />

      </div>

    </div>
  );
}


// =========================================================
// DOCTOR
// =========================================================

function DoctorDashboard({ user }) {
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [emrList, setEmrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [aptRes, patRes, rxRes, emrRes] = await Promise.allSettled([
        appointmentApi.list(),
        patientApi.list(),
        prescriptionApi.list(),
        emrApi.list(),
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

      setAppointmentsList(normalize(aptRes));
      setPatientsList(normalize(patRes));
      setPrescriptionsList(normalize(rxRes));
      setEmrList(normalize(emrRes));
    } catch (e) {
      toast.error("Failed to load doctor clinical data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update appointment status (e.g. mark completed)
  const handleUpdateApptStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentApi.update(appointmentId, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
      await loadData(true);
    } catch (e) {
      toast.error("Failed to update appointment status");
    }
  };

  // Filtered appointments queue
  const filteredAppointments = useMemo(() => {
    return appointmentsList.filter((a) => {
      const status = String(a.status || "SCHEDULED").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" &&
          (status === "SCHEDULED" || status === "CONFIRMED" || status === "IN_PROGRESS")) ||
        (statusFilter === "COMPLETED" && status === "COMPLETED");

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(a.patient_name || "").toLowerCase().includes(q) ||
        String(a.patient_id || "").toLowerCase().includes(q) ||
        String(a.reason || "").toLowerCase().includes(q) ||
        String(a.phone || "").toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [appointmentsList, statusFilter, search]);

  const pendingCount = appointmentsList.filter(
    (a) =>
      String(a.status || "").toUpperCase() === "SCHEDULED" ||
      String(a.status || "").toUpperCase() === "CONFIRMED"
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Dashboard & Consultation Queue"
        subtitle={`Welcome, Dr. ${
          user?.first_name || user?.name || user?.username || "Doctor"
        }. Manage daily consultation queue, review patient medical charts, and prescribe treatments.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
              title="Refresh"
            >
              <FiRefreshCw
                size={14}
                className={refreshing ? "animate-spin text-medicore-600" : ""}
              />
              <span>Refresh</span>
            </button>
            <Link
              to="/patients"
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
            >
              <FiUsers size={14} />
              <span>All Patients Directory</span>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Consultations Queue"
          value={appointmentsList.length}
          subtitle={`${pendingCount} pending appointments`}
          icon={<FiCalendar />}
          color="blue"
        />

        <StatCard
          title="Patients Under Care"
          value={patientsList.length}
          subtitle="Registered patient charts"
          icon={<FiUsers />}
          color="green"
        />

        <StatCard
          title="Prescriptions Issued"
          value={prescriptionsList.length}
          subtitle="Electronic prescriptions"
          icon={<FiFileText />}
          color="purple"
        />

        <StatCard
          title="Clinical EMR Records"
          value={emrList.length}
          subtitle="Diagnostic consult notes"
          icon={<FiActivity />}
          color="orange"
        />
      </div>

      {/* Main Grid: Queue on Left, Quick Links & Feeds on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Consultation Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            {/* Queue Header & Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Today's Patient Queue
                </h3>
                <p className="text-xs text-gray-500">
                  Click "Consult / View Chart" to view medical history, write notes, or prescribe
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
                  {["ALL", "PENDING", "COMPLETED"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        statusFilter === f
                          ? "bg-white text-gray-900 shadow-2xs font-semibold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Bar in Queue */}
            <div className="p-3 bg-gray-50/60 border-b border-gray-100 flex items-center">
              <FiSearch className="text-gray-400 mr-2" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search appointment by patient name, phone, or reason..."
                className="bg-transparent text-xs outline-none w-full text-gray-800"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <FiX className="text-gray-400" size={14} />
                </button>
              )}
            </div>

            {/* Appointment Cards List */}
            {loading ? (
              <div className="p-10 text-center text-gray-400">
                <FiRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                Loading consultation queue...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <FiUserCheck size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="font-semibold text-gray-600">
                  No appointments found for this filter.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  New appointment bookings will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAppointments.map((appt, idx) => {
                  const status = String(appt.status || "SCHEDULED").toUpperCase();
                  const isCompleted = status === "COMPLETED";

                  // Find full patient object if available
                  const matchedPatient =
                    patientsList.find(
                      (p) =>
                        p.id === appt.patient ||
                        p.patient_id === appt.patient ||
                        p.patient_id === appt.patient_id
                    ) || {
                      id: appt.patient || appt.patient_id || idx + 1,
                      patient_id: appt.patient_id || `PAT-${appt.patient || idx + 1}`,
                      full_name: appt.patient_name || `Patient #${appt.patient}`,
                      mobile_number: appt.phone || appt.patient_mobile || "—",
                      gender: appt.patient_gender || "Other",
                    };

                  return (
                    <div
                      key={appt.id || idx}
                      className="p-4 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Patient Avatar & Details */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-medicore-100 text-medicore-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {String(appt.patient_name || "P").charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setSelectedPatient(matchedPatient)}
                              className="font-bold text-gray-900 text-sm hover:text-medicore-600 hover:underline text-left cursor-pointer truncate"
                            >
                              {appt.patient_name || `Patient #${appt.patient}`}
                            </button>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? "bg-green-100 text-green-700"
                                  : status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {status}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            <strong className="text-gray-700">Complaint:</strong>{" "}
                            {appt.reason || "General Consultation / Routine Checkup"}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <FiClock size={12} />
                              {appt.appointment_date || "Today"} •{" "}
                              {appt.appointment_time || "Morning Slot"}
                            </span>
                            {appt.token_number && (
                              <span className="font-semibold text-medicore-700 bg-medicore-50 px-1.5 py-0.2 rounded">
                                Token #{appt.token_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedPatient(matchedPatient)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-medicore-600 text-white hover:bg-medicore-700 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FiEye size={13} />
                          <span>Consult / Chart</span>
                        </button>

                        {!isCompleted ? (
                          <button
                            onClick={() =>
                              handleUpdateApptStatus(appt.id, "COMPLETED")
                            }
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors flex items-center gap-1"
                            title="Mark Completed"
                          >
                            <FiCheck size={13} />
                            <span>Done</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-green-600 font-semibold px-2 py-1">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Quick Shortcuts & Feeds */}
        <div className="space-y-6">
          {/* Quick Doctor Modules */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
              Clinical Workspaces
            </h3>
            <div className="space-y-2">
              <Link
                to="/patients"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-medicore-300 hover:bg-medicore-50/50 transition-all text-gray-700 hover:text-medicore-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-medicore-100 text-medicore-700">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <p className="font-bold">All Patients Directory</p>
                    <p className="text-[11px] text-gray-400 font-normal">
                      Search medical histories & records
                    </p>
                  </div>
                </div>
                <FiArrowRight />
              </Link>

              <Link
                to="/emr"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-gray-700 hover:text-blue-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <FiFileText size={16} />
                  </div>
                  <div>
                    <p className="font-bold">Electronic Health Records</p>
                    <p className="text-[11px] text-gray-400 font-normal">
                      Full diagnostic notes archive
                    </p>
                  </div>
                </div>
                <FiArrowRight />
              </Link>

              <Link
                to="/laboratory"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-gray-700 hover:text-amber-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <FiDroplet size={16} />
                  </div>
                  <div>
                    <p className="font-bold">Lab Orders & Pathology</p>
                    <p className="text-[11px] text-gray-400 font-normal">
                      Review diagnostic lab results
                    </p>
                  </div>
                </div>
                <FiArrowRight />
              </Link>

              <Link
                to="/telemedicine"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-gray-700 hover:text-purple-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <FiActivity size={16} />
                  </div>
                  <div>
                    <p className="font-bold">Telemedicine Suite</p>
                    <p className="text-[11px] text-gray-400 font-normal">
                      Remote video consultations
                    </p>
                  </div>
                </div>
                <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Recent Prescriptions Issued */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Recent Prescriptions
              </h3>
              <span className="text-xs text-gray-400">
                {prescriptionsList.length} total
              </span>
            </div>

            {prescriptionsList.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No recent prescriptions issued.
              </p>
            ) : (
              <div className="space-y-2.5">
                {prescriptionsList.slice(0, 4).map((rx) => (
                  <div
                    key={rx.id}
                    className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 truncate">
                        {rx.patient_name || `Patient #${rx.patient}`}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        RX-{rx.id}
                      </span>
                    </div>
                    <p className="text-medicore-700 font-medium mt-1 truncate">
                      {rx.medicine_name || rx.medicine || "Prescription item"}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                      <span>{rx.dosage || "1 tablet"} • {rx.frequency || "Twice daily"}</span>
                      <span>{rx.duration_days ? `${rx.duration_days} days` : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PATIENT DETAIL MODAL INTEGRATION */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          isOpen={Boolean(selectedPatient)}
          onClose={() => setSelectedPatient(null)}
          onPatientUpdated={() => loadData(true)}
        />
      )}
    </div>
  );
}


// =========================================================
// PATIENT
// =========================================================

function PatientDashboard({
  user,
}) {

  const myAppointments =
    appointments.slice(0, 3);

  return (
    <div>

      <PageHeader
        title="My Dashboard"
        subtitle={`Welcome, ${
          user?.name ||
          "Patient"
        }. Here's your care summary.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <StatCard
          title="Upcoming Appointments"
          value={
            myAppointments.length
          }
          icon={<FiCalendar />}
          color="blue"
        />

        <StatCard
          title="Medical Reports"
          value={4}
          icon={<FiFileText />}
          color="green"
        />

        <StatCard
          title="Active Prescriptions"
          value={2}
          icon={<FiHeart />}
          color="purple"
        />

      </div>

    </div>
  );
}


// =========================================================
// RECEPTIONIST
// =========================================================

function ReceptionistDashboard({
  user,
}) {

  return (
    <div>

      <PageHeader
        title="Front Desk"
        subtitle={`Welcome, ${
          user?.name ||
          "Receptionist"
        }.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <StatCard
          title="Today's Registrations"
          value={12}
          icon={<FiUsers />}
          color="blue"
        />

        <StatCard
          title="Appointments Today"
          value={
            statsData.todayAppointments
          }
          icon={<FiCalendar />}
          color="green"
        />

        <StatCard
          title="Waiting Now"
          value={7}
          icon={<FiClock />}
          color="orange"
        />

        <StatCard
          title="Emergency Cases"
          value={
            statsData.emergencyCases
          }
          icon={<FiAlertTriangle />}
          color="red"
        />

      </div>

    </div>
  );
}


