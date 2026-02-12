import { ShuttleAi } from '@shuttle-ai/type'

import GetTableDetailToolRender from './render'

const getTableDetailTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'get_table_detail',
  description: '获取数据模型详情',
  run: {
    type: 'render',
    Render: GetTableDetailToolRender,
  },
  extras: {
    disableExport: true,
    onlyShow: true,
  },
}

export default getTableDetailTool
