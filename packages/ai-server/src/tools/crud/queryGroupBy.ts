import { tool } from '@langchain/core/tools'
import { conditionPluginManager, DataCRUD } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'
import { z } from 'zod'

export interface QueryGroupByParams extends Pick<DataCRUD.Server.Options, 'modelName' | 'useApiName'>, DataCRUD.QueryGroupByOption<any> {
}

const queryGroupByTool = tool(
  async ({ modelName, useApiName, ...groupByOptions }: QueryGroupByParams, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const records = await context.dataModel.crud({
      modelName,
      useApiName,
      context
    }).queryGroupBy(groupByOptions)

    return JSON.stringify(records)
  },
  {
    name: 'crud_query_group_by',
    description:
      'Query records grouped by the specified fields in the specified model that match the condition.',
    schema: z.object({
      modelName: z.string().describe('The name of the model to create the record in.'),
      useApiName: z.boolean().describe('Whether to use the API name of the model instead of the model name.'),
      aggFunction: z.enum(['count', 'sum', 'avg', 'min', 'max']).describe('The aggregation function to apply to the grouped records.'),
      aggField: z.string().describe('The field to apply the aggregation function to.'),
      // condition: conditionPluginManager.getZod().describe('The condition to filter records to find.').optional(),
      condition: z.object().catchall(z.any()).describe('Please call crud_get_condition_define to obtain the condition definition'),
      groupByFields: z.array(z.string()).describe('The fields to group by.').optional(),
      orders: z.array(z.object({
        key: z.string().describe('The field to order by.'),
        desc: z.boolean().describe('Whether to order by descending order.').optional(),
      })).describe('The orders to apply to the records.').optional(),
      limit: z.number().describe('The maximum number of records to return.').optional(),
      offset: z.number().describe('The offset to start returning records from.').optional(),
    }),
    extras: {
      scope: 'read',
    },
  },
)

export default queryGroupByTool
