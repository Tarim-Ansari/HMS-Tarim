from rest_framework import viewsets, permissions, filters
from apps.common_permissions import IsAdminOrReadOnly
from .models import Branch
from .serializers import BranchSerializer


class BranchViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Branches with filtering by hospital.
    Accessible to authenticated users; write access for SUPER_ADMIN and HOSPITAL_ADMIN.
    """
    queryset = Branch.objects.select_related("hospital").all()
    serializer_class = BranchSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "branch_code", "city", "state", "hospital__name"]
    ordering_fields = ["name", "branch_code", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Super admin can see all branches
        if getattr(user, "is_superuser", False) or getattr(user, "role", "") in ["SUPER_ADMIN", "SUPER_USER"]:
            hospital_id = self.request.query_params.get("hospital")
            if hospital_id:
                queryset = queryset.filter(hospital_id=hospital_id)
            return queryset

        # Hospital admin sees branches in their hospital
        if getattr(user, "role", "") == "HOSPITAL_ADMIN" and getattr(user, "hospital_id", None):
            return queryset.filter(hospital_id=user.hospital_id)

        # Branch scoped users see their assigned branch
        if getattr(user, "branch_id", None):
            return queryset.filter(id=user.branch_id)

        return queryset
