import { tool } from '@langchain/core/tools'
import { ShuttleAi } from '@shuttle-ai/type'
import { z } from 'zod'

const dropTableTool = tool(
  async ({ tableName, useApiName }, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    await context.dataModel.schema.dropTable(tableName, useApiName)

    return `Table ${tableName} dropped`
  },
  {
    name: 'drop_table',
    description: 'Drop a table in the database',
    schema: z.object({
      tableName: z.string().describe('The name or apiName of the table'),
      useApiName: z
        .boolean()
        .describe('Whether to use apiName instead of name'),
    }),
    extras: {
      scope: 'write',
    },
  },
)

export default dropTableTool
