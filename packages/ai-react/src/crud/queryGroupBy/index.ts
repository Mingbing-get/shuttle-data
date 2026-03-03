import { ShuttleAi } from '@shuttle-ai/type'

import QueryGroupByToolRender from './render'

const queryGroupByTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'crud_query_group_by',
  description: '分组查询',
  label: '分组查询',
  run: {
    type: 'render',
    Render: QueryGroupByToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default queryGroupByTool
