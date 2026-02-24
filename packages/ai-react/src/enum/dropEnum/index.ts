import { ShuttleAi } from '@shuttle-ai/type'

import DropEnumToolRender from './render'

const dropEnumTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'remove_enum_group',
  description: '删除枚举',
  run: {
    type: 'render',
    Render: DropEnumToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default dropEnumTool
