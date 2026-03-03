import { ShuttleAi } from '@shuttle-ai/type'

import CountToolRender from './render'

const countTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'crud_record_count',
  description: '查询记录数',
  label: '查询记录数',
  run: {
    type: 'render',
    Render: CountToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default countTool
