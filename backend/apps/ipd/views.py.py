from rest_framework import viewsets,filters
from rest_framework.permissions import IsAuthenticated
from .models import Admission
from .serializers import AdmissionSerializer
class AdmissionViewSet(viewsets.ModelViewSet):
    queryset=Admission.objects.select_related("patient","branch","created_by").all(); serializer_class=AdmissionSerializer; permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]; search_fields=["patient__first_name","patient__last_name","ward","bed_number","status"]; ordering=["-admission_date"]
    def get_queryset(self):
        qs=super().get_queryset(); u=self.request.user
        if u.role=="PATIENT": return qs.filter(patient__user=u)
        if u.role=="HOSPITAL_ADMIN": return qs.filter(branch__hospital_id=u.hospital_id)
        if u.branch_id: return qs.filter(branch_id=u.branch_id)
        return qs if u.role=="SUPER_USER" or u.is_superuser else qs.none()
    def perform_create(self,serializer): serializer.save(created_by=self.request.user)
