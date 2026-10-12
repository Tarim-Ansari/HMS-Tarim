from rest_framework import viewsets,filters
from rest_framework.permissions import IsAuthenticated
from .models import TelemedicineSession
from .serializers import TelemedicineSessionSerializer
class TelemedicineSessionViewSet(viewsets.ModelViewSet):
    queryset=TelemedicineSession.objects.select_related("patient","doctor__user","created_by").all(); serializer_class=TelemedicineSessionSerializer; permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]; search_fields=["patient__first_name","patient__last_name","doctor__user__first_name","doctor__user__last_name","status"]; ordering=["-scheduled_at"]
    def get_queryset(self):
        qs=super().get_queryset(); u=self.request.user
        if u.role=="PATIENT": return qs.filter(patient__user=u)
        if u.role=="DOCTOR": return qs.filter(doctor__user=u)
        if u.role=="HOSPITAL_ADMIN": return qs.filter(patient__branch__hospital_id=u.hospital_id)
        if u.branch_id: return qs.filter(patient__branch_id=u.branch_id)
        return qs if u.role=="SUPER_USER" or u.is_superuser else qs.none()
    def perform_create(self,serializer): serializer.save(created_by=self.request.user)
