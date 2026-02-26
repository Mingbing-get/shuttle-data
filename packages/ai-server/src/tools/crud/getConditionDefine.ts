import { tool } from '@langchain/core/tools'
import { conditionPluginManager } from '@shuttle-data/type'
import { z } from 'zod'

const getConditionDefineTool = tool(
  async (_, request) => {
    return conditionPluginManager.getZod().toJSONSchema()
  },
  {
    name: 'crud_get_condition_define',
    description:
      'Get the condition define of the specified model.',
    schema: z.object(),
    extras: {
      scope: 'read',
      skipReport: true,
    },
  },
)

export default getConditionDefineTool
