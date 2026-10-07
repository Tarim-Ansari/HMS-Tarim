from django.conf import settings
from django.db import models
from apps.patients.models import Patient
from apps.doctors.models import DoctorProfile

class Medicine(models.Model):
    name=models.CharField(max_length=150)
    generic_name=models.CharField(max_length=150,blank=True)
    sku=models.CharField(max_length=80,unique=True)
    category=models.CharField(max_length=100,blank=True)
    manufacturer=models.CharField(max_length=150,blank=True)
    batch_number=models.CharField(max_length=100,blank=True)
    expiry_date=models.DateField(null=True,blank=True)
    quantity=models.PositiveIntegerField(default=0)
    reorder_level=models.PositiveIntegerField(default=10)
    unit_price=models.DecimalField(max_digits=10,decimal_places=2,default=0)
    is_active=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["name"]

class Prescription(models.Model):
    class Status(models.TextChoices): ACTIVE="ACTIVE","Active"; DISPENSED="DISPENSED","Dispensed"; CANCELLED="CANCELLED","Cancelled"
    patient=models.ForeignKey(Patient,on_delete=models.CASCADE,related_name="prescriptions")
    doctor=models.ForeignKey(DoctorProfile,on_delete=models.SET_NULL,null=True,blank=True,related_name="prescriptions")
    medicine=models.ForeignKey(Medicine,on_delete=models.PROTECT,related_name="prescriptions")
    dosage=models.CharField(max_length=100)
    frequency=models.CharField(max_length=100)
    duration_days=models.PositiveIntegerField(default=1)
    instructions=models.TextField(blank=True)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.ACTIVE)
    prescribed_at=models.DateTimeField(auto_now_add=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    class Meta: ordering=["-prescribed_at"]


class PharmacistProfile(models.Model):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="pharmacist_profile")
    license_number=models.CharField(max_length=100,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
