from rest_framework import serializers
from .models import Admission
class AdmissionSerializer(serializers.ModelSerializer):
    patient_name=serializers.CharField(source="patient.full_name",read_only=True)
    branch_name=serializers.CharField(source="branch.name",read_only=True)
    class Meta:
        model=Admission
        fields="__all__"
        read_only_fields=["id","patient_name","branch_name","admission_date","created_by"]
