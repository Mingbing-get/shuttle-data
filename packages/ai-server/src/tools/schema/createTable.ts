import { tool } from '@langchain/core/tools'
import { DataModel, dataModelManager } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'

const createTableTool = tool(
  async (model: DataModel.Define, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    await context.dataModel.schema.createTable(model)

    return `Table ${model.name} created`
  },
  {
    name: 'create_table',
    description: 'Create a table in the database',
    schema: dataModelManager.getZodWithFields(),
    extras: {
      scope: 'write',
    },
  },
)

export default createTableTool
