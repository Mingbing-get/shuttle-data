import { tool } from '@langchain/core/tools'
import { DataModel, dataModelManager } from '@shuttle-data/type'
import { ShuttleAi } from '@shuttle-ai/type'

const updateTableTool = tool(
  async (model: DataModel.Define, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    await context.dataModel.schema.updateTable(model)

    return `Table ${model.name} updated`
  },
  {
    name: 'update_table',
    description: 'Update a table in the database',
    schema: dataModelManager.getZodWithFields(),
    extras: {
      scope: 'write',
    },
  },
)

export default updateTableTool
