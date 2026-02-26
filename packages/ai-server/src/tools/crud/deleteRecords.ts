import { tool } from '@langchain/core/tools'
import { conditionPluginManager, DataCRUD } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'
import { z } from 'zod'

export interface DeleteRecordParams extends Pick<DataCRUD.Server.Options, 'modelName' | 'useApiName'>, DataCRUD.DelOption<any> {
}

const deleteRecordsTool = tool(
  async ({ modelName, useApiName, ...delOptions }: DeleteRecordParams, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    await context.dataModel.crud({
      modelName,
      useApiName,
      context
    }).del(delOptions)

    return 'success'
  },
  {
    name: 'crud_delete_records',
    description:
      'Delete records in the specified model that match the condition.',
    schema: z.object({
      modelName: z.string().describe('The name of the model to create the record in.'),
      useApiName: z.boolean().describe('Whether to use the API name of the model instead of the model name.'),
      // condition: conditionPluginManager.getZod().describe('The condition to filter records to delete.').optional(),
      condition: z.object().catchall(z.any()).describe('Please call crud_get_condition_define to obtain the condition definition'),
    }),
    extras: {
      scope: 'write',
    },
  },
)

export default deleteRecordsTool
