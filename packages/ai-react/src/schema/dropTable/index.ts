import { ShuttleAi } from '@shuttle-ai/type'

import DropTableToolRender from './render'

const dropTableTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'drop_table',
  label: '删除数据模型',
  description: '删除数据模型',
  run: {
    type: 'render',
    Render: DropTableToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default dropTableTool
