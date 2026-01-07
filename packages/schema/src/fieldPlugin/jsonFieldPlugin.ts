import { Knex } from 'knex'

import {
  DataModel,
  JsonFieldPlugin as _JsonFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema, NDataModelSchema } from '../schema'

export default class JsonFieldPlugin
  extends _JsonFieldPlugin
  implements NDataModelSchema.FieldPlugin<'json'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.JsonField,
  ): void {
    table.json(field.name)
  }

  check(schema: DataModelSchema, field: DataModel.JsonField) {
    this.getZod().parse(field)
  }
}
