import { ShuttleAi } from '@shuttle-ai/type'

import CreateRecordRender from './render'

const createRecordTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'crud_create_record',
  description: '创建记录',
  label: '创建记录',
  run: {
    type: 'render',
    Render: CreateRecordRender,
  },
  extras: {
    disableExport: true,
  },
}

export default createRecordTool
