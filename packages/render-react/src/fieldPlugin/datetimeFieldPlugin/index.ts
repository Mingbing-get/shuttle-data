import { DataModel } from '@shuttle-data/type'
import { DatetimeFieldPlugin as _DatetimeFieldPlugin } from '@shuttle-data/type'

import DateTimeSettingRender from './settingRender'
import DateTimeFormInputRender from './formInputRender'
import DateTimeDisplayRender from './displayRender'
import DateTimeConditionInputRender from './conditionInputRender'

export default class DatetimeFieldPlugin
  extends _DatetimeFieldPlugin
  implements DataModel.Render.FieldPlugin<'datetime', string>
{
  getSettingRender() {
    return DateTimeSettingRender
  }

  getFormInputRender() {
    return DateTimeFormInputRender
  }

  getDisplayRender() {
    return DateTimeDisplayRender
  }

  getConditionInputRender() {
    return DateTimeConditionInputRender
  }
}
