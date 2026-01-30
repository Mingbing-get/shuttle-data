import { useRef, useCallback, useEffect } from 'react'

export default function useRefDebounce<T extends any[]>(
  cb: (...args: T) => void,
) {
  const timerRef = useRef<number | NodeJS.Timeout>()
  const cbRef = useRef(cb)

  useEffect(() => {
    cbRef.current = cb
  }, [cb])

  const fn = useCallback((delay?: number) => {
    return (...args: T) => {
      clearTimeout(timerRef.current)
      if (!delay || delay <= 0) {
        cbRef.current(...args)
        return
      }
      timerRef.current = setTimeout(cbRef.current, delay, ...args)
    }
  }, [])

  return fn
}
