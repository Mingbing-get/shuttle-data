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
    table.timestamp(field.name)
  }

  check(schema: DataModelSchema, field: DataModel.DateTimeField) {
    this.getZod().parse(field)
  }
}
