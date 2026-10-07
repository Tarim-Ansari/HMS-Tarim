from django.conf import settings
from django.db import models
from apps.patients.models import Patient
from apps.doctors.models import DoctorProfile

class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED="SCHEDULED","Scheduled"; CONFIRMED="CONFIRMED","Confirmed"; COMPLETED="COMPLETED","Completed"
        CANCELLED="CANCELLED","Cancelled"; NO_SHOW="NO_SHOW","No Show"
    patient=models.ForeignKey(Patient,on_delete=models.CASCADE,related_name="appointments")
    doctor=models.ForeignKey(DoctorProfile,on_delete=models.CASCADE,related_name="appointments")
    branch=models.ForeignKey("branches.Branch",on_delete=models.SET_NULL,null=True,blank=True,related_name="appointments")
    appointment_date=models.DateField()
    appointment_time=models.TimeField()
    reason=models.TextField(blank=True)
    notes=models.TextField(blank=True)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.SCHEDULED)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="created_appointments")
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["appointment_date","appointment_time"]
