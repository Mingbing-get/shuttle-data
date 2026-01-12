import { Knex } from 'knex'

import {
  DataModel,
  DatetimeFieldPlugin as _DatetimeFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema, NDataModelSchema } from '../schema'

export default class DatetimeFieldPlugin
  extends _DatetimeFieldPlugin
  implements NDataModelSchema.FieldPlugin<'datetime'>
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
    this.getZod().parse(field)
  }
}
