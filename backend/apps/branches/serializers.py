from rest_framework import serializers
from .models import Branch


class BranchSerializer(serializers.ModelSerializer):
    hospital_name = serializers.ReadOnlyField(source="hospital.name")

    class Meta:
        model = Branch
        fields = [
            "id",
            "hospital",
            "hospital_name",
            "name",
            "branch_code",
            "phone",
            "email",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "postal_code",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "hospital_name"]

