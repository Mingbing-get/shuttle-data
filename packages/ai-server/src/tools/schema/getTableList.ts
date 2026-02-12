import { tool } from '@langchain/core/tools'
import { ShuttleAi } from '@shuttle-ai/type'

const getTableListTool = tool(
  async (_, request) => {
    const context = request.context as ShuttleAi.Cluster.Context

    const res = await context.dataModel.schema.all()

    const models = Object.values(res.modelMap)

    const modelBaseList = models.map((model) => {
      const { fields, ...rest } = model

      return rest
    })
    return JSON.stringify(modelBaseList)
  },
  {
    name: 'get_table_list',
    description: 'Get the list of tables in the database',
    extras: {
      scope: 'read',
    },
  },
)

export default getTableListTool
