import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataCondition } from '@shuttle-data/type'
import { ConditionContext, conditionContext } from '.'

export interface ConditionProviderProps extends Pick<
  ConditionContext,
  'condition' | 'disabled' | 'dataModel' | 'fields' | 'useApiName'
> {
  children: React.ReactNode
  onChange?: (condition?: DataCondition.Define<any>) => void
}

export default function ConditionProvider({
  children,
  condition,
  disabled,
  dataModel,
  fields,
  useApiName,
  onChange,
}: ConditionProviderProps) {
  const [conditionState, setConditionState] =
    useState<DataCondition.Define<any>>()
  const onChangeRef = useRef(onChange)
  const [dragCondition, setDragCondition] =
    useState<DataCondition.Define<any>>()
  const [canDropConditions, setCanDropConditions] = useState<
    DataCondition.Define<any>[]
  >([])

  useEffect(() => {
    setConditionState(condition)
  }, [condition])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const add = useCallback(
    (
      parent?: DataCondition.AndCondition<any> | DataCondition.OrCondition<any>,
      isLogic?: boolean,
    ) => {
      const newCondition: DataCondition.Define<any> = isLogic
        ? {
            op: 'and',
            subCondition: [{} as DataCondition.Define<any>],
          }
        : ({} as DataCondition.Define<any>)

      if (!parent) {
        setConditionState(newCondition)
        onChangeRef.current?.(newCondition)
      } else {
        parent.subCondition.push(newCondition)
        setConditionState((old) => {
          const newValue = old ? { ...old } : newCondition

          onChangeRef.current?.(newValue)

          return newValue
        })
      }
    },
    [],
  )

  const remove = useCallback((condition: DataCondition.Define<any>) => {
    setConditionState((old) => {
      let handleCondition: DataCondition.Define<any> | undefined = condition

      while (true) {
        const parent = findParent(old, handleCondition)
        if (!parent) break

        parent.subCondition = parent.subCondition.filter(
          (item) => item !== handleCondition,
        )
        if (parent.subCondition.length === 0) {
          handleCondition = parent
        } else {
          handleCondition = undefined
          break
        }
      }

      const newValue = old && handleCondition !== old ? { ...old } : undefined
      onChangeRef.current?.(newValue)

      return newValue
    })
  }, [])

  const update = useCallback(
    (
      condition: DataCondition.Define<any>,
      newCondition: DataCondition.Define<any>,
    ) => {
      setConditionState((old) => {
        if (condition === old) {
          onChangeRef.current?.(newCondition)
          return newCondition
        }

        const parent = findParent(old, condition)
        if (!parent) return old

        const index = parent.subCondition.indexOf(condition)
        if (index === -1) return old

        parent.subCondition[index] = newCondition

        const newValue = old ? { ...old } : undefined

        onChangeRef.current?.(newValue)

        return newValue
      })
    },
    [],
  )

  const move = useCallback(
    (
      source: DataCondition.Define<any>,
      target: DataCondition.Define<any>,
      before?: boolean,
    ) => {
      setConditionState((old) => {
        if (!old) return old

        const sourceParent = findParent(old, source)
        if (!sourceParent) return old

        const targetParent = findParent(old, target)
        if (!targetParent) return old

        sourceParent.subCondition = sourceParent.subCondition.filter(
          (item) => item !== source,
        )

        const targetIndex = targetParent.subCondition.indexOf(target)

        targetParent.subCondition.splice(
          before ? targetIndex : targetIndex + 1,
          0,
          source,
        )

        // 检查被移动的父节点是否还有多余的condition,若没有则需要将其移出
        let checkCondition = sourceParent
        while (true) {
          if (checkCondition.subCondition.length === 0) {
            const parent = findParent(old, checkCondition)
            if (!parent) break

            parent.subCondition = parent.subCondition.filter(
              (item) => item !== checkCondition,
            )
            checkCondition = parent
          } else {
            break
          }
        }

        const newValue = old ? { ...old } : undefined

        onChangeRef.current?.(newValue)

        return newValue
      })
    },
    [],
  )

  useEffect(() => {
    setCanDropConditions((old) => {
      const newData = getCanDropConditions(dragCondition, conditionState)
      if (newData.length === 0 && old.length === 0) return old

      return newData
    })
  }, [conditionState, dragCondition])

  const clearDragCondition = useCallback(() => {
    setDragCondition(undefined)
  }, [])

  const memoizedValue = useMemo(
    () => ({
      add,
      remove,
      update,
      move,
      setDragCondition,
      clearDragCondition,
      disabled,
      condition: conditionState,
      dragCondition,
      canDropConditions,
      fields,
      useApiName,
      dataModel,
    }),
    [
      disabled,
      conditionState,
      fields,
      useApiName,
      dataModel,
      dragCondition,
      canDropConditions,
    ],
  )

  return (
    <conditionContext.Provider value={memoizedValue}>
      {children}
    </conditionContext.Provider>
  )
}

function findParent(
  condition?: DataCondition.Define<any>,
  cur?: DataCondition.Define<any>,
):
  | DataCondition.AndCondition<any>
  | DataCondition.OrCondition<any>
  | undefined {
  if (!condition || !cur) return

  if (condition.op === 'and' || condition.op === 'or') {
    if (condition.subCondition.includes(cur)) return condition

    for (const item of condition.subCondition) {
      const parent = findParent(item, cur)
      if (parent) return parent
    }
  }
}

function getCanDropConditions(
  condition?: DataCondition.Define<any>,
  rootCondition?: DataCondition.Define<any>,
) {
  if (
    !condition ||
    !rootCondition ||
    (rootCondition.op !== 'and' && rootCondition.op !== 'or')
  ) {
    return []
  }

  const canDropConditions: DataCondition.Define<any>[] = []

  const willHandleConditions = [...rootCondition.subCondition]
  while (willHandleConditions.length > 0) {
    const firstCondition = willHandleConditions.pop()
    if (!firstCondition) break

    if (firstCondition === condition) continue

    if (firstCondition.op === 'and' || firstCondition.op === 'or') {
      willHandleConditions.unshift(...firstCondition.subCondition)
    }

    canDropConditions.push(firstCondition)
  }

  return canDropConditions
}
