import { DataCRUD, DataModel as NDataModel } from '@shuttle-data/type'
import { DataModelSchema } from '@shuttle-data/schema'
import { CRUD } from './crud'
import { Transaction, CRUDOptions } from './transaction'

interface DataModelOptions extends Pick<
  DataCRUD.Server.Options,
  'generateId' | 'getKnex' | 'onCheckPermission'
> {
  onCreate?: <M extends Record<string, any>>(
    options: CRUDOptions & {
      dataModel: DataModel
      getNewRecords: () => Promise<M[]>
    },
  ) => void
  onUpdate?: <M extends Record<string, any>>(
    options: CRUDOptions & {
      dataModel: DataModel
      getUpdatedRecords: () => Promise<
        {
          oldRecord: M
          newRecord: M
          updateFieldNames: (keyof M & string)[]
        }[]
      >
    },
  ) => void
  onDelete?: <M extends Record<string, any>>(
    options: CRUDOptions & {
      dataModel: DataModel
      getDeletedRecords: () => Promise<M[]>
    },
  ) => void
}

export default class DataModel {
  readonly schema: DataModelSchema

  constructor(
    private options: DataModelOptions,
    schemaOptions: NDataModel.Schema.ServerOptions,
  ) {
    this.schema = new DataModelSchema(schemaOptions)
  }

  async transaction(
    dataSourceName: string,
    cb: (trx: Transaction) => Promise<void>,
  ): Promise<void>
  async transaction(dataSourceName: string): Promise<Transaction>
  async transaction(
    dataSourceName: string,
    cb?: (trx: Transaction) => Promise<void>,
  ): Promise<void | Transaction> {
    const knex = await this.options.getKnex(dataSourceName)

    if (!knex) {
      throw new Error(`DataSource ${dataSourceName} not found`)
    }

    if (!cb) {
      const trx = await knex.transaction()

      return new Transaction(trx, (modelInfo) =>
        this.createCrudOptions(modelInfo),
      )
    }

    await knex.transaction(async (trx) => {
      const transaction = new Transaction(trx, (modelInfo) =>
        this.createCrudOptions(modelInfo),
      )
      await cb(transaction)
    })
  }

  crud<M extends Record<string, any>>(options: CRUDOptions) {
    return new CRUD<M>({
      ...options,
      getKnex: this.options.getKnex,
      ...this.createCrudOptions(options),
    })
  }

  private createCrudOptions(modelInfo: CRUDOptions) {
    const crudOptions: Omit<
      DataCRUD.Server.Options,
      keyof CRUDOptions | 'getKnex'
    > = {
      schema: this.schema,
      generateId: this.options.generateId,
      onCheckPermission: this.options.onCheckPermission,
      onCreate: (getNewRecords) => {
        this.options.onCreate?.({
          ...modelInfo,
          getNewRecords,
          dataModel: this,
        })
      },
      onUpdate: (getUpdatedRecords) => {
        this.options.onUpdate?.({
          ...modelInfo,
          getUpdatedRecords,
          dataModel: this,
        })
      },
      onDelete: (getDeletedRecords) => {
        this.options.onDelete?.({
          ...modelInfo,
          getDeletedRecords,
          dataModel: this,
        })
      },
    }

    return crudOptions
  }
}
