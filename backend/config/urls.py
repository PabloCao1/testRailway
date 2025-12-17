from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'Auditoria API is running'})

urlpatterns = [
    path('', health_check, name='health_check'),  # Root health check
    path('health/', health_check, name='health_check_alt'),  # Alternative health check
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('audits.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
