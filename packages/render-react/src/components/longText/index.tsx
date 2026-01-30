import { useLayoutEffect, useRef, useState } from 'react'
import { Popover } from 'antd'
import classNames from 'classnames'

import './index.scss'

interface Props {
  className?: string
  style?: React.CSSProperties
  text?: string
}

export default function LongText({ style, text, className }: Props) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const [textOverFlow, setTextOverFlow] = useState(false)

  useLayoutEffect(() => {
    if (!wrapperRef.current) return

    setTextOverFlow(
      wrapperRef.current.clientWidth < wrapperRef.current.scrollWidth,
    )
  }, [text])

  return (
    <Popover placement="top" trigger="hover" content={textOverFlow ? text : ''}>
      <span
        ref={wrapperRef}
        style={style}
        className={classNames(className, 'shuttle-data-long-text')}
      >
        {text}
      </span>
    </Popover>
  )
}
