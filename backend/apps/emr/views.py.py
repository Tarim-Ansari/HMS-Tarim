from rest_framework import viewsets,filters
from rest_framework.permissions import IsAuthenticated
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer
class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset=MedicalRecord.objects.select_related("patient","doctor__user","created_by").all()
    serializer_class=MedicalRecordSerializer; permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]
    search_fields=["patient__first_name","patient__last_name","patient__email","diagnosis","symptoms","clinical_notes"]
    ordering=["-created_at"]
    def get_queryset(self):
        qs=super().get_queryset(); u=self.request.user
        if u.role=="PATIENT": return qs.filter(patient__user=u)
        if u.role=="DOCTOR": return qs.filter(doctor__user=u)
        if u.role=="HOSPITAL_ADMIN": return qs.filter(patient__branch__hospital_id=u.hospital_id)
        if u.branch_id: return qs.filter(patient__branch_id=u.branch_id)
        if u.role in {"SUPER_USER"} or u.is_superuser: return qs
        return qs.none()
    def perform_create(self,serializer): serializer.save(created_by=self.request.user)
