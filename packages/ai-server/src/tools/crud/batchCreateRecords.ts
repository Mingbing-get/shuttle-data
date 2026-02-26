import { tool } from '@langchain/core/tools'
import { DataCRUD } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'
import { z } from 'zod'

export interface BatchCreateRecordsParams extends Pick<DataCRUD.Server.Options, 'modelName' | 'useApiName'> {
  records: Record<string, any>[]
}

const batchCreateRecordsTool = tool(
  async ({ modelName, useApiName, records }: BatchCreateRecordsParams, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const recordIds = await context.dataModel.crud({
      modelName,
      useApiName,
      context
    }).batchCreate({
      data: records
    })

    return JSON.stringify(recordIds.map((id) => ({ _id: id })))
  },
  {
    name: 'crud_batch_create_records',
    description:
      'Create multiple records in the specified model.',
    schema: z.object({
      modelName: z.string().describe('The name of the model to create the record in.'),
      useApiName: z.boolean().describe('Whether to use the API name of the model instead of the model name.'),
      records: z.array(z.object().catchall(z.any())).describe('The records data to create. First fetch the field definitions of the model, then fill in the data according to those definitions. You do not need to provide _id, _createdAt, _updatedAt, _createdBy, or _updatedBy fields.'),
    }),
    extras: {
      scope: 'write',
    },
  },
)

export default batchCreateRecordsTool
