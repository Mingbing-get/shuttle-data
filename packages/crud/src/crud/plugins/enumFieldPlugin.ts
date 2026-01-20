import { EnumFieldPlugin as _EnumFieldPlugin } from '@shuttle-data/schema'
import { DataCondition, DataCRUD } from '@shuttle-data/type'

import conditionPluginManager from '../conditionBuilder'

export default class EnumFieldPlugin
  extends _EnumFieldPlugin
  implements DataCRUD.Server.FieldPlugin<'enum'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    enumInfo,
    condition,
    useApiName,
  }: DataCRUD.Server.FieldCreateConditionOption<'enum', M>) {
    const newCondition = { ...condition, key: field.name }
    if (this.hasValueCondition(newCondition)) {
      if (useApiName) {
        const enumGroup = enumInfo.groupMap[field.extra?.groupName || '']

        if (Array.isArray(newCondition.value)) {
          newCondition.value = newCondition.value.map((item) => {
            const enumItem = enumGroup.items.find((i) => i.apiName === item)
            if (!enumItem) {
              throw new Error(
                `enum item ${item} not found in group ${enumGroup.label || enumGroup.apiName}`,
              )
            }
            return enumItem.name
          })
        } else {
          const enumItem = enumGroup.items.find(
            (i) => i.apiName === newCondition.value,
          )
          if (!enumItem) {
            throw new Error(
              `enum item ${newCondition.value} not found in group ${enumGroup.label || enumGroup.apiName}`,
            )
          }
          newCondition.value = enumItem.name
        }
      }
    }

    conditionPluginManager.create(
      builder,
      newCondition,
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
    field,
    useApiName,
  }: DataCRUD.Server.FieldToOutputOption<
    'enum',
    undefined | string | string[]
  >) {
    if (values.length === 0) return values

    if (!field.extra) {
      throw new Error('enum field extra is required')
    }

    const enumManager = schema.getEnumManager()
    const group = await enumManager.getGroup(field.extra.groupName)
    if (!group) {
      throw new Error(`enum group ${field.extra.groupName} not found`)
    }

    if (field.extra.multiple) {
      return values.map((v) => {
        if (!v?.length) return []

        const names = this.parseValue(v)

        if (!useApiName) return names

        return names.map((itemName) => {
          const enumItem = group.items.find((i) => i.name === itemName)
          if (!enumItem) {
            throw new Error(
              `enum item ${itemName} not found in group ${group.label || group.apiName}`,
            )
          }
          return enumItem.apiName
        })
      })
    }

    if (!useApiName) return values

    return (values as (string | undefined)[]).map((itemName) => {
      if (!itemName) return itemName

      const enumItem = group.items.find((i) => i.name === itemName)
      if (!enumItem) {
        throw new Error(
          `enum item ${itemName} not found in group ${group.label || group.apiName}`,
        )
      }
      return enumItem.apiName
    })
  }

  async toDb({
    values,
    schema,
    field,
    useApiName,
  }: DataCRUD.Server.FieldToDbOption<'enum', undefined | string | string[]>) {
    if (!field.extra) {
      throw new Error('enum field extra is required')
    }

    const enumManager = schema.getEnumManager()
    const group = await enumManager.getGroup(field.extra.groupName)
    if (!group) {
      throw new Error(`enum group ${field.extra.groupName} not found`)
    }

    if (values.length === 0 || !useApiName) {
      if (field.extra?.multiple) {
        return (values as string[][]).map((v) => {
          if (v === undefined) return v

          v.forEach((item) => {
            const enumItem = group.items.find((i) => i.name === item)
            if (!enumItem) {
              throw new Error(
                `enum item ${item} not found in group ${group.label || group.apiName}`,
              )
            }
          })

          return JSON.stringify(v || [])
        })
      }

      ;(values as (string | undefined)[]).forEach((v) => {
        if (!v) return

        const enumItem = group.items.find((i) => i.name === v)
        if (!enumItem) {
          throw new Error(
            `enum item ${v} not found in group ${group.label || group.apiName}`,
          )
        }
      })
      return values
    }

    if (field.extra.multiple) {
      return (values as string[][]).map((v) => {
        const value = (v || []).map((itemApiName) => {
          const enumItem = group.items.find((i) => i.apiName === itemApiName)
          if (!enumItem) {
            throw new Error(
              `enum item ${itemApiName} not found in group ${group.label || group.apiName}`,
            )
          }
          return enumItem.name
        })

        return JSON.stringify(value)
      })
    }

    return (values as (string | undefined)[]).map((itemApiName) => {
      if (!itemApiName) return itemApiName

      const enumItem = group.items.find((i) => i.apiName === itemApiName)
      if (!enumItem) {
        throw new Error(
          `enum item ${itemApiName} not found in group ${group.label || group.apiName}`,
        )
      }
      return enumItem.name
    })
  }

  compare({
    field,
    value1,
    value2,
  }: DataCRUD.Server.FieldCompareOption<
    'enum',
    undefined | string | string[]
  >) {
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

  private hasValueCondition<M extends Record<string, any>>(
    condition: Exclude<
      DataCondition.Define<M>,
      DataCondition.AndCondition<M> | DataCondition.OrCondition<M>
    >,
  ): condition is Exclude<
    DataCondition.Define<M>,
    | DataCondition.AndCondition<M>
    | DataCondition.OrCondition<M>
    | DataCondition.IsTrueCondition<M>
    | DataCondition.IsNotTrueCondition<M>
    | DataCondition.IsNullCondition<M>
    | DataCondition.IsNotNullCondition<M>
  > {
    return (condition as any).value !== undefined
  }

  private parseValue(v: string | string[]) {
    if (Array.isArray(v)) return v

    if (v.startsWith('[')) return JSON.parse(v) as string[]

    return []
  }
}
