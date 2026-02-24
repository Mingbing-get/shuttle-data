import { Knex } from 'knex'

import {
  DataModel,
  JsonFieldPlugin as _JsonFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class JsonFieldPlugin
  extends _JsonFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'json'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.JsonField,
  ): void {
    table.json(field.name)
  }

  check(schema: DataModelSchema, field: DataModel.JsonField) {
    const result = this.getZod().safeParse(field)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }
}
