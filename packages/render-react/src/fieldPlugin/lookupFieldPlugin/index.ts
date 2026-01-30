import {
  LookupFieldPlugin as _LookupFieldPlugin,
  DataCRUD,
} from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/type'

import LookupSettingRender from './settingRender'
import LookupDisplayRender from './displayRender'
import LookupFormInputRender from './formInputRender'

export default class LookupFieldPlugin
  extends _LookupFieldPlugin
  implements
    DataModel.Render.FieldPlugin<
      'lookup',
      DataCRUD.LookupInRecord | DataCRUD.LookupInRecord[]
    >
{
  getSettingRender() {
    return LookupSettingRender
  }

  getDisplayRender() {
    return LookupDisplayRender
  }

  getFormInputRender() {
    return LookupFormInputRender
  }
}
