import { Knex } from 'knex'

import {
  DataModel,
  TextFieldPlugin as _TextFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class TextFieldPlugin
  extends _TextFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'text'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.TextField,
  ): void {
    const builder = table.text(field.name)
    if (field.extra?.unique) {
      builder.unique()
    }
  }

  check(schema: DataModelSchema, field: DataModel.TextField) {
    const result = this.getZod().safeParse(field)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }
}
