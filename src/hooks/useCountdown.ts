import { useState, useEffect, useCallback } from 'react'

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning) return
    if (seconds <= 0) {
      setIsRunning(false)
      return
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [seconds, isRunning])

  const reset = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(true)
  }, [initialSeconds])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${mins}:${secs.toString().padStart(2, '0')}`
  const progress = (seconds / initialSeconds) * 100

  return { seconds, display, progress, isRunning, reset, expired: seconds <= 0 }
}
