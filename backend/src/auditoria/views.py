from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.core.cache import cache
from django.db.models import Count
from django.db import transaction
from .models import Institucion, VisitaAuditoria, PlatoObservado, IngredientePlato, PlatoPlantilla, IngredientePlantilla
from .serializers import (
    InstitucionSerializer,
    VisitaAuditoriaSerializer,
    VisitaAuditoriaListSerializer,
    PlatoObservadoSerializer,
    IngredientePlatoSerializer,
    PlatoPlantillaSerializer,
    IngredientePlantillaSerializer
)
from .reports import ReportService


class InstitucionViewSet(viewsets.ModelViewSet):
    queryset = Institucion.objects.all()
    serializer_class = InstitucionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tipo', 'activo', 'comuna']
    search_fields = ['nombre', 'codigo', 'barrio']


class VisitaAuditoriaViewSet(viewsets.ModelViewSet):
    queryset = VisitaAuditoria.objects.select_related('institucion').all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['institucion', 'tipo_comida', 'fecha']
    ordering_fields = ['fecha']
    ordering = ['-fecha']

    def get_queryset(self):
        queryset = VisitaAuditoria.objects.select_related('institucion')
        
        if self.action == 'list':
            return queryset.annotate(
                cantidad_platos=Count('platos')
            )
        
        return queryset.prefetch_related(
            'platos__ingredientes__alimento'
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return VisitaAuditoriaListSerializer
        return VisitaAuditoriaSerializer


class PlatoObservadoViewSet(viewsets.ModelViewSet):
    queryset = PlatoObservado.objects.select_related('visita').prefetch_related('ingredientes__alimento').all()
    serializer_class = PlatoObservadoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['visita']

    @action(detail=True, methods=['post'])
    def recalcular(self, request, pk=None):
        """Recalcula los totales nutricionales del plato"""
        plato = self.get_object()
        totales = plato.recalcular_totales(save=True)
        return Response(totales)


class IngredientePlatoViewSet(viewsets.ModelViewSet):
    queryset = IngredientePlato.objects.select_related('plato', 'alimento').all()
    serializer_class = IngredientePlatoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['plato']

    def perform_create(self, serializer):
        with transaction.atomic():
            ingrediente = serializer.save()
            ingrediente.recalcular_aporte(save=False)
            
            plato = ingrediente.plato
            plato.recalcular_totales(save=False)
            
            ingrediente.save()
            plato.save()
        
        cache.delete('dashboard_stats')

    def perform_update(self, serializer):
        with transaction.atomic():
            ingrediente = serializer.save()
            ingrediente.recalcular_aporte(save=False)
            
            plato = ingrediente.plato
            plato.recalcular_totales(save=False)
            
            ingrediente.save()
            plato.save()
        
        cache.delete('dashboard_stats')

    def perform_destroy(self, instance):
        with transaction.atomic():
            plato = instance.plato
            instance.delete()
            plato.recalcular_totales(save=True)
        
        cache.delete('dashboard_stats')


@api_view(['GET'])
def dashboard_stats(request):
    """Estadísticas generales del dashboard"""
    stats = ReportService.get_dashboard_stats()
    return Response(stats)


@api_view(['GET'])
def visitas_por_periodo(request):
    """Visitas agrupadas por período"""
    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin = request.query_params.get('fecha_fin')
    data = ReportService.get_visitas_por_periodo(fecha_inicio, fecha_fin)
    return Response(data)


@api_view(['GET'])
def reporte_institucion(request, institucion_id):
    """Reporte detallado de una institución"""
    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin = request.query_params.get('fecha_fin')
    try:
        data = ReportService.get_reporte_institucion(institucion_id, fecha_inicio, fecha_fin)
        return Response(data)
    except Institucion.DoesNotExist:
        return Response({'error': 'Institución no encontrada'}, status=404)


@api_view(['GET'])
def ranking_instituciones(request):
    """Ranking de instituciones por visitas"""
    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin = request.query_params.get('fecha_fin')
    limit = int(request.query_params.get('limit', 10))
    data = ReportService.get_ranking_instituciones(fecha_inicio, fecha_fin, limit)
    return Response(data)


@api_view(['POST'])
def comparativa_nutricional(request):
    """Comparativa nutricional entre instituciones"""
    institucion_ids = request.data.get('institucion_ids', [])
    fecha_inicio = request.data.get('fecha_inicio')
    fecha_fin = request.data.get('fecha_fin')
    data = ReportService.get_comparativa_nutricional(institucion_ids, fecha_inicio, fecha_fin)
    return Response(data)


@api_view(['GET'])
def instituciones_con_filtros(request):
    """Instituciones que cumplen con filtros del formulario"""
    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin = request.query_params.get('fecha_fin')
    
    # Extraer filtros dinámicos
    filtros = {}
    for key, value in request.query_params.items():
        if key.startswith('filtro_') and '_campo' in key:
            index = key.split('_')[1]
            campo = value
            valor_key = f'filtro_{index}_valor'
            if valor_key in request.query_params:
                filtros[campo] = request.query_params[valor_key]
    
    data = ReportService.get_instituciones_con_filtros(fecha_inicio, fecha_fin, filtros)
    return Response(data)


class PlatoPlantillaViewSet(viewsets.ModelViewSet):
    queryset = PlatoPlantilla.objects.prefetch_related('ingredientes_plantilla__alimento').all()
    serializer_class = PlatoPlantillaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tipo_plato', 'activo']
    search_fields = ['nombre', 'descripcion']

    @action(detail=True, methods=['post'])
    def recalcular(self, request, pk=None):
        plato = self.get_object()
        totales = plato.recalcular_totales(save=True)
        return Response(totales)

    @action(detail=True, methods=['post'])
    def clonar_a_visita(self, request, pk=None):
        """Clona este plato plantilla a una visita específica"""
        plantilla = self.get_object()
        visita_id = request.data.get('visita_id')
        
        if not visita_id:
            return Response({'error': 'visita_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            visita = VisitaAuditoria.objects.get(id=visita_id)
        except VisitaAuditoria.DoesNotExist:
            return Response({'error': 'Visita no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        # Crear plato observado desde plantilla
        plato = PlatoObservado.objects.create(
            visita=visita,
            nombre=plantilla.nombre,
            tipo_plato=plantilla.tipo_plato,
            energia_kcal_total=plantilla.energia_kcal_total,
            proteinas_g_total=plantilla.proteinas_g_total,
            grasas_totales_g_total=plantilla.grasas_totales_g_total,
            carbohidratos_g_total=plantilla.carbohidratos_g_total,
            fibra_g_total=plantilla.fibra_g_total,
            sodio_mg_total=plantilla.sodio_mg_total
        )
        
        # Copiar ingredientes con bulk_create (optimizado)
        ingredientes_bulk = [
            IngredientePlato(
                plato=plato,
                alimento=ing.alimento,
                cantidad=ing.cantidad,
                unidad=ing.unidad,
                orden=ing.orden
            )
            for ing in plantilla.ingredientes_plantilla.all()
        ]
        IngredientePlato.objects.bulk_create(ingredientes_bulk)
        
        # Recalcular aportes y totales
        for ing in plato.ingredientes.all():
            ing.recalcular_aporte(save=True)
        plato.recalcular_totales(save=True)
        
        serializer = PlatoObservadoSerializer(plato)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class IngredientePlantillaViewSet(viewsets.ModelViewSet):
    queryset = IngredientePlantilla.objects.select_related('plato_plantilla', 'alimento').all()
    serializer_class = IngredientePlantillaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['plato_plantilla']

    def perform_create(self, serializer):
        ingrediente = serializer.save()
        ingrediente.plato_plantilla.recalcular_totales(save=True)

    def perform_update(self, serializer):
        ingrediente = serializer.save()
        ingrediente.plato_plantilla.recalcular_totales(save=True)

    def perform_destroy(self, instance):
        plato = instance.plato_plantilla
        instance.delete()
        plato.recalcular_totales(save=True)
