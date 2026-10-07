from django.conf import settings
from django.db import models
from apps.patients.models import Patient
from apps.doctors.models import DoctorProfile

class MedicalRecord(models.Model):
    patient=models.ForeignKey(Patient,on_delete=models.CASCADE,related_name="medical_records")
    doctor=models.ForeignKey(DoctorProfile,on_delete=models.SET_NULL,null=True,blank=True,related_name="medical_records")
    diagnosis=models.TextField(blank=True)
    symptoms=models.TextField(blank=True)
    allergies=models.TextField(blank=True)
    medications=models.TextField(blank=True)
    clinical_notes=models.TextField(blank=True)
    follow_up_date=models.DateField(null=True,blank=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["-created_at"]
