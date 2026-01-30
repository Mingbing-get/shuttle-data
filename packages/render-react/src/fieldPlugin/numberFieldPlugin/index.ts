import { DataModel } from '@shuttle-data/type'
import { NumberFieldPlugin as _NumberFieldPlugin } from '@shuttle-data/type'

import NumberSettingRender from './settingRender'
import NumberDisplayRender from './displayRender'
import NumberFormInputRender from './formInputRender'

export default class NumberFieldPlugin
  extends _NumberFieldPlugin
  implements DataModel.Render.FieldPlugin<'number', number>
{
  getSettingRender() {
    return NumberSettingRender
  }

  getDisplayRender() {
    return NumberDisplayRender
  }

  getFormInputRender() {
    return NumberFormInputRender
  }
}
