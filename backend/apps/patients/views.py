from rest_framework import viewsets, permissions, filters
from apps.common_permissions import PatientPermission
from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing patients.
    Supports list, retrieve, create, update, delete with branch filtering.
    """
    queryset = Patient.objects.select_related("branch", "user").all()
    serializer_class = PatientSerializer
    permission_classes = [PatientPermission]
    lookup_field = "patient_id"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "first_name",
        "last_name",
        "email",
        "mobile_number",
        "patient_id",
        "city",
    ]
    ordering_fields = ["first_name", "created_at", "date_of_birth"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        branch_id = self.request.query_params.get("branch")

        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)

        # Patient seeing own profile
        if getattr(user, "role", "") == "PATIENT":
            return queryset.filter(user=user)

        # Branch scoped staff
        if getattr(user, "role", "") in ["RECEPTIONIST", "NURSE", "BRANCH_ADMIN"] and getattr(user, "branch_id", None):
            return queryset.filter(branch_id=user.branch_id)

        # Hospital scoped admin
        if getattr(user, "role", "") == "HOSPITAL_ADMIN" and getattr(user, "hospital_id", None):
            return queryset.filter(branch__hospital_id=user.hospital_id)

        if getattr(user, "role", "") in {"SUPER_USER", "HOSPITAL_ADMIN", "RECEPTIONIST", "NURSE", "DOCTOR"}:
            return queryset
        return queryset.none()
