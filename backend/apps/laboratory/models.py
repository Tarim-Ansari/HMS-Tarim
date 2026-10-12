from django.conf import settings
from django.db import models
from apps.patients.models import Patient
from apps.doctors.models import DoctorProfile

class LabOrder(models.Model):
    class Status(models.TextChoices):
        ORDERED="ORDERED","Ordered"; SAMPLE_COLLECTED="SAMPLE_COLLECTED","Sample Collected"; PROCESSING="PROCESSING","Processing"; COMPLETED="COMPLETED","Completed"; CANCELLED="CANCELLED","Cancelled"
    patient=models.ForeignKey(Patient,on_delete=models.CASCADE,related_name="lab_orders")
    doctor=models.ForeignKey(DoctorProfile,on_delete=models.SET_NULL,null=True,blank=True,related_name="lab_orders")
    test_name=models.CharField(max_length=200)
    test_code=models.CharField(max_length=50,blank=True)
    instructions=models.TextField(blank=True)
    result=models.TextField(blank=True)
    result_file=models.FileField(upload_to="laboratory/reports/",null=True,blank=True)
    status=models.CharField(max_length=30,choices=Status.choices,default=Status.ORDERED)
    ordered_at=models.DateTimeField(auto_now_add=True)
    completed_at=models.DateTimeField(null=True,blank=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    class Meta: ordering=["-ordered_at"]


class LabTechnicianProfile(models.Model):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="lab_technician_profile")
    certification=models.CharField(max_length=255,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
