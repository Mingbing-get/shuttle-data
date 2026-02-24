import { Knex } from 'knex'

import {
  DataModel,
  EnumFieldPlugin as _EnumFieldPlugin,
} from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

export default class EnumFieldPlugin
  extends _EnumFieldPlugin
  implements DataModel.Schema.ServerFieldPlugin<'enum'>
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

  async check(schema: DataModelSchema, field: DataModel.EnumField) {
    const result = this.getZod().safeParse(field)
    if (!result.success) {
      throw new Error(result.error.message)
    }

    if (!field.extra?.groupName) {
      throw new Error(`enum field ${field.name} must have groupName`)
    }

    const hasGroup = await schema.enumManager.hasGroup(field.extra.groupName)
    if (!hasGroup) {
      throw new Error(
        `enum field ${field.name} group name ${field.extra.groupName} not found`,
      )
    }
  }
}
