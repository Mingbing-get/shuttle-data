import { DataModel } from '@shuttle-data/type'
import { TextFieldPlugin as _TextFieldPlugin } from '@shuttle-data/type'

import TextSettingRender from './settingRender'
import TextFormInputRender from './formInputRender'
import TextDisplayRender from './displayRender'
import TextConditionInputRender from './conditionInputRender'

export default class TextFieldPlugin
  extends _TextFieldPlugin
  implements DataModel.Render.FieldPlugin<'text', string>
{
  getSettingRender() {
    return TextSettingRender
  }

  getFormInputRender() {
    return TextFormInputRender
  }

  getDisplayRender() {
    return TextDisplayRender
  }

  getConditionInputRender() {
    return TextConditionInputRender
  }
}
