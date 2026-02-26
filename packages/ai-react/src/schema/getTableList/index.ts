import { ShuttleAi } from '@shuttle-ai/type'

import GetTableListToolRender from './render'

const getTableListTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'get_table_list',
  label: '获取数据模型列表',
  description: '获取数据模型列表',
  run: {
    type: 'render',
    Render: GetTableListToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default getTableListTool
