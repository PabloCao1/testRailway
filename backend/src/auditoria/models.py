from django.db import models
from decimal import Decimal
from nutricion.models import AlimentoNutricional


class PlatoPlantilla(models.Model):
    """Platos precargados que se pueden reutilizar en visitas"""
    TIPO_PLATO_CHOICES = [
        ("principal", "Plato principal"),
        ("guarnicion", "Guarnición"),
        ("postre", "Postre"),
        ("bebida", "Bebida"),
        ("otro", "Otro"),
    ]

    nombre = models.CharField(max_length=255)
    tipo_plato = models.CharField(max_length=50, choices=TIPO_PLATO_CHOICES)
    descripcion = models.TextField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    
    energia_kcal_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    proteinas_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    grasas_totales_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    carbohidratos_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    fibra_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    sodio_mg_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)

    class Meta:
        verbose_name = "Plato plantilla"
        verbose_name_plural = "Platos plantilla"
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['tipo_plato', 'activo']),
            models.Index(fields=['activo', 'nombre']),
        ]

    def __str__(self):
        return self.nombre

    def recalcular_totales(self, save=True):
        energia = Decimal("0")
        prot = Decimal("0")
        grasa = Decimal("0")
        cho = Decimal("0")
        fibra = Decimal("0")
        sodio = Decimal("0")

        for ing in self.ingredientes_plantilla.select_related('alimento').all():
            factor = (ing.cantidad or 0) / Decimal("100")
            alimento = ing.alimento

            if alimento.energia_kcal is not None:
                energia += factor * alimento.energia_kcal
            if alimento.proteinas_g is not None:
                prot += factor * alimento.proteinas_g
            if alimento.grasas_totales_g is not None:
                grasa += factor * alimento.grasas_totales_g
            if alimento.carbohidratos_disponibles_g is not None:
                cho += factor * alimento.carbohidratos_disponibles_g
            elif alimento.carbohidratos_totales_g is not None:
                cho += factor * alimento.carbohidratos_totales_g
            if alimento.fibra_g is not None:
                fibra += factor * alimento.fibra_g
            if alimento.sodio_mg is not None:
                sodio += factor * alimento.sodio_mg

        self.energia_kcal_total = energia
        self.proteinas_g_total = prot
        self.grasas_totales_g_total = grasa
        self.carbohidratos_g_total = cho
        self.fibra_g_total = fibra
        self.sodio_mg_total = sodio

        if save:
            self.save()

        return {
            "energia_kcal_total": energia,
            "proteinas_g_total": prot,
            "grasas_totales_g_total": grasa,
            "carbohidratos_g_total": cho,
            "fibra_g_total": fibra,
            "sodio_mg_total": sodio,
        }


class IngredientePlantilla(models.Model):
    """Ingredientes de platos plantilla"""
    plato_plantilla = models.ForeignKey(PlatoPlantilla, on_delete=models.CASCADE, related_name="ingredientes_plantilla")
    alimento = models.ForeignKey(AlimentoNutricional, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=3)
    unidad = models.CharField(max_length=20, default="g")
    orden = models.IntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Ingrediente plantilla"
        verbose_name_plural = "Ingredientes plantilla"
        ordering = ['orden', 'id']
        indexes = [
            models.Index(fields=['plato_plantilla', 'orden']),
        ]

    def __str__(self):
        return f"{self.alimento.nombre} ({self.cantidad}{self.unidad})"


class Institucion(models.Model):
    TIPO_CHOICES = [
        ('escuela', 'Escuela'),
        ('cdi', 'CDI'),
        ('hogar', 'Hogar'),
        ('geriatrico', 'Geriátrico'),
        ('otro', 'Otro'),
    ]

    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    barrio = models.CharField(max_length=100, null=True, blank=True)
    comuna = models.CharField(max_length=50, null=True, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Institución"
        verbose_name_plural = "Instituciones"
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['tipo', 'activo']),
            models.Index(fields=['activo', 'nombre']),
            models.Index(fields=['codigo']),
            models.Index(fields=['comuna', 'activo']),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.codigo})"


class VisitaAuditoria(models.Model):
    TIPO_COMIDA_CHOICES = [
        ("desayuno", "Desayuno"),
        ("almuerzo", "Almuerzo"),
        ("merienda", "Merienda"),
        ("cena", "Cena"),
        ("vianda", "Vianda"),
    ]

    institucion = models.ForeignKey(
        Institucion,
        on_delete=models.PROTECT,
        related_name="visitas",
    )
    fecha = models.DateField()
    tipo_comida = models.CharField(max_length=20, choices=TIPO_COMIDA_CHOICES)
    observaciones = models.TextField(null=True, blank=True)
    
    # Campos para el formulario de relevamiento
    formulario_completado = models.BooleanField(default=False)
    formulario_respuestas = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name = "Visita de auditoría"
        verbose_name_plural = "Visitas de auditoría"
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['institucion', '-fecha']),
            models.Index(fields=['-fecha']),
            models.Index(fields=['tipo_comida', '-fecha']),
            models.Index(fields=['fecha']),
        ]

    def __str__(self):
        return f"{self.institucion.nombre} - {self.fecha} - {self.get_tipo_comida_display()}"


class PlatoObservado(models.Model):
    TIPO_PLATO_CHOICES = [
        ("principal", "Plato principal"),
        ("guarnicion", "Guarnición"),
        ("postre", "Postre"),
        ("bebida", "Bebida"),
        ("otro", "Otro"),
    ]

    visita = models.ForeignKey(
        VisitaAuditoria,
        on_delete=models.CASCADE,
        related_name="platos",
    )
    nombre = models.CharField(max_length=255)
    tipo_plato = models.CharField(
        max_length=50,
        choices=TIPO_PLATO_CHOICES,
        null=True,
        blank=True,
    )
    porciones_servidas = models.IntegerField(null=True, blank=True)
    notas = models.TextField(null=True, blank=True)

    # Totales comunes
    energia_kcal_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    proteinas_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    grasas_totales_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    carbohidratos_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    agua_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    
    # Totales adicionales
    fibra_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    sodio_mg_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    calcio_mg_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    hierro_mg_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    zinc_mg_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    vitamina_c_mg_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    potasio_mg_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    fosforo_mg_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    grasas_saturadas_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    grasas_monoinsat_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    grasas_poliinsat_g_total = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)

    class Meta:
        verbose_name = "Plato observado"
        verbose_name_plural = "Platos observados"
        ordering = ['id']
        indexes = [
            models.Index(fields=['visita', 'tipo_plato']),
            models.Index(fields=['visita']),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.visita})"

    def recalcular_totales(self, save=True):
        """Recalcula los totales nutricionales del plato sumando todos sus ingredientes."""
        totales = {
            'energia': Decimal("0"), 'prot': Decimal("0"), 'grasa': Decimal("0"),
            'cho': Decimal("0"), 'agua': Decimal("0"), 'fibra': Decimal("0"),
            'sodio': Decimal("0"), 'calcio': Decimal("0"), 'hierro': Decimal("0"),
            'zinc': Decimal("0"), 'vitamina_c': Decimal("0"), 'potasio': Decimal("0"),
            'fosforo': Decimal("0"), 'grasas_sat': Decimal("0"), 'grasas_mono': Decimal("0"),
            'grasas_poli': Decimal("0")
        }

        for ing in self.ingredientes.select_related('alimento').all():
            factor = (ing.cantidad or 0) / Decimal("100")
            a = ing.alimento

            totales['energia'] += factor * (a.energia_kcal or 0)
            totales['prot'] += factor * (a.proteinas_g or 0)
            totales['grasa'] += factor * (a.grasas_totales_g or 0)
            totales['agua'] += factor * (a.agua_g or 0)
            totales['cho'] += factor * (a.carbohidratos_disponibles_g or a.carbohidratos_totales_g or 0)
            totales['fibra'] += factor * (a.fibra_g or 0)
            totales['sodio'] += factor * (a.sodio_mg or 0)
            totales['calcio'] += factor * (a.calcio_mg or 0)
            totales['hierro'] += factor * (a.hierro_mg or 0)
            totales['zinc'] += factor * (a.zinc_mg or 0)
            totales['vitamina_c'] += factor * (a.vitamina_c_mg or 0)
            totales['potasio'] += factor * (a.potasio_mg or 0)
            totales['fosforo'] += factor * (a.fosforo_mg or 0)
            totales['grasas_sat'] += factor * (a.grasas_saturadas_g or 0)
            totales['grasas_mono'] += factor * (a.grasas_monoinsat_g or 0)
            totales['grasas_poli'] += factor * (a.grasas_poliinsat_g or 0)

        self.energia_kcal_total = totales['energia']
        self.proteinas_g_total = totales['prot']
        self.grasas_totales_g_total = totales['grasa']
        self.carbohidratos_g_total = totales['cho']
        self.agua_g_total = totales['agua']
        self.fibra_g_total = totales['fibra']
        self.sodio_mg_total = totales['sodio']
        self.calcio_mg_total = totales['calcio']
        self.hierro_mg_total = totales['hierro']
        self.zinc_mg_total = totales['zinc']
        self.vitamina_c_mg_total = totales['vitamina_c']
        self.potasio_mg_total = totales['potasio']
        self.fosforo_mg_total = totales['fosforo']
        self.grasas_saturadas_g_total = totales['grasas_sat']
        self.grasas_monoinsat_g_total = totales['grasas_mono']
        self.grasas_poliinsat_g_total = totales['grasas_poli']

        if save:
            self.save()

        return {k + '_total': v for k, v in totales.items()}


class IngredientePlato(models.Model):
    plato = models.ForeignKey(
        PlatoObservado,
        on_delete=models.CASCADE,
        related_name="ingredientes",
    )
    alimento = models.ForeignKey(
        AlimentoNutricional,
        on_delete=models.PROTECT,
        related_name="ingredientes_en_platos",
    )
    cantidad = models.DecimalField(max_digits=10, decimal_places=3)
    unidad = models.CharField(max_length=20, default="g")
    orden = models.IntegerField(null=True, blank=True)

    # Campos comunes
    energia_kcal = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    proteinas_g = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    grasas_totales_g = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    carbohidratos_g = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    agua_g = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    
    # Campos adicionales
    fibra_g = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    sodio_mg = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    calcio_mg = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    hierro_mg = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    zinc_mg = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    vitamina_c_mg = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    potasio_mg = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    fosforo_mg = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    grasas_saturadas_g = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    grasas_monoinsat_g = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    grasas_poliinsat_g = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)

    class Meta:
        verbose_name = "Ingrediente de plato"
        verbose_name_plural = "Ingredientes de plato"
        ordering = ['orden', 'id']
        indexes = [
            models.Index(fields=['plato', 'orden']),
            models.Index(fields=['alimento']),
        ]

    def __str__(self):
        return f"{self.alimento.nombre} ({self.cantidad}{self.unidad})"

    def recalcular_aporte(self, save=True):
        """Calcula y guarda el aporte nutricional de ESTE ingrediente."""
        factor = self.cantidad / Decimal("100")
        a = self.alimento

        # Campos comunes
        self.energia_kcal = factor * (a.energia_kcal or 0)
        self.proteinas_g = factor * (a.proteinas_g or 0)
        self.grasas_totales_g = factor * (a.grasas_totales_g or 0)
        self.agua_g = factor * (a.agua_g or 0)

        if a.carbohidratos_disponibles_g is not None:
            self.carbohidratos_g = factor * a.carbohidratos_disponibles_g
        else:
            self.carbohidratos_g = factor * (a.carbohidratos_totales_g or 0)

        # Campos adicionales
        self.fibra_g = factor * (a.fibra_g or 0)
        self.sodio_mg = factor * (a.sodio_mg or 0)
        self.calcio_mg = factor * (a.calcio_mg or 0)
        self.hierro_mg = factor * (a.hierro_mg or 0)
        self.zinc_mg = factor * (a.zinc_mg or 0)
        self.vitamina_c_mg = factor * (a.vitamina_c_mg or 0)
        self.potasio_mg = factor * (a.potasio_mg or 0)
        self.fosforo_mg = factor * (a.fosforo_mg or 0)
        self.grasas_saturadas_g = factor * (a.grasas_saturadas_g or 0)
        self.grasas_monoinsat_g = factor * (a.grasas_monoinsat_g or 0)
        self.grasas_poliinsat_g = factor * (a.grasas_poliinsat_g or 0)

        if save:
            self.save()

        return {
            "energia_kcal": self.energia_kcal,
            "proteinas_g": self.proteinas_g,
            "grasas_totales_g": self.grasas_totales_g,
            "carbohidratos_g": self.carbohidratos_g,
            "agua_g": self.agua_g,
            "fibra_g": self.fibra_g,
            "sodio_mg": self.sodio_mg,
            "calcio_mg": self.calcio_mg,
            "hierro_mg": self.hierro_mg,
            "zinc_mg": self.zinc_mg,
            "vitamina_c_mg": self.vitamina_c_mg,
            "potasio_mg": self.potasio_mg,
            "fosforo_mg": self.fosforo_mg,
            "grasas_saturadas_g": self.grasas_saturadas_g,
            "grasas_monoinsat_g": self.grasas_monoinsat_g,
            "grasas_poliinsat_g": self.grasas_poliinsat_g,
        }
