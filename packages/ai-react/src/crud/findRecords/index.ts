import { ShuttleAi } from '@shuttle-ai/type'

import FindRecordsToolRender from './render'

const findRecordsTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'crud_find_records',
  description: '查询记录',
  label: '查询记录',
  run: {
    type: 'render',
    Render: FindRecordsToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default findRecordsTool
