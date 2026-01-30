import { useMemo } from 'react'
import { Form, Switch, InputNumber, Select } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function NumberSettingRender({
  field,
  prePath,
}: DataModel.Render.SettingRenderProps<'number'>) {
  const isNewField = useMemo(
    () => !field.name || field.name.startsWith('temp_'),
    [field],
  )

  return (
    <>
      <Form.Item name={[...prePath, 'autoIncrement']} label="是否自动递增">
        <Switch disabled={field.isSystem || !isNewField} />
      </Form.Item>

      {!field.extra?.autoIncrement && (
        <>
          <Form.Item name={[...prePath, 'unique']} label="是否唯一">
            <Switch disabled={field.isSystem || !isNewField} />
          </Form.Item>

          <Form.Item name={[...prePath, 'min']} label="最小值">
            <InputNumber
              disabled={field.isSystem}
              precision={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name={[...prePath, 'max']} label="最大值">
            <InputNumber
              disabled={field.isSystem}
              precision={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name={[...prePath, 'func']}
            label="格式化函数"
            tooltip="当值为小数时，用于转换成整数的方式"
          >
            <Select
              disabled={field.isSystem}
              defaultValue={'round'}
              options={[
                {
                  label: '四舍五入',
                  value: 'round',
                },
                {
                  label: '向下取整',
                  value: 'floor',
                },
                {
                  label: '向上取整',
                  value: 'ceil',
                },
              ]}
            />
          </Form.Item>
        </>
      )}
    </>
  )
}
