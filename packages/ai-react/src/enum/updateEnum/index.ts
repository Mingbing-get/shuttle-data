import { ShuttleAi } from '@shuttle-ai/type'

import UpdateEnumToolRender from '../createEnum/render'

const updateEnumTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'update_enum_group',
  description: '更新枚举',
  run: {
    type: 'render',
    Render: UpdateEnumToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default updateEnumTool
