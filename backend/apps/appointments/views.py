from rest_framework import viewsets,filters
from rest_framework.permissions import IsAuthenticated
from .models import Appointment
from .serializers import AppointmentSerializer
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset=Appointment.objects.select_related("patient","doctor__user","branch","created_by").all()
    serializer_class=AppointmentSerializer
    permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]
    search_fields=["patient__first_name","patient__last_name","patient__email","doctor__user__first_name","doctor__user__last_name","reason"]
    ordering_fields=["appointment_date","appointment_time","created_at","status"]
    ordering=["appointment_date","appointment_time"]
    def get_queryset(self):
        qs=super().get_queryset(); u=self.request.user
        if u.role=="PATIENT": qs=qs.filter(patient__user=u)
        elif u.role=="DOCTOR": qs=qs.filter(doctor__user=u)
        elif u.role=="HOSPITAL_ADMIN": qs=qs.filter(branch__hospital_id=u.hospital_id)
        elif u.branch_id: qs=qs.filter(branch_id=u.branch_id)
        status=self.request.query_params.get("status")
        if status: qs=qs.filter(status=status)
        date=self.request.query_params.get("date")
        if date: qs=qs.filter(appointment_date=date)
        return qs
    def perform_create(self,serializer):
        serializer.save(created_by=self.request.user)
