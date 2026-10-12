from rest_framework import viewsets, permissions, filters
from apps.common_permissions import IsAdminOrReadOnly
from .models import Department
from .serializers import DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Departments with filtering by branch.
    """
    queryset = Department.objects.select_related("branch", "branch__hospital").all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "code", "branch__name"]
    ordering_fields = ["name", "code", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        branch_id = self.request.query_params.get("branch")
        if user.role == "HOSPITAL_ADMIN":
            queryset = queryset.filter(branch__hospital_id=user.hospital_id)
        elif user.role not in {"SUPER_USER"} and not user.is_superuser:
            if user.branch_id:
                queryset = queryset.filter(branch_id=user.branch_id)
            else:
                return queryset.none()
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        return queryset
