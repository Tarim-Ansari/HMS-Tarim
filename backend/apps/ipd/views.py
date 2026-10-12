import uuid
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Admission, Bed, PatientVital, NurseTask
from .serializers import AdmissionSerializer, BedSerializer, PatientVitalSerializer, NurseTaskSerializer
from apps.patients.models import Patient


def get_patient_instance(val):
    if not val:
        return None
    if isinstance(val, int) or (isinstance(val, str) and str(val).isdigit()):
        p = Patient.objects.filter(id=int(val)).first()
        if p:
            return p
    try:
        u = uuid.UUID(str(val))
        return Patient.objects.filter(patient_id=u).first()
    except (ValueError, TypeError, AttributeError):
        pass
    return None


def filter_by_patient_param(qs, param, field="patient"):
    if not param:
        return qs
    if isinstance(param, int) or (isinstance(param, str) and str(param).isdigit()):
        return qs.filter(**{f"{field}__id": int(param)})
    try:
        u = uuid.UUID(str(param))
        return qs.filter(**{f"{field}__patient_id": u})
    except (ValueError, TypeError, AttributeError):
        pass
    return qs.none()


class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.select_related("patient", "branch", "created_by").all()
    serializer_class = AdmissionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__first_name", "patient__last_name", "ward", "bed_number", "status"]
    ordering = ["-admission_date"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        patient_param = self.request.query_params.get("patient")
        if patient_param:
            qs = filter_by_patient_param(qs, patient_param, "patient")

        if u.role == "PATIENT":
            return qs.filter(patient__user=u)
        if u.role == "HOSPITAL_ADMIN" and u.hospital_id:
            return qs.filter(branch__hospital_id=u.hospital_id)
        if u.branch_id:
            return qs.filter(branch_id=u.branch_id)
        if u.role in {"SUPER_USER", "DOCTOR", "NURSE", "RECEPTIONIST"} or u.is_superuser:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.select_related("branch", "current_patient", "current_admission").all()
    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["bed_number", "ward", "floor", "bed_type", "status", "current_patient__first_name", "current_patient__last_name"]
    ordering_fields = ["ward", "bed_number", "status", "updated_at"]
    ordering = ["ward", "bed_number"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        ward = self.request.query_params.get("ward")
        bed_status = self.request.query_params.get("status")
        bed_type = self.request.query_params.get("bed_type")

        if ward:
            qs = qs.filter(ward__iexact=ward)
        if bed_status:
            qs = qs.filter(status__iexact=bed_status)
        if bed_type:
            qs = qs.filter(bed_type__iexact=bed_type)

        if u.role == "HOSPITAL_ADMIN" and u.hospital_id:
            qs = qs.filter(branch__hospital_id=u.hospital_id)
        elif u.branch_id:
            qs = qs.filter(branch_id=u.branch_id)
        return qs

    @action(detail=False, methods=["get"])
    def occupancy(self, request):
        """
        Returns real-time occupancy statistics across all wards.
        """
        qs = self.get_queryset()
        total_beds = qs.count()
        occupied_beds = qs.filter(status=Bed.Status.OCCUPIED).count()
        available_beds = qs.filter(status=Bed.Status.AVAILABLE).count()
        cleaning_beds = qs.filter(status=Bed.Status.CLEANING).count()
        maintenance_beds = qs.filter(status=Bed.Status.MAINTENANCE).count()

        occupancy_rate = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0

        # Group by ward
        wards_summary = []
        wards = sorted(list(set(qs.values_list("ward", flat=True))))
        for w in wards:
            w_qs = qs.filter(ward=w)
            w_total = w_qs.count()
            w_occ = w_qs.filter(status=Bed.Status.OCCUPIED).count()
            w_avail = w_qs.filter(status=Bed.Status.AVAILABLE).count()
            wards_summary.append({
                "ward": w,
                "total": w_total,
                "occupied": w_occ,
                "available": w_avail,
                "occupancy_rate": round((w_occ / w_total * 100), 1) if w_total > 0 else 0,
            })

        return Response({
            "total_beds": total_beds,
            "occupied_beds": occupied_beds,
            "available_beds": available_beds,
            "cleaning_beds": cleaning_beds,
            "maintenance_beds": maintenance_beds,
            "occupancy_rate": occupancy_rate,
            "wards": wards_summary,
            "ward_breakdown": wards_summary,
        })

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        bed = self.get_object()
        patient_id = request.data.get("patient_id") or request.data.get("patient")
        diagnosis = request.data.get("diagnosis", "")
        notes = request.data.get("notes", "")

        if not patient_id:
            return Response({"error": "patient_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        patient = get_patient_instance(patient_id)
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        admission = Admission.objects.create(
            patient=patient,
            branch=bed.branch,
            ward=bed.ward,
            bed_number=bed.bed_number,
            diagnosis=diagnosis,
            notes=notes,
            status=Admission.Status.ADMITTED,
            created_by=request.user,
        )

        bed.current_patient = patient
        bed.current_admission = admission
        bed.status = Bed.Status.OCCUPIED
        bed.save()

        return Response(BedSerializer(bed).data)

    @action(detail=True, methods=["post"])
    def discharge(self, request, pk=None):
        bed = self.get_object()
        if bed.current_admission:
            bed.current_admission.status = Admission.Status.DISCHARGED
            bed.current_admission.discharge_date = timezone.now()
            bed.current_admission.save()

        bed.current_patient = None
        bed.current_admission = None
        bed.status = Bed.Status.AVAILABLE
        bed.save()

        return Response(BedSerializer(bed).data)


class PatientVitalViewSet(viewsets.ModelViewSet):
    queryset = PatientVital.objects.select_related("patient", "recorded_by").all()
    serializer_class = PatientVitalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__first_name", "patient__last_name", "blood_pressure", "notes"]
    ordering = ["-recorded_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        patient_param = self.request.query_params.get("patient")
        if patient_param:
            qs = filter_by_patient_param(qs, patient_param, "patient")

        if u.role == "PATIENT":
            return qs.filter(patient__user=u)
        if u.role == "HOSPITAL_ADMIN" and u.hospital_id:
            return qs.filter(patient__branch__hospital_id=u.hospital_id)
        if u.branch_id:
            return qs.filter(patient__branch_id=u.branch_id)
        if u.role in {"SUPER_USER", "DOCTOR", "NURSE"} or u.is_superuser:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class NurseTaskViewSet(viewsets.ModelViewSet):
    queryset = NurseTask.objects.select_related("nurse", "patient").all()
    serializer_class = NurseTaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["task_name", "description", "ward", "bed_number", "patient__first_name", "patient__last_name"]
    ordering = ["status", "-due_date", "scheduled_time"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        task_status = self.request.query_params.get("status")
        ward = self.request.query_params.get("ward")

        if task_status:
            qs = qs.filter(status=task_status)
        if ward:
            qs = qs.filter(ward__iexact=ward)

        if u.role == "NURSE":
            return qs
        if u.role in {"SUPER_USER", "DOCTOR", "HOSPITAL_ADMIN"} or u.is_superuser:
            return qs
        return qs.none()

    @action(detail=True, methods=["post"])
    def toggle_status(self, request, pk=None):
        task = self.get_object()
        if task.status == NurseTask.Status.PENDING:
            task.status = NurseTask.Status.IN_PROGRESS
        elif task.status == NurseTask.Status.IN_PROGRESS:
            task.status = NurseTask.Status.COMPLETED
            task.completed_at = timezone.now()
        else:
            task.status = NurseTask.Status.PENDING
            task.completed_at = None
        task.save()
        return Response(NurseTaskSerializer(task).data)
