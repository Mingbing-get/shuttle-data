import { Knex } from 'knex'
import '@shuttle-data/type'

declare module '@shuttle-data/type' {
  export namespace DataCRUD {}
  export namespace DataCondition {}
  export namespace DataModel {}
  export namespace DataEnum {
    type ObjectKeyAppendField<T extends Record<string, any>> = {
      [K in `${keyof T & string}Field`]: string
    }

    export interface ServerManagerOptions {
      groupTableConfig?: GroupTableConfig
      enumGroup?: DataEnum.Group[]
    }

    export interface GroupTableConfig extends Partial<
      ObjectKeyAppendField<Omit<DataEnum.Group, 'items'>>
    > {
      knex: Knex
      tableName: string
      isDeleteField?: string
      itemTableConfig: ItemTableConfig
      custom?: Partial<
        Record<keyof DataEnum.Group, CustomField<DataEnum.Group>>
      >
    }

    export interface ItemTableConfig extends Partial<
      ObjectKeyAppendField<DataEnum.Item>
    > {
      tableName: string
      groupField?: string
      isDeleteField?: string
      custom?: Partial<Record<keyof DataEnum.Item, CustomField<DataEnum.Item>>>
    }

    export interface CustomField<T> {
      builder: (table: Knex.CreateTableBuilder) => void
      onCreate: (model: T) => any
    }
  }
}
