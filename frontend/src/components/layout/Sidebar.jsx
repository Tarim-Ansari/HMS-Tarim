import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../store/uiSlice';
import { useLocation, Link } from 'react-router-dom';
import {
  FiX,
  FiHome,
  FiUsers,
  FiCalendar,
  FiHeart,
  FiFileText,
  FiMonitor,
  FiDroplet,
  FiShoppingCart,
  FiDollarSign,
  FiLayers,
  FiAlertTriangle,
  FiBriefcase,
  FiChevronRight,
} from 'react-icons/fi';
import { HiOutlineShieldCheck } from 'react-icons/hi2';

/**
 * All live, backend-integrated menu items with strictly authorized roles.
 * Dead items (/hr, /inventory, /ai, /analytics) have been removed.
 */
const allMenuItems = [
  // Dashboard is accessible to all authenticated roles
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: FiHome,
    roles: null,
  },

  // Enterprise Governance (Super User / Super Admin ONLY)
  {
    path: '/hospitals',
    label: 'Hospital Setup',
    icon: HiOutlineShieldCheck,
    roles: ['SUPER_USER', 'SUPER_ADMIN'],
  },
  {
    path: '/hospital-admins',
    label: 'Hospital Admins',
    icon: HiOutlineShieldCheck,
    roles: ['SUPER_USER', 'SUPER_ADMIN'],
  },

  // Hospital Branch & Department Management
  {
    path: '/branches',
    label: 'Branch Setup',
    icon: FiLayers,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'],
  },
  {
    path: '/departments',
    label: 'Department Setup',
    icon: FiBriefcase,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'],
  },

  // Patient Directory & Registration
  {
    label: 'Patient Management',
    icon: FiUsers,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    children: [
      {
        path: '/patients',
        label: 'All Patients',
        roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
      },
      {
        path: '/patients/register',
        label: 'Register Patient',
        roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'],
      },
    ],
  },

  // Appointments Scheduling & Queue
  {
    path: '/appointments',
    label: 'Appointments',
    icon: FiCalendar,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
  },

  // Clinical & Staff Directories
  {
    path: '/doctors',
    label: 'Doctors',
    icon: FiHeart,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  },
  {
    path: '/nurses',
    label: 'Nurses',
    icon: FiUsers,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'NURSE', 'RECEPTIONIST'],
  },

  // EMR / EHR Clinical Records
  {
    path: '/emr',
    label: 'EMR / EHR',
    icon: FiFileText,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'PATIENT'],
  },

  // Inpatient Department (IPD - Bed Management, Occupancy, Vitals)
  {
    path: '/ipd',
    label: 'IPD Management',
    icon: FiLayers,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'NURSE', 'DOCTOR'],
  },

  // Emergency Care & Triage
  {
    path: '/emergency',
    label: 'Emergency',
    icon: FiAlertTriangle,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'NURSE', 'DOCTOR'],
  },

  // Laboratory Diagnostics & Reports
  {
    path: '/laboratory',
    label: 'Laboratory',
    icon: FiDroplet,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN', 'DOCTOR'],
  },

  // Pharmacy & Prescriptions
  {
    path: '/pharmacy',
    label: 'Pharmacy',
    icon: FiShoppingCart,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST', 'DOCTOR'],
  },

  // Billing & Finance Invoicing
  {
    path: '/billing',
    label: 'Billing & Finance',
    icon: FiDollarSign,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'ACCOUNTANT'],
  },

  // Telemedicine Consultations
  {
    path: '/telemedicine',
    label: 'Telemedicine',
    icon: FiMonitor,
    roles: ['SUPER_USER', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'PATIENT'],
  },
];

export default function Sidebar() {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState([]);

  // Strict role evaluation
  const currentRole = String(role || '').trim().toUpperCase();
  const isSuperUser = currentRole === 'SUPER_USER' || currentRole === 'SUPER_ADMIN';

  const canSee = (itemRoles) => {
    // null or undefined means accessible to all authenticated roles
    if (!itemRoles || itemRoles.length === 0) return true;

    // Super user matches if SUPER_USER or SUPER_ADMIN is listed
    if (isSuperUser && (itemRoles.includes('SUPER_USER') || itemRoles.includes('SUPER_ADMIN'))) {
      return true;
    }

    // Role must be explicitly included
    return itemRoles.some((r) => r.toUpperCase() === currentRole);
  };

  const menuItems = allMenuItems
    .filter((item) => canSee(item.roles))
    .map((item) =>
      item.children
        ? { ...item, children: item.children.filter((c) => canSee(c.roles)) }
        : item
    )
    .filter((item) => !item.children || item.children.length > 0);

  const toggleMenu = (label) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (path) => location.pathname === path;
  const isMenuActive = (item) => {
    if (item.path) return isActive(item.path);
    if (item.children) return item.children.some((c) => isActive(c.path));
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'lg:justify-center'}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-medicore-500 to-medicore-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <HiOutlineShieldCheck className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-medicore-700 leading-tight">MediCore</h1>
                <p className="text-[10px] text-gray-400 leading-tight">Enterprise HMS</p>
              </div>
            )}
          </div>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => (sidebarOpen ? toggleMenu(item.label) : null)}
                      className={`w-full sidebar-link ${
                        isMenuActive(item) ? 'bg-medicore-50 text-medicore-700' : ''
                      } ${!sidebarOpen && 'lg:justify-center'}`}
                    >
                      <item.icon size={18} className="flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left text-sm">{item.label}</span>
                          <FiChevronRight
                            size={14}
                            className={`transition-transform ${
                              expandedMenus.includes(item.label) ? 'rotate-90' : ''
                            }`}
                          />
                        </>
                      )}
                    </button>
                    {sidebarOpen && expandedMenus.includes(item.label) && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block px-3 py-2 text-sm rounded-lg ${
                              isActive(child.path)
                                ? 'text-medicore-700 bg-medicore-50 font-medium'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`${
                      isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'
                    } ${!sidebarOpen && 'lg:justify-center'}`}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm">{item.label}</span>}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}