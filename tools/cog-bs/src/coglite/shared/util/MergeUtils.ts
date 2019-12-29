import { isArray, isObject, isString } from "./LangUtils"

export interface IEquality {
  (l: any, r: any): boolean
}

export const defaultEquality: IEquality = (l: any, r: any) => {
  return l === r
}

const deepObjectEquality = (value: any, other: any) => {
  if (value && other) {
    const valueKeys = Object.keys(value)
    const otherKeys = Object.keys(other)
    const everyValueKeyEqual = valueKeys.every((key) => {
      const v = value[key]
      const ov = other[key]
      return deepEquality(v, ov)
    })
    if (!everyValueKeyEqual) {
      return false
    }
    const otherExtraKeys = otherKeys.filter((key) => valueKeys.indexOf(key) < 0)
    if (otherExtraKeys.length > 0) {
      return otherExtraKeys.every((key) => {
        return value[key] === other[key]
      })
    }
    return true
  }
  return false
}

const deepArrayEquality = (value: any, other: any) => {
  if (value && other && value.length === other.length) {
    return value.every((e, idx) => {
      return deepEquality(e, other[idx])
    })
  }
  return false
}

export const deepEquality: IEquality = (value: any, other: any) => {
  if (value === other) {
    return true
  }
  if (isArray(value)) {
    return deepArrayEquality(value, other)
  }
  if (isObject(value)) {
    return deepObjectEquality(value, other)
  }
  return false
}

interface IMergeStrategy {
  (l: any, r: any): any
}

export const defaultSimpleMergeStrategy: IMergeStrategy = (l: any, r: any) => {
  if (l === r) {
    return l
  }
  return [l, r]
}

export const stringConcatSimpleMergeStrategy = (separator = ","): IMergeStrategy => {
  return (l: any, r: any) => {
    if (isString(l)) {
      return `${l}${r !== undefined ? separator + r : ""}`
    }
    return defaultSimpleMergeStrategy(l, r)
  }
}

interface IMergeOptions {
  eq?: IEquality
  simpleMergeStrategy?: IMergeStrategy
}

export const MergeDefaults: IMergeOptions = {
  eq: defaultEquality,
  simpleMergeStrategy: defaultSimpleMergeStrategy
}

const mergeObjectDedup = (value: any, other: any, opts: IMergeOptions): any => {
  const r = {}
  const valueKeys = Object.keys(value)
  const otherKeys = Object.keys(other)
  valueKeys.forEach((key) => {
    if (otherKeys.indexOf(key) >= 0) {
      const v = value[key]
      r[key] = mergeDedupImmediate(v, other ? other[key] : undefined, opts)
    } else {
      r[key] = value[key]
    }
  })
  otherKeys.forEach((key) => {
    if (valueKeys.indexOf(key) < 0) {
      r[key] = other[key]
    }
  })
  return r
}

const mergeArrayDedup = (value: any, other: any, opts: IMergeOptions): any => {
  const r = []
  value.forEach((e) => {
    r.push(e)
  })
  if (isArray(other)) {
    other.forEach((e) => {
      if (!r.some((re) => opts.eq(e, re))) {
        r.push(e)
      }
    })
  } else if (other !== undefined) {
    if (!r.some((re) => opts.eq(re, other))) {
      r.push(other)
    }
  }
  return r
}

const mergeSimpleDedup = (value: any, other: any, opts: IMergeOptions): any => {
  if (opts.eq(value, other)) {
    return value
  }
  if (other === undefined) {
    return value
  }
  if (value === undefined) {
    return other
  }
  return opts.simpleMergeStrategy(value, other)
}

const mergeDedupImmediate = (value: any, other: any, opts: IMergeOptions): any => {
  if (value === null || value === undefined) {
    return other
  } else if (other === null || other === undefined) {
    return value
  }
  if (isArray(value)) {
    return mergeArrayDedup(value, other, opts)
  }
  if (isObject(value)) {
    return mergeObjectDedup(value, other, opts)
  }
  return mergeSimpleDedup(value, other, opts)
}

export const mergeDedup = (value: any, other: any, opts?: IMergeOptions): any => {
  return mergeDedupImmediate(value, other, Object.assign({}, MergeDefaults, opts))
}

const mergeAllDedupImmediate = (values: any[], opts: IMergeOptions): any => {
  let r = {}
  if (values) {
    values.forEach((value) => {
      r = mergeDedup(r, value, opts)
    })
  }
  return r
}

export const mergeAllDedup = (values: any[], opts?: IMergeOptions): any => {
  return mergeAllDedupImmediate(values, Object.assign({}, MergeDefaults, opts))
}

export const dedupArray = (value: any[], eq: IEquality = defaultEquality): any[] => {
  if (value) {
    const r = []
    value.forEach((e) => {
      if (!r.some((re) => eq(re, e))) {
        r.push(e)
      }
    })
    return r
  }
}

export let MergeUtils = {
  mergeDedup,
  mergeAllDedup,
  defaultEquality,
  deepEquality,
  defaultSimpleMergeStrategy,
  stringConcatSimpleMergeStrategy,
  MergeDefaults,
  dedupArray
}
