import { DataModel } from '@shuttle-data/type'
import { DatetimeFieldPlugin as _DatetimeFieldPlugin } from '@shuttle-data/type'

import DateTimeSettingRender from './settingRender'

export default class DatetimeFieldPlugin
  extends _DatetimeFieldPlugin
  implements DataModel.Render.FieldPlugin<'datetime'>
{
  getSettingRender() {
    return DateTimeSettingRender
  }
}
