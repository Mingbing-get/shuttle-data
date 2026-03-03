import { ShuttleAi } from '@shuttle-ai/type'

import DeleteRecordToolRender from './render'

const deleteRecordTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'crud_delete_records',
  description: '删除记录',
  label: '删除记录',
  run: {
    type: 'render',
    Render: DeleteRecordToolRender,
  },
  extras: {
    disableExport: true,
  },
}

export default deleteRecordTool
