from rest_framework import serializers
from .models import EmergencyCase
class EmergencyCaseSerializer(serializers.ModelSerializer):
    patient_name=serializers.CharField(source="patient.full_name",read_only=True)
    class Meta:
        model=EmergencyCase; fields="__all__"; read_only_fields=["id","patient_name","created_by","created_at","updated_at"]
