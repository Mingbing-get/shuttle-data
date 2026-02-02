import { DataModel } from '@shuttle-data/type'
import { BooleanFieldPlugin as _BooleanFieldPlugin } from '@shuttle-data/type'

import BooleanSettingRender from './settingRender'
import BooleanFormInputRender from './formInputRender'
import BooleanDisplayRender from './displayRender'
import BooleanConditionInputRender from './conditionInputRender'

export default class BooleanFieldPlugin
  extends _BooleanFieldPlugin
  implements DataModel.Render.FieldPlugin<'boolean', boolean>
{
  getSettingRender() {
    return BooleanSettingRender
  }

  getFormInputRender() {
    return BooleanFormInputRender
  }

  getDisplayRender() {
    return BooleanDisplayRender
  }

  getConditionInputRender() {
    return BooleanConditionInputRender
  }
}
