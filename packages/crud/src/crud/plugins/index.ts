import { DataModel } from '@shuttle-data/type'
import { NCRUD } from '../type'

import StringFieldPlugin from './stringFieldPlugin'
import BooleanFieldPlugin from './booleanFieldPlugin'
import TextFieldPlugin from './textFieldPlugin'
import NumberFieldPlugin from './numberFieldPlugin'
import DoubleFieldPlugin from './doubleFieldPlugin'
import DatetimeFieldPlugin from './datetimeFieldPlugin'
import DateFieldPlugin from './dateFieldPlugin'
import EnumFieldPlugin from './enumFieldPlugin'
import LookupFieldPlugin from './lookupFieldPlugin'
import JsonFieldPlugin from './jsonFieldPlugin'

export {
  StringFieldPlugin,
  BooleanFieldPlugin,
  TextFieldPlugin,
  NumberFieldPlugin,
  DoubleFieldPlugin,
  DatetimeFieldPlugin,
  DateFieldPlugin,
  EnumFieldPlugin,
  LookupFieldPlugin,
  JsonFieldPlugin,
}

class CRUDFieldPluginManager {
  private plugins: Record<DataModel.FieldType, NCRUD.FieldPlugin<any>> = {
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

  use(plugin: NCRUD.FieldPlugin<DataModel.FieldType>) {
    this.plugins[plugin.type] = plugin
  }

  getPlugin(type: DataModel.FieldType) {
    return this.plugins[type]
  }
}

export default new CRUDFieldPluginManager()
