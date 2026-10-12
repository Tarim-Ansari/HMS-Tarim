from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

@receiver(post_save, sender=User)
def create_role_profile(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.role == "DOCTOR":
        from apps.doctors.models import DoctorProfile
        DoctorProfile.objects.get_or_create(user=instance, defaults={"specialization": "General Medicine"})
    elif instance.role == "NURSE":
        from apps.nurses.models import NurseProfile
        NurseProfile.objects.get_or_create(user=instance)
    elif instance.role == "LAB_TECHNICIAN":
        from apps.laboratory.models import LabTechnicianProfile
        LabTechnicianProfile.objects.get_or_create(user=instance)
    elif instance.role == "PHARMACIST":
        from apps.pharmacy.models import PharmacistProfile
        PharmacistProfile.objects.get_or_create(user=instance)
    elif instance.role == "ACCOUNTANT":
        from apps.accounting.models import AccountantProfile
        AccountantProfile.objects.get_or_create(user=instance)
    elif instance.role == "RECEPTIONIST":
        from apps.receptionist.models import ReceptionistProfile
        ReceptionistProfile.objects.get_or_create(user=instance)
