from rest_framework import serializers
from .models import LabOrder
class LabOrderSerializer(serializers.ModelSerializer):
    patient_name=serializers.CharField(source="patient.full_name",read_only=True)
    doctor_name=serializers.SerializerMethodField()
    class Meta:
        model=LabOrder
        fields=["id","patient","patient_name","doctor","doctor_name","test_name","test_code","instructions","result","result_file","status","ordered_at","completed_at","created_by"]
        read_only_fields=["id","patient_name","doctor_name","ordered_at","completed_at","created_by"]
    def get_doctor_name(self,obj): return (obj.doctor.user.get_full_name() or obj.doctor.user.username) if obj.doctor else None
