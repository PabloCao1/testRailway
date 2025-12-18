from django.contrib import admin
from .models import CategoriaAlimento, AlimentoNutricional


@admin.register(CategoriaAlimento)
class CategoriaAlimentoAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre']
    search_fields = ['codigo', 'nombre']
    fields = ['codigo', 'nombre']


@admin.register(AlimentoNutricional)
class AlimentoNutricionalAdmin(admin.ModelAdmin):
    list_display = ['codigo_argenfood', 'nombre', 'categoria', 'energia_kcal', 'proteinas_g']
    list_filter = ['categoria']
    search_fields = ['nombre', 'codigo_argenfood']
    list_per_page = 50
    fieldsets = (
        ('Información Básica', {
            'fields': ('codigo_argenfood', 'nombre', 'especie', 'unidad_base', 'categoria', 'fuente')
        }),
        ('Energía', {
            'fields': ('energia_kj', 'energia_kcal')
        }),
        ('Macronutrientes', {
            'fields': ('agua_g', 'proteinas_g', 'grasas_totales_g', 'carbohidratos_totales_g', 'carbohidratos_disponibles_g', 'fibra_g', 'cenizas_g')
        }),
        ('Minerales', {
            'fields': ('sodio_mg', 'potasio_mg', 'calcio_mg', 'fosforo_mg', 'hierro_mg', 'zinc_mg'),
            'classes': ('collapse',)
        }),
        ('Vitaminas', {
            'fields': ('tiamina_mg', 'riboflavina_mg', 'niacina_mg', 'vitamina_c_mg'),
            'classes': ('collapse',)
        }),
        ('Ácidos Grasos', {
            'fields': ('grasas_saturadas_g', 'grasas_monoinsat_g', 'grasas_poliinsat_g', 'colesterol_mg', 'ag_c14_0_g', 'ag_c16_0_g', 'ag_c18_0_g', 'ag_c18_1w9_g', 'ag_c18_2w6_g', 'ag_c18_3w3_g', 'ag_epa_g', 'ag_dha_g'),
            'classes': ('collapse',)
        }),
    )
