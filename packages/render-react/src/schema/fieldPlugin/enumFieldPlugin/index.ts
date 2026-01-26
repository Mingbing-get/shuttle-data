import { EnumFieldPlugin as _EnumFieldPlugin } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/type'

import EnumSettingRender from './settingRender'

export default class EnumFieldPlugin
  extends _EnumFieldPlugin
  implements DataModel.Render.FieldPlugin<'enum'>
{
  getSettingRender() {
    return EnumSettingRender
  }
}
