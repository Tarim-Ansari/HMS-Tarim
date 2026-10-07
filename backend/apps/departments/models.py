# from django.db import models

# # Create your models here.

# class Department(models.Model):
#     name = models.CharField(max_length=100)
#     address = models.TextField()
#     hospital = models.ForeignKey("hospitals.Hospital", on_delete=models.CASCADE, related_name="branches")
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.name



from django.db import models
from django.utils import timezone


class Department(models.Model):
    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    )

    branch = models.ForeignKey(
        "branches.Branch",
        on_delete=models.CASCADE,
        related_name="departments",
        null=True,
        blank=True
    )
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, default="")
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return f"{self.name} ({self.code})"