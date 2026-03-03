import { ShuttleAi } from '@shuttle-ai/type'

import ConditionUpdateRecordRender from './render'

const conditionUpdateRecordsTool: ShuttleAi.Client.Agent.WithRunTool = {
  name: 'crud_condition_update_records',
  description: '根据条件更新记录',
  label: '根据条件更新记录',
  run: {
    type: 'render',
    Render: ConditionUpdateRecordRender,
  },
  extras: {
    disableExport: true,
  },
}

export default conditionUpdateRecordsTool
