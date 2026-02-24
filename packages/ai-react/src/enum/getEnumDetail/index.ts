import { ShuttleAi } from '@shuttle-ai/type'

import GetEnumDetailToolRender from './render'

const getEnumDetailTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'get_enum_group_detail',
  description: '获取枚举详情',
  run: {
    type: 'render',
    Render: GetEnumDetailToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default getEnumDetailTool
