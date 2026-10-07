from django.conf import settings
from django.db import models
from apps.patients.models import Patient
class Admission(models.Model):
    class Status(models.TextChoices): ADMITTED="ADMITTED","Admitted"; DISCHARGED="DISCHARGED","Discharged"; TRANSFERRED="TRANSFERRED","Transferred"
    patient=models.ForeignKey(Patient,on_delete=models.CASCADE,related_name="admissions")
    branch=models.ForeignKey("branches.Branch",on_delete=models.SET_NULL,null=True,blank=True,related_name="admissions")
    ward=models.CharField(max_length=100)
    bed_number=models.CharField(max_length=50)
    admission_date=models.DateTimeField(auto_now_add=True)
    discharge_date=models.DateTimeField(null=True,blank=True)
    diagnosis=models.TextField(blank=True)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.ADMITTED)
    notes=models.TextField(blank=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    class Meta: ordering=["-admission_date"]
