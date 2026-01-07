import { Knex } from 'knex'

import {
  DataModel,
  NumberFieldPlugin as _NumberFieldPlugin,
} from '@shuttle-data/type'

import { NDataModelSchema, DataModelSchema } from '../schema'

export default class NumberFieldPlugin
  extends _NumberFieldPlugin
  implements NDataModelSchema.FieldPlugin<'number'>
{
  readonly canAsDisplay = true

  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.NumberField,
  ): void {
    if (field.extra?.autoIncrement) {
      table.increments(field.name)
    } else {
      table.integer(field.name)
    }
  }

  check(schema: DataModelSchema, field: DataModel.NumberField) {
    this.getZod().parse(field)
  }
}
