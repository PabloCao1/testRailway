from django.db import models


class CategoriaAlimento(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Categoría de alimento"
        verbose_name_plural = "Categorías de alimentos"
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['codigo']),
        ]

    def __str__(self):
        return self.nombre


class AlimentoNutricional(models.Model):
    codigo_argenfood = models.IntegerField(unique=True)
    nombre = models.CharField(max_length=255, db_index=True)
    especie = models.CharField(max_length=255, null=True, blank=True)
    unidad_base = models.CharField(max_length=20, default="100 g")

    categoria = models.ForeignKey(
        CategoriaAlimento,
        on_delete=models.PROTECT,
        related_name="alimentos"
    )

    energia_kj = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    energia_kcal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    agua_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    proteinas_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    grasas_totales_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    carbohidratos_totales_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    carbohidratos_disponibles_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    fibra_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    cenizas_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    sodio_mg = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    potasio_mg = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    calcio_mg = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    fosforo_mg = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    hierro_mg = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    zinc_mg = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    tiamina_mg = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    riboflavina_mg = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    niacina_mg = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    vitamina_c_mg = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    grasas_saturadas_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    grasas_monoinsat_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    grasas_poliinsat_g = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    colesterol_mg = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    ag_c14_0_g = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    ag_c16_0_g = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    ag_c18_0_g = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    ag_c18_1w9_g = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    ag_c18_2w6_g = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    ag_c18_3w3_g = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    ag_epa_g = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    ag_dha_g = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)

    fuente = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = "Alimento nutricional"
        verbose_name_plural = "Alimentos nutricionales"
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['categoria', 'nombre']),
            models.Index(fields=['nombre']),
            models.Index(fields=['codigo_argenfood']),
            models.Index(fields=['energia_kcal']),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.codigo_argenfood})"
