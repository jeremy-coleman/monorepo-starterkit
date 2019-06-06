import { proxify } from 'lape'

export interface State {
  count: number
  pastCounters: number[]
}

const defaultState: State = {
  count: 0,
  pastCounters: [],
}

export let state = proxify(defaultState)
