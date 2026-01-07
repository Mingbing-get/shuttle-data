import { Knex } from 'knex'

import {
  DataModel,
  LookupFieldPlugin as _LookupFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema, NDataModelSchema } from '../schema'

export default class LookupFieldPlugin
  extends _LookupFieldPlugin
  implements NDataModelSchema.FieldPlugin<'lookup'>
{
  fieldBuilder(
    table: Knex.CreateTableBuilder,
    field: DataModel.LookupField,
  ): void {
    if (field.extra?.multiple) {
      table.json(field.name)
    } else {
      table.bigInteger(field.name)
    }
  }

  async check(schema: DataModelSchema, field: DataModel.LookupField) {
    this.getZod().parse(field)

    if (!field.extra?.modalName) {
      throw new Error(`lookup field ${field.name} must have modalName`)
    }

    if (field.extra.modalName === schema.userDbName) return

    const modals = await schema.all()
    const modal = modals.find((modal) => modal.name === field.extra?.modalName)
    if (!modal) {
      throw new Error(
        `lookup field ${field.name} modalName ${field.extra.modalName} is not found`,
      )
    }
  }
}
