import { Knex } from 'knex'
import { DataModelSchema } from '@shuttle-data/schema'
import '@shuttle-data/type'

declare module '@shuttle-data/type' {
  export namespace DataModel {}
  export namespace DataEnum {}
  export namespace DataCondition {
    export namespace Server {
      export interface Plugin<T extends DataCondition.Op> {
        readonly op: T

        create<M extends Record<string, any>>(
          builder: Knex.QueryBuilder,
          condition: Extract<DataCondition.Define<M>, { op: T }>,
        ): void
      }
    }
  }
  export namespace DataCRUD {
    export namespace Server {
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
        onCreate?: <M extends Record<string, any>>(
          getNewRecords: () => Promise<M[]>,
        ) => void
        onUpdate?: <M extends Record<string, any>>(
          getUpdatedRecords: () => Promise<
            {
              oldRecord: M
              newRecord: M
              updateFieldNames: (keyof M & string)[]
            }[]
          >,
        ) => void
        onDelete?: <M extends Record<string, any>>(
          getDeletedRecords: () => Promise<M[]>,
        ) => void
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

      export interface FieldCompareOption<
        T extends DataModel.FieldType,
        v,
      > extends FieldPluginFnContext<T> {
        value1?: v
        value2?: v
      }

      export interface FieldPlugin<
        T extends DataModel.FieldType,
      > extends DataModel.Schema.ServerFieldPlugin<T> {
        createCondition<M extends Record<string, any>>(
          options: FieldCreateConditionOption<T, M>,
        ): void
        compare?: (
          options: FieldCompareOption<T, any>,
        ) => boolean | Promise<boolean>
        toOutput?: (
          options: FieldToOutputOption<T, any>,
        ) => any[] | Promise<any[]>
        toDb?: (options: FieldToDbOption<T, any>) => any[] | Promise<any[]>
        skipCheckRequired?: (
          field: Extract<DataModel.Field, { type: T }>,
        ) => boolean
      }
    }
  }
}
