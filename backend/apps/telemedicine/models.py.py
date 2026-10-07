from django.conf import settings
from django.db import models
from apps.patients.models import Patient
from apps.doctors.models import DoctorProfile
class TelemedicineSession(models.Model):
    class Status(models.TextChoices): SCHEDULED="SCHEDULED","Scheduled"; LIVE="LIVE","Live"; COMPLETED="COMPLETED","Completed"; CANCELLED="CANCELLED","Cancelled"
    patient=models.ForeignKey(Patient,on_delete=models.CASCADE,related_name="telemedicine_sessions")
    doctor=models.ForeignKey(DoctorProfile,on_delete=models.CASCADE,related_name="telemedicine_sessions")
    scheduled_at=models.DateTimeField()
    meeting_url=models.URLField(blank=True)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.SCHEDULED)
    notes=models.TextField(blank=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: ordering=["-scheduled_at"]
