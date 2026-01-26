import { DataModel } from '@shuttle-data/type'
import { TextFieldPlugin as _TextFieldPlugin } from '@shuttle-data/type'

import TextSettingRender from './settingRender'

export default class TextFieldPlugin
  extends _TextFieldPlugin
  implements DataModel.Render.FieldPlugin<'text'>
{
  getSettingRender() {
    return TextSettingRender
  }
}
