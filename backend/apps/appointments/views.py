import uuid
from django.db.models import Q
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Appointment
from .serializers import AppointmentSerializer


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


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient", "doctor__user", "branch", "created_by").all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__first_name", "patient__last_name", "patient__email", "doctor__user__first_name", "doctor__user__last_name", "reason"]
    ordering_fields = ["appointment_date", "appointment_time", "created_at", "status"]
    ordering = ["appointment_date", "appointment_time"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user

        patient_param = self.request.query_params.get("patient")
        if patient_param:
            qs = filter_by_patient_param(qs, patient_param, "patient")

        doctor_param = self.request.query_params.get("doctor")
        if doctor_param:
            qs = qs.filter(doctor_id=doctor_param)

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        date_param = self.request.query_params.get("date")
        if date_param:
            qs = qs.filter(appointment_date=date_param)

        if u.role == "PATIENT":
            return qs.filter(patient__user=u)
        if u.role == "DOCTOR":
            # If requesting specific patient history, allow seeing it; otherwise filter by doctor
            if not patient_param:
                qs = qs.filter(doctor__user=u)
            return qs
        if u.role == "HOSPITAL_ADMIN" and u.hospital_id:
            return qs.filter(branch__hospital_id=u.hospital_id)
        if u.branch_id:
            return qs.filter(branch_id=u.branch_id)
        if u.role in {"SUPER_USER", "RECEPTIONIST", "NURSE"} or u.is_superuser:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
