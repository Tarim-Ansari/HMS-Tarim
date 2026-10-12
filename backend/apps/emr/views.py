import uuid
from django.db.models import Q
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer


def filter_by_patient_param(qs, param, field="patient"):
    if not param:
        return qs
    if isinstance(param, int) or (isinstance(param, str) and str(param).isdigit()):
        return qs.filter(**{f"{field}__id": int(param)})
    try:
        u = uuid.UUID(str(param))
        return qs.filter(**{f"{field}__patient_id": u})
    except (ValueError, TypeError, AttributeError):
        pass
    return qs.none()


class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.select_related("patient", "doctor__user", "created_by").all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__first_name", "patient__last_name", "patient__email", "diagnosis", "symptoms", "clinical_notes"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        patient_param = self.request.query_params.get("patient")
        if patient_param:
            qs = filter_by_patient_param(qs, patient_param, "patient")

        if u.role == "PATIENT":
            return qs.filter(patient__user=u)
        if u.role in {"DOCTOR", "SUPER_USER", "HOSPITAL_ADMIN", "NURSE"} or u.is_superuser:
            return qs
        if u.branch_id:
            return qs.filter(patient__branch_id=u.branch_id)
        return qs.none()

    def perform_create(self, serializer):
        # Auto-link doctor profile if the current user is a DOCTOR
        doctor_profile = getattr(self.request.user, "doctor_profile", None)
        serializer.save(created_by=self.request.user, doctor=doctor_profile)
