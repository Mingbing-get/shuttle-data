import { ShuttleAi } from '@shuttle-ai/type'

import CreateTableToolRender from '../createTable/render'

const updateTableTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'update_table',
  label: '更新数据模型',
  description: '更新数据模型',
  run: {
    type: 'render',
    Render: CreateTableToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default updateTableTool
