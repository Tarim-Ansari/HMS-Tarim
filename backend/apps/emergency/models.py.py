from django.conf import settings
from django.db import models
from apps.patients.models import Patient
class EmergencyCase(models.Model):
    class Priority(models.TextChoices): CRITICAL="CRITICAL","Critical"; HIGH="HIGH","High"; MEDIUM="MEDIUM","Medium"; LOW="LOW","Low"
    class Status(models.TextChoices): OPEN="OPEN","Open"; IN_TREATMENT="IN_TREATMENT","In Treatment"; DISCHARGED="DISCHARGED","Discharged"; REFERRED="REFERRED","Referred"
    patient=models.ForeignKey(Patient,on_delete=models.CASCADE,related_name="emergency_cases")
    branch=models.ForeignKey("branches.Branch",on_delete=models.SET_NULL,null=True,blank=True,related_name="emergency_cases")
    priority=models.CharField(max_length=20,choices=Priority.choices,default=Priority.MEDIUM)
    chief_complaint=models.TextField()
    vitals=models.TextField(blank=True)
    treatment=models.TextField(blank=True)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.OPEN)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["-created_at"]
