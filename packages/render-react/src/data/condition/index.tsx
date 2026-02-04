import ConditionProvider, { ConditionProviderProps } from './context/provider'
import InnerRender from './innerRender'

import './index.scss'

export interface ConditionRenderProps extends Omit<
  ConditionProviderProps,
  'children'
> {
  style?: React.CSSProperties
  className?: string
}

export default function ConditionRender({
  style,
  className,
  ...context
}: ConditionRenderProps) {
  return (
    <ConditionProvider {...context}>
      <InnerRender style={style} className={className} />
    </ConditionProvider>
  )
}
