from rest_framework import serializers
from .models import MedicalRecord
class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name=serializers.CharField(source="patient.full_name",read_only=True)
    doctor_name=serializers.SerializerMethodField()
    class Meta:
        model=MedicalRecord
        fields="__all__"
        read_only_fields=["id","patient_name","doctor_name","created_by","created_at","updated_at"]
    def get_doctor_name(self,obj): return (obj.doctor.user.get_full_name() or obj.doctor.user.username) if obj.doctor else None
