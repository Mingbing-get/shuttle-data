import { DataCondition } from '../type'

import EqConditionPlugin from './eqConditionPlugin'
import IsNullConditionPlugin from './isNullConditionPlugin'
import IsNotNullConditionPlugin from './isNotNullConditionPlugin'
import IsTrueConditionPlugin from './isTrueConditionPlugin'
import IsNotTrueConditionPlugin from './isNotTrueConditionPlugin'
import ContainsConditionPlugin from './contansConditionPlugin'
import GtConditionPlugin from './gtConditionPlugin'
import GteConditionPlugin from './gteConditionPlugin'
import LtConditionPlugin from './ltConditionPlugin'
import LteConditionPlugin from './lteConditionPlugin'
import HasAnyOfConditionPlugin from './hasAnyOfConditionPlugin'
import InConditionPlugin from './inConditionPlugin'
import NotInConditionPlugin from './notInConditionPlugin'
import LikeConditionPlugin from './likeConditionPlugin'
import NeqConditionPlugin from './neqConditionPlugin'
import NotAnyOfConditionPlugin from './notAnyOfConditionPlugin'
import NotLikeConditionPlugin from './notLikeConditionPlugin'
import NotContainsConditionPlugin from './notContainsConditionPlugin'

export {
  EqConditionPlugin,
  IsNullConditionPlugin,
  IsNotNullConditionPlugin,
  IsTrueConditionPlugin,
  IsNotTrueConditionPlugin,
  ContainsConditionPlugin,
  GtConditionPlugin,
  GteConditionPlugin,
  LtConditionPlugin,
  LteConditionPlugin,
  HasAnyOfConditionPlugin,
  InConditionPlugin,
  NotInConditionPlugin,
  LikeConditionPlugin,
  NeqConditionPlugin,
  NotAnyOfConditionPlugin,
  NotLikeConditionPlugin,
  NotContainsConditionPlugin,
}

class ConditionPluginManager {
  private pluginMap: Record<
    Exclude<DataCondition.Op, 'and' | 'or'>,
    DataCondition.Plugin<any>
  > = {
    eq: new EqConditionPlugin(),
    neq: new NeqConditionPlugin(),
    isNull: new IsNullConditionPlugin(),
    isNotNull: new IsNotNullConditionPlugin(),
    isTrue: new IsTrueConditionPlugin(),
    isNotTrue: new IsNotTrueConditionPlugin(),
    gt: new GtConditionPlugin(),
    gte: new GteConditionPlugin(),
    lt: new LtConditionPlugin(),
    lte: new LteConditionPlugin(),
    like: new LikeConditionPlugin(),
    notLike: new NotLikeConditionPlugin(),
    in: new InConditionPlugin(),
    notIn: new NotInConditionPlugin(),
    contains: new ContainsConditionPlugin(),
    notContains: new NotContainsConditionPlugin(),
    notAnyOf: new NotAnyOfConditionPlugin(),
    hasAnyOf: new HasAnyOfConditionPlugin(),
  }

  use<T extends Exclude<DataCondition.Op, 'and' | 'or'>>(
    plugin: DataCondition.Plugin<T>,
  ) {
    this.pluginMap[plugin.op] = plugin
  }

  getPlugin(op: Exclude<DataCondition.Op, 'and' | 'or'>) {
    return this.pluginMap[op]
  }

  check(condition: Partial<DataCondition.Define<any>>): boolean {
    if (!condition.op) return false

    if (condition.op === 'and' || condition.op === 'or') {
      if (!condition.subCondition?.length) return true

      return condition.subCondition.every((item) => this.check(item))
    }

    const plugin = this.getPlugin(condition.op)
    return plugin.check(condition)
  }
}

export default new ConditionPluginManager()
