# MediCore HMS Backend

## 1. Environment
Copy `.env.example` to `.env` and fill PostgreSQL and Gmail values.

## 2. Install
python -m venv venv
Windows: `venv\Scripts\activate`
`pip install -r requirements.txt`

## 3. Database
`python manage.py makemigrations`
`python manage.py migrate`

The new Doctor, Nurse, Appointment, Laboratory, Pharmacy and Billing models are included in the source. Run `makemigrations` once on the development machine because this build environment does not have Django packages installed.

## 4. Run
`python manage.py runserver`

API base: `http://127.0.0.1:8000/api/`

Important auth flow:
- Patient register: POST `/api/accounts/patient/register/`
- Patient OTP: POST `/api/accounts/patient/verify-otp/`
- Login: POST `/api/accounts/login/`
- Refresh: POST `/api/accounts/token/refresh/`
- Current user: GET `/api/accounts/me/`
- Logout: POST `/api/accounts/logout/`

Domain endpoints:
- `/api/patients/`
- `/api/hospitals/hospitals/`
- `/api/branches/`
- `/api/departments/`
- `/api/doctors/`
- `/api/nurses/`
- `/api/appointments/`
- `/api/laboratory/`
- `/api/pharmacy/medicines/`
- `/api/pharmacy/prescriptions/`
- `/api/billing/`
- `/api/accounts/staff/`

## 5. Super User
Use the existing superuser registration/OTP flow, or create one with Django's createsuperuser command if appropriate for the deployment.

## Notes
The API enforces hospital/branch scoping for the main clinical resources. Review your organization's clinical and privacy requirements before production deployment.
