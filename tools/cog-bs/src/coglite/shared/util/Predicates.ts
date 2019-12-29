import { IPredicateFunc } from "coglite/types"

export const not = <T = any, S = T[]>(pr: IPredicateFunc<T, S>) => (value, idx, source) => {
  return !pr(value, idx, source)
}

export const and = <T = any, S = T[]>(...prs: Array<IPredicateFunc<T, S>>) => (value, idx, source) => {
  return prs.every((pr) => {
    return pr(value, idx, source)
  })
}

export const or = <T = any, S = T[]>(...prs: Array<IPredicateFunc<T, S>>) => (value, idx, source) => {
  return prs.some((pr) => {
    return pr(value, idx, source)
  })
}
