from django.urls import path, include

urlpatterns = [
    path('', include('core.urls')),
    path('nutricion/', include('nutricion.urls')),
    path('auditoria/', include('auditoria.urls')),
]