import { Knex } from 'knex'

import { DataEnum } from '@shuttle-data/type'

type ObjectKeyAppendField<T extends Record<string, any>> = {
  [K in `${keyof T & string}Field`]: string
}

export interface DataEnumManagerOptions {
  groupTableConfig?: GroupTableConfig
  enumGroup?: DataEnum.Group[]
}

export interface GroupTableConfig extends ObjectKeyAppendField<
  Omit<DataEnum.Group, 'items'>
> {
  knex: Knex
  tableName: string
  isDeleteField?: string
  itemTableConfig: ItemTableConfig
}

export interface ItemTableConfig extends ObjectKeyAppendField<DataEnum.Item> {
  tableName: string
  groupField?: string
  isDeleteField?: string
}
