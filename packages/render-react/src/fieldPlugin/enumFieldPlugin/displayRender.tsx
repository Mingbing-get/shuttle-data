import { useMemo } from 'react'
import { Tag, TagProps, Flex } from 'antd'
import { DataModel, DataEnum } from '@shuttle-data/type'

import { useGroup } from '../../dataEnum'

export default function EnumDisplayRender({
  field,
  value,
  dataModel,
  useApiName,
  ...tagProps
}: DataModel.Render.DisplayRenderProps<'enum', string | string[]> &
  Omit<TagProps, 'children' | 'color'>) {
  const { group } = useGroup(
    dataModel.enumManager,
    field.extra?.groupName || '',
  )

  const displayItems = useMemo(() => {
    if (!value) return []

    if (Array.isArray(value)) {
      return value.reduce((acc: DataEnum.Item[], v) => {
        const item = group?.items?.find((item) =>
          useApiName ? item.apiName === v : item.name === v,
        )
        if (item) {
          acc.push(item)
        }
        return acc
      }, [])
    }

    const item = group?.items?.find((item) =>
      useApiName ? item.apiName === value : item.name === value,
    )
    if (item) {
      return [item]
    }
    return []
  }, [group, value, useApiName])

  return (
    <Flex gap={4}>
      {displayItems.map((item) => (
        <Tag key={item.name} color={item.color} {...tagProps}>
          {item.label || item.apiName || item.name}
        </Tag>
      ))}
    </Flex>
  )
}
