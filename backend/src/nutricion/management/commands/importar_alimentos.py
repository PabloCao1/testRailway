import json
import os
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from nutricion.models import CategoriaAlimento, AlimentoNutricional


CATEGORIA_CODIGOS = {
    "Cereales y derivados": "CER",
    "Vegetales y derivados": "VEG",
    "Frutas y derivados": "FRT",
    "Carnes y derivados": "CAR",
    "Pescados y mariscos": "PES",
    "Leche y derivados": "LAC",
    "Grasas y aceites": "GRA",
    "Productos azucarados": "AZU",
    "Misceláneos": "MISC",
    "Huevo": "HUE",
}


class Command(BaseCommand):
    help = "Importa el catálogo de alimentos nutricionales desde un archivo JSON"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            default="data/alimentos_argenfood_ejemplo.json",
            help="Ruta al archivo JSON de alimentos",
        )
        parser.add_argument(
            "--truncate",
            action="store_true",
            help="Borra los alimentos existentes antes de importar",
        )

    def handle(self, *args, **options):
        file_path = options["file"]
        truncate = options["truncate"]

        if not os.path.exists(file_path):
            raise CommandError(f"Archivo JSON no encontrado: {file_path}")

        self.stdout.write(self.style.NOTICE(f"Usando archivo: {file_path}"))

        with open(file_path, encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                raise CommandError(f"Error al parsear JSON: {e}")

        if not isinstance(data, list):
            raise CommandError("El JSON debe ser una lista de objetos (alimentos).")

        with transaction.atomic():
            if truncate:
                self.stdout.write("Borrando alimentos existentes...")
                AlimentoNutricional.objects.all().delete()
                CategoriaAlimento.objects.all().delete()

            categorias_map = {c.nombre: c for c in CategoriaAlimento.objects.all()}

            def get_or_create_categoria(nombre_cat: str) -> CategoriaAlimento:
                cat = categorias_map.get(nombre_cat)
                if cat:
                    return cat

                codigo = CATEGORIA_CODIGOS.get(
                    nombre_cat,
                    nombre_cat[:4].upper().replace(" ", "_"),
                )
                cat = CategoriaAlimento.objects.create(
                    codigo=codigo,
                    nombre=nombre_cat,
                )
                categorias_map[nombre_cat] = cat
                self.stdout.write(f"  Categoría creada: {nombre_cat} ({codigo})")
                return cat

            objetos = []
            for item in data:
                nombre_cat = item.get("categoria")
                if not nombre_cat:
                    raise CommandError(f"Registro sin 'categoria': {item}")

                categoria = get_or_create_categoria(nombre_cat)

                objetos.append(
                    AlimentoNutricional(
                        codigo_argenfood=item["codigo_argenfood"],
                        nombre=item["nombre"],
                        especie=item.get("especie") or None,
                        unidad_base=item.get("unidad_base") or "100 g",
                        categoria=categoria,
                        energia_kj=item.get("energia_kj"),
                        energia_kcal=item.get("energia_kcal"),
                        agua_g=item.get("agua_g"),
                        proteinas_g=item.get("proteinas_g"),
                        grasas_totales_g=item.get("grasas_totales_g"),
                        carbohidratos_totales_g=item.get("carbohidratos_totales_g"),
                        carbohidratos_disponibles_g=item.get("carbohidratos_disponibles_g"),
                        fibra_g=item.get("fibra_g"),
                        cenizas_g=item.get("cenizas_g"),
                        sodio_mg=item.get("sodio_mg"),
                        potasio_mg=item.get("potasio_mg"),
                        calcio_mg=item.get("calcio_mg"),
                        fosforo_mg=item.get("fosforo_mg"),
                        hierro_mg=item.get("hierro_mg"),
                        zinc_mg=item.get("zinc_mg"),
                        tiamina_mg=item.get("tiamina_mg"),
                        riboflavina_mg=item.get("riboflavina_mg"),
                        niacina_mg=item.get("niacina_mg"),
                        vitamina_c_mg=item.get("vitamina_c_mg"),
                        grasas_saturadas_g=item.get("grasas_saturadas_g"),
                        grasas_monoinsat_g=item.get("grasas_monoinsat_g"),
                        grasas_poliinsat_g=item.get("grasas_poliinsat_g"),
                        colesterol_mg=item.get("colesterol_mg"),
                        ag_c14_0_g=item.get("ag_c14_0_g"),
                        ag_c16_0_g=item.get("ag_c16_0_g"),
                        ag_c18_0_g=item.get("ag_c18_0_g"),
                        ag_c18_1w9_g=item.get("ag_c18_1w9_g"),
                        ag_c18_2w6_g=item.get("ag_c18_2w6_g"),
                        ag_c18_3w3_g=item.get("ag_c18_3w3_g"),
                        ag_epa_g=item.get("ag_epa_g"),
                        ag_dha_g=item.get("ag_dha_g"),
                        fuente=item.get("fuente"),
                    )
                )

            self.stdout.write(f"Importando {len(objetos)} alimentos...")
            AlimentoNutricional.objects.bulk_create(objetos, batch_size=500)

        self.stdout.write(self.style.SUCCESS("✓ Importación completada con éxito."))
        self.stdout.write(f"  Categorías: {CategoriaAlimento.objects.count()}")
        self.stdout.write(f"  Alimentos: {AlimentoNutricional.objects.count()}")
