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
  fieldBuilder(table: Knex.CreateTableBuilder, field: DataModel.StringField) {
    const builder = table.string(field.name)
    if (field.extra?.unique) {
      builder.unique()
    }
  }

  check(schema: DataModelSchema, field: DataModel.StringField) {
    const result = this.getZod().safeParse(field)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }
}
