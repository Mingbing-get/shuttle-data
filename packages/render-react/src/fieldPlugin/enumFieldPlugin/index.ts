import { EnumFieldPlugin as _EnumFieldPlugin } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/type'

import EnumSettingRender from './settingRender'
import EnumFormInputRender from './formInputRender'
import EnumDisplayRender from './displayRender'

export default class EnumFieldPlugin
  extends _EnumFieldPlugin
  implements DataModel.Render.FieldPlugin<'enum', string | string[]>
{
  getSettingRender() {
    return EnumSettingRender
  }

  getFormInputRender() {
    return EnumFormInputRender
  }

  getDisplayRender() {
    return EnumDisplayRender
  }
}
