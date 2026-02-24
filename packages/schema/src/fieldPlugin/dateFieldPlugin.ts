import { Knex } from 'knex'

import {
  DataModel,
  DateFieldPlugin as _DateFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class DateFieldPlugin
  extends _DateFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'date'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.DateField,
  ): void {
    const builder = table.date(field.name)
    if (field.extra?.unique) {
      builder.unique()
    }
  }

  check(schema: DataModelSchema, field: DataModel.DateField) {
    const result = this.getZod().safeParse(field)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }
}
