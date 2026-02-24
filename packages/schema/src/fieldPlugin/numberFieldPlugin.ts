import { Knex } from 'knex'

import {
  DataModel,
  NumberFieldPlugin as _NumberFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class NumberFieldPlugin
  extends _NumberFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'number'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.NumberField,
  ): void {
    if (field.extra?.autoIncrement) {
      table.increments(field.name)
    } else {
      const builder = table.integer(field.name)
      if (field.extra?.unique) {
        builder.unique()
      }
    }
  }

  check(schema: DataModelSchema, field: DataModel.NumberField) {
    const result = this.getZod().safeParse(field)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }
}
