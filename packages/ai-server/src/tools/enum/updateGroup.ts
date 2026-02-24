import { tool } from '@langchain/core/tools'
import { DataEnum, DataEnumManager } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'

const updateGroupTool = tool(
  async (group: DataEnum.Group, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    await context.dataModel.schema.enumManager.updateGroup(group)

    return `Enum group ${group.name} updated`
  },
  {
    name: 'update_enum_group',
    description: 'Update an existing enum group',
    schema: new DataEnumManager().getGroupZodWithItems(),
    extras: {
      scope: 'write',
    },
  },
)

export default updateGroupTool
