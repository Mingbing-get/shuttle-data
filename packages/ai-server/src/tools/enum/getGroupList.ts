import { tool } from '@langchain/core/tools'
import { ShuttleAi } from '@shuttle-ai/type'

const getGroupListTool = tool(
  async (_: {}, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const res = await context.dataModel.schema.enumManager.all()

    const groups = Object.values(res.groupMap)

    const groupBaseList = groups.map((group) => {
      const { items, ...rest } = group

      return rest
    })

    return JSON.stringify(groupBaseList)
  },
  {
    name: 'get_enum_group_list',
    description: 'Get a list of all enum groups (without items)',
    schema: {
      type: 'object',
      properties: {},
    },
    extras: {
      scope: 'read',
    },
  },
)

export default getGroupListTool
