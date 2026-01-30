import { DataModel } from '@shuttle-data/type'
import { JsonFieldPlugin as _JsonFieldPlugin } from '@shuttle-data/type'

export default class JsonFieldPlugin
  extends _JsonFieldPlugin
  implements DataModel.Render.FieldPlugin<'json', any>
{
  getFormInputRender() {
    return null as any
  }
}
