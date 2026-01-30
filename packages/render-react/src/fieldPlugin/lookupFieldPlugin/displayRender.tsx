import { useMemo } from 'react'
import { Tag, TagProps, Flex } from 'antd'
import { DataModel, DataCRUD } from '@shuttle-data/type'

export default function LookupDisplayRender({
  field,
  value,
  dataModel,
  ...tagProps
}: DataModel.Render.DisplayRenderProps<
  'lookup',
  DataCRUD.LookupInRecord | DataCRUD.LookupInRecord[]
> &
  Omit<TagProps, 'children'>) {
  const displayItems = useMemo(() => {
    if (!value) return []

    if (Array.isArray(value)) {
      return value
    }

    return [value]
  }, [value])

  return (
    <Flex gap={4}>
      {displayItems.map((item) => (
        <Tag key={item._id} {...tagProps}>
          {item._display || item._id}
        </Tag>
      ))}
    </Flex>
  )
}
