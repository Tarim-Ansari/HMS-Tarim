import uuid
from django.db.models import Q
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Medicine, Prescription
from .serializers import MedicineSerializer, PrescriptionSerializer


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


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "generic_name", "sku", "manufacturer", "category"]
    ordering_fields = ["name", "quantity", "expiry_date", "unit_price"]
    ordering = ["name"]

    def get_queryset(self):
        qs = super().get_queryset()
        active = self.request.query_params.get("active")
        if active in {"true", "false"}:
            qs = qs.filter(is_active=(active == "true"))
        return qs


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related("patient", "doctor__user", "medicine", "created_by").all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__first_name", "patient__last_name", "medicine__name"]
    ordering = ["-prescribed_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user

        patient_param = self.request.query_params.get("patient")
        if patient_param:
            qs = filter_by_patient_param(qs, patient_param, "patient")

        if u.role == "PATIENT":
            return qs.filter(patient__user=u)
        if u.role == "DOCTOR":
            if not patient_param:
                qs = qs.filter(doctor__user=u)
            return qs
        if u.role == "HOSPITAL_ADMIN" and u.hospital_id:
            return qs.filter(patient__branch__hospital_id=u.hospital_id)
        if u.branch_id:
            return qs.filter(patient__branch_id=u.branch_id)
        if u.role in {"SUPER_USER", "PHARMACIST", "NURSE"} or u.is_superuser:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        doctor_profile = getattr(self.request.user, "doctor_profile", None)
        serializer.save(created_by=self.request.user, doctor=doctor_profile)
