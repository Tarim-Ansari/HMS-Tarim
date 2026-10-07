from rest_framework import serializers
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    branch_name = serializers.ReadOnlyField(source="branch.name")
    hospital_name = serializers.ReadOnlyField(source="branch.hospital.name")

    class Meta:
        model = Department
        fields = [
            "id",
            "branch",
            "branch_name",
            "hospital_name",
            "name",
            "code",
            "description",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "branch_name", "hospital_name"]

