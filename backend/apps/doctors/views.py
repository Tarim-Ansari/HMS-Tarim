from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import DoctorProfile
from .serializers import DoctorSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.select_related("user").all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__username","user__first_name","user__last_name","user__email","specialization","registration_number"]
    ordering_fields = ["created_at","experience_years","consultation_fee"]
    ordering = ["user__first_name"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "HOSPITAL_ADMIN":
            qs = qs.filter(user__hospital_id=user.hospital_id)
        elif user.role == "DOCTOR":
            qs = qs.filter(user=user)
        elif user.role in {"NURSE","RECEPTIONIST","PATIENT"} and user.branch_id:
            qs = qs.filter(user__branch_id=user.branch_id)
        branch = self.request.query_params.get("branch")
        if branch: qs = qs.filter(user__branch_id=branch)
        specialization = self.request.query_params.get("specialization")
        if specialization: qs = qs.filter(specialization__icontains=specialization)
        return qs
