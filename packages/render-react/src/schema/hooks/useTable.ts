import { useCallback, useEffect, useState } from 'react'
import { DataModelSchema } from '@shuttle-data/client'
import { DataModel } from '@shuttle-data/type'

export default function useTable(
  schema: DataModelSchema,
  tableName: string,
  useApiName?: boolean,
) {
  const [loading, setLoading] = useState(false)
  const [table, setTable] = useState<DataModel.Define>()

  const fetchTable = useCallback(async () => {
    if (!tableName) return

    try {
      setLoading(true)
      const table = await schema.getTable(tableName, useApiName)
      setTable(table)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [tableName, useApiName])

  useEffect(() => {
    if (!tableName) return

    const removeListener = schema.observe(
      (table) => {
        if (table) {
          setTable(table)
        } else {
          fetchTable()
        }
      },
      tableName,
      useApiName,
    )

    fetchTable()

    return removeListener
  }, [tableName, useApiName])

  return {
    loading,
    table,
  }
}
