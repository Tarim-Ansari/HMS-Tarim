
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
} from "react-icons/fi";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

import { dashboardApi } from "../../api/service";

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

  const { role, user } = useSelector(
    (state) => state.auth
  );

  if (role === "doctor") {
    return <DoctorDashboard user={user} />;
  }

  if (role === "patient") {
    return <PatientDashboard user={user} />;
  }

  if (role === "receptionist") {
    return <ReceptionistDashboard user={user} />;
  }

  if (role === "nurse") {
    return <NurseDashboard user={user} />;
  }

  if (role === "lab_technician") {
    return <LabTechnicianDashboard user={user} />;
  }

  if (role === "pharmacist") {
    return <PharmacistDashboard user={user} />;
  }

  if (role === "accountant") {
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

  return (
    <div>

      <PageHeader
        title="Nurse Dashboard"
        subtitle={`Welcome, ${
          user?.name || "Nurse"
        }. Patient monitoring and bed allocation.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">

        <StatCard
          title="Patients Under Care"
          value={18}
          icon={<FiUsers />}
          color="blue"
        />

        <StatCard
          title="Bed Occupancy"
          value={`${statsData.bedOccupancy}%`}
          icon={<FiLayers />}
          color="green"
        />

        <StatCard
          title="Emergency Cases"
          value={statsData.emergencyCases}
          icon={<FiAlertTriangle />}
          color="red"
        />

      </div>


      <div className="card">

        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Ward Overview
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          Current bed status
        </p>


        <div className="grid grid-cols-2 gap-3">

          {bedOccupancy
            .slice(0, 4)
            .map((ward) => (

              <div
                key={ward.ward}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >

                <span className="text-sm font-medium">
                  {ward.ward}
                </span>

                <span className="text-sm text-gray-500">
                  {ward.occupied}/
                  {ward.total} beds
                </span>

              </div>

            ))}

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

function DoctorDashboard({
  user,
}) {

  const myAppointments =
    appointments.slice(0, 5);

  return (
    <div>

      <PageHeader
        title="Doctor Dashboard"
        subtitle={`Welcome back, ${
          user?.name ||
          "Doctor"
        }. Here's your day at a glance.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">

        <StatCard
          title="Today's Patients"
          value={
            myAppointments.length
          }
          icon={<FiUsers />}
          color="blue"
        />

        <StatCard
          title="Prescriptions Issued"
          value={9}
          icon={<FiFileText />}
          color="green"
        />

        <StatCard
          title="Follow-Ups Due"
          value={5}
          icon={<FiClock />}
          color="purple"
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


