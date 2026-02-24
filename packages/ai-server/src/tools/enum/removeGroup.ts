import { tool } from '@langchain/core/tools'
import { ShuttleAi } from '@shuttle-ai/type'

const removeGroupTool = tool(
  async (params: { groupName: string; useApiName?: boolean }, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    await context.dataModel.schema.enumManager.removeGroup(
      params.groupName,
      params.useApiName,
    )

    return `Enum group ${params.groupName} removed`
  },
  {
    name: 'remove_enum_group',
    description: 'Remove an existing enum group',
    schema: {
      type: 'object',
      properties: {
        groupName: {
          type: 'string',
          description: 'The name or API name of the enum group to remove',
        },
        useApiName: {
          type: 'boolean',
          description: 'Whether to use API name instead of display name',
        },
      },
      required: ['groupName'],
    },
    extras: {
      scope: 'write',
    },
  },
)

export default removeGroupTool
