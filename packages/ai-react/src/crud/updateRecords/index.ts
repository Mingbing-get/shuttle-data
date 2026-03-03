import { ShuttleAi } from '@shuttle-ai/type'

import UpdateRecordRender from './render'

const updateRecordsTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'crud_update_records',
  description: '更新记录',
  label: '更新记录',
  run: {
    type: 'render',
    Render: UpdateRecordRender,
  },
  extras: {
    disableExport: true,
  },
}

export default updateRecordsTool
