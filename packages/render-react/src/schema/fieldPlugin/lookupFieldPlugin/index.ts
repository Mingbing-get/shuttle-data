import { LookupFieldPlugin as _LookupFieldPlugin } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/type'

import LookupSettingRender from './settingRender'

export default class LookupFieldPlugin
  extends _LookupFieldPlugin
  implements DataModel.Render.FieldPlugin<'lookup'>
{
  getSettingRender() {
    return LookupSettingRender
  }
}
