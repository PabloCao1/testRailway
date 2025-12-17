from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstablishmentViewSet, AuditViewSet, SyncPushView, SyncPullView

router = DefaultRouter()
router.register(r'establishments', EstablishmentViewSet)
router.register(r'audits', AuditViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('sync/push/', SyncPushView.as_view(), name='sync-push'),
    path('sync/pull/', SyncPullView.as_view(), name='sync-pull'),
]
