import { Knex } from 'knex'

import {
  DataModel,
  DatetimeFieldPlugin as _DatetimeFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class DatetimeFieldPlugin
  extends _DatetimeFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'datetime'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.DateTimeField,
  ): void {
    const builder = table.timestamp(field.name)
    if (field.extra?.unique) {
      builder.unique()
    }
  }

  check(schema: DataModelSchema, field: DataModel.DateTimeField) {
    const result = this.getZod().safeParse(field)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }
}
