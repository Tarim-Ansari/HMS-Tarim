from rest_framework import viewsets,filters
from rest_framework.permissions import IsAuthenticated
from .models import Medicine,Prescription
from .serializers import MedicineSerializer,PrescriptionSerializer
class MedicineViewSet(viewsets.ModelViewSet):
    queryset=Medicine.objects.all(); serializer_class=MedicineSerializer; permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]; search_fields=["name","generic_name","sku","manufacturer","category"]; ordering_fields=["name","quantity","expiry_date","unit_price"]; ordering=["name"]
    def get_queryset(self):
        qs=super().get_queryset()
        active=self.request.query_params.get("active")
        if active in {"true","false"}: qs=qs.filter(is_active=active=="true")
        return qs
class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset=Prescription.objects.select_related("patient","doctor__user","medicine","created_by").all(); serializer_class=PrescriptionSerializer; permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]; search_fields=["patient__first_name","patient__last_name","medicine__name"]; ordering=["-prescribed_at"]
    def get_queryset(self):
        qs=super().get_queryset(); u=self.request.user
        if u.role=="PATIENT": qs=qs.filter(patient__user=u)
        elif u.role=="DOCTOR": qs=qs.filter(doctor__user=u)
        elif u.role=="HOSPITAL_ADMIN" and u.hospital_id: qs=qs.filter(patient__branch__hospital_id=u.hospital_id)
        elif u.branch_id: qs=qs.filter(patient__branch_id=u.branch_id)
        return qs
    def perform_create(self,serializer): serializer.save(created_by=self.request.user)
