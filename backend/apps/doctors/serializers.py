from rest_framework import serializers
from .models import DoctorProfile

class DoctorSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    hospital_id = serializers.IntegerField(source="user.hospital_id", read_only=True)
    branch_id = serializers.IntegerField(source="user.branch_id", read_only=True)
    department_id = serializers.IntegerField(source="user.department_id", read_only=True)

    class Meta:
        model = DoctorProfile
        fields = ["id","user_id","username","name","email","hospital_id","branch_id","department_id",
                  "specialization","qualification","registration_number","experience_years",
                  "consultation_fee","bio","available_from","available_to","is_available",
                  "created_at","updated_at"]
        read_only_fields = ["id","user_id","username","name","email","hospital_id","branch_id","department_id","created_at","updated_at"]

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
