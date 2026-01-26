import { Knex } from 'knex'

import {
  DataModel,
  DoubleFieldPlugin as _DoubleFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class DoubleFieldPlugin
  extends _DoubleFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'double'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.DoubleField,
  ): void {
    table.double(field.name)
  }

  check(schema: DataModelSchema, field: DataModel.DoubleField) {
    this.getZod().parse(field)
  }
}
