from django.contrib import admin
from .models import Institucion, VisitaAuditoria, PlatoObservado, IngredientePlato, PlatoPlantilla, IngredientePlantilla


@admin.register(Institucion)
class InstitucionAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'tipo', 'barrio', 'comuna', 'activo']
    list_filter = ['tipo', 'activo', 'comuna']
    search_fields = ['nombre', 'codigo', 'barrio']


class PlatoObservadoInline(admin.TabularInline):
    model = PlatoObservado
    extra = 0
    fields = ['nombre', 'tipo_plato', 'porciones_servidas']


@admin.register(VisitaAuditoria)
class VisitaAuditoriaAdmin(admin.ModelAdmin):
    list_display = ['institucion', 'fecha', 'tipo_comida']
    list_filter = ['tipo_comida', 'fecha']
    search_fields = ['institucion__nombre']
    inlines = [PlatoObservadoInline]


class IngredientePlatoInline(admin.TabularInline):
    model = IngredientePlato
    extra = 1
    fields = ['alimento', 'cantidad', 'unidad', 'orden']


@admin.register(PlatoObservado)
class PlatoObservadoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'visita', 'tipo_plato', 'energia_kcal_total', 'proteinas_g_total']
    list_filter = ['tipo_plato']
    search_fields = ['nombre', 'visita__institucion__nombre']
    inlines = [IngredientePlatoInline]
    readonly_fields = ['energia_kcal_total', 'proteinas_g_total', 'grasas_totales_g_total',
                      'carbohidratos_g_total', 'fibra_g_total', 'sodio_mg_total']


@admin.register(IngredientePlato)
class IngredientePlatoAdmin(admin.ModelAdmin):
    list_display = ['plato', 'alimento', 'cantidad', 'unidad', 'energia_kcal']
    search_fields = ['plato__nombre', 'alimento__nombre']


class IngredientePlantillaInline(admin.TabularInline):
    model = IngredientePlantilla
    extra = 1
    fields = ['alimento', 'cantidad', 'unidad', 'orden']


@admin.register(PlatoPlantilla)
class PlatoPlantillaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo_plato', 'activo', 'energia_kcal_total', 'proteinas_g_total']
    list_filter = ['tipo_plato', 'activo']
    search_fields = ['nombre', 'descripcion']
    inlines = [IngredientePlantillaInline]
    readonly_fields = ['energia_kcal_total', 'proteinas_g_total', 'grasas_totales_g_total',
                      'carbohidratos_g_total', 'fibra_g_total', 'sodio_mg_total']


@admin.register(IngredientePlantilla)
class IngredientePlantillaAdmin(admin.ModelAdmin):
    list_display = ['plato_plantilla', 'alimento', 'cantidad', 'unidad']
    search_fields = ['plato_plantilla__nombre', 'alimento__nombre']
