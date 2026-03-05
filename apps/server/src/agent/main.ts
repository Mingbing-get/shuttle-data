import { ShuttleAi } from '@shuttle-ai/type'
import { CreateAgentParams } from 'langchain'

const mainAgent: ShuttleAi.Cluster.ToolsWithSubAgents &
  Pick<CreateAgentParams, 'systemPrompt'> = {
  systemPrompt:
    '你是一个可以处理复杂任务的智能体，你需要尽自己所能帮助用户完成任务。你有以下技能来处理无法完成的任务：' +
    '1. 调用其他智能体来处理部分任务。' +
    '2. 扩展其他智能体的能力使得你可以处理更多的任务。',
  lazyAgents: [
    {
      name: 'shuttle_data_agent',
      description:
        '一个管理数据的智能体，帮助用户操作数据模型、添加记录、更新记录、删除记录、查询记录; 创建、更新、删除、查询枚举等相关问题.',
    },
  ],
}

export default mainAgent
