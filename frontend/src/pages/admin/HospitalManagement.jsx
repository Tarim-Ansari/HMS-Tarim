
import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiPhone,
  FiMail,
  FiMapPin,
  FiX,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPower,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiMoreVertical,
} from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import PageHeader from "../../components/common/PageHeader";
import toast from "react-hot-toast";
import { hospitalApi } from "../../api/service";
const initialHospitals = [
  {
    id: 1,
    name: "Apollo Multispeciality Hospital",
    legal_name: "Apollo Hospitals Enterprise Ltd",
    hospital_code: "APOLLO-PUNE",
    hospital_type: "PRIVATE",
    registration_number: "REG-MH-2018-9921",
    email: "contact@apollo-pune.com",
    phone: "+91 20 6767 8900",
    city: "Pune",
    state: "Maharashtra",
    status: "ACTIVE",
    branches_count: 3,
  },
  {
    id: 2,
    name: "Lilavati Care Hospital",
    legal_name: "Lilavati Medical Trust",
    hospital_code: "LILAVATI-MUM",
    hospital_type: "TRUST",
    registration_number: "REG-MH-2012-4410",
    email: "info@lilavati.org",
    phone: "+91 22 2675 1000",
    city: "Mumbai",
    state: "Maharashtra",
    status: "ACTIVE",
    branches_count: 2,
  },
  {
    id: 3,
    name: "AIIMS Research & Healthcare",
    legal_name: "All India Institute of Medical Sciences",
    hospital_code: "AIIMS-DEL",
    hospital_type: "GOVERNMENT",
    registration_number: "REG-DL-2005-0012",
    email: "support@aiims.edu",
    phone: "+91 11 2658 8500",
    city: "New Delhi",
    state: "Delhi",
    status: "ACTIVE",
    branches_count: 5,
  },
];
const emptyForm = {
  name: "",
  legalName: "",
  hospitalCode: "",
  hospitalType: "PRIVATE",
  registrationNumber: "",
  email: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  postal_Code: "",
  status: "ACTIVE",
};
export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await hospitalApi.list();
        if (Array.isArray(data?.data)) {
          setHospitals(data.data);
        } else if (Array.isArray(data)) {
          setHospitals(data);
        }
      } catch (error) {
        console.error("Failed to load hospitals:", error);
      }
    };
    loadHospitals();
  }, []);
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const openCreateModal = () => {
    setEditingHospital(null);
    setFormData(emptyForm);
    setShowModal(true);
  };
  const openEditModal = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name || "",
      legalName: hospital.legal_name || "",
      hospitalCode: hospital.hospital_code || "",
      hospitalType: hospital.hospital_type || "PRIVATE",
      registrationNumber: hospital.registration_number || "",
      email: hospital.email || "",
      phone: hospital.phone || "",
      addressLine1: hospital.address_line_1 || "",
      city: hospital.city || "",
      state: hospital.state || "",
      postal_Code: hospital.postal_code || "",
      status: hospital.status || "ACTIVE",
    });
    setShowModal(true);
  };
  const openViewModal = (hospital) => {
    setSelectedHospital(hospital);
    setShowViewModal(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: formData.name,
      legal_name: formData.legalName,
      hospital_code: formData.hospitalCode.trim().toUpperCase(),
      hospital_type: formData.hospitalType,
      registration_number: formData.registrationNumber.trim().toUpperCase(),
      email: formData.email.trim(),
      phone: formData.phone.replace(/[^0-9]/g, ""),
      address_line_1: formData.addressLine1,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postal_Code,
      status: formData.status,
    };
    try {
      if (editingHospital) {
        const result = await hospitalApi.update(editingHospital.id, payload);
        const updatedHospital = result?.data || result;
        setHospitals((prev) =>
          prev.map((hospital) =>
            hospital.id === editingHospital.id
              ? { ...hospital, ...updatedHospital }
              : hospital,
          ),
        );
        toast.success("Hospital updated successfully.");
      } else {
        const result = await hospitalApi.create(payload);
        const newHospital = result?.data || result;
        setHospitals((prev) => [newHospital, ...prev]);
        toast.success("Hospital registered and saved to database!");
      }
      setShowModal(false);
      setEditingHospital(null);
      resetForm();
    } catch (err) {
      toast.error(
        err.message ||
          `Failed to ${editingHospital ? "update" : "register"} hospital.`,
      );
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (hospital) => {
    const isActive = hospital.status === "ACTIVE";
    const nextStatus = isActive ? "INACTIVE" : "ACTIVE";
    const action = isActive ? "deactivate" : "activate";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${hospital.name}"?`,
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      const result = await hospitalApi.update(hospital.id, {
        status: nextStatus,
      });
      const updatedHospital = result?.data || result;
      setHospitals((prev) =>
        prev.map((item) =>
          item.id === hospital.id
            ? {
                ...item,
                ...updatedHospital,
                status: updatedHospital?.status || nextStatus,
              }
            : item,
        ),
      );
      toast.success(`Hospital ${action}d successfully.`);
    } catch (err) {
      toast.error(err.message || `Failed to ${action} hospital.`);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (hospital) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${hospital.name}"?\n\nThis action cannot be undone.`,
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await hospitalApi.remove(hospital.id);
      setHospitals((prev) => prev.filter((item) => item.id !== hospital.id));
      toast.success("Hospital deleted successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to delete hospital.");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setFormData(emptyForm);
  };
  const filteredHospitals = hospitals.filter((hospital) => {
    const searchValue = search.toLowerCase();
    const matchSearch =
      hospital.name?.toLowerCase().includes(searchValue) ||
      hospital.hospital_code?.toLowerCase().includes(searchValue) ||
      hospital.city?.toLowerCase().includes(searchValue);
    const matchType =
      typeFilter === "ALL" || hospital.hospital_type === typeFilter;
    return matchSearch && matchType;
  });
  const totalHospitals = hospitals.length;
  const activeHospitals = hospitals.filter((h) => h.status === "ACTIVE").length;
  const inactiveHospitals = hospitals.filter(
    (h) => h.status !== "ACTIVE",
  ).length;
  const privateHospitals = hospitals.filter(
    (h) => h.hospital_type === "PRIVATE",
  ).length;
  return (
    <div className="space-y-6 pb-8">
      {" "}
      <PageHeader
        title="Hospital Management"
        subtitle="Platform-level multi-hospital administration and onboarding"
        action={
          <button
            onClick={openCreateModal}
            className="btn-primary text-sm flex items-center gap-2 shadow-sm"
          >
            {" "}
            <FiPlus size={16} /> Register Hospital{" "}
          </button>
        }
      />{" "}
      {/* Stats */}{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {" "}
        <StatCard
          title="Total Hospitals"
          value={totalHospitals}
          icon={FiHome}
          description="Registered facilities"
          iconClass="bg-indigo-50 text-indigo-600"
        />{" "}
        <StatCard
          title="Active Facilities"
          value={activeHospitals}
          icon={FiCheckCircle}
          description="Currently operational"
          iconClass="bg-emerald-50 text-emerald-600"
        />{" "}
        <StatCard
          title="Inactive Facilities"
          value={inactiveHospitals}
          icon={FiClock}
          description="Currently disabled"
          iconClass="bg-amber-50 text-amber-600"
        />{" "}
        <StatCard
          title="Private Facilities"
          value={privateHospitals}
          icon={HiOutlineShieldCheck}
          description="Private hospitals"
          iconClass="bg-purple-50 text-purple-600"
        />{" "}
      </div>{" "}
      {/* Main Card */}{" "}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {" "}
        {/* Toolbar */}{" "}
        <div className="p-5 border-b border-gray-100">
          {" "}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            {" "}
            <div>
              {" "}
              <h3 className="text-lg font-bold text-gray-800">
                {" "}
                Registered Healthcare Organizations{" "}
              </h3>{" "}
              <p className="text-xs text-gray-500 mt-1">
                {" "}
                Manage hospital registration, operational status and
                organization details.{" "}
              </p>{" "}
            </div>{" "}
            <div className="flex flex-col sm:flex-row gap-3">
              {" "}
              {/* Search */}{" "}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-10 w-full sm:w-[300px] focus-within:border-medicore-400 focus-within:ring-2 focus-within:ring-medicore-100">
                {" "}
                <FiSearch className="text-gray-400 shrink-0" size={16} />{" "}
                <input
                  type="text"
                  placeholder="Search hospital..."
                  className="bg-transparent border-none outline-none ml-2 w-full text-sm text-gray-700"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />{" "}
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {" "}
                    <FiX size={15} />{" "}
                  </button>
                )}{" "}
              </div>{" "}
              {/* Filter */}{" "}
              <select
                className="input-field h-10 text-sm min-w-[150px]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {" "}
                <option value="ALL">All Types</option>{" "}
                <option value="PRIVATE">Private</option>{" "}
                <option value="GOVERNMENT"> Government </option>{" "}
                <option value="TRUST">Trust</option>{" "}
                <option value="CORPORATE">Corporate</option>{" "}
              </select>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Table */}{" "}
        <div className="overflow-x-auto">
          {" "}
          <table className="w-full text-left">
            {" "}
            <thead className="bg-gray-50/80 border-b border-gray-100">
              {" "}
              <tr>
                {" "}
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  {" "}
                  Hospital{" "}
                </th>{" "}
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  {" "}
                  Type{" "}
                </th>{" "}
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  {" "}
                  Location{" "}
                </th>{" "}
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  {" "}
                  Contact{" "}
                </th>{" "}
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                  {" "}
                  Status{" "}
                </th>{" "}
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500 text-right">
                  {" "}
                  Actions{" "}
                </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-gray-100">
              {" "}
              {filteredHospitals.map((hospital) => {
                const active = hospital.status === "ACTIVE";
                return (
                  <tr
                    key={hospital.id || hospital.hospital_code}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {" "}
                    {/* Hospital */}{" "}
                    <td className="px-5 py-4">
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <div className="w-10 h-10 rounded-xl bg-medicore-50 text-medicore-600 flex items-center justify-center shrink-0">
                          {" "}
                          <FiHome size={18} />{" "}
                        </div>{" "}
                        <div className="min-w-0">
                          {" "}
                          <div className="font-semibold text-gray-800 text-sm truncate max-w-[260px]">
                            {" "}
                            {hospital.name}{" "}
                          </div>{" "}
                          <div className="flex items-center gap-2 mt-1">
                            {" "}
                            <span className="font-mono text-[10px] font-bold text-medicore-700 bg-medicore-50 px-2 py-0.5 rounded-md">
                              {" "}
                              {hospital.hospital_code}{" "}
                            </span>{" "}
                          </div>{" "}
                          {hospital.legal_name && (
                            <div className="text-[11px] text-gray-400 mt-1 truncate max-w-[260px]">
                              {" "}
                              {hospital.legal_name}{" "}
                            </div>
                          )}{" "}
                        </div>{" "}
                      </div>{" "}
                    </td>{" "}
                    {/* Type */}{" "}
                    <td className="px-5 py-4">
                      {" "}
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                        {" "}
                        {hospital.hospital_type}{" "}
                      </span>{" "}
                    </td>{" "}
                    {/* Location */}{" "}
                    <td className="px-5 py-4">
                      {" "}
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        {" "}
                        <FiMapPin
                          size={14}
                          className="text-gray-400 shrink-0"
                        />{" "}
                        <span>
                          {" "}
                          {hospital.city
                            ? `${hospital.city}, ${hospital.state || ""}`
                            : "N/A"}{" "}
                        </span>{" "}
                      </div>{" "}
                    </td>{" "}
                    {/* Contact */}{" "}
                    <td className="px-5 py-4">
                      {" "}
                      <div className="space-y-1">
                        {" "}
                        {hospital.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            {" "}
                            <FiMail size={12} className="text-gray-400" />{" "}
                            <span className="truncate max-w-[190px]">
                              {" "}
                              {hospital.email}{" "}
                            </span>{" "}
                          </div>
                        )}{" "}
                        {hospital.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            {" "}
                            <FiPhone size={12} className="text-gray-400" />{" "}
                            {hospital.phone}{" "}
                          </div>
                        )}{" "}
                      </div>{" "}
                    </td>{" "}
                    {/* Status */}{" "}
                    <td className="px-5 py-4">
                      {" "}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                      >
                        {" "}
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`}
                        />{" "}
                        {active ? "Active" : "Inactive"}{" "}
                      </span>{" "}
                    </td>{" "}
                    {/* Actions */}{" "}
                    <td className="px-5 py-4">
                      {" "}
                      <div className="flex items-center justify-end gap-1.5">
                        {" "}
                        {/* View */}{" "}
                        <ActionButton
                          title="View Hospital"
                          onClick={() => openViewModal(hospital)}
                        >
                          {" "}
                          <FiEye size={15} />{" "}
                        </ActionButton>{" "}
                        {/* Edit */}{" "}
                        <ActionButton
                          title="Edit Hospital"
                          onClick={() => openEditModal(hospital)}
                        >
                          {" "}
                          <FiEdit2 size={15} />{" "}
                        </ActionButton>{" "}
                        {/* Activate / Deactivate */}{" "}
                        <ActionButton
                          title={
                            active ? "Deactivate Hospital" : "Activate Hospital"
                          }
                          disabled={loading}
                          onClick={() => handleStatusChange(hospital)}
                          className={
                            active
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }
                        >
                          {" "}
                          <FiPower size={15} />{" "}
                        </ActionButton>{" "}
                        {/* Delete */}{" "}
                        <ActionButton
                          title="Delete Hospital"
                          disabled={loading}
                          onClick={() => handleDelete(hospital)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          {" "}
                          <FiTrash2 size={15} />{" "}
                        </ActionButton>{" "}
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
                          title="More actions"
                        >
                          {" "}
                          <FiMoreVertical size={16} />{" "}
                        </button>{" "}
                      </div>{" "}
                    </td>{" "}
                  </tr>
                );
              })}{" "}
              {filteredHospitals.length === 0 && (
                <tr>
                  {" "}
                  <td colSpan={6} className="py-16 text-center">
                    {" "}
                    <div className="flex flex-col items-center">
                      {" "}
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                        {" "}
                        <FiHome size={24} />{" "}
                      </div>{" "}
                      <p className="font-semibold text-gray-700">
                        {" "}
                        No hospitals found{" "}
                      </p>{" "}
                      <p className="text-sm text-gray-400 mt-1">
                        {" "}
                        Try changing your search or filter.{" "}
                      </p>{" "}
                    </div>{" "}
                  </td>{" "}
                </tr>
              )}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>{" "}
        {/* Footer */}{" "}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          {" "}
          <p className="text-xs text-gray-500">
            {" "}
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {" "}
              {filteredHospitals.length}{" "}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {" "}
              {hospitals.length}{" "}
            </span>{" "}
            hospitals{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Create / Edit Modal */}{" "}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          {" "}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            {" "}
            {/* Modal Header */}{" "}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-gray-100 px-6 py-5">
              {" "}
              <div>
                {" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <div className="w-9 h-9 rounded-xl bg-medicore-50 text-medicore-600 flex items-center justify-center">
                    {" "}
                    {editingHospital ? (
                      <FiEdit2 size={17} />
                    ) : (
                      <FiHome size={17} />
                    )}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="text-lg font-bold text-gray-800">
                      {" "}
                      {editingHospital
                        ? "Edit Hospital"
                        : "Onboard New Hospital"}{" "}
                    </h3>{" "}
                    <p className="text-xs text-gray-500">
                      {" "}
                      {editingHospital
                        ? "Update hospital organization details."
                        : "Register a new healthcare organization."}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                {" "}
                <FiX size={19} />{" "}
              </button>{" "}
            </div>{" "}
            {/* Form */}{" "}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {" "}
              <div>
                {" "}
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  {" "}
                  Organization Information{" "}
                </p>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <FormField label="Hospital Name" required>
                    {" "}
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Fortis Healthcare"
                      className="input-field text-sm"
                    />{" "}
                  </FormField>{" "}
                  <FormField label="Hospital Code" required>
                    {" "}
                    <input
                      required
                      name="hospitalCode"
                      value={formData.hospitalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. FORTIS-BLR"
                      className="input-field text-sm uppercase"
                    />{" "}
                  </FormField>{" "}
                  <FormField label="Legal Entity Name">
                    {" "}
                    <input
                      name="legalName"
                      value={formData.legalName}
                      onChange={handleInputChange}
                      placeholder="Registered legal corporate name"
                      className="input-field text-sm"
                    />{" "}
                  </FormField>{" "}
                  <FormField label="Hospital Type">
                    {" "}
                    <select
                      name="hospitalType"
                      value={formData.hospitalType}
                      onChange={handleInputChange}
                      className="input-field text-sm"
                    >
                      {" "}
                      <option value="PRIVATE"> Private </option>{" "}
                      <option value="GOVERNMENT"> Government </option>{" "}
                      <option value="TRUST"> Trust </option>{" "}
                      <option value="CORPORATE"> Corporate </option>{" "}
                    </select>{" "}
                  </FormField>{" "}
                  <FormField label="Registration Number">
                    {" "}
                    <input
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="Registration number"
                      className="input-field text-sm"
                    />{" "}
                  </FormField>{" "}
                  <FormField label="Official Email">
                    {" "}
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@hospital.com"
                      className="input-field text-sm"
                    />{" "}
                  </FormField>{" "}
                  <FormField label="Contact Phone">
                    {" "}
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="input-field text-sm"
                    />{" "}
                  </FormField>{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  {" "}
                  Location Information{" "}
                </p>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <div className="md:col-span-2">
                    {" "}
                    <FormField label="Address">
                      {" "}
                      <input
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        placeholder="Street / Campus address"
                        className="input-field text-sm"
                      />{" "}
                    </FormField>{" "}
                  </div>{" "}
                  <FormField label="City">
                    {" "}
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="input-field text-sm"
                    />{" "}
                  </FormField>{" "}
                  <FormField label="State">
                    {" "}
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="input-field text-sm"
                    />{" "}
                  </FormField>{" "}
                  <FormField label="Pincode">
                    {" "}
                    <input
                      name="postal_Code"
                      value={formData.postal_Code}
                      onChange={handleInputChange}
                      placeholder="Pincode"
                      className="input-field text-sm"
                    />{" "}
                  </FormField>{" "}
                  {editingHospital && (
                    <FormField label="Status">
                      {" "}
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="input-field text-sm"
                      >
                        {" "}
                        <option value="ACTIVE"> Active </option>{" "}
                        <option value="INACTIVE"> Inactive </option>{" "}
                      </select>{" "}
                    </FormField>
                  )}{" "}
                </div>{" "}
              </div>{" "}
              {/* Footer */}{" "}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                {" "}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-sm"
                >
                  {" "}
                  Cancel{" "}
                </button>{" "}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-sm min-w-[130px]"
                >
                  {" "}
                  {loading
                    ? "Saving..."
                    : editingHospital
                      ? "Update Hospital"
                      : "Save Hospital"}{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* View Modal */}{" "}
      {showViewModal && selectedHospital && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          {" "}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {" "}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <div className="w-11 h-11 rounded-xl bg-medicore-50 text-medicore-600 flex items-center justify-center">
                  {" "}
                  <FiHome size={20} />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h3 className="font-bold text-gray-800">
                    {" "}
                    {selectedHospital.name}{" "}
                  </h3>{" "}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {" "}
                    {selectedHospital.hospital_code}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={() => setShowViewModal(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                {" "}
                <FiX size={19} />{" "}
              </button>{" "}
            </div>{" "}
            <div className="p-6 space-y-6">
              {" "}
              {/* Status banner */}{" "}
              <div
                className={`rounded-xl p-4 border ${selectedHospital.status === "ACTIVE" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}
              >
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <div>
                    {" "}
                    <p className="text-xs text-gray-500">
                      {" "}
                      Account Status{" "}
                    </p>{" "}
                    <p
                      className={`font-bold mt-1 ${selectedHospital.status === "ACTIVE" ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {" "}
                      {selectedHospital.status === "ACTIVE"
                        ? "Active & Operational"
                        : "Inactive"}{" "}
                    </p>{" "}
                  </div>{" "}
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${selectedHospital.status === "ACTIVE" ? "bg-white text-emerald-700" : "bg-white text-red-700"}`}
                  >
                    {" "}
                    {selectedHospital.status || "ACTIVE"}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              {/* Details */}{" "}
              <div>
                {" "}
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  {" "}
                  Organization Details{" "}
                </p>{" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {" "}
                  <DetailItem
                    label="Hospital Name"
                    value={selectedHospital.name}
                  />{" "}
                  <DetailItem
                    label="Legal Name"
                    value={selectedHospital.legal_name}
                  />{" "}
                  <DetailItem
                    label="Hospital Code"
                    value={selectedHospital.hospital_code}
                  />{" "}
                  <DetailItem
                    label="Hospital Type"
                    value={selectedHospital.hospital_type}
                  />{" "}
                  <DetailItem
                    label="Registration Number"
                    value={selectedHospital.registration_number}
                  />{" "}
                  <DetailItem
                    label="Branches"
                    value={selectedHospital.branches_count ?? "—"}
                  />{" "}
                </div>{" "}
              </div>{" "}
              {/* Contact */}{" "}
              <div>
                {" "}
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  {" "}
                  Contact & Location{" "}
                </p>{" "}
                <div className="space-y-3">
                  {" "}
                  <ContactDetail
                    icon={FiMail}
                    label="Official Email"
                    value={selectedHospital.email}
                  />{" "}
                  <ContactDetail
                    icon={FiPhone}
                    label="Phone"
                    value={selectedHospital.phone}
                  />{" "}
                  <ContactDetail
                    icon={FiMapPin}
                    label="Location"
                    value={
                      selectedHospital.city
                        ? `${selectedHospital.city}, ${selectedHospital.state || ""}`
                        : "N/A"
                    }
                  />{" "}
                </div>{" "}
              </div>{" "}
              {/* Actions */}{" "}
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-gray-100">
                {" "}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedHospital);
                  }}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  {" "}
                  <FiEdit2 size={14} /> Edit{" "}
                </button>{" "}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleStatusChange(selectedHospital);
                  }}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {" "}
                  <FiPower size={14} />{" "}
                  {selectedHospital.status === "ACTIVE"
                    ? "Deactivate"
                    : "Activate"}{" "}
                </button>{" "}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleDelete(selectedHospital);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold flex items-center gap-2"
                >
                  {" "}
                  <FiTrash2 size={14} /> Delete{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
} /* -------------------- Small UI Components -------------------- */

function StatCard({ title, value, icon: Icon, description, iconClass }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {" "}
      <div className="flex items-start justify-between">
        {" "}
        <div>
          {" "}
          <p className="text-sm font-medium text-gray-500"> {title} </p>{" "}
          <p className="text-3xl font-bold text-gray-800 mt-2"> {value} </p>{" "}
          <p className="text-xs text-gray-400 mt-1"> {description} </p>{" "}
        </div>{" "}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {" "}
          <Icon size={20} />{" "}
        </div>{" "}
      </div>{" "}
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
      {" "}
      {children}{" "}
    </button>
  );
}
function FormField({ label, required = false, children }) {
  return (
    <div>
      {" "}
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {" "}
        {label}{" "}
        {required && <span className="text-red-500 ml-1"> * </span>}{" "}
      </label>{" "}
      {children}{" "}
    </div>
  );
}
function DetailItem({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3.5">
      {" "}
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
        {" "}
        {label}{" "}
      </p>{" "}
      <p className="text-sm font-semibold text-gray-700 mt-1 break-words">
        {" "}
        {value || "—"}{" "}
      </p>{" "}
    </div>
  );
}
function ContactDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      {" "}
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
        {" "}
        <Icon size={15} />{" "}
      </div>{" "}
      <div>
        {" "}
        <p className="text-[11px] text-gray-400"> {label} </p>{" "}
        <p className="text-sm font-medium text-gray-700">
          {" "}
          {value || "—"}{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}
