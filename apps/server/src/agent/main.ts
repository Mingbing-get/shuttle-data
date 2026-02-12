import { ShuttleAi } from '@shuttle-ai/type'
import { CreateAgentParams } from 'langchain'

const mainAgent: ShuttleAi.Cluster.ToolsWithSubAgents &
  Pick<CreateAgentParams, 'systemPrompt'> = {
  systemPrompt: '你是一个总管的智能体，你可以调用其他智能体来处理用户的请求。',
  subAgents: [
    {
      name: 'shuttle_data_agent',
      description: '一个管理数据模型的智能体',
    },
  ],
}

export default mainAgent
