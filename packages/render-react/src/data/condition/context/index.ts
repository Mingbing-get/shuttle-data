import { createContext, useContext } from 'react'
import { DataCondition, DataModel as NDataModel } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/client'

export interface ConditionContext {
  add: (
    parent?: DataCondition.AndCondition<any> | DataCondition.OrCondition<any>,
    isLogic?: boolean,
  ) => void
  remove: (condition: DataCondition.Define<any>) => void
  update: (
    condition: DataCondition.Define<any>,
    newCondition: DataCondition.Define<any>,
  ) => void
  move: (
    source: DataCondition.Define<any>,
    target: DataCondition.Define<any>,
    before?: boolean,
  ) => void
  setDragCondition: (condition: DataCondition.Define<any>) => void
  clearDragCondition: () => void

  dragCondition?: DataCondition.Define<any>
  canDropConditions: DataCondition.Define<any>[]
  disabled?: boolean
  condition?: DataCondition.Define<any>
  fields: NDataModel.Field[]
  useApiName?: boolean
  dataModel: DataModel
}

export const conditionContext = createContext<ConditionContext>({
  add: () => {},
  remove: () => {},
  update: () => {},
  move: () => {},
  setDragCondition: () => {},
  clearDragCondition: () => {},
  fields: [],
  canDropConditions: [],
  dataModel: {} as DataModel,
})

export function useCondition() {
  return useContext(conditionContext)
}
