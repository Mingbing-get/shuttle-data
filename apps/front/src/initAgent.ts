import { ShuttleAi } from '@shuttle-ai/type'
import { writeTodosTool } from '@shuttle-ai/render-react'
import { getTableListTool, getTableDetailTool } from '@shuttle-data/ai-react'
import '@shuttle-ai/client'
import '@shuttle-ai/render-react'

const initAgent: Record<string, ShuttleAi.Client.Agent.WithRunToolParams> = {
  shuttle_data_agent: {
    tools: [getTableListTool, getTableDetailTool],
  },
}

const getAgentParams = (
  agentName: string,
): ShuttleAi.Client.Agent.WithRunToolParams => {
  const info = initAgent[agentName]
  if (!info) {
    return {
      tools: [writeTodosTool],
    }
  }

  return {
    ...info,
    tools: [...(info.tools || []), writeTodosTool],
  }
}
export default getAgentParams
