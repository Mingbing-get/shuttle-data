import { useCallback, useEffect, useState } from 'react'
import { DataEnumManager } from '@shuttle-data/client'
import { DataEnum } from '@shuttle-data/type'

export default function useGroupList(manager: DataEnumManager) {
  const [loading, setLoading] = useState(false)
  const [groupList, setGroupList] = useState<Omit<DataEnum.Group, 'items'>[]>(
    [],
  )

  const fetchGroupList = useCallback(async () => {
    try {
      setLoading(true)
      const list = await manager.getGroupList()
      setGroupList(list)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const removeListener = manager.observeGroupList((list) => {
      if (list) {
        setGroupList(list)
      } else {
        fetchGroupList()
      }
    })

    fetchGroupList()

    return removeListener
  }, [])

  return {
    loading,
    groupList,
  }
}
