import { Knex } from 'knex'

import {
  DataModel,
  LookupFieldPlugin as _LookupFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class LookupFieldPlugin
  extends _LookupFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'lookup'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.LookupField,
  ): void {
    if (field.extra?.multiple) {
      table.json(field.name)
    } else {
      const builder = table.bigInteger(field.name)
      if (field.extra?.unique) {
        builder.unique()
      }
    }
  }

  async check(schema: DataModelSchema, field: DataModel.LookupField) {
    const result = this.getZod().safeParse(field)
    if (!result.success) {
      throw new Error(result.error.message)
    }

    if (!field.extra?.modalName) {
      throw new Error(`lookup field ${field.name} must have modalName`)
    }

    if (field.extra.modalName === schema.userDbName) return

    const hasModel = await schema.hasTable(field.extra.modalName)
    if (!hasModel) {
      throw new Error(
        `lookup field ${field.name} modalName ${field.extra.modalName} is not found`,
      )
    }
  }
}
