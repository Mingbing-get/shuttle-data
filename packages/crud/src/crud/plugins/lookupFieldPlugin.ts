import { LookupFieldPlugin as _LookupFieldPlugin } from '@shuttle-data/schema'
import { DataCRUD } from '@shuttle-data/type'

import CRUD from '../instance'
import conditionPluginManager from '../conditionBuilder'
import { NCRUD } from '../type'

export default class LookupFieldPlugin
  extends _LookupFieldPlugin
  implements NCRUD.FieldPlugin<'lookup'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: NCRUD.FieldCreateConditionOption<'lookup', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      field.extra?.multiple
        ? [
            'isNull',
            'isNotNull',
            'contains',
            'notContains',
            'hasAnyOf',
            'notAnyOf',
          ]
        : ['isNull', 'isNotNull', 'eq', 'neq', 'in', 'notIn'],
    )
  }

  async toOutput({
    values,
    schema,
    getKnex,
    field,
  }: NCRUD.FieldToOutputOption<'lookup', undefined | string | string[]>) {
    if (values.length === 0) return []

    if (!field.extra) {
      throw new Error(`Field ${field.name} extra is undefined`)
    }

    let allIds: string[] = []
    if (field.extra.multiple) {
      allIds = values.reduce((acc: string[], v) => {
        if (v?.length) {
          const ids = this.parseValue(v)
          ids.forEach((id) => {
            if (!acc.includes(id)) {
              acc.push(id)
            }
          })
        }

        return acc
      }, [])
    } else {
      allIds = [...new Set((values as string[]).filter(Boolean))]
    }

    if (allIds.length === 0) {
      if (field.extra.multiple) {
        return values.map(() => [])
      }

      return []
    }

    const model = await schema.getTable(field.extra.modalName)
    if (!model) {
      throw new Error(`Model ${field.extra.modalName} not found`)
    }
    const knex = await getKnex(model.dataSourceName)
    const records: { _id: string; [CRUD.DISPLAY]: string }[] = await knex(
      model.name,
    )
      .where(CRUD.ID, 'in', allIds)
      .select(CRUD.ID, { [CRUD.DISPLAY]: model.displayField || CRUD.ID })

    if (field.extra.multiple) {
      return (values as string[][]).map((v) => {
        if (!v?.length) return []

        const ids = this.parseValue(v)

        return records.filter((r) => ids.includes(r._id))
      })
    }

    return (values as (string | undefined)[]).map((v) => {
      if (!v) return

      return records.find((r) => r._id === v)
    })
  }

  async toDb({
    values,
    field,
  }: NCRUD.FieldToDbOption<
    'lookup',
    undefined | DataCRUD.LookupInRecord | DataCRUD.LookupInRecord[]
  >) {
    if (values.length === 0) return []

    if (!field.extra) {
      throw new Error(`Field ${field.name} extra is undefined`)
    }

    if (field.extra.multiple) {
      return (values as DataCRUD.LookupInRecord[][]).map((list) => {
        if (list === undefined) return

        return JSON.stringify((list || []).map((v) => v._id))
      })
    }

    return (values as (DataCRUD.LookupInRecord | undefined)[]).map(
      (v) => v?._id,
    )
  }

  compare({
    field,
    value1,
    value2,
  }: NCRUD.FieldCompareOption<'lookup', undefined | string | string[]>) {
    if (!field.extra?.multiple) {
      return value1 === value2
    }

    const values1 = this.parseValue(value1 || [])
    const values2 = this.parseValue(value2 || [])

    return (
      values1.length === values2.length &&
      values1.every((v) => values2.includes(v))
    )
  }

  private parseValue(v: string | string[]) {
    if (Array.isArray(v)) return v

    if (v.startsWith('[')) return JSON.parse(v) as string[]

    return []
  }
}
