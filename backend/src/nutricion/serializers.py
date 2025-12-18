from rest_framework import serializers
from .models import CategoriaAlimento, AlimentoNutricional


class CategoriaAlimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaAlimento
        fields = '__all__'


class AlimentoNutricionalSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = AlimentoNutricional
        fields = '__all__'


class AlimentoNutricionalListSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = AlimentoNutricional
        fields = ['id', 'codigo_argenfood', 'nombre', 'categoria', 'categoria_nombre', 
                  'energia_kcal', 'proteinas_g', 'grasas_totales_g', 'carbohidratos_disponibles_g']
