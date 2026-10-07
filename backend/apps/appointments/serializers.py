from rest_framework import serializers
from .models import Appointment
class AppointmentSerializer(serializers.ModelSerializer):
    patient_name=serializers.CharField(source="patient.full_name",read_only=True)
    doctor_name=serializers.SerializerMethodField()
    branch_name=serializers.CharField(source="branch.name",read_only=True,allow_null=True)
    class Meta:
        model=Appointment
        fields=["id","patient","patient_name","doctor","doctor_name","branch","branch_name","appointment_date","appointment_time","reason","notes","status","created_by","created_at","updated_at"]
        read_only_fields=["id","patient_name","doctor_name","branch_name","created_by","created_at","updated_at"]
    def get_doctor_name(self,obj): return obj.doctor.user.get_full_name() or obj.doctor.user.username
