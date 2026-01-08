import { Knex } from 'knex'

import { DataEnum } from '@shuttle-data/type'

type ObjectKeyAppendField<T extends Record<string, any>> = {
  [K in `${keyof T & string}Field`]: string
}

export interface DataEnumManagerOptions {
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
  custom?: Record<keyof DataEnum.Group, CustomField<DataEnum.Group>>
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
