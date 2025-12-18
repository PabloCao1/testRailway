import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema'
import Alimento from './models/Alimento'
import Institucion from './models/Institucion'
import Visita from './models/Visita'
import Plato from './models/Plato'
import Ingrediente from './models/Ingrediente'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'auditoria_nutricional',
  jsi: true,
})

export const database = new Database({
  adapter,
  modelClasses: [
    Alimento,
    Institucion,
    Visita,
    Plato,
    Ingrediente,
  ],
})
