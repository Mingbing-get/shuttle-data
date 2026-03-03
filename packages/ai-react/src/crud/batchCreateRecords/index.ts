import { ShuttleAi } from '@shuttle-ai/type'

import BatchCreateRecordsRender from './render'

const batchCreateRecordsTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'crud_batch_create_records',
  description: '批量创建记录',
  label: '批量创建记录',
  run: {
    type: 'render',
    Render: BatchCreateRecordsRender,
  },
  extras: {
    disableExport: true,
  },
}

export default batchCreateRecordsTool
