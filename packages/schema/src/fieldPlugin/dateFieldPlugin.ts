import { Knex } from 'knex'

import {
  DataModel,
  DateFieldPlugin as _DateFieldPlugin,
} from '@shuttle-data/type'

import { NDataModelSchema, DataModelSchema } from '../schema'

export default class DateFieldPlugin
  extends _DateFieldPlugin
  implements NDataModelSchema.FieldPlugin<'date'>
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
    this.getZod().parse(field)
  }
}
