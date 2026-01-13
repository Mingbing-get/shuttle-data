import { DataCondition } from './condition'

export namespace DataCRUD {
  export interface LookupInRecord {
    _id: string
    _display?: string
  }

  export interface BaseRecord {
    _id: string
    _createdAt: string
    _updatedAt: string
    _createdBy: LookupInRecord
    _updatedBy: LookupInRecord
  }

  export interface OrderBy<M extends Record<string, any>> {
    key: keyof M & string
    desc?: boolean
  }

  export type SelectField<M extends Record<string, any>> =
    | (keyof M & string)
    | Partial<Record<keyof M & string, string>>

  export type CreateInput<M extends Record<string, any>> = Omit<
    M,
    keyof BaseRecord
  >

  export type UpdateInput<M extends Record<string, any>> = Partial<
    Omit<M, keyof BaseRecord>
  >

  export type UpdateInputWithId<M extends Record<string, any>> = Partial<
    Omit<M, keyof BaseRecord>
  > & {
    _id: string
  }

  export type Method =
    | 'find'
    | 'findOne'
    | 'count'
    | 'del'
    | 'update'
    | 'create'
    | 'countUseGroupBy'
    | 'minUseGroupBy'
    | 'maxUseGroupBy'
    | 'avgUseGroupBy'
    | 'sumUseGroupBy'

  export interface FindOption<M extends Record<string, any>> {
    fields?: SelectField<M>[]
    condition?: DataCondition.Define<M>
    orders?: OrderBy<M>[]
    limit?: number
    offset?: number
  }

  export interface FineOneOption<M extends Record<string, any>> {
    fields?: SelectField<M>[]
    condition?: DataCondition.Define<M>
    orders?: OrderBy<M>[]
    offset?: number
  }

  export interface CountOption<M extends Record<string, any>> {
    condition?: DataCondition.Define<M>
  }

  export interface DelOption<M extends Record<string, any>> {
    condition?: DataCondition.Define<M>
    returnFields?: SelectField<M>[]
  }

  export interface UpdateOption<M extends Record<string, any>> {
    condition?: DataCondition.Define<M>
    returnFields?: SelectField<M>[]
    data: UpdateInput<M>
  }

  export interface UpdateWithIdOption<M extends Record<string, any>> {
    returnFields?: SelectField<M>[]
    data: UpdateInputWithId<M>[]
  }

  export interface CreateOption<M extends Record<string, any>> {
    returnFields?: SelectField<M>[]
    data: CreateInput<M>
  }

  export interface BatchCreateOption<M extends Record<string, any>> {
    returnFields?: SelectField<M>[]
    data: CreateInput<M>[]
  }

  export interface GroupByOption<
    M extends Record<string, any>,
    AF extends SelectField<M> = keyof M & string,
  > {
    condition?: DataCondition.Define<M>
    orders?: OrderBy<M>[]
    limit?: number
    offset?: number
    aggField: AF
    groupByFields: SelectField<M>[]
  }

  export type Option<
    M extends Record<string, any>,
    AF extends SelectField<M> = keyof M & string,
  > =
    | FindOption<M>
    | FineOneOption<M>
    | CountOption<M>
    | DelOption<M>
    | UpdateOption<M>
    | UpdateWithIdOption<M>
    | CreateOption<M>
    | BatchCreateOption<M>
    | GroupByOption<M, AF>
}
