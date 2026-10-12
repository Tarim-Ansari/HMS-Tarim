from rest_framework import viewsets,filters
from rest_framework.permissions import IsAuthenticated
from .models import Invoice
from .serializers import InvoiceSerializer
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset=Invoice.objects.select_related("patient","created_by").prefetch_related("items").all(); serializer_class=InvoiceSerializer; permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]; search_fields=["invoice_number","patient__first_name","patient__last_name","patient__email"]; ordering_fields=["issue_date","total","status"]; ordering=["-created_at"]
    def get_queryset(self):
        qs=super().get_queryset(); u=self.request.user
        if u.role=="PATIENT": qs=qs.filter(patient__user=u)
        elif u.role=="HOSPITAL_ADMIN" and u.hospital_id: qs=qs.filter(patient__branch__hospital_id=u.hospital_id)
        elif u.branch_id: qs=qs.filter(patient__branch_id=u.branch_id)
        status=self.request.query_params.get("status")
        if status: qs=qs.filter(status=status)
        return qs
    def perform_create(self,serializer): serializer.save(created_by=self.request.user)
