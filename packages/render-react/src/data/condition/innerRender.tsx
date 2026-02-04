import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { useCondition } from './context'
import RenderSingleCondition from './renderSingleCondition'

import './index.scss'

interface Props {
  style?: React.CSSProperties
  className?: string
}

export default function WrapperRender({ style, className }: Props) {
  const { condition, add, disabled } = useCondition()

  return (
    <div
      className={classNames('shuttle-data-condition-wrapper', className)}
      style={style}
    >
      {condition && <RenderSingleCondition condition={condition} />}

      {!disabled && !condition && (
        <Button
          icon={<PlusOutlined />}
          type="text"
          onClick={() => add(undefined, true)}
        >
          添加条件
        </Button>
      )}
    </div>
  )
}
