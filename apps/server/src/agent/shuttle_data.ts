import { ShuttleAi } from '@shuttle-ai/type'
import { shuttleDataAgentSystemPrompt, allTool } from '@shuttle-data/ai-server'
import { CreateAgentParams } from 'langchain'

const shuttleDataAgent: ShuttleAi.Cluster.ToolsWithSubAgents &
  Pick<CreateAgentParams, 'systemPrompt'> = {
  systemPrompt: shuttleDataAgentSystemPrompt,
  tools: allTool(),
}

export default shuttleDataAgent
