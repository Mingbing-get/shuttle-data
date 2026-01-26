import { DataModel } from '@shuttle-data/type'
import { StringFieldPlugin as _StringFieldPlugin } from '@shuttle-data/type'

import StringSettingRender from './settingRender'

export default class StringFieldPlugin
  extends _StringFieldPlugin
  implements DataModel.Render.FieldPlugin<'string'>
{
  getSettingRender() {
    return StringSettingRender
  }
}
