import { Button, ButtonProps } from 'antd'
import { useCallback, useState } from 'react'

export interface WaitLoadingButtonProps extends Omit<ButtonProps, 'loading'> {}

export default function WaitLoadingButton({
  onClick,
  ...props
}: WaitLoadingButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      setLoading(true)
      try {
        await onClick?.(e)
      } catch (error) {
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onClick],
  )

  return <Button {...props} loading={loading} onClick={handleClick} />
}
