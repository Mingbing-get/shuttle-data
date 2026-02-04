export namespace DataCondition {
  export type WithIdValue = string | number | boolean | { _id: string }

  export interface BaseCondition<T extends string> {
    op: T
  }

  export interface AndCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'and'> {
    subCondition: Define<M>[]
  }

  export interface OrCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'or'> {
    subCondition: Define<M>[]
  }

  export interface EqCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'eq'> {
    key: keyof M & string
    value: WithIdValue
  }

  export interface NeqCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'neq'> {
    key: keyof M & string
    value: WithIdValue
  }

  export interface GtCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'gt'> {
    key: keyof M & string
    value: string | number
  }

  export interface GteCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'gte'> {
    key: keyof M & string
    value: string | number
  }

  export interface LtCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'lt'> {
    key: keyof M & string
    value: string | number
  }

  export interface LteCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'lte'> {
    key: keyof M & string
    value: string | number
  }

  export interface ContainsCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'contains'> {
    key: keyof M & string
    value: WithIdValue
  }

  export interface NotContainsCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'notContains'> {
    key: keyof M & string
    value: WithIdValue
  }

  export interface HasAnyOfCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'hasAnyOf'> {
    key: keyof M & string
    value: WithIdValue[]
  }

  export interface NotAnyOfCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'notAnyOf'> {
    key: keyof M & string
    value: WithIdValue[]
  }

  export interface InCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'in'> {
    key: keyof M & string
    value: WithIdValue[]
  }

  export interface NotInCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'notIn'> {
    key: keyof M & string
    value: WithIdValue[]
  }

  export interface LikeCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'like'> {
    key: keyof M & string
    value: string
  }

  export interface NotLikeCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'notLike'> {
    key: keyof M & string
    value: string
  }

  export interface IsTrueCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'isTrue'> {
    key: keyof M & string
  }

  export interface IsNotTrueCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'isNotTrue'> {
    key: keyof M & string
  }

  export interface IsNullCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'isNull'> {
    key: keyof M & string
  }

  export interface IsNotNullCondition<
    M extends Record<string, any>,
  > extends BaseCondition<'isNotNull'> {
    key: keyof M & string
  }

  export interface ConditionMap<M extends Record<string, any>> {
    and: AndCondition<M>
    or: OrCondition<M>
    eq: EqCondition<M>
    neq: NeqCondition<M>
    gt: GtCondition<M>
    gte: GteCondition<M>
    lt: LtCondition<M>
    lte: LteCondition<M>
    contains: ContainsCondition<M>
    notContains: NotContainsCondition<M>
    hasAnyOf: HasAnyOfCondition<M>
    notAnyOf: NotAnyOfCondition<M>
    in: InCondition<M>
    notIn: NotInCondition<M>
    like: LikeCondition<M>
    notLike: NotLikeCondition<M>
    isTrue: IsTrueCondition<M>
    isNotTrue: IsNotTrueCondition<M>
    isNull: IsNullCondition<M>
    isNotNull: IsNotNullCondition<M>
  }

  export type Define<M extends Record<string, any>> =
    ConditionMap<M>[keyof ConditionMap<M>]

  export type Op = Define<any>['op']

  export interface Plugin<T extends Op> {
    readonly op: T
    readonly label: string

    check(
      condition: Partial<Extract<Define<any>, { op: T }>>,
    ): condition is Extract<Define<any>, { op: T }>
  }
}
