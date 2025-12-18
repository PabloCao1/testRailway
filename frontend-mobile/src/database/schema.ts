import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'alimentos',
      columns: [
        { name: 'codigo_argenfood', type: 'number', isIndexed: true },
        { name: 'nombre', type: 'string', isIndexed: true },
        { name: 'categoria_id', type: 'number' },
        { name: 'energia_kcal', type: 'number' },
        { name: 'proteinas_g', type: 'number' },
        { name: 'grasas_totales_g', type: 'number' },
        { name: 'carbohidratos_g', type: 'number' },
        { name: 'fibra_g', type: 'number' },
        { name: 'sodio_mg', type: 'number' },
        { name: 'calcio_mg', type: 'number' },
        { name: 'hierro_mg', type: 'number' },
        { name: 'zinc_mg', type: 'number' },
        { name: 'vitamina_c_mg', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'instituciones',
      columns: [
        { name: 'codigo', type: 'string', isIndexed: true },
        { name: 'nombre', type: 'string', isIndexed: true },
        { name: 'tipo', type: 'string', isIndexed: true },
        { name: 'direccion', type: 'string' },
        { name: 'barrio', type: 'string' },
        { name: 'comuna', type: 'string' },
        { name: 'activo', type: 'boolean' },
        { name: 'synced', type: 'boolean', isIndexed: true },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'visitas',
      columns: [
        { name: 'institucion_id', type: 'string', isIndexed: true },
        { name: 'fecha', type: 'number', isIndexed: true },
        { name: 'tipo_comida', type: 'string' },
        { name: 'observaciones', type: 'string' },
        { name: 'formulario_completado', type: 'boolean' },
        { name: 'formulario_respuestas', type: 'string' },
        { name: 'synced', type: 'boolean', isIndexed: true },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'platos',
      columns: [
        { name: 'visita_id', type: 'string', isIndexed: true },
        { name: 'nombre', type: 'string' },
        { name: 'tipo_plato', type: 'string' },
        { name: 'porciones_servidas', type: 'number' },
        { name: 'energia_kcal_total', type: 'number' },
        { name: 'proteinas_g_total', type: 'number' },
        { name: 'grasas_totales_g_total', type: 'number' },
        { name: 'carbohidratos_g_total', type: 'number' },
        { name: 'synced', type: 'boolean', isIndexed: true },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'ingredientes',
      columns: [
        { name: 'plato_id', type: 'string', isIndexed: true },
        { name: 'alimento_id', type: 'string', isIndexed: true },
        { name: 'cantidad', type: 'number' },
        { name: 'unidad', type: 'string' },
        { name: 'energia_kcal', type: 'number' },
        { name: 'proteinas_g', type: 'number' },
        { name: 'grasas_totales_g', type: 'number' },
        { name: 'carbohidratos_g', type: 'number' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
})
