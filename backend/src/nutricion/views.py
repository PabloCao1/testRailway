from rest_framework import viewsets, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from .models import CategoriaAlimento, AlimentoNutricional
from .serializers import (
    CategoriaAlimentoSerializer,
    AlimentoNutricionalSerializer,
    AlimentoNutricionalListSerializer
)


class CategoriaAlimentoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaAlimento.objects.all()
    serializer_class = CategoriaAlimentoSerializer


class AlimentoNutricionalViewSet(viewsets.ModelViewSet):
    queryset = AlimentoNutricional.objects.select_related('categoria').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria']
    search_fields = ['nombre', 'codigo_argenfood']
    ordering_fields = ['nombre', 'codigo_argenfood', 'energia_kcal']
    ordering = ['nombre']

    def list(self, request, *args, **kwargs):
        search = request.query_params.get('search', '')
        
        if search and len(search) > 2:
            cache_key = f'alimentos_search_{search[:50]}'
            cached = cache.get(cache_key)
            
            if cached:
                return Response(cached)
            
            response = super().list(request, *args, **kwargs)
            cache.set(cache_key, response.data, 1800)  # 30 min
            return response
        
        return super().list(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.action == 'list':
            return AlimentoNutricionalListSerializer
        return AlimentoNutricionalSerializer
