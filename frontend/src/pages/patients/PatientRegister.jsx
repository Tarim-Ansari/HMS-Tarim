// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FiUser,
//   FiPhone,
//   FiMail,
//   FiMapPin,
//   FiCalendar,
//   FiHeart,
//   FiAlertTriangle,
//   FiUsers,
//   FiSave,
// } from "react-icons/fi";
// import PageHeader from "../../components/common/PageHeader";
// import toast from "react-hot-toast";
// import { api } from "../../api/client";

// export default function PatientRegister() {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1);
//   const [branches, setBranches] = useState([]);
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     dob: "",
//     gender: "male",
//     phone: "",
//     email: "",
//     address: "",
//     city: "Pune",
//     state: "Maharashtra",
//     pincode: "411001",
//     bloodGroup: "",
//     allergies: "",
//     medicalHistory: "",
//     emergencyContact: "",
//     emergencyPhone: "",
//     insuranceProvider: "",
//     insuranceNumber: "",
//     branch: "",
//     doctor: "",
//   });

//   useEffect(() => {
//     api
//       .get("/branches/")
//       .then((data) => {
//         const list = Array.isArray(data)
//           ? data
//           : data?.results || data?.data || [];
//         setBranches(list);
//         if (list.length > 0) {
//           setFormData((prev) => ({
//             ...prev,
//             branch: prev.branch || list[0].id,
//           }));
//         }
//       })
//       .catch(() => {});
//   }, []);

//   const updateField = (field, value) =>
//     setFormData({ ...formData, [field]: value });

//   const handleRegisterPatient = async () => {
//     const rawDigits = (formData.phone || "9823099999").replace(/[^0-9]/g, "");
//     const cleanDigits =
//       rawDigits.length >= 10 ? rawDigits.slice(-10) : "9823099999";
//     const formattedPhone = `+91${cleanDigits}`;

//     const payload = {
//       first_name: formData.firstName || "Walk-in",
//       last_name: formData.lastName || "Patient",
//       date_of_birth: formData.dob || "1995-05-15",
//       gender: (formData.gender || "male").toLowerCase(),
//       mobile_number: formattedPhone,
//       email: formData.email.trim() || `patient.${Date.now()}@example.com`,
//       address_line: formData.address || "Street address",
//       city: formData.city || "Pune",
//       state: formData.state || "Maharashtra",
//       postal_code: formData.pincode || "411001",
//       country: "India",
//       branch: formData.branch || branches[0]?.id || 1,
//     };

//     try {
//       await api.post("/patients/", payload);
//       toast.success("Patient registered successfully and saved to database!");
//       navigate("/patients");
//     } catch (err) {
//       toast.error(err.message || "Failed to register patient.");
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Register New Patient"
//         subtitle="Fill in the patient details to create a new record"
//       />

//       {/* Progress Steps */}
//       <div className="flex items-center justify-center mb-8">
//         {[
//           "Personal Info",
//           "Medical Info",
//           "Emergency & Insurance",
//           "Department",
//         ].map((label, idx) => (
//           <React.Fragment key={label}>
//             <div
//               className={`flex items-center gap-2 ${step > idx + 1 ? "text-medicore-600" : step === idx + 1 ? "text-medicore-600" : "text-gray-400"}`}
//             >
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
//                   step > idx + 1
//                     ? "bg-medicore-600 text-white"
//                     : step === idx + 1
//                       ? "bg-medicore-100 text-medicore-700 ring-2 ring-medicore-600"
//                       : "bg-gray-100 text-gray-500"
//                 }`}
//               >
//                 {step > idx + 1 ? "✓" : idx + 1}
//               </div>
//               <span className="text-sm font-medium hidden md:block">
//                 {label}
//               </span>
//             </div>
//             {idx < 3 && (
//               <div
//                 className={`w-16 h-0.5 mx-2 ${step > idx + 1 ? "bg-medicore-600" : "bg-gray-200"}`}
//               />
//             )}
//           </React.Fragment>
//         ))}
//       </div>

//       <div className="card max-w-4xl mx-auto">
//         {step === 1 && (
//           <div className="space-y-6">
//             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//               <FiUser /> Personal Information
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   First Name *
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="Enter first name"
//                   value={formData.firstName}
//                   onChange={(e) => updateField("firstName", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Last Name *
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="Enter last name"
//                   value={formData.lastName}
//                   onChange={(e) => updateField("lastName", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Date of Birth *
//                 </label>
//                 <input
//                   type="date"
//                   className="input-field"
//                   value={formData.dob}
//                   onChange={(e) => updateField("dob", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Gender *
//                 </label>
//                 <select
//                   className="input-field"
//                   value={formData.gender}
//                   onChange={(e) => updateField("gender", e.target.value)}
//                 >
//                   <option value="">Select Gender</option>
//                   <option>Male</option>
//                   <option>Female</option>
//                   <option>Other</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Phone Number *
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="+91 XXXXX XXXXX"
//                   value={formData.phone}
//                   onChange={(e) => updateField("phone", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   className="input-field"
//                   placeholder="patient@email.com"
//                   value={formData.email}
//                   onChange={(e) => updateField("email", e.target.value)}
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Address
//                 </label>
//                 <textarea
//                   className="input-field"
//                   rows={2}
//                   placeholder="Full address"
//                   value={formData.address}
//                   onChange={(e) => updateField("address", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   City
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="City"
//                   value={formData.city}
//                   onChange={(e) => updateField("city", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   State
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="State"
//                   value={formData.state}
//                   onChange={(e) => updateField("state", e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="space-y-6">
//             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//               <FiHeart /> Medical Information
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Blood Group
//                 </label>
//                 <select
//                   className="input-field"
//                   value={formData.bloodGroup}
//                   onChange={(e) => updateField("bloodGroup", e.target.value)}
//                 >
//                   <option value="">Select Blood Group</option>
//                   {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
//                     (bg) => (
//                       <option key={bg}>{bg}</option>
//                     ),
//                   )}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Known Allergies
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="e.g., Penicillin, Dust"
//                   value={formData.allergies}
//                   onChange={(e) => updateField("allergies", e.target.value)}
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Medical History
//                 </label>
//                 <textarea
//                   className="input-field"
//                   rows={4}
//                   placeholder="Previous medical conditions, surgeries, etc."
//                   value={formData.medicalHistory}
//                   onChange={(e) =>
//                     updateField("medicalHistory", e.target.value)
//                   }
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {step === 3 && (
//           <div className="space-y-6">
//             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//               <FiAlertTriangle /> Emergency Contact & Insurance
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Emergency Contact Name *
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="Contact person name"
//                   value={formData.emergencyContact}
//                   onChange={(e) =>
//                     updateField("emergencyContact", e.target.value)
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Emergency Contact Phone *
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="+91 XXXXX XXXXX"
//                   value={formData.emergencyPhone}
//                   onChange={(e) =>
//                     updateField("emergencyPhone", e.target.value)
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Insurance Provider
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="e.g., Star Health"
//                   value={formData.insuranceProvider}
//                   onChange={(e) =>
//                     updateField("insuranceProvider", e.target.value)
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Insurance Number
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="Policy number"
//                   value={formData.insuranceNumber}
//                   onChange={(e) =>
//                     updateField("insuranceNumber", e.target.value)
//                   }
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {step === 4 && (
//           <div className="space-y-6">
//             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//               <FiUsers /> Branch & Department Assignment
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Hospital Branch *
//                 </label>
//                 <select
//                   className="input-field"
//                   value={formData.branch}
//                   onChange={(e) => updateField("branch", e.target.value)}
//                 >
//                   {branches.map((b) => (
//                     <option key={b.id} value={b.id}>
//                       {b.name} ({b.branch_code})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Department
//                 </label>
//                 <select
//                   className="input-field"
//                   value={formData.department}
//                   onChange={(e) => updateField("department", e.target.value)}
//                 >
//                   <option value="">Select Department</option>
//                   {[
//                     "Cardiology",
//                     "Orthopedics",
//                     "Neurology",
//                     "Dermatology",
//                     "Gynecology",
//                     "Pulmonology",
//                     "Oncology",
//                     "ENT",
//                     "General Medicine",
//                   ].map((d) => (
//                     <option key={d}>{d}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Assign Doctor
//                 </label>
//                 <select
//                   className="input-field"
//                   value={formData.doctor}
//                   onChange={(e) => updateField("doctor", e.target.value)}
//                 >
//                   <option value="">Select Doctor</option>
//                   <option>Dr. Meera Joshi</option>
//                   <option>Dr. Anil Kulkarni</option>
//                   <option>Dr. Pooja Nair</option>
//                 </select>
//               </div>
//             </div>
//             <div className="bg-medicore-50 rounded-lg p-4">
//               <h4 className="font-medium text-medicore-700 mb-2">Summary</h4>
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <p className="text-gray-600">
//                   <strong>Name:</strong> {formData.firstName}{" "}
//                   {formData.lastName}
//                 </p>
//                 <p className="text-gray-600">
//                   <strong>Phone:</strong> {formData.phone}
//                 </p>
//                 <p className="text-gray-600">
//                   <strong>Gender:</strong> {formData.gender}
//                 </p>
//                 <p className="text-gray-600">
//                   <strong>Blood Group:</strong>{" "}
//                   {formData.bloodGroup || "Not specified"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
//           <button
//             onClick={() => setStep(Math.max(1, step - 1))}
//             className="btn-secondary"
//             disabled={step === 1}
//           >
//             Previous
//           </button>
//           {step < 4 ? (
//             <button onClick={() => setStep(step + 1)} className="btn-primary">
//               Next Step
//             </button>
//           ) : (
//             <button
//               onClick={handleRegisterPatient}
//               className="btn-success flex items-center gap-2"
//             >
//               <FiSave size={16} /> Register Patient
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }






import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  AlertCircle,
  Shield,
  Building2,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import toast from "react-hot-toast";
import { api } from "../../api/client";

export default function PatientRegister() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
    emergencyContact: "",
    emergencyPhone: "",
    insuranceProvider: "",
    insuranceNumber: "",
    branch: "",
    department: "",
    doctor: "",
  });

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await api.get("/branches/");
        setBranches(res.data || res.results || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();

    if (step !== 4) {
      nextStep();
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);

    try {
      const phone = formData.phone.replace(/\D/g, "");

      if (phone.length !== 10) {
        toast.error("Enter a valid 10 digit phone number");
        setLoading(false);
        return;
      }

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dob || null,
        gender: formData.gender,
        mobile_number: `+91${phone}`,
        email: formData.email.trim(),
        address_line: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.pincode,
        country: "India",
        branch: formData.branch || null,
      };

      await api.post("/patients/", payload);

      sessionStorage.setItem(
        "patientVerificationEmail",
        formData.email.trim()
      );

      toast.success("Registration successful. OTP sent to your email.");

      navigate(
        `/verify-otp?email=${encodeURIComponent(formData.email.trim())}`
      );
    } catch (error) {
      toast.error(
        error?.message ||
          error?.response?.data?.detail ||
          "Patient registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Patient Registration"
        subtitle="Register a new patient"
      />

      <div className="max-w-5xl mx-auto p-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= item
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {item}
                </div>

                {item < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step > item ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleRegisterPatient}>
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <User size={22} />
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">First Name</label>
                    <input
                      className="input-field w-full"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Last Name</label>
                    <input
                      className="input-field w-full"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        className="input-field w-full pl-10"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Gender</label>
                    <select
                      className="input-field w-full"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        className="input-field w-full pl-10"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10 digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Email</label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        className="input-field w-full pl-10"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2">Address</label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <textarea
                        className="input-field w-full pl-10"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">City</label>
                    <input
                      className="input-field w-full"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block mb-2">State</label>
                    <input
                      className="input-field w-full"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Pincode</label>
                    <input
                      className="input-field w-full"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <HeartPulse size={22} />
                  <h2 className="text-xl font-semibold">Medical Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Blood Group</label>
                    <select
                      className="input-field w-full"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2">Allergies</label>
                    <input
                      className="input-field w-full"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="Enter allergies"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2">Medical History</label>
                    <textarea
                      className="input-field w-full"
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Previous medical history"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <AlertCircle size={22} />
                  <h2 className="text-xl font-semibold">
                    Emergency & Insurance
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Emergency Contact</label>
                    <input
                      className="input-field w-full"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block mb-2">
                      Emergency Phone
                    </label>
                    <input
                      className="input-field w-full"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block mb-2">
                      Insurance Provider
                    </label>
                    <div className="relative">
                      <Shield
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        className="input-field w-full pl-10"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">
                      Insurance Number
                    </label>
                    <input
                      className="input-field w-full"
                      name="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Building2 size={22} />
                  <h2 className="text-xl font-semibold">
                    Branch & Department Assignment
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Branch</label>
                    <select
                      className="input-field w-full"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Branch</option>

                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2">Department</label>
                    <input
                      className="input-field w-full"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Department"
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Doctor</label>
                    <div className="relative">
                      <Stethoscope
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <input
                        className="input-field w-full pl-10"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                        placeholder="Doctor"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="font-semibold mb-4">Registration Summary</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <p>
                      <strong>Name:</strong> {formData.firstName}{" "}
                      {formData.lastName}
                    </p>

                    <p>
                      <strong>Email:</strong> {formData.email}
                    </p>

                    <p>
                      <strong>Phone:</strong> {formData.phone}
                    </p>

                    <p>
                      <strong>Gender:</strong> {formData.gender}
                    </p>

                    <p>
                      <strong>City:</strong> {formData.city}
                    </p>

                    <p>
                      <strong>Blood Group:</strong>{" "}
                      {formData.bloodGroup || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 1 || loading}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {step < 4 ? (
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={loading}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Patient"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}