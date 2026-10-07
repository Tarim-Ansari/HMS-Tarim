from django.conf import settings
from django.db import models

class NurseProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="nurse_profile")
    qualification = models.CharField(max_length=255, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=120, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    shift = models.CharField(max_length=30, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__first_name", "user__last_name"]
