import { Transaction } from '@shuttle-data/crud'
import { randomUUID } from 'node:crypto'

import dataModel from '../../../config/dataModel'

class TransactionManager {
  private transactionMap: Map<string, Transaction> = new Map()

  async start(dataSourceName: string) {
    const transaction = await dataModel.transaction(dataSourceName)
    const transactionId = randomUUID()
    this.transactionMap.set(transactionId, transaction)
    return transactionId
  }

  getTransaction(transactionId: string) {
    const transaction = this.transactionMap.get(transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`)
    }
    return transaction
  }

  commit(transactionId: string) {
    const transaction = this.getTransaction(transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`)
    }
    transaction.commit()
    this.transactionMap.delete(transactionId)
  }

  rollback(transactionId: string) {
    const transaction = this.getTransaction(transactionId)
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`)
    }
    transaction.rollback()
    this.transactionMap.delete(transactionId)
  }
}

export default new TransactionManager()
