from django.conf import settings
from django.db import models
class AccountantProfile(models.Model):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="accountant_profile")
    employee_code=models.CharField(max_length=50,blank=True)
    qualification=models.CharField(max_length=255,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
