import { useCallback, useEffect, useState } from 'react'
import { DataEnumManager } from '@shuttle-data/client'
import { DataEnum } from '@shuttle-data/type'

export default function useGroup(
  manager: DataEnumManager,
  groupName: string,
  useApiName?: boolean,
) {
  const [loading, setLoading] = useState(false)
  const [group, setGroup] = useState<DataEnum.Group>()

  const fetchGroup = useCallback(async () => {
    try {
      setLoading(true)
      const group = await manager.getGroup(groupName, useApiName)
      setGroup(group)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [groupName, useApiName])

  useEffect(() => {
    const removeListener = manager.observe(
      (group) => {
        if (group) {
          setGroup(group)
        } else {
          fetchGroup()
        }
      },
      groupName,
      useApiName,
    )

    fetchGroup()

    return removeListener
  }, [groupName, useApiName])

  return {
    loading,
    group,
  }
}
