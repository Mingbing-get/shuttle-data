import { Knex } from 'knex'
import { DataModel } from '@shuttle-data/type'
import Schema from './instance'
import { DataEnumManagerOptions, GroupTableConfig } from '../enum/type'

export namespace NDataModelSchema {
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

  export interface ModelTableConfig extends Partial<
    ObjectKeyAppendField<Omit<DataModel.Define, 'fields'>>
  > {
    knex?: Knex
    tableName: string
    fieldConfig: ModelFieldConfig
    isDeleteField?: string
  }

  export interface ModelFieldConfig extends Partial<
    ObjectKeyAppendField<DataModel.BaseField<any>>
  > {
    tableName: string
    modelField?: string
    isDeleteField?: string
  }

  export interface Options {
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
    enumSourceConfig?: Omit<DataEnumManagerOptions, 'groupTableConfig'> & {
      groupTableConfig?: Omit<GroupTableConfig, 'knex'> & {
        knex?: Knex
      }
    }
  }

  export interface FieldPlugin<
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
