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
  },
)

export default dataModel
