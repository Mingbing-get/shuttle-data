import { DataModel as NDataModel, DataEnum } from '@shuttle-data/type'
import { DataModelSchema } from './schema'
import { DataEnumManager } from './enum'
import { CRUD, NCRUD } from './crud'

type CRUDOptions = Pick<NCRUD.Options, 'modelName' | 'useApiName' | 'context'>

interface DataModelOptions extends Pick<
  NCRUD.Options,
  'generateId' | 'getKnex' | 'onCheckPermission'
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
