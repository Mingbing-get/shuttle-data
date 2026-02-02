import { DataModel } from '@shuttle-data/type'
import { DoubleFieldPlugin as _DoubleFieldPlugin } from '@shuttle-data/type'

import DoubleSettingRender from './settingRender'
import DoubleDisplayRender from './displayRender'
import DoubleFormInputRender from './formInputRender'
import DoubleConditionInputRender from './conditionInputRender'

export default class DoubleFieldPlugin
  extends _DoubleFieldPlugin
  implements DataModel.Render.FieldPlugin<'double', number>
{
  getSettingRender() {
    return DoubleSettingRender
  }

  getDisplayRender() {
    return DoubleDisplayRender
  }

  getFormInputRender() {
    return DoubleFormInputRender
  }

  getConditionInputRender() {
    return DoubleConditionInputRender
  }
}
