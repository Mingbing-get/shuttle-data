import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Select, SelectProps } from 'antd'
import { DataCRUD } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/client'

import useRefDebounce from '../../hooks/useRefDebounce'
import { useTable } from '../../schema'
import { isSameStringArray } from '../../utils'

export interface DataRecordSelectProps<M extends boolean = false> extends Omit<
  SelectProps,
  | 'value'
  | 'onChange'
  | 'onOpenChange'
  | 'loading'
  | 'mode'
  | 'options'
  | 'showSearch'
  | 'fieldNames'
  | 'labelInValue'
> {
  dataModel: DataModel
  tableName: string
  pageSize?: number
  useApiName?: boolean
  multiple?: M
  value?: M extends true ? DataCRUD.LookupInRecord[] : DataCRUD.LookupInRecord
  onChange?: (
    value?: M extends true
      ? DataCRUD.LookupInRecord[]
      : DataCRUD.LookupInRecord,
  ) => void
}

export default function DataRecordSelect<M extends boolean = false>({
  dataModel,
  tableName,
  useApiName,
  pageSize = 20,
  multiple,
  value,
  onChange,
  ...selectProps
}: DataRecordSelectProps<M>) {
  const [loading, setLoading] = useState<boolean>(false)
  const [options, setOptions] = useState<DataCRUD.LookupInRecord[]>([])
  const [selectIds, setSelectIds] = useState<string[] | string>()
  const { table } = useTable(dataModel.schema, tableName, useApiName)

  const valueRef = useRef<DataCRUD.LookupInRecord[]>([])
  const optionsRef = useRef<DataCRUD.LookupInRecord[]>([])
  const loadMoreRef = useRef({
    page: 0,
    searchValue: '',
    popupVisible: false,
    hasMore: true,
    loading: false,
  })

  useEffect(() => {
    if (!value) {
      valueRef.current = []
    } else if (Array.isArray(value)) {
      valueRef.current = value
    } else {
      valueRef.current = [value]
    }
  }, [value])

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const mergeOptions = useCallback(
    (options: DataCRUD.LookupInRecord[], clear = false) => {
      const needOptions = [...valueRef.current]
      options.forEach((item) => {
        if (!needOptions.find((i) => i._id === item._id)) {
          needOptions.push(item)
        }
      })

      setOptions((prevOptions) => {
        if (clear) return needOptions

        const newOptions = [...prevOptions]
        needOptions.forEach((item) => {
          if (!newOptions.find((i) => i._id === item._id)) {
            newOptions.push(item)
          }
        })
        return newOptions
      })
    },
    [],
  )

  const crud = useMemo(() => {
    return dataModel.crud({
      modelName: tableName,
      useApiName,
    })
  }, [tableName, useApiName, dataModel])

  const fetchData = useRefDebounce(async () => {
    if (!table) return

    setLoading(true)
    loadMoreRef.current.loading = true
    loadMoreRef.current.page++

    try {
      const records = await crud.find({
        fields: ['_id'],
        limit: pageSize,
        offset: (loadMoreRef.current.page - 1) * pageSize,
        condition: loadMoreRef.current.searchValue
          ? {
              key: table.displayField,
              op: 'like',
              value: loadMoreRef.current.searchValue,
            }
          : undefined,
      })

      loadMoreRef.current.hasMore = records.length >= pageSize
      mergeOptions(records as DataCRUD.LookupInRecord[])
    } catch (error) {
      throw error
    } finally {
      loadMoreRef.current.loading = false
      setLoading(false)
    }
  })

  const handleChange = useCallback(
    (v?: string | string[]) => {
      if (!v) {
        onChange?.()
        setSelectIds(undefined)
        return
      }

      if (Array.isArray(v)) {
        const options = optionsRef.current.filter((item) =>
          v.includes(item._id),
        )
        setSelectIds(v)
        onChange?.(options as any)
        return
      }

      const option = optionsRef.current.find((item) => item._id === v)
      if (option) {
        setSelectIds(v)
        onChange?.(option as any)
      } else {
        setSelectIds(undefined)
        onChange?.()
      }
    },
    [onChange],
  )

  const handleOpenChange = useCallback((open?: boolean) => {
    loadMoreRef.current.popupVisible = open || false

    if (
      !open ||
      loadMoreRef.current.page !== 0 ||
      loadMoreRef.current.loading
    ) {
      return
    }

    fetchData()()
  }, [])

  const handlePopupScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!loadMoreRef.current.hasMore || loadMoreRef.current.loading) return

    const target = e.target as HTMLElement
    const canLoad =
      Math.abs(target.scrollTop + target.clientHeight - target.scrollHeight) <
      10

    if (!canLoad) return

    fetchData()()
  }, [])

  const handleSearch = useCallback((v: string) => {
    mergeOptions([], true)
    loadMoreRef.current.hasMore = true
    loadMoreRef.current.searchValue = v
    loadMoreRef.current.page = 0

    if (!loadMoreRef.current.popupVisible) return
    fetchData(300)()
  }, [])

  const handleFilterOption = useCallback(
    (inputValue: string, option?: DataCRUD.LookupInRecord) => {
      return (
        option?._display?.toLowerCase().includes(inputValue.toLowerCase()) ||
        false
      )
    },
    [],
  )

  useEffect(() => {
    setSelectIds((old) => {
      if (!multiple) {
        if (old !== (value as DataCRUD.LookupInRecord)?._id) {
          return (value as DataCRUD.LookupInRecord)?._id
        }
        return old
      }

      const newValue =
        (value as DataCRUD.LookupInRecord[])?.map((item) => item._id) || []
      const oldValue = (old as string[]) || []

      if (!isSameStringArray(newValue, oldValue)) {
        return newValue
      }
      return oldValue
    })
  }, [value, multiple])

  useEffect(() => {
    loadMoreRef.current.hasMore = true
    loadMoreRef.current.page = 0
    mergeOptions([], true)

    if (loadMoreRef.current.popupVisible) {
      fetchData()()
    }
  }, [pageSize, crud])

  return (
    <Select
      {...selectProps}
      showSearch={{
        onSearch: handleSearch,
        filterOption: handleFilterOption,
      }}
      options={options}
      fieldNames={{
        label: '_display',
        value: '_id',
      }}
      loading={loading}
      mode={multiple ? 'multiple' : undefined}
      value={selectIds as any}
      onChange={handleChange as any}
      onOpenChange={handleOpenChange}
      onPopupScroll={handlePopupScroll}
    />
  )
}
