import { ShuttleAi } from '@shuttle-ai/type'
import {
  shuttleDataAgentSystemPrompt,
  allTool,
  createTableTool,
  updateTableTool,
} from '@shuttle-data/ai-server'
import { tool } from '@langchain/core/tools'
import { CreateAgentParams } from 'langchain'

import createTableService from '../service/dataModel/schema/createTable'
import updateTableService from '../service/dataModel/schema/updateTable'

const shuttleDataAgent: ShuttleAi.Cluster.ToolsWithSubAgents &
  Pick<CreateAgentParams, 'systemPrompt'> = {
  systemPrompt: shuttleDataAgentSystemPrompt,
  tools: [
    ...allTool().filter((tool) => {
      return ![createTableTool.name, updateTableTool.name].includes(tool.name)
    }),
    tool(
      async (model: DataModel.Define) => {
        try {
          await createTableService(model)
        } catch (error) {
          return `Error creating table ${model.name}: ${error}`
        }
        return `Table ${model.name} created`
      },
      {
        name: createTableTool.name,
        description: createTableTool.description,
        schema: createTableTool.schema,
        extras: createTableTool.extras,
      },
    ),
    tool(
      async (model: DataModel.Define) => {
        await updateTableService(model)
        return `Table ${model.name} updated`
      },
      {
        name: updateTableTool.name,
        description: updateTableTool.description,
        schema: updateTableTool.schema,
        extras: updateTableTool.extras,
      },
    ),
  ],
}

export default shuttleDataAgent
