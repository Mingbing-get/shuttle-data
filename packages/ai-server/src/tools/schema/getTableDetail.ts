import { tool } from '@langchain/core/tools'
import { ShuttleAi } from '@shuttle-ai/type'
import { z } from 'zod'

const getTableDetailTool = tool(
  async ({ tableName, useApiName }, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const model = await context.dataModel.schema.getTable(tableName, useApiName)

    if (!model) return `Table ${tableName} not found`

    return JSON.stringify(model)
  },
  {
    name: 'get_table_detail',
    description: 'Get the detail of a table in the database',
    schema: z.object({
      tableName: z.string().describe('The name or apiName of the table'),
      useApiName: z
        .boolean()
        .describe('Whether to use apiName instead of name'),
    }),
    extras: {
      scope: 'read',
    },
  },
)

export default getTableDetailTool
