"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/emr/', include('apps.emr.urls')),
    path('api/ipd/', include('apps.ipd.urls')),
    path('api/emergency/', include('apps.emergency.urls')),
    path('api/telemedicine/', include('apps.telemedicine.urls')),
    path('api/doctors/', include('apps.doctors.urls')),
    path('api/hospitals/', include('apps.hospitals.urls')),
    path('api/laboratory/', include('apps.laboratory.urls')),
    # receptionist profile is managed through accounts staff APIs
    path('api/pharmacy/', include('apps.pharmacy.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/nurses/', include('apps.nurses.urls')),
    path('api/branches/', include('apps.branches.urls')),
    path('api/departments/', include('apps.departments.urls')),
    # path('api/staff/', include('apps.staff.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
