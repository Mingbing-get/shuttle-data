import { Knex } from 'knex'

import {
  DataModel,
  BooleanFieldPlugin as _BooleanFieldPlugin,
} from '@shuttle-data/type'

import { NDataModelSchema, DataModelSchema } from '../schema'

export default class BooleanFieldPlugin
  extends _BooleanFieldPlugin
  implements NDataModelSchema.FieldPlugin<'boolean'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.BooleanField,
  ): void {
    table.boolean(field.name)
  }

  check(schema: DataModelSchema, field: DataModel.BooleanField) {
    this.getZod().parse(field)
  }
}
