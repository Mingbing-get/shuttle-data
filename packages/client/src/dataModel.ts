import { DataModel as NDataModel, DataEnum, DataCRUD } from '@shuttle-data/type'
import { DataModelSchema } from './schema'
import { DataEnumManager } from './enum'
import { CRUD, Transaction } from './crud'

interface DataModelOptions extends Pick<
  DataCRUD.Client.Options,
  'transporter'
> {}

export default class DataModel {
  readonly schema: DataModelSchema
  readonly enumManager: DataEnumManager

  constructor(
    private options: DataModelOptions,
    schemaOptions: NDataModel.Schema.Options,
    enumOptions: DataEnum.ManagerOptions,
  ) {
    this.schema = new DataModelSchema(schemaOptions)
    this.enumManager = new DataEnumManager(enumOptions)
  }

  async transaction(cb: (trx: Transaction) => Promise<void>): Promise<void>
  async transaction(): Promise<Transaction>
  async transaction(
    cb?: (trx: Transaction) => Promise<void>,
  ): Promise<void | Transaction> {
    const transaction = new Transaction(this.options.transporter)
    await transaction.start()

    if (!cb) {
      return transaction
    }

    try {
      await cb(transaction)
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  crud<M extends Record<string, any>>(options: DataCRUD.Client.ModelConfig) {
    return new CRUD<M>({
      ...options,
      transporter: this.options.transporter,
    })
  }
}
