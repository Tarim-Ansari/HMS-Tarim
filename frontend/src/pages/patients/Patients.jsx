import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiFileText, FiEye } from "react-icons/fi";
import ResourcePage from "../../components/common/ResourcePage";
import PatientDetailModal from "../../components/patients/PatientDetailModal";
import { patientApi } from "../../api/service";

const ADMIN_ROLES = [
  "SUPER_USER",
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
];

export default function Patients() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <>
      <ResourcePage
        title="Patients"
        subtitle="Manage patient records, clinical charts, and registrations"
        api={patientApi}
        manageRoles={ADMIN_ROLES}
        canCreate={true}
        showEdit
        showDeactivate
        showDelete
        searchPlaceholder="Search patients by name, ID, phone or email..."
        columns={[
          {
            key: "patient_id",
            label: "Patient ID",
            render: (row) => (
              <button
                type="button"
                onClick={() => setSelectedPatient(row)}
                className="font-mono text-xs font-semibold text-medicore-600 hover:text-medicore-800 hover:underline cursor-pointer"
                title="View Patient Chart"
              >
                {row.patient_id || row.id || "—"}
              </button>
            ),
          },
          {
            key: "full_name",
            label: "Patient",
            render: (row) => {
              const name =
                row.full_name ||
                [row.first_name, row.last_name]
                  .filter(Boolean)
                  .join(" ") ||
                "—";
              return (
                <button
                  type="button"
                  onClick={() => setSelectedPatient(row)}
                  className="font-medium text-gray-900 hover:text-medicore-600 hover:underline cursor-pointer text-left"
                  title="View Patient Chart"
                >
                  {name}
                </button>
              );
            },
          },
          {
            key: "mobile_number",
            label: "Mobile",
            render: (row) =>
              row.mobile_number ||
              row.phone ||
              "—",
          },
          {
            key: "gender",
            label: "Gender",
            render: (row) =>
              row.gender
                ? String(row.gender)
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) =>
                      c.toUpperCase(),
                    )
                : "—",
          },
        {
          key: "branch_name",
          label: "Branch",
          render: (row) =>
            row.branch_name ||
            row.branch?.name ||
            row.branch ||
            "—",
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
        {
          key: "created_at",
          label: "Registered",
          render: (row) =>
            row.created_at
              ? new Date(
                  row.created_at,
                ).toLocaleDateString()
              : "—",
        },
        {
          key: "clinical_chart",
          label: "Clinical Chart",
          render: (row) => (
            <button
              type="button"
              onClick={() => setSelectedPatient(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-medicore-50 text-medicore-700 hover:bg-medicore-100 hover:text-medicore-800 border border-medicore-200 transition-colors cursor-pointer shadow-xs"
              title="Open full clinical chart, history, vitals & prescriptions"
            >
              <FiEye size={13} />
              <span>View Details</span>
            </button>
          ),
        },
      ]}
      fields={[
        {
          name: "first_name",
          label: "First Name",
          required: true,
        },
        {
          name: "middle_name",
          label: "Middle Name",
        },
        {
          name: "last_name",
          label: "Last Name",
          required: true,
        },
        {
          name: "date_of_birth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
            {
              value: "prefer_not_to_say",
              label: "Prefer not to say",
            },
          ],
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "mobile_number",
          label: "Mobile Number",
          required: true,
        },
        {
          name: "address_line",
          label: "Address",
          type: "textarea",
          required: true,
          full: true,
        },
        {
          name: "city",
          label: "City",
          required: true,
        },
        {
          name: "state",
          label: "State",
          required: true,
        },
        {
          name: "postal_code",
          label: "Postal Code",
          required: true,
        },
        {
          name: "country",
          label: "Country",
          default: "India",
        },
        {
          name: "branch",
          label: "Branch ID",
          required: true,
        },
        {
          name: "id_proof_type",
          label: "ID Proof Type",
          type: "select",
          options: [
            {
              value: "",
              label: "Select",
            },
            {
              value: "aadhaar",
              label: "Aadhaar",
            },
            {
              value: "passport",
              label: "Passport",
            },
            {
              value: "driving_license",
              label: "Driving License",
            },
            {
              value: "voter_id",
              label: "Voter ID",
            },
            {
              value: "other",
              label: "Other",
            },
          ],
        },
        {
          name: "id_proof_number",
          label: "ID Proof Number",
        },
      ]}
      emptyMessage={
        <span>
          No patients found.{" "}
          <Link
            to="/patients/register"
            className="text-medicore-600 font-medium hover:underline"
          >
            Register a patient
          </Link>
          .
        </span>
      }
    />

    {selectedPatient && (
      <PatientDetailModal
        patient={selectedPatient}
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        onPatientUpdated={() => {}}
      />
    )}
  </>
  );
}
