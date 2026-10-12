from rest_framework import serializers
from .models import Admission, Bed, PatientVital, NurseTask


class AdmissionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)

    class Meta:
        model = Admission
        fields = "__all__"
        read_only_fields = ["id", "patient_name", "branch_name", "admission_date", "created_by"]


class BedSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    patient_id = serializers.SerializerMethodField()
    branch_name = serializers.CharField(source="branch.name", read_only=True)

    class Meta:
        model = Bed
        fields = [
            "id",
            "bed_number",
            "ward",
            "floor",
            "bed_type",
            "status",
            "branch",
            "branch_name",
            "current_patient",
            "patient_name",
            "patient_id",
            "current_admission",
            "daily_rate",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "branch_name", "patient_name", "patient_id", "created_at", "updated_at"]

    def get_patient_name(self, obj):
        if obj.current_patient:
            return obj.current_patient.full_name
        if obj.current_admission and obj.current_admission.patient:
            return obj.current_admission.patient.full_name
        return None

    def get_patient_id(self, obj):
        if obj.current_patient:
            return str(obj.current_patient.patient_id)
        if obj.current_admission and obj.current_admission.patient:
            return str(obj.current_admission.patient.patient_id)
        return None


class PatientVitalSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PatientVital
        fields = [
            "id",
            "patient",
            "patient_name",
            "recorded_by",
            "recorded_by_name",
            "recorded_at",
            "blood_pressure",
            "heart_rate",
            "temperature",
            "oxygen_saturation",
            "respiratory_rate",
            "blood_glucose",
            "weight",
            "height",
            "notes",
        ]
        read_only_fields = ["id", "patient_name", "recorded_by_name", "recorded_at"]

    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return None


class NurseTaskSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    nurse_name = serializers.SerializerMethodField()

    class Meta:
        model = NurseTask
        fields = [
            "id",
            "nurse",
            "nurse_name",
            "patient",
            "patient_name",
            "task_name",
            "description",
            "ward",
            "bed_number",
            "scheduled_time",
            "due_date",
            "priority",
            "status",
            "created_at",
            "completed_at",
        ]
        read_only_fields = ["id", "patient_name", "nurse_name", "created_at"]

    def get_nurse_name(self, obj):
        if obj.nurse:
            return obj.nurse.get_full_name() or obj.nurse.username
        return None
