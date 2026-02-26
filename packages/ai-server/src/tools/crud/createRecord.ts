import { tool } from '@langchain/core/tools'
import { DataCRUD } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'
import { z } from 'zod'

export interface CreateRecordParams extends Pick<DataCRUD.Server.Options, 'modelName' | 'useApiName'> {
  record: Record<string, any>
}

const createRecordTool = tool(
  async ({ modelName, useApiName, record }: CreateRecordParams, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const recordId = await context.dataModel.crud({
      modelName,
      useApiName,
      context
    }).create({
      data: record
    })

    return JSON.stringify({ _id: recordId })
  },
  {
    name: 'crud_create_record',
    description:
      'Create a new record in the specified model.',
    schema: z.object({
      modelName: z.string().describe('The name of the model to create the record in.'),
      useApiName: z.boolean().describe('Whether to use the API name of the model instead of the model name.'),
      record: z.object().catchall(z.any()).describe('The record data to create. First fetch the field definitions of the model, then fill in the data according to those definitions. You do not need to provide _id, _createdAt, _updatedAt, _createdBy, or _updatedBy fields.'),
    }),
    extras: {
      scope: 'write',
    },
  },
)

export default createRecordTool
