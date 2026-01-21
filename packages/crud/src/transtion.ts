import { Knex } from 'knex'
import { DataCRUD } from '@shuttle-data/type'
import { CRUD } from './crud'

export type CRUDOptions = Pick<
  DataCRUD.Server.Options,
  'modelName' | 'useApiName' | 'context'
>

export class Transtion {
  private isCommitted = false
  private isRollbacked = false

  constructor(
    private trx: Knex.Transaction,
    private getCrudOption: (
      modelInfo: CRUDOptions,
    ) => Omit<DataCRUD.Server.Options, keyof CRUDOptions | 'getKnex'>,
  ) {}

  commit() {
    if (this.isCommitted || this.isRollbacked) return

    this.trx.commit()
    this.isCommitted = true
  }

  rollback() {
    if (this.isCommitted || this.isRollbacked) return

    this.trx.rollback()
    this.isRollbacked = true
  }

  crud<M extends Record<string, any>>(options: CRUDOptions) {
    return new CRUD<M>({
      ...options,
      ...this.getCrudOption(options),
      getKnex: (dataSourceName: string) => this.trx,
    })
  }
}
