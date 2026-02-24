import { ShuttleAi } from '@shuttle-ai/type'

import GetEnumListToolRender from './render'

const getEnumListTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'get_enum_group_list',
  description: '获取枚举列表',
  run: {
    type: 'render',
    Render: GetEnumListToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default getEnumListTool
