import { DataModel } from '@shuttle-data/type'
import { NumberFieldPlugin as _NumberFieldPlugin } from '@shuttle-data/type'

import NumberSettingRender from './settingRender'

export default class NumberFieldPlugin
  extends _NumberFieldPlugin
  implements DataModel.Render.FieldPlugin<'number'>
{
  getSettingRender() {
    return NumberSettingRender
  }
}
