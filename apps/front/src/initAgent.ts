import { ShuttleAi } from '@shuttle-ai/type'
import { writeTodosTool } from '@shuttle-ai/render-react'
import { allTool } from '@shuttle-data/ai-react'
import '@shuttle-ai/client'
import '@shuttle-ai/render-react'

const initAgent: Record<string, ShuttleAi.Client.Agent.WithRunToolParams> = {
  shuttle_data_agent: {
    tools: allTool({
      getTableDetailTool: {
        run: {
          defaultProps: {
            prefix: 'test_',
          },
        },
      },
      createTableTool: {
        run: {
          defaultProps: {
            dataSourceName: 'main',
            prefix: 'test_',
          },
        },
      },
    }),
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
