import { DataCRUD } from '@shuttle-data/type'

import dataModel from '../../../config/dataModel'
import transactionManager from '../transaction/manager'

export interface ModelConfig {
  modelName: string
  transactionId?: string
  useApiName?: boolean
}

interface Options extends ModelConfig {
  options: DataCRUD.Option<any>
  method: DataCRUD.Method
  context: DataCRUD.Server.Context
}

export default async function baseCrud({
  options,
  method,
  context,
  modelName,
  transactionId,
  useApiName,
}: Options) {
  if (transactionId) {
    const trx = transactionManager.getTransaction(transactionId)
    const crud = trx.crud({
      modelName,
      useApiName,
      context: context,
    })
    return await crud[method](options as any)
  } else {
    const crud = dataModel.crud({
      modelName,
      useApiName,
      context: context,
    })
    return await crud[method](options as any)
  }
}
