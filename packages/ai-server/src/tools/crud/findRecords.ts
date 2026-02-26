import { tool } from '@langchain/core/tools'
import { conditionPluginManager, DataCRUD } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'
import { z } from 'zod'

export interface FindRecordParams extends Pick<DataCRUD.Server.Options, 'modelName' | 'useApiName'>, DataCRUD.FindOption<any> {
}

const findRecordsTool = tool(
  async ({ modelName, useApiName, ...findOptions }: FindRecordParams, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const records = await context.dataModel.crud({
      modelName,
      useApiName,
      context
    }).find(findOptions)

    return JSON.stringify(records)
  },
  {
    name: 'crud_find_records',
    description:
      'Find records in the specified model that match the condition.',
    schema: z.object({
      modelName: z.string().describe('The name of the model to create the record in.'),
      useApiName: z.boolean().describe('Whether to use the API name of the model instead of the model name.'),
      // condition: conditionPluginManager.getZod().describe('The condition to filter records to find.').optional(),
      condition: z.object().catchall(z.any()).describe('Please call crud_get_condition_define to obtain the condition definition'),
      fields: z.array(z.string()).describe('The fields to select.').optional(),
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

export default findRecordsTool
