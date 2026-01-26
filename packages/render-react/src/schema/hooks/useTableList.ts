import { useCallback, useEffect, useState } from 'react'
import { DataModelSchema } from '@shuttle-data/client'
import { DataModel } from '@shuttle-data/type'

export default function useTableList(schema: DataModelSchema) {
  const [loading, setLoading] = useState(false)
  const [tableList, setTableList] = useState<
    Omit<DataModel.Define, 'fields'>[]
  >([])

  const fetchTableList = useCallback(async () => {
    try {
      setLoading(true)
      const list = await schema.getTableList()
      setTableList(list)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const removeListener = schema.observeTableList((list) => {
      if (list) {
        setTableList(list)
      } else {
        fetchTableList()
      }
    })

    fetchTableList()

    return removeListener
  }, [])

  return {
    loading,
    tableList,
  }
}
