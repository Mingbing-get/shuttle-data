import { ShuttleAi } from '@shuttle-ai/type'

import CreateTableToolRender from './render'

const createTableTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'create_table',
  description: '创建数据模型',
  label: '创建数据模型',
  run: {
    type: 'render',
    Render: CreateTableToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default createTableTool
