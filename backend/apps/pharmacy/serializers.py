from rest_framework import serializers
from .models import Medicine,Prescription
class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model=Medicine; fields="__all__"; read_only_fields=["id","created_at","updated_at"]
class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name=serializers.CharField(source="patient.full_name",read_only=True)
    medicine_name=serializers.CharField(source="medicine.name",read_only=True)
    doctor_name=serializers.SerializerMethodField()
    class Meta:
        model=Prescription
        fields=["id","patient","patient_name","doctor","doctor_name","medicine","medicine_name","dosage","frequency","duration_days","instructions","status","prescribed_at","created_by"]
        read_only_fields=["id","patient_name","medicine_name","doctor_name","prescribed_at","created_by"]
    def get_doctor_name(self,obj): return (obj.doctor.user.get_full_name() or obj.doctor.user.username) if obj.doctor else None
