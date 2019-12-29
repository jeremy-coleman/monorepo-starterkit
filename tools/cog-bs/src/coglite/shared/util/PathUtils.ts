//import * as StringUtils from "./StringUtils";
import { endsWith, isOneOf, rightTrim } from "./StringUtils"

export const sep = "/"
const extDelim = "."
const currentDir = "."
const parentDir = ".."
const sepCharCode = sep.charCodeAt(0)

const sepFilter = isOneOf(sep)

const startsWithSeparator = (path: string): boolean => {
  return path && path.length > 0 && path.charCodeAt(0) === sepCharCode
}

export const isAbsolute = (path: string): boolean => {
  return startsWithSeparator(path)
}

const endsWithSeparator = (path: string): boolean => {
  return path && path.length > 0 && path.charCodeAt(path.length - 1) === sepCharCode
}

export const basename = (path: string, ext?: string): string => {
  if (path) {
    const lastSepIdx = path.lastIndexOf(sep)
    const bn = lastSepIdx >= 0 ? path.substring(lastSepIdx + sep.length) : path
    return ext && endsWith(bn, ext) ? bn.substring(0, bn.length - ext.length) : bn
  }
}

export const parent = (path: string): string => {
  if (path) {
    const lastSepIdx = path.lastIndexOf(sep)
    if (lastSepIdx > 0) {
      return path.substring(0, lastSepIdx)
    }
  }
}

export const dirname = (path: string): string => {
  if (path) {
    const lastSepIdx = path.lastIndexOf(sep)
    if (lastSepIdx === 0) {
      return sep
    }
    if (lastSepIdx > 0) {
      const prefix = path.substring(0, lastSepIdx)
      const suffix = path.substring(lastSepIdx + sep.length)
      return suffix ? prefix : this.dirname(prefix)
    }
    return currentDir
  }
}

export const extname = (path: string, noDelim = false): string => {
  if (path) {
    const lastExtIdx = path.lastIndexOf(extDelim)
    if (lastExtIdx >= 0) {
      return path.substring(noDelim ? lastExtIdx + 1 : lastExtIdx)
    }
  }
  return ""
}

export const removeExt = (path: string): string => {
  const lastExtIdx = path.lastIndexOf(extDelim)
  const prefix = path.substring(0, lastExtIdx)
  return prefix.length > 0 ? prefix : path
}

interface IJoinState {
  els: string[]
  startSep: boolean
  endSep: boolean
}

const joinInternal = (arg: any, state: IJoinState) => {
  if (Array.isArray(arg)) {
    arg.forEach((a: any) => {
      joinInternal(a, state)
    })
  } else if (arg) {
    const s = String(arg)
    if (state.els.length === 0 && startsWithSeparator(s)) {
      state.startSep = true
    }
    state.endSep = endsWithSeparator(s)
    const ps = arg.split(sep)
    ps.forEach((p: string) => {
      if (p) {
        if (p === parentDir) {
          if (state.els.length > 0) {
            state.els.splice(state.els.length - 1, 1)
          }
        } else if (p !== currentDir) {
          state.els.push(p)
        }
      }
    })
  }
  return state
}

export const joinPaths = function(...args: any[]) {
  const state: IJoinState = { els: [], startSep: false, endSep: false }

  Array.prototype.forEach.call(
    arguments,
    function(arg: string) {
      joinInternal(arg, state)
    },
    this
  )

  if (state.els.length > 0) {
    const r = state.els.join(sep)
    return (state.startSep ? sep : "") + r + (state.endSep ? sep : "")
  }

  return state.startSep || state.endSep ? sep : currentDir
}

export const normalize = (path: string) => {
  if (path) {
    const els = path.split(sep)
    return this.join(els)
  }
}

export const trimSeparatorFromEnd = (path: string) => {
  return rightTrim(path, sepFilter)
}

export let PathUtils = {
  sep,
  basename,
  parent,
  dirname,
  extname,
  removeExt,
  isAbsolute,
  joinPaths,
  normalize,
  trimSeparatorFromEnd
}
