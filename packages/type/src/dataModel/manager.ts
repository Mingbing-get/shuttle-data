import { z } from 'zod'
import { nameZod, apiNameZod, labelZod, uniqueArrayZod } from '../utils'

import BooleanFieldPlugin from './fieldPlugin/booleanFieldPlugin'
import StringFieldPlugin from './fieldPlugin/stringFieldPlugin'
import TextFieldPlugin from './fieldPlugin/textFieldPlugin'
import NumberFieldPlugin from './fieldPlugin/numberFieldPlugin'
import DoubleFieldPlugin from './fieldPlugin/doubleFieldPlugin'
import DatetimeFieldPlugin from './fieldPlugin/datetimeFieldPlugin'
import DateFieldPlugin from './fieldPlugin/dateFieldPlugin'
import EnumFieldPlugin from './fieldPlugin/enumFieldPlugin'
import LookupFieldPlugin from './fieldPlugin/lookupFieldPlugin'
import JsonFieldPlugin from './fieldPlugin/jsonFieldPlugin'

import type { DataModel } from './type'

class DataModelManager {
  private fieldPlugins: Partial<
    Record<DataModel.FieldType, DataModel.FieldPlugin<any>>
  > = {
    boolean: new BooleanFieldPlugin(),
    string: new StringFieldPlugin(),
    text: new TextFieldPlugin(),
    number: new NumberFieldPlugin(),
    double: new DoubleFieldPlugin(),
    datetime: new DatetimeFieldPlugin(),
    date: new DateFieldPlugin(),
    enum: new EnumFieldPlugin(),
    lookup: new LookupFieldPlugin(),
    json: new JsonFieldPlugin(),
  }

  use(plugin: DataModel.FieldPlugin<DataModel.FieldType>) {
    this.fieldPlugins[plugin.type] = plugin

    return this
  }

  getPlugin<T extends DataModel.FieldType>(
    type: T,
  ): DataModel.FieldPlugin<T> | undefined {
    return this.fieldPlugins[type]
  }

  getPlugins() {
    return Object.values(this.fieldPlugins)
  }

  getZod() {
    return z
      .object({
        dataSourceName: z.string(),
        name: nameZod(),
        apiName: apiNameZod(),
        label: labelZod(),
        displayField: nameZod().describe(
          'Note: the field’s `name` is used here, not `apiName`',
        ),
        isSystem: z.boolean().optional().nullable(),
      })
      .catchall(z.any())
  }

  getWithoutNameZod() {
    return this.getZodWithFields().omit({ name: true })
  }

  getZodWithFields() {
    const modelZod = this.getZod()

    const fieldZods = Object.values(this.fieldPlugins).map((plugin) =>
      plugin.getZod(),
    )

    return modelZod.extend({
      fields: uniqueArrayZod(z.array(z.union(fieldZods)), ['name', 'apiName']),
    })
  }

  getWithoutNameWithFieldZod() {
    const fieldZods = Object.values(this.fieldPlugins).map((plugin) =>
      plugin.getZod().omit({ name: true }),
    )

    return this.getWithoutNameZod().extend({
      fields: uniqueArrayZod(z.array(z.union(fieldZods)), ['apiName']),
    })
  }

  getMabNameWithFieldZod() {
    const fieldZods = Object.values(this.fieldPlugins).map((plugin) =>
      plugin.getZod().partial({ name: true }),
    )

    return this.getZod().extend({
      fields: uniqueArrayZod(z.array(z.union(fieldZods)), ['apiName']),
    })
  }

  toTs(model: DataModel.Define, useApiName?: boolean) {
    const fields = model.fields.map((field) => {
      const plugin = this.getPlugin(field.type)
      if (!plugin) {
        throw new Error(`Field type ${field.type} not found`)
      }
      return plugin.getTs(field, useApiName)
    })

    const modelTypeName = `${this.capitalizeFirstLetter(model.name)}_model${useApiName ? '_api' : ''}`

    return `/**
  * label: ${model.label}
  * name: ${model.name}
  * apiName: ${model.apiName}
  */
export interface ${modelTypeName} {
  ${fields.join('\n')}
}`
  }

  private capitalizeFirstLetter(str: string): string {
    if (!str) return str // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

export default new DataModelManager()
