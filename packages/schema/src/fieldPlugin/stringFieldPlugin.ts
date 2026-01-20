import { Knex } from 'knex'

import {
  DataModel,
  StringFieldPlugin as _StringFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class StringFieldPlugin
  extends _StringFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'string'>
{
  readonly canAsDisplay = true

  fieldBuilder(table: Knex.CreateTableBuilder, field: DataModel.StringField) {
    const builder = table.string(field.name)
    if (field.extra?.unique) {
      builder.unique()
    }
  }

  check(schema: DataModelSchema, field: DataModel.StringField) {
    this.getZod().parse(field)
  }
}
