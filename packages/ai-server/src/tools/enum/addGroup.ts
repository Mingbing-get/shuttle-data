import { tool } from '@langchain/core/tools'
import { DataEnum, DataEnumManager } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'

const addGroupTool = tool(
  async (group: DataEnum.Group, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    await context.dataModel.schema.enumManager.addGroup(group)

    return `Enum group ${group.name} created`
  },
  {
    name: 'add_enum_group',
    description: 'Add a new enum group with items',
    schema: new DataEnumManager().getWithoutNameWithItemZod(),
    extras: {
      scope: 'write',
    },
  },
)

export default addGroupTool
