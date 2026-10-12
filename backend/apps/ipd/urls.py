from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AdmissionViewSet, BedViewSet, PatientVitalViewSet, NurseTaskViewSet

router = DefaultRouter()
router.register(r"beds", BedViewSet, basename="bed")
router.register(r"admissions", AdmissionViewSet, basename="admission")
router.register(r"vitals", PatientVitalViewSet, basename="patient-vital")
router.register(r"tasks", NurseTaskViewSet, basename="nurse-task")
router.register(r"", AdmissionViewSet, basename="ipd-root")

urlpatterns = [
    path("", include(router.urls)),
]
