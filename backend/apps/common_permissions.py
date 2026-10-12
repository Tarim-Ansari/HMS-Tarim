from rest_framework.permissions import BasePermission

STAFF_ROLES = {
    "DOCTOR", "NURSE", "LAB_TECHNICIAN", "PHARMACIST",
    "ACCOUNTANT", "RECEPTIONIST",
}

class RolePermission(BasePermission):
    allowed_roles = set()
    write_roles = None

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
        if user.is_superuser or user.role == "SUPER_USER":
            return True
        if not self.allowed_roles or user.role in self.allowed_roles:
            if request.method in {"GET", "HEAD", "OPTIONS"}:
                return True
            return self.write_roles is None or user.role in self.write_roles
        return False

class IsAdminOrReadOnly(RolePermission):
    allowed_roles = {"SUPER_USER", "HOSPITAL_ADMIN"}
    write_roles = {"SUPER_USER", "HOSPITAL_ADMIN"}

class PatientPermission(RolePermission):
    allowed_roles = {"SUPER_USER", "HOSPITAL_ADMIN", "RECEPTIONIST", "NURSE", "DOCTOR", "PATIENT"}
    write_roles = {"SUPER_USER", "HOSPITAL_ADMIN", "RECEPTIONIST"}
