import { Popover } from 'antd'
import { PlusOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { DataCondition } from '@shuttle-data/type'

import { useCondition } from './context'

interface Props {
  parent: DataCondition.AndCondition<any> | DataCondition.OrCondition<any>
}

export default function RenderAddCondition({ parent }: Props) {
  const { add } = useCondition()

  return (
    <div className="add-condition-group">
      <Popover placement="top" trigger="hover" content="添加条件">
        <div className="icon-add">
          <PlusOutlined onClick={() => add(parent)} />
        </div>
      </Popover>
      <Popover placement="top" trigger="hover" content="添加组">
        <div className="icon-add">
          <PlusCircleOutlined onClick={() => add(parent, true)} />
        </div>
      </Popover>
    </div>
  )
}
