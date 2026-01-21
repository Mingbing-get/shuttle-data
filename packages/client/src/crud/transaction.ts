import { DataCRUD } from '@shuttle-data/type'

import CRUD from './instance'

export default class Transaction {
  private transactionId: string | null = null

  constructor(private transporter: DataCRUD.Client.Transporter) {}

  async start() {
    this.transactionId = await this.transporter.startTransaction()
  }

  async commit() {
    if (!this.transactionId) {
      throw new Error('Transaction not started')
    }
    return this.transporter.commitTransaction(this.transactionId)
  }

  async rollback() {
    if (!this.transactionId) {
      throw new Error('Transaction not started')
    }
    return this.transporter.rollbackTransaction(this.transactionId)
  }

  crud<M extends Record<string, any>>(options: DataCRUD.Client.ModelConfig) {
    if (!this.transactionId) {
      throw new Error('Transaction not started')
    }

    return new CRUD<M>({
      ...options,
      transactionId: this.transactionId,
      transporter: this.transporter,
    })
  }
}
