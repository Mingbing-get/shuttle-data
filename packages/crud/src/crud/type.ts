import { Knex } from 'knex'
import { DataCondition, DataModel, DataEnum } from '@shuttle-data/type'
import { DataModelSchema, NDataModelSchema } from '@shuttle-data/schema'

export namespace NCRUD {
  export interface User {
    _id: string
  }

  export interface Context {
    user: User
  }

  export interface CheckPermissionOptions<M extends Record<string, any>> {
    type: 'create' | 'read' | 'update' | 'delete'
    context: Context
    modelName: string
    fieldNames?: (keyof M & string)[]
  }

  export interface Options {
    generateId: () => string
    getKnex: (dataSourceName: string) => Promise<Knex> | Knex
    schema: DataModelSchema
    modelName: string
    useApiName?: boolean
    context: Context
    onCheckPermission?: <M extends Record<string, any>>(
      options: CheckPermissionOptions<M>,
    ) => Promise<
      | false
      | {
          fieldNames?: (keyof M & string)[]
          condition?: DataCondition.Define<M>
        }
    >
  }

  export interface FieldPluginFnContext<T extends DataModel.FieldType> {
    schema: DataModelSchema
    field: Extract<DataModel.Field, { type: T }>
    useApiName?: boolean
  }

  export interface FieldCreateConditionOption<
    T extends DataModel.FieldType,
    M extends Record<string, any>,
  > extends FieldPluginFnContext<T> {
    builder: Knex.QueryBuilder
    enumInfo: {
      apiNameReflexName: Record<string, string>
      groupMap: Record<string, DataEnum.Group>
    }
    condition: Exclude<
      DataCondition.Define<M>,
      DataCondition.AndCondition<M> | DataCondition.OrCondition<M>
    >
  }

  export interface FieldToOutputOption<T extends DataModel.FieldType, v>
    extends
      FieldPluginFnContext<T>,
      Pick<Options, 'generateId' | 'getKnex' | 'context'> {
    values: v[]
  }

  export interface FieldToDbOption<T extends DataModel.FieldType, v>
    extends
      FieldPluginFnContext<T>,
      Pick<Options, 'generateId' | 'getKnex' | 'context'> {
    values: v[]
  }

  export interface FieldPlugin<
    T extends DataModel.FieldType,
  > extends NDataModelSchema.FieldPlugin<T> {
    createCondition<M extends Record<string, any>>(
      options: FieldCreateConditionOption<T, M>,
    ): void
    toOutput?: (options: FieldToOutputOption<T, any>) => any[] | Promise<any[]>
    toDb?: (options: FieldToDbOption<T, any>) => any[] | Promise<any[]>
  }

  export interface ConditionPlugin<T extends DataCondition.Op> {
    readonly op: T

    create<M extends Record<string, any>>(
      builder: Knex.QueryBuilder,
      condition: Extract<DataCondition.Define<M>, { op: T }>,
    ): void
  }
}
