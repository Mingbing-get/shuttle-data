import { DataModel } from '@shuttle-data/crud'

import db from './db'
import snowFlake from './snowFlake'

const dataModel = new DataModel(
  {
    generateId: () => snowFlake.next(),
    getKnex: () => db,
  },
  {
    knex: db,
    modelTableConfig: {
      tableName: '_model',
      fieldConfig: {
        tableName: '_field',
      },
    },
    enumSourceConfig: {
      groupTableConfig: {
        tableName: '_group',
        itemTableConfig: {
          tableName: '_item',
        },
      },
    },
  },
)

export default dataModel
