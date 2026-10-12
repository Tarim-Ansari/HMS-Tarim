from rest_framework import serializers
from .models import NurseProfile
class NurseSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    hospital_id = serializers.IntegerField(source="user.hospital_id", read_only=True)
    branch_id = serializers.IntegerField(source="user.branch_id", read_only=True)
    class Meta:
        model = NurseProfile
        fields = ["id","user_id","name","email","hospital_id","branch_id","qualification","registration_number",
                  "specialization","experience_years","shift","is_available","created_at","updated_at"]
        read_only_fields = ["id","user_id","name","email","hospital_id","branch_id","created_at","updated_at"]
    def get_name(self,obj): return obj.user.get_full_name() or obj.user.username
