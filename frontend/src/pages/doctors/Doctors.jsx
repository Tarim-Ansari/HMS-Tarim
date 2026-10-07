import React from "react";
import ResourcePage from "../../components/common/ResourcePage";
import { doctorApi } from "../../api/service";

const ADMIN_ROLES = [
  "SUPER_USER",
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
];

export default function Doctors() {
  return (
    <ResourcePage
      title="Doctors"
      subtitle="Manage doctors, specializations, availability and status"
      api={doctorApi}
      manageRoles={ADMIN_ROLES}
      canCreate={true}
      showEdit
      showDeactivate
      showDelete
      searchPlaceholder="Search doctors by name, specialization or registration..."
      columns={[
        {
          key: "full_name",
          label: "Doctor",
          render: (row) =>
            row.full_name ||
            [
              row.first_name,
              row.last_name,
            ]
              .filter(Boolean)
              .join(" ") ||
            "—",
        },
        {
          key: "specialization",
          label: "Specialization",
          render: (row) =>
            row.specialization || "—",
        },
        {
          key: "department_name",
          label: "Department",
          render: (row) =>
            row.department_name ||
            row.department?.name ||
            row.department ||
            "—",
        },
        {
          key: "experience_years",
          label: "Experience",
          render: (row) =>
            row.experience_years !==
            undefined
              ? `${row.experience_years} yrs`
              : "—",
        },
        {
          key: "consultation_fee",
          label: "Fee",
          render: (row) =>
            row.consultation_fee !==
            undefined
              ? `₹${row.consultation_fee}`
              : "—",
        },
        {
          key: "is_active",
          label: "Status",
          render: (row) => {
            const active =
              row.is_active !== false;

            return (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {active
                  ? "Active"
                  : "Inactive"}
              </span>
            );
          },
        },
      ]}
      fields={[
        {
          name: "first_name",
          label: "First Name",
          required: true,
        },
        {
          name: "last_name",
          label: "Last Name",
          required: true,
        },
        {
          name: "phone",
          label: "Phone",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
        },
        {
          name: "branch",
          label: "Branch ID",
          required: true,
        },
        {
          name: "department",
          label: "Department ID",
          required: true,
        },
        {
          name: "specialization",
          label: "Specialization",
          required: true,
          default: "General Medicine",
        },
        {
          name: "license_number",
          label: "License / Registration Number",
          required: true,
        },
        {
          name: "consultation_fee",
          label: "Consultation Fee",
          type: "number",
          default: 0,
        },
        {
          name: "experience_years",
          label: "Experience Years",
          type: "number",
          default: 0,
        },
        {
          name: "status",
          label: "Availability Status",
          type: "select",
          default: "AVAILABLE",
          options: [
            {
              value: "AVAILABLE",
              label: "Available",
            },
            {
              value: "IN_CONSULTATION",
              label: "In Consultation",
            },
            {
              value: "IN_SURGERY",
              label: "In Surgery",
            },
            {
              value: "ON_LEAVE",
              label: "On Leave",
            },
          ],
        },
        {
          name: "bio",
          label: "Bio",
          type: "textarea",
          full: true,
        },
        {
          name: "available_from",
          label: "Available From",
          type: "time",
        },
        {
          name: "available_to",
          label: "Available To",
          type: "time",
        },
      ]}
    />
  );
}
