import { EffectCallback, useEffect } from "react"

const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, [])
}

export const useMount = (fn: () => void) => {
  useEffectOnce(() => {
    fn()
  })
}