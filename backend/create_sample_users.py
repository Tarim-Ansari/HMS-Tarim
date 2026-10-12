import os
import sys
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, time, timedelta

from apps.hospitals.models import Hospital
from apps.branches.models import Branch
from apps.departments.models import Department
from apps.doctors.models import DoctorProfile
from apps.nurses.models import NurseProfile
from apps.patients.models import Patient
from apps.receptionist.models import ReceptionistProfile
from apps.pharmacy.models import PharmacistProfile, Medicine, Prescription
from apps.laboratory.models import LabTechnicianProfile, LabOrder
from apps.billing.models import Invoice, InvoiceItem
from apps.appointments.models import Appointment
from apps.emr.models import MedicalRecord
from apps.ipd.models import Bed, Admission, PatientVital, NurseTask

User = get_user_model()

PASSWORD = "Medicore@123"

def main():
    print("=" * 60)
    print("CREATING / UPDATING SAMPLE REAL USERS FOR ALL 9 ROLES")
    print("=" * 60)

    # 1. Base Hospital, Branch & Departments
    hospital, _ = Hospital.objects.get_or_create(
        id=1,
        defaults={
            "name": "MediCore Central Hospital",
            "code": "MCH-01",
            "registration_number": "REG-HOSP-2026-001",
            "address": "100 Healthcare Boulevard, Metro City",
            "contact_email": "admin@medicore.com",
            "contact_phone": "+91 9876543210",
            "is_active": True,
        }
    )

    branch, _ = Branch.objects.get_or_create(
        id=1,
        defaults={
            "hospital": hospital,
            "name": "Main City Campus",
            "code": "MCH-MAIN",
            "address": "100 Healthcare Boulevard, Metro City",
            "contact_phone": "+91 9876543211",
            "contact_email": "main.branch@medicore.com",
            "is_active": True,
        }
    )

    dept_cardio, _ = Department.objects.get_or_create(
        name="Cardiology",
        defaults={
            "branch": branch,
            "code": "CARDIO",
            "description": "Cardiovascular Medicine and Interventions",
            "status": "ACTIVE",
        }
    )

    dept_general, _ = Department.objects.get_or_create(
        name="General Medicine",
        defaults={
            "branch": branch,
            "code": "GEN-MED",
            "description": "General Internal Medicine and Adult Inpatient Care",
            "status": "ACTIVE",
        }
    )

    dept_emergency, _ = Department.objects.get_or_create(
        name="Emergency & Trauma",
        defaults={
            "branch": branch,
            "code": "EMERGENCY",
            "description": "Acute Emergency Care and Critical Resuscitation",
            "status": "ACTIVE",
        }
    )

    def create_or_update_user(username, email, role, first_name, last_name, phone, dept=None, is_super=False):
        u, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email}
        )
        u.email = email
        u.role = role
        u.first_name = first_name
        u.last_name = last_name
        u.phone = phone
        u.hospital = hospital
        u.branch = branch
        u.department = dept
        u.is_approved = True
        u.is_email_verified = True
        u.is_active = True
        if is_super:
            u.is_staff = True
            u.is_superuser = True
        u.set_password(PASSWORD)
        u.save()
        status = "Created" if created else "Updated"
        print(f"[{status}] User: {u.username} | Role: {u.role} | Email: {u.email}")
        return u

    # =========================================================
    # ROLE 1: SUPER USER
    # =========================================================
    super_user = create_or_update_user(
        username="admin",
        email="admin@medicore.com",
        role="SUPER_USER",
        first_name="System",
        last_name="SuperAdmin",
        phone="+91 9800000001",
        is_super=True
    )

    # =========================================================
    # ROLE 2: HOSPITAL ADMIN
    # =========================================================
    hosp_admin = create_or_update_user(
        username="admin_vikram",
        email="vikram.admin@medicore.com",
        role="HOSPITAL_ADMIN",
        first_name="Vikram",
        last_name="Mehta",
        phone="+91 9800000002"
    )

    # =========================================================
    # ROLE 3: DOCTOR
    # =========================================================
    doctor_user = create_or_update_user(
        username="dr_sharma",
        email="dr.sharma@medicore.com",
        role="DOCTOR",
        first_name="Rajesh",
        last_name="Sharma",
        phone="+91 9800000003",
        dept=dept_cardio
    )
    doc_profile, _ = DoctorProfile.objects.get_or_create(
        user=doctor_user,
        defaults={
            "specialization": "Interventional Cardiology",
            "qualification": "MD, DM (Cardiology), FACC",
            "registration_number": "MCI-CARD-2015-8842",
            "experience_years": 14,
            "consultation_fee": 800.00,
            "bio": "Senior Consultant Cardiologist specializing in adult cardiovascular care and preventive cardiology.",
            "available_from": time(9, 0),
            "available_to": time(17, 0),
            "is_available": True,
        }
    )

    # =========================================================
    # ROLE 4: NURSE
    # =========================================================
    nurse_user = create_or_update_user(
        username="nurse_anita",
        email="anita.nurse@medicore.com",
        role="NURSE",
        first_name="Anita",
        last_name="Deshmukh",
        phone="+91 9800000004",
        dept=dept_general
    )
    nurse_profile, _ = NurseProfile.objects.get_or_create(
        user=nurse_user,
        defaults={
            "qualification": "B.Sc Nursing, Critical Care Certification",
            "registration_number": "INC-NUR-2018-4491",
            "specialization": "Inpatient Ward & Critical Care",
            "experience_years": 7,
            "shift": "Morning",
            "is_available": True,
        }
    )

    # =========================================================
    # ROLE 5: RECEPTIONIST
    # =========================================================
    receptionist_user = create_or_update_user(
        username="reception_priya",
        email="priya.reception@medicore.com",
        role="RECEPTIONIST",
        first_name="Priya",
        last_name="Verma",
        phone="+91 9800000005"
    )
    rec_profile, _ = ReceptionistProfile.objects.get_or_create(
        user=receptionist_user,
        defaults={
            "employee_code": "REC-MCH-01",
            "shift": "Day",
        }
    )

    # =========================================================
    # ROLE 6: PHARMACIST
    # =========================================================
    pharmacist_user = create_or_update_user(
        username="pharm_rahul",
        email="rahul.pharmacy@medicore.com",
        role="PHARMACIST",
        first_name="Rahul",
        last_name="Gupta",
        phone="+91 9800000006"
    )
    pharm_profile, _ = PharmacistProfile.objects.get_or_create(
        user=pharmacist_user,
        defaults={
            "license_number": "PHARM-LIC-2017-9102",
        }
    )

    # =========================================================
    # ROLE 7: LAB TECHNICIAN
    # =========================================================
    lab_user = create_or_update_user(
        username="lab_suresh",
        email="suresh.lab@medicore.com",
        role="LAB_TECHNICIAN",
        first_name="Suresh",
        last_name="Patel",
        phone="+91 9800000007"
    )
    lab_profile, _ = LabTechnicianProfile.objects.get_or_create(
        user=lab_user,
        defaults={
            "certification": "Diploma in Medical Laboratory Technology (DMLT), NABL Certified",
        }
    )

    # =========================================================
    # ROLE 8: ACCOUNTANT
    # =========================================================
    accountant_user = create_or_update_user(
        username="acc_neha",
        email="neha.finance@medicore.com",
        role="ACCOUNTANT",
        first_name="Neha",
        last_name="Joshi",
        phone="+91 9800000008"
    )

    # =========================================================
    # ROLE 9: PATIENT
    # =========================================================
    patient_user = create_or_update_user(
        username="patient_aman",
        email="aman.kumar@medicore.com",
        role="PATIENT",
        first_name="Aman",
        last_name="Kumar",
        phone="+91 9800000009"
    )

    patient_record, created_pat = Patient.objects.get_or_create(
        user=patient_user,
        defaults={
            "first_name": "Aman",
            "last_name": "Kumar",
            "date_of_birth": date(1994, 6, 15),
            "gender": "male",
            "email": patient_user.email,
            "mobile_number": patient_user.phone,
            "address_line": "Flat 402, Green Avenue, Metro City",
            "city": "Metro City",
            "state": "Maharashtra",
            "postal_code": "400001",
            "country": "India",
            "branch": branch,
            "email_verified": True,
            "mobile_verified": True,
        }
    )
    if not created_pat:
        patient_record.branch = branch
        patient_record.email_verified = True
        patient_record.mobile_verified = True
        patient_record.save()

    print(f"[Linked] Patient Profile ID: {patient_record.patient_id} linked to User: {patient_user.username}")

    # =========================================================
    # SEED REAL DATA CONNECTED TO SAMPLE USERS
    # =========================================================

    # 1. Appointment for Patient with Doctor
    app_date = date.today()
    apt, _ = Appointment.objects.get_or_create(
        patient=patient_record,
        doctor=doc_profile,
        appointment_date=app_date,
        defaults={
            "branch": branch,
            "appointment_time": time(10, 30),
            "reason": "Routine Cardiovascular Follow-up & Blood Pressure Check",
            "notes": "Patient reported mild exertional fatigue. Vitals to be taken before consultation.",
            "status": "CONFIRMED",
            "created_by": receptionist_user,
        }
    )

    # 2. Medical Record for Patient by Doctor
    med_rec, _ = MedicalRecord.objects.get_or_create(
        patient=patient_record,
        doctor=doc_profile,
        diagnosis="Stage 1 Essential Hypertension (Managed)",
        defaults={
            "symptoms": "Mild headaches, elevated resting blood pressure, exertional tiredness",
            "allergies": "Penicillin (Mild rash)",
            "medications": "Telmisartan 40mg once daily morning, Atorvastatin 10mg night",
            "clinical_notes": "Blood pressure stabilized at 128/82 mmHg. Advised 30 mins aerobic walking and sodium restriction.",
            "follow_up_date": app_date + timedelta(days=30),
            "created_by": doctor_user,
        }
    )

    # 3. Medicines & Prescriptions
    med1, _ = Medicine.objects.get_or_create(
        sku="MED-TEL-40",
        defaults={
            "name": "Telmisartan 40mg",
            "generic_name": "Telmisartan",
            "category": "Antihypertensive",
            "manufacturer": "Sun Pharma",
            "quantity": 250,
            "reorder_level": 30,
            "unit_price": 45.00,
            "is_active": True,
        }
    )

    presc, _ = Prescription.objects.get_or_create(
        patient=patient_record,
        doctor=doc_profile,
        medicine=med1,
        defaults={
            "dosage": "40mg",
            "frequency": "Once daily after breakfast",
            "duration_days": 30,
            "instructions": "Take consistently with water",
            "status": "ACTIVE",
            "created_by": doctor_user,
        }
    )

    # 4. Lab Order for Patient
    lab_order, _ = LabOrder.objects.get_or_create(
        patient=patient_record,
        test_name="Comprehensive Lipid Profile & Serum Creatinine",
        defaults={
            "doctor": doc_profile,
            "test_code": "LAB-LIPID-01",
            "instructions": "12-hour fasting mandatory",
            "result": "Total Cholesterol: 182 mg/dL, HDL: 48 mg/dL, LDL: 104 mg/dL, Triglycerides: 150 mg/dL, Creatinine: 0.9 mg/dL (Normal).",
            "status": "COMPLETED",
            "completed_at": timezone.now(),
            "created_by": doctor_user,
        }
    )

    # 5. Billing Invoice for Patient
    inv, _ = Invoice.objects.get_or_create(
        patient=patient_record,
        invoice_number="INV-2026-0042",
        defaults={
            "subtotal": 1250.00,
            "tax": 125.00,
            "discount": 50.00,
            "total": 1325.00,
            "paid_amount": 1325.00,
            "status": "PAID",
            "notes": "Cardiology Consultation & Diagnostic Screening",
            "created_by": accountant_user,
        }
    )

    # 6. Bed & Nursing Shift Task
    bed1, _ = Bed.objects.get_or_create(
        bed_number="GW-101",
        ward="General Ward A",
        defaults={
            "floor": "1st Floor",
            "bed_type": "STANDARD",
            "status": "AVAILABLE",
            "branch": branch,
            "daily_rate": 1500.00,
        }
    )

    task, _ = NurseTask.objects.get_or_create(
        task_name="Morning Vitals & Medication Rounds",
        defaults={
            "nurse": nurse_user,
            "patient": patient_record,
            "priority": "HIGH",
            "status": "PENDING",
            "ward": "General Ward A",
            "bed_number": "GW-101",
            "scheduled_time": "09:30 AM",
            "due_date": date.today(),
            "description": "Administer morning antihypertensive dosages and record SpO2 & BP for patient.",
        }
    )

    # 7. Patient Vitals
    vital, _ = PatientVital.objects.get_or_create(
        patient=patient_record,
        blood_pressure="128/82",
        defaults={
            "recorded_by": nurse_user,
            "recorded_at": timezone.now(),
            "heart_rate": 74,
            "temperature": 98.4,
            "oxygen_saturation": 99,
            "respiratory_rate": 16,
            "blood_glucose": 95.0,
            "weight": 70.5,
            "height": 175.0,
            "notes": "Hemodynamically stable.",
        }
    )

    print("=" * 60)
    print("SUCCESS: ALL 9 REAL SAMPLE ACCOUNTS HAVE BEEN SEEDED WITH ACTIVE DATA!")
    print(f"PASSWORD FOR ALL ACCOUNTS: {PASSWORD}")
    print("=" * 60)

if __name__ == "__main__":
    main()
