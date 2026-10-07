from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import NurseProfile
from .serializers import NurseSerializer
class NurseViewSet(viewsets.ModelViewSet):
    queryset=NurseProfile.objects.select_related("user").all()
    serializer_class=NurseSerializer
    permission_classes=[IsAuthenticated]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]
    search_fields=["user__username","user__first_name","user__last_name","user__email","specialization","registration_number"]
    ordering_fields=["created_at","experience_years"]
    ordering=["user__first_name"]
    def get_queryset(self):
        qs=super().get_queryset(); u=self.request.user
        if u.role=="HOSPITAL_ADMIN": qs=qs.filter(user__hospital_id=u.hospital_id)
        elif u.role=="NURSE": qs=qs.filter(user=u)
        elif u.branch_id and u.role in {"RECEPTIONIST","DOCTOR"}: qs=qs.filter(user__branch_id=u.branch_id)
        branch=self.request.query_params.get("branch")
        if branch: qs=qs.filter(user__branch_id=branch)
        return qs
