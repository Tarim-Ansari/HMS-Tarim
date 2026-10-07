# MediCore HMS - Hospital Management System

A comprehensive multi-role Hospital Management System (HMS) built with **Django REST Framework** on the backend and **React + Vite + Tailwind CSS** on the frontend.

---

## 🏥 Features & Modules

- **Authentication & RBAC:** Multi-role authorization with JWT token rotation and blacklist support.
- **Roles Supported:**
  - `SUPER_USER` / `SUPER_ADMIN`: Complete platform management (Hospitals, Branches, Hospital Admins).
  - `HOSPITAL_ADMIN`: Operations management, Department creation, Staff administration.
  - `DOCTOR`: Patient consultations, EMR records, appointment tracking, prescriptions.
  - `NURSE`: In-patient department (IPD), vital monitoring, bed allocations.
  - `RECEPTIONIST`: Patient intake and registration, appointment scheduling.
  - `LAB_TECHNICIAN`: Lab test ordering, status tracking, and report management.
  - `PHARMACIST`: Medication inventory and prescription fulfillment.
  - `ACCOUNTANT`: Billing management, invoices, payments, and financial analytics.
  - `PATIENT`: Appointment booking, medical records, and prescription views.
- **Clinical & Operational Resources:**
  - Hospitals, Branches, and Departments management
  - Doctor and Nurse profiles
  - Patient management and OTP verification
  - Appointments scheduling and status workflows
  - Pharmacy and Prescriptions management
  - Laboratory tests and results
  - Inpatient (IPD) and Emergency tracking
  - Billing and Invoicing

---

## 🛠️ Tech Stack

- **Backend:** Python, Django 6, Django REST Framework, SimpleJWT, PostgreSQL / psycopg3, django-filter, django-cors-headers
- **Frontend:** React 19, Vite, Redux Toolkit, React Router 7, Tailwind CSS, Lucide React, Recharts, React Hot Toast

---

## 🚀 Getting Started

### Prerequisites

- **Python:** 3.12+ (or 3.13 / 3.14)
- **Node.js:** v18+ (or v20 / v24)
- **PostgreSQL:** 14+

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   Copy `.env.example` to `.env` and fill in your database credentials:
   ```env
   DB_NAME=check_hospital
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   SUPERUSER_REGISTRATION_SECRET=your_secret_key
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_app_password
   ```

5. **Apply Database Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create Superuser (Optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the Django Development Server:**
   ```bash
   python manage.py runserver
   ```
   API runs at: `http://127.0.0.1:8000/api/`

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create `.env` based on `.env.example`:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
HMS-Tarim/
├── backend/
│   ├── apps/
│   │   ├── accounts/         # Users, authentication, OTP, roles
│   │   ├── appointments/     # Appointment scheduling
│   │   ├── billing/          # Invoices, billing records
│   │   ├── branches/         # Hospital branch management
│   │   ├── departments/      # Clinical & admin departments
│   │   ├── doctors/          # Doctor profiles & availability
│   │   ├── hospitals/        # Multi-hospital management
│   │   ├── laboratory/       # Lab tests and reports
│   │   ├── nurses/           # Nurse profiles & assignments
│   │   ├── patients/         # Patient registration and records
│   │   ├── pharmacy/         # Medicines and prescriptions
│   │   ├── receptionist/     # Front desk management
│   │   └── staff/            # Staff directory
│   ├── config/               # Django settings and URL routes
│   ├── hospitals/            # Media logos
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/               # Public assets and icons
│   ├── src/
│   │   ├── api/              # API clients & service endpoints
│   │   ├── components/       # Common & layout UI components
│   │   ├── pages/            # Role-specific dashboard & domain pages
│   │   ├── store/            # Redux store & slices
│   │   ├── App.jsx           # Main routing & protected routes
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── .gitignore
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License.
