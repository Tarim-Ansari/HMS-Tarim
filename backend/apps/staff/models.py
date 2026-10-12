from django.conf import settings
from django.db import models
class StaffNote(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="staff_notes")
    note=models.TextField()
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="created_staff_notes")
    created_at=models.DateTimeField(auto_now_add=True)
