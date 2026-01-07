import { z } from 'zod'

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

export default class DataModelManager {
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

  getZod() {
    return z
      .object({
        dataSourceName: z.string(),
        name: z.string(),
        apiName: z.string(),
        label: z.string().optional(),
        displayField: z.string(),
        isSystem: z.boolean().optional(),
      })
      .catchall(z.any())
  }

  getZodWithFields() {
    const modelZod = this.getZod()

    const fieldZods = Object.values(this.fieldPlugins).map((plugin) =>
      plugin.getZod(),
    )

    return modelZod.extend({
      fields: z.array(z.union(fieldZods)),
    })
  }
}
