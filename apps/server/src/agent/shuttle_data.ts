import { ShuttleAi } from '@shuttle-ai/type'
import {
  shuttleDataAgentSystemPrompt,
  allTool,
  createTableTool,
  updateTableTool,
  addGroupTool,
  updateGroupTool,
} from '@shuttle-data/ai-server'
import { tool } from '@langchain/core/tools'
import { CreateAgentParams } from 'langchain'

import createTableService from '../service/dataModel/schema/createTable'
import updateTableService from '../service/dataModel/schema/updateTable'
import addGroupService from '../service/dataEnum/addGroup'
import updateGroupService from '../service/dataEnum/updateGroup'

const shuttleDataAgent: ShuttleAi.Cluster.ToolsWithSubAgents &
  Pick<CreateAgentParams, 'systemPrompt'> = {
  systemPrompt: shuttleDataAgentSystemPrompt,
  tools: [
    ...allTool().filter((tool) => {
      return ![
        createTableTool.name,
        updateTableTool.name,
        addGroupTool.name,
        updateGroupTool.name,
      ].includes(tool.name)
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
    tool(
      async (group: DataEnum.Group) => {
        await addGroupService(group)
        return `Group ${group.name} added`
      },
      {
        name: addGroupTool.name,
        description: addGroupTool.description,
        schema: addGroupTool.schema,
        extras: addGroupTool.extras,
      },
    ),
    tool(
      async (group: DataEnum.Group) => {
        await updateGroupService(group)
        return `Group ${group.name} updated`
      },
      {
        name: updateGroupTool.name,
        description: updateGroupTool.description,
        schema: updateGroupTool.schema,
        extras: updateGroupTool.extras,
      },
    ),
  ],
}

export default shuttleDataAgent
