import { Knex } from 'knex'

import {
  DataModel,
  StringFieldPlugin as _StringFieldPlugin,
} from '@shuttle-data/type'

import { NDataModelSchema, DataModelSchema } from '../schema'

export default class StringFieldPlugin
  extends _StringFieldPlugin
  implements NDataModelSchema.FieldPlugin<'string'>
{
  readonly canAsDisplay = true

  fieldBuilder(table: Knex.CreateTableBuilder, field: DataModel.StringField) {
    table.string(field.name)
  }

  check(schema: DataModelSchema, field: DataModel.StringField) {
    this.getZod().parse(field)
  }
}
