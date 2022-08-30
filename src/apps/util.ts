import { useState, useEffect } from 'preact/hooks'

export const useWidthCondition = (
  conditionCheck: (width: number) => boolean
) => {
  const [conditionMet, setConditionMet] = useState(false)
  useEffect(() => {
    const onResize = () => setConditionMet(conditionCheck(window.innerWidth))
    window.addEventListener('resize', onResize)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  })
  return conditionMet
}

export const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, '0')
