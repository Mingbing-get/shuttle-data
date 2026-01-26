import { DataModel } from '@shuttle-data/type'
import { DateFieldPlugin as _DateFieldPlugin } from '@shuttle-data/type'

import DateSettingRender from './settingRender'

export default class DateFieldPlugin
  extends _DateFieldPlugin
  implements DataModel.Render.FieldPlugin<'date'>
{
  getSettingRender() {
    return DateSettingRender
  }
}
