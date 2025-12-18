from rest_framework import serializers
from .models import Institucion, VisitaAuditoria, PlatoObservado, IngredientePlato, PlatoPlantilla, IngredientePlantilla


class InstitucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucion
        fields = '__all__'


class IngredientePlatoSerializer(serializers.ModelSerializer):
    alimento_nombre = serializers.CharField(source='alimento.nombre', read_only=True)
    
    class Meta:
        model = IngredientePlato
        fields = '__all__'
        read_only_fields = ['energia_kcal', 'proteinas_g', 'grasas_totales_g', 
                           'carbohidratos_g', 'fibra_g', 'sodio_mg']


class PlatoObservadoSerializer(serializers.ModelSerializer):
    ingredientes = IngredientePlatoSerializer(many=True, read_only=True)
    
    class Meta:
        model = PlatoObservado
        fields = '__all__'
        read_only_fields = ['energia_kcal_total', 'proteinas_g_total', 'grasas_totales_g_total',
                           'carbohidratos_g_total', 'fibra_g_total', 'sodio_mg_total']


class VisitaAuditoriaSerializer(serializers.ModelSerializer):
    platos = PlatoObservadoSerializer(many=True, read_only=True)
    institucion_nombre = serializers.CharField(source='institucion.nombre', read_only=True)
    
    class Meta:
        model = VisitaAuditoria
        fields = '__all__'
        read_only_fields = []


class VisitaAuditoriaListSerializer(serializers.ModelSerializer):
    institucion_nombre = serializers.CharField(source='institucion.nombre', read_only=True)
    cantidad_platos = serializers.IntegerField(read_only=True)  # Ya viene del annotate
    
    class Meta:
        model = VisitaAuditoria
        fields = ['id', 'institucion', 'institucion_nombre', 'fecha', 'tipo_comida', 'cantidad_platos']


class IngredientePlantillaSerializer(serializers.ModelSerializer):
    alimento_nombre = serializers.CharField(source='alimento.nombre', read_only=True)
    
    class Meta:
        model = IngredientePlantilla
        fields = '__all__'


class PlatoPlantillaSerializer(serializers.ModelSerializer):
    ingredientes_plantilla = IngredientePlantillaSerializer(many=True, read_only=True)
    cantidad_ingredientes = serializers.IntegerField(source='ingredientes_plantilla.count', read_only=True)
    
    class Meta:
        model = PlatoPlantilla
        fields = '__all__'
        read_only_fields = ['energia_kcal_total', 'proteinas_g_total', 'grasas_totales_g_total',
                           'carbohidratos_g_total', 'fibra_g_total', 'sodio_mg_total']
