from django.conf import settings
from django.db import models
from django.utils import timezone
from apps.patients.models import Patient


class Admission(models.Model):
    class Status(models.TextChoices):
        ADMITTED = "ADMITTED", "Admitted"
        DISCHARGED = "DISCHARGED", "Discharged"
        TRANSFERRED = "TRANSFERRED", "Transferred"

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="admissions")
    branch = models.ForeignKey("branches.Branch", on_delete=models.SET_NULL, null=True, blank=True, related_name="admissions")
    ward = models.CharField(max_length=100)
    bed_number = models.CharField(max_length=50)
    admission_date = models.DateTimeField(auto_now_add=True)
    discharge_date = models.DateTimeField(null=True, blank=True)
    diagnosis = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ADMITTED)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ["-admission_date"]

    def __str__(self):
        return f"{self.patient.full_name} - {self.ward} ({self.bed_number})"


class Bed(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        OCCUPIED = "OCCUPIED", "Occupied"
        CLEANING = "CLEANING", "Cleaning"
        MAINTENANCE = "MAINTENANCE", "Maintenance"

    class BedType(models.TextChoices):
        STANDARD = "STANDARD", "Standard"
        ICU = "ICU", "ICU"
        OXYGEN = "OXYGEN", "Oxygen Support"
        VENTILATOR = "VENTILATOR", "Ventilator"
        PEDIATRIC = "PEDIATRIC", "Pediatric"
        ISOLATION = "ISOLATION", "Isolation"

    bed_number = models.CharField(max_length=50)
    ward = models.CharField(max_length=100)
    floor = models.CharField(max_length=50, blank=True, default="1st Floor")
    bed_type = models.CharField(max_length=30, choices=BedType.choices, default=BedType.STANDARD)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    branch = models.ForeignKey("branches.Branch", on_delete=models.SET_NULL, null=True, blank=True, related_name="beds")
    current_patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_beds")
    current_admission = models.ForeignKey(Admission, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_bed_records")
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["ward", "bed_number"]
        unique_together = [("ward", "bed_number")]

    def __str__(self):
        return f"{self.ward} - {self.bed_number} ({self.status})"


class PatientVital(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="vitals")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="recorded_vitals")
    recorded_at = models.DateTimeField(default=timezone.now)
    blood_pressure = models.CharField(max_length=30, blank=True)
    heart_rate = models.PositiveIntegerField(null=True, blank=True)
    temperature = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    oxygen_saturation = models.PositiveIntegerField(null=True, blank=True)
    respiratory_rate = models.PositiveIntegerField(null=True, blank=True)
    blood_glucose = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.patient.full_name} Vitals ({self.recorded_at.strftime('%Y-%m-%d %H:%M')})"


class NurseTask(models.Model):
    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        URGENT = "URGENT", "Urgent"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    nurse = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="nurse_tasks")
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name="nurse_tasks")
    task_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    ward = models.CharField(max_length=100, blank=True)
    bed_number = models.CharField(max_length=50, blank=True)
    scheduled_time = models.CharField(max_length=30, blank=True)
    due_date = models.DateField(default=timezone.now)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["status", "-due_date", "scheduled_time"]

    def __str__(self):
        return f"{self.task_name} - {self.ward} {self.bed_number} ({self.status})"
