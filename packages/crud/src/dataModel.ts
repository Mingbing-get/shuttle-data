import { DataCRUD, DataModel as NDataModel } from '@shuttle-data/type'
import { DataModelSchema } from '@shuttle-data/schema'
import { CRUD } from './crud'

type CRUDOptions = Pick<
  DataCRUD.Server.Options,
  'modelName' | 'useApiName' | 'context'
>

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

  crud<M extends Record<string, any>>(options: CRUDOptions) {
    return new CRUD<M>({
      ...options,
      schema: this.schema,
      generateId: this.options.generateId,
      getKnex: this.options.getKnex,
      onCheckPermission: this.options.onCheckPermission,
      onCreate: (getNewRecords) => {
        this.options.onCreate?.({
          ...options,
          getNewRecords,
          dataModel: this,
        })
      },
      onUpdate: (getUpdatedRecords) => {
        this.options.onUpdate?.({
          ...options,
          getUpdatedRecords,
          dataModel: this,
        })
      },
      onDelete: (getDeletedRecords) => {
        this.options.onDelete?.({
          ...options,
          getDeletedRecords,
          dataModel: this,
        })
      },
    })
  }
}
