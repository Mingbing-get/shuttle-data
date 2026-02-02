import { DataModel } from '@shuttle-data/type'
import { DateFieldPlugin as _DateFieldPlugin } from '@shuttle-data/type'

import DateSettingRender from './settingRender'
import DateDisplayRender from './displayRender'
import DateFormInputRender from './formInputRender'
import DateConditionInputRender from './conditionInputRender'

export default class DateFieldPlugin
  extends _DateFieldPlugin
  implements DataModel.Render.FieldPlugin<'date', string>
{
  getSettingRender() {
    return DateSettingRender
  }

  getDisplayRender() {
    return DateDisplayRender
  }

  getFormInputRender() {
    return DateFormInputRender
  }

  getConditionInputRender() {
    return DateConditionInputRender
  }
}
