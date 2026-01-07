import { Knex } from 'knex'

import {
  DataModel,
  TextFieldPlugin as _TextFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema, NDataModelSchema } from '../schema'

export default class TextFieldPlugin
  extends _TextFieldPlugin
  implements NDataModelSchema.FieldPlugin<'text'>
{
  readonly canAsDisplay = true

  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.TextField,
  ): void {
    table.text(field.name)
  }

  check(schema: DataModelSchema, field: DataModel.TextField) {
    this.getZod().parse(field)
  }
}
