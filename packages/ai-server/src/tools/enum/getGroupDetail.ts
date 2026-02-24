import { tool } from '@langchain/core/tools'
import { ShuttleAi } from '@shuttle-ai/type'

const getGroupDetailTool = tool(
  async (params: { groupName: string; useApiName?: boolean }, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const group = await context.dataModel.schema.enumManager.getGroup(
      params.groupName,
      params.useApiName,
    )

    if (!group) {
      return `Enum group ${params.groupName} not found`
    }

    return JSON.stringify(group)
  },
  {
    name: 'get_enum_group_detail',
    description: 'Get a specific enum group with its items',
    schema: {
      type: 'object',
      properties: {
        groupName: {
          type: 'string',
          description: 'The name or API name of the enum group',
        },
        useApiName: {
          type: 'boolean',
          description: 'Whether to use API name instead of display name',
        },
      },
      required: ['groupName'],
    },
    extras: {
      scope: 'read',
    },
  },
)

export default getGroupDetailTool
