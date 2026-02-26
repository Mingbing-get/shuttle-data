import { tool } from '@langchain/core/tools'
import { conditionPluginManager, DataCRUD } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'
import { z } from 'zod'

export interface CountRecordParams extends Pick<DataCRUD.Server.Options, 'modelName' | 'useApiName'>, DataCRUD.CountOption<any> {
}

const recordCountTool = tool(
  async ({ modelName, useApiName, ...countOptions }: CountRecordParams, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const count = await context.dataModel.crud({
      modelName,
      useApiName,
      context
    }).count(countOptions)

    return count
  },
  {
    name: 'crud_record_count',
    description:
      'Count records in the specified model that match the condition.',
    schema: z.object({
      modelName: z.string().describe('The name of the model to create the record in.'),
      useApiName: z.boolean().describe('Whether to use the API name of the model instead of the model name.'),
      // condition: conditionPluginManager.getZod().describe('The condition to filter records to count.').optional(),
      condition: z.object().catchall(z.any()).describe('Please call crud_get_condition_define to obtain the condition definition'),
    }),
    extras: {
      scope: 'read',
    },
  },
)

export default recordCountTool
