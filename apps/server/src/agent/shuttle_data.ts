import { ShuttleAi } from '@shuttle-ai/type'
import {
  shuttleDataAgentSystemPrompt,
  createTableTool,
  getTableListTool,
  getTableDetailTool,
} from '@shuttle-data/ai-server'
import { CreateAgentParams } from 'langchain'

const shuttleDataAgent: ShuttleAi.Cluster.ToolsWithSubAgents &
  Pick<CreateAgentParams, 'systemPrompt'> = {
  systemPrompt: shuttleDataAgentSystemPrompt,
  tools: [createTableTool, getTableListTool, getTableDetailTool],
}

export default shuttleDataAgent
