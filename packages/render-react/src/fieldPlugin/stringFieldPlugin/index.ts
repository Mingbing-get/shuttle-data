import { DataModel } from '@shuttle-data/type'
import { StringFieldPlugin as _StringFieldPlugin } from '@shuttle-data/type'

import StringSettingRender from './settingRender'
import StringFormInputRender from './formInputRender'
import StringDisplayRender from './displayRender'

export default class StringFieldPlugin
  extends _StringFieldPlugin
  implements DataModel.Render.FieldPlugin<'string', string>
{
  getSettingRender() {
    return StringSettingRender
  }

  getFormInputRender() {
    return StringFormInputRender
  }

  getDisplayRender() {
    return StringDisplayRender
  }
}
