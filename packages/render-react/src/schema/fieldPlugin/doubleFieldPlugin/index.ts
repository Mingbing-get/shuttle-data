import { DataModel } from '@shuttle-data/type'
import { DoubleFieldPlugin as _DoubleFieldPlugin } from '@shuttle-data/type'

import DoubleSettingRender from './settingRender'

export default class DoubleFieldPlugin
  extends _DoubleFieldPlugin
  implements DataModel.Render.FieldPlugin<'double'>
{
  getSettingRender() {
    return DoubleSettingRender
  }
}
