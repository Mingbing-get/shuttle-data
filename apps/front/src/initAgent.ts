import { ShuttleAi } from '@shuttle-ai/type'
import { writeTodosTool } from '@shuttle-ai/render-react'
import { allTool } from '@shuttle-data/ai-react'
import '@shuttle-ai/client'
import '@shuttle-ai/render-react'

const initAgent: Record<string, ShuttleAi.Client.Agent.WithRunToolParams> = {
  shuttle_data_agent: {
    lazyTools: allTool({
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
      updateTableTool: {
        run: {
          defaultProps: {
            dataSourceName: 'main',
            prefix: 'test_',
          },
        },
      },
      createEnumTool: {
        run: {
          defaultProps: {
            prefix: 'test_',
          },
        },
      },
      updateEnumTool: {
        run: {
          defaultProps: {
            prefix: 'test_',
          },
        },
      },
      getEnumDetailTool: {
        run: {
          defaultProps: {
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
      lazyTools: [writeTodosTool],
    }
  }

  return {
    ...info,
    lazyTools: [...(info.lazyTools || []), writeTodosTool],
  }
}
export default getAgentParams
