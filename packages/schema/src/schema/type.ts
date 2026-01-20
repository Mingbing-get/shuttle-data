import { Knex } from 'knex'
import Schema from './instance'

declare module '@shuttle-data/type' {
  export namespace DataCRUD {}
  export namespace DataCondition {}
  export namespace DataEnum {}
  export namespace DataModel {
    export namespace Schema {
      export interface DataHistory {
        tableName: string
        value: {
          _id: string
          [key: string]: any
        }
      }

      export interface DataHistoryConfig extends Partial<
        ObjectKeyAppendField<DataHistory>
      > {
        knex?: Knex
        tableName: string
      }

      export interface CustomField<T> {
        builder: (table: Knex.CreateTableBuilder) => void
        onCreate: (model: T) => any
      }

      export interface ModelTableConfig extends Partial<
        ObjectKeyAppendField<Omit<DataModel.Define, 'fields'>>
      > {
        knex?: Knex
        tableName: string
        fieldConfig: ModelFieldConfig
        isDeleteField?: string
        custom?: Partial<
          Record<keyof DataModel.Define, CustomField<DataModel.Define>>
        >
      }

      export interface ModelFieldConfig extends Partial<
        ObjectKeyAppendField<DataModel.BaseField<any>>
      > {
        tableName: string
        modelField?: string
        isDeleteField?: string
        custom?: Partial<
          Record<
            keyof DataModel.BaseField<any>,
            CustomField<DataModel.BaseField<any>>
          >
        >
      }

      export interface ServerOptions {
        /** 实际操作的数据库 */
        knex?: Knex
        /** 用户数据库名称，默认使用_user */
        userDbName?: string
        /** 数据历史表配置，用于在移除字段时保存数据 */
        dataHistoryConfig?: DataHistoryConfig
        /** 模型表配置，用于存储模型定义 */
        modelTableConfig?: ModelTableConfig
        /** 数据模型定义, 自定义有哪些数据模型，后续将不会去数据库查询 */
        dataModels?: DataModel.Define[]
        /** 枚举表配置，用于查询枚举相关信息 */
        enumSourceConfig?: Omit<
          DataEnum.ServerManagerOptions,
          'groupTableConfig'
        > & {
          groupTableConfig?: Omit<DataEnum.GroupTableConfig, 'knex'> & {
            knex?: Knex
          }
        }
      }

      export interface ServerFieldPlugin<
        T extends DataModel.FieldType,
      > extends DataModel.FieldPlugin<T> {
        readonly canAsDisplay?: boolean
        fieldBuilder(
          table: Knex.CreateTableBuilder,
          field: Extract<DataModel.Field, { type: T }>,
        ): void
        check(
          schema: Schema,
          field: Extract<DataModel.Field, { type: T }>,
        ): Promise<void> | void
      }

      type ObjectKeyAppendField<T extends Record<string, any>> = {
        [K in `${keyof T & string}Field`]: string
      }
    }
  }
}
