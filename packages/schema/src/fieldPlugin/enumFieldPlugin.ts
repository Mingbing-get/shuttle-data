import { Knex } from 'knex'

import {
  DataModel,
  EnumFieldPlugin as _EnumFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema, NDataModelSchema } from '../schema'

export default class EnumFieldPlugin
  extends _EnumFieldPlugin
  implements NDataModelSchema.FieldPlugin<'enum'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.EnumField,
  ): void {
    if (field.extra?.multiple) {
      table.json(field.name)
    } else {
      table.string(field.name)
    }
  }

  check(schema: DataModelSchema, field: DataModel.EnumField) {
    this.getZod().parse(field)
  }
}
