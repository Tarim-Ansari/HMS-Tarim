from django.urls import include,path
from rest_framework.routers import DefaultRouter
from .views import EmergencyCaseViewSet
router=DefaultRouter(); router.register(r"",EmergencyCaseViewSet,basename="emergency")
urlpatterns=[path("",include(router.urls))]
