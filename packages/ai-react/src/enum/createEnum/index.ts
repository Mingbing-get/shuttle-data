import { ShuttleAi } from '@shuttle-ai/type'

import CreateEnumToolRender from './render'

const createEnumTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'add_enum_group',
  description: '创建枚举',
  label: '创建枚举',
  run: {
    type: 'render',
    Render: CreateEnumToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default createEnumTool
