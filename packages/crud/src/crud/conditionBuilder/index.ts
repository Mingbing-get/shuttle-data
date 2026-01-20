import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

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

class ConditionPliuginManager {
  private pluginMap: Record<
    Exclude<DataCondition.Op, 'and' | 'or'>,
    DataCondition.Server.Plugin<any>
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
    plugin: DataCondition.Server.Plugin<T>,
  ) {
    this.pluginMap[plugin.op] = plugin
  }

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: Exclude<DataCondition.Define<M>, { op: 'and' | 'or' }>,
    onlyOps?: Exclude<DataCondition.Op, 'and' | 'or'>[],
  ) {
    if (onlyOps) {
      if (!onlyOps.includes(condition.op)) {
        throw new Error(`Op ${condition.op} not supported`)
      }
    }

    const plugin = this.pluginMap[condition.op]
    if (!plugin) {
      throw new Error(`Plugin for op ${condition.op} not found`)
    }

    plugin.create(builder, condition)
  }

  getPlugin(op: Exclude<DataCondition.Op, 'and' | 'or'>) {
    return this.pluginMap[op]
  }
}

export default new ConditionPliuginManager()
