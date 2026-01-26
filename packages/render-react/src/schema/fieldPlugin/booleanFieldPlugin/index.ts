import { DataModel } from '@shuttle-data/type'
import { BooleanFieldPlugin as _BooleanFieldPlugin } from '@shuttle-data/type'

import BooleanSettingRender from './settingRender'

export default class BooleanFieldPlugin
  extends _BooleanFieldPlugin
  implements DataModel.Render.FieldPlugin<'boolean'>
{
  getSettingRender() {
    return BooleanSettingRender
  }
}
