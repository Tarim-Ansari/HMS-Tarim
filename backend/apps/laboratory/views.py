from django.utils import timezone
from rest_framework import viewsets,filters
from rest_framework.permissions import IsAuthenticated
from .models import LabOrder
from .serializers import LabOrderSerializer
class LabOrderViewSet(viewsets.ModelViewSet):
    queryset=LabOrder.objects.select_related("patient","doctor__user","created_by").all()
    serializer_class=LabOrderSerializer; permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]
    search_fields=["patient__first_name","patient__last_name","patient__email","test_name","test_code","status"]
    ordering_fields=["ordered_at","status","test_name"]; ordering=["-ordered_at"]
    def get_queryset(self):
        qs=super().get_queryset(); u=self.request.user
        if u.role=="PATIENT": qs=qs.filter(patient__user=u)
        elif u.role=="DOCTOR": qs=qs.filter(doctor__user=u)
        elif u.role=="HOSPITAL_ADMIN": qs=qs.filter(patient__branch__hospital_id=u.hospital_id)
        elif u.branch_id: qs=qs.filter(patient__branch_id=u.branch_id)
        status=self.request.query_params.get("status")
        if status: qs=qs.filter(status=status)
        return qs
    def perform_create(self,serializer): serializer.save(created_by=self.request.user)
    def perform_update(self,serializer):
        obj=serializer.save()
        if obj.status=="COMPLETED" and not obj.completed_at: obj.completed_at=timezone.now(); obj.save(update_fields=["completed_at"])
