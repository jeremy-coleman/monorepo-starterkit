import { IConsumerFunc, IMapFunc, IPredicateFunc } from "coglite/types"
import { isArray, isFunction, isObject } from "./LangUtils"
import { not } from "./Predicates"

export interface IContainsTextOptions {
  matcher: (text: string, match: string) => boolean
}

interface CharMap {
  cr: string
  lf: string
  tab: string
  space: string
  zero: string
  nine: string
  a: string
  z: string
  A: string
  Z: string
  [k: string]: string
}

const chars: CharMap = {
  cr: "\r",
  lf: "\n",
  tab: "\t",
  space: " ",
  zero: "0",
  nine: "9",
  a: "a",
  z: "z",
  A: "A",
  Z: "Z"
}

interface CharCodeMap {
  cr: number
  lf: number
  tab: number
  space: number
  zero: number
  nine: number
  a: number
  z: number
  A: number
  Z: number
  [k: string]: number
}

const charCodes = {
  cr: chars.cr.charCodeAt(0),
  lf: chars.lf.charCodeAt(0),
  tab: chars.tab.charCodeAt(0),
  space: chars.space.charCodeAt(0),
  zero: chars.zero.charCodeAt(0),
  nine: chars.nine.charCodeAt(0),
  a: chars.a.charCodeAt(0),
  z: chars.z.charCodeAt(0),
  A: chars.A.charCodeAt(0),
  Z: chars.Z.charCodeAt(0)
}

export const isWhitespace = (ch: string) => {
  const code = ch.charCodeAt(0)
  return (
    isNaN(code) ||
    (code >= 9 && code <= 13) ||
    code === 32 ||
    code === 133 ||
    code === 160 ||
    code === 5760 ||
    (code >= 8192 && code <= 8202) ||
    code === 8232 ||
    code === 8233 ||
    code === 8239 ||
    code === 8287 ||
    code === 12288
  )
}

export const isNotWhitespace = (ch: string) => {
  return !isWhitespace(ch)
}

export const isDigit = (ch: string) => {
  const code = ch.charCodeAt(0)
  return code >= charCodes.zero && code <= charCodes.nine
}

export const isNotDigit = (ch: string) => {
  return !isDigit(ch)
}

export const isAlpha = (ch: string) => {
  const code = ch.charCodeAt(0)
  return (code >= charCodes.a && code <= charCodes.z) || (code >= charCodes.A && code <= charCodes.Z)
}

export const isNotAlpha = (ch: string) => {
  return !isAlpha(ch)
}

export const isAlphaNumeric = (ch: string) => {
  return isAlpha(ch) || isDigit(ch)
}

export const isNotAlphaNumeric = (ch: string) => {
  return !isAlpha(ch) && !isDigit(ch)
}

export const isOneOf = (chars: string) => {
  return (ch) => {
    return chars && chars.indexOf(ch) >= 0
  }
}

export const isNotOneOf = (chars: string) => {
  return not(isOneOf(chars))
}

export const empty = ""

const isSane = (text: string) => {
  return text !== undefined && text !== null
}

export const startsWith = (text: string, match: string): boolean => {
  return isSane(text) && isSane(match) && match.length <= text.length ? text.indexOf(match) === 0 : false
}

export const endsWith = (text: string, match: string): boolean => {
  if (isSane(text) && isSane(match) && match.length <= text.length) {
    const idx = text.lastIndexOf(match)
    return idx >= 0 && idx + match.length === text.length
  }
  return false
}

export const contains = (text: string, match: string): boolean => {
  return isSane(text) && isSane(match) ? text.indexOf(match) >= 0 : false
}

export const each = (text: string, cb: IConsumerFunc<string, string>): void => {
  if (text) {
    const tl = text.length
    for (let i = 0; i < tl; i++) {
      cb(text.charAt(i), i, text)
    }
  }
}

export const eachRtl = (text: string, cb: IConsumerFunc<string, string>): void => {
  if (text) {
    const tl = text.length
    for (let i = tl - 1; i >= 0; i--) {
      cb(text.charAt(i), i, text)
    }
  }
}

export const some = (text: string, pr: IPredicateFunc<string, string>): boolean => {
  if (text) {
    const tl = text.length
    for (let i = 0; i < tl; i++) {
      if (pr(text.charAt(i), i, text)) {
        return true
      }
    }
  }
  return false
}

export const someRtl = (text: string, pr: IPredicateFunc<string, string>): boolean => {
  if (text) {
    const tl = text.length
    for (let i = tl - 1; i >= 0; i--) {
      if (pr(text.charAt(i), i, text)) {
        return true
      }
    }
  }
  return false
}

export const every = (text: string, pr: IPredicateFunc<string, string>): boolean => {
  if (text) {
    const tl = text.length
    for (let i = 0; i < tl; i++) {
      if (!pr(text.charAt(i), i, text)) {
        return false
      }
    }
  }
  return true
}

export const everyRtl = (text: string, pr: IPredicateFunc<string, string>): boolean => {
  if (text) {
    const tl = text.length
    for (let i = tl - 1; i >= 0; i--) {
      if (!pr(text.charAt(i), i, text)) {
        return false
      }
    }
  }
  return true
}

export const filter = (text: string, pr: IPredicateFunc<string, string>): string => {
  if (text) {
    let r = empty
    const action = (ch, idx, source) => {
      if (pr(ch, idx, source)) {
        r += ch
      }
    }
    each(text, action)
    return r
  }
  return text
}

export const reject = (text: string, pr: IPredicateFunc<string, string>): string => {
  if (text) {
    let r = empty
    const action = (ch, idx, source) => {
      if (!pr(ch, idx, source)) {
        r += ch
      }
    }
    each(text, action)
    return r
  }
  return text
}

export const map = (text: string, m: IMapFunc<string, string, string>): string => {
  if (text) {
    let r = empty
    let mc
    const action = (ch, idx, source) => {
      mc = m(ch, idx, source)
      if (mc) {
        r += mc
      }
    }
    each(text, action)
    return r
  }
  return text
}

export const split = (text: string, pr: IPredicateFunc<string, string>): string[] => {
  const r: string[] = []
  if (text) {
    let b = empty
    const action = (ch, idx, source) => {
      if (pr(ch, idx, source)) {
        if (b) {
          r.push(b)
          b = empty
        }
      } else {
        b += ch
      }
    }
    each(text, action)

    if (b) {
      r.push(b)
    }
  }
  return r
}

export const removeWhitespace = (text: string): string => {
  return reject(text, isWhitespace)
}

export const findIndexOf = (text: string, pr: IPredicateFunc<string, string>): number => {
  let foundIdx = -1
  if (pr) {
    const spr = (ch, idx, source) => {
      if (pr(ch, idx, source)) {
        foundIdx = idx
        return true
      }
      return false
    }
    some(text, spr)
  }
  return foundIdx
}

export const findLastIndexOf = (text: string, pr: IPredicateFunc<string, string>): number => {
  let foundIdx = -1
  if (pr) {
    const spr = (ch, idx, source) => {
      if (pr(ch, idx, source)) {
        foundIdx = idx
        return true
      }
      return false
    }
    someRtl(text, spr)
  }
  return foundIdx
}

export const leftTrim = (text: string, pr: IPredicateFunc<string, string> = isWhitespace): string => {
  if (text) {
    const idx = findIndexOf(text, not(pr))
    return idx >= 0 ? text.substring(idx) : empty
  }
  return text
}

export const rightTrim = (text: string, pr: IPredicateFunc<string, string> = isWhitespace): string => {
  if (text) {
    const idx = findLastIndexOf(text, not(pr))
    return idx >= 0 ? text.substring(0, idx + 1) : empty
  }
  return text
}

export const trim = (text: string, pr: IPredicateFunc<string, string> = isWhitespace): string => {
  return rightTrim(leftTrim(text, pr), pr)
}

export const isBlank = (text: string): boolean => {
  return every(text, isWhitespace)
}

export const isNotBlank = (text: string): boolean => {
  return !isBlank(text)
}

export const startsWithIgnoreCase = (text: string, match: string): boolean => {
  return isSane(text) && isSane(match) ? startsWith(text.toLowerCase(), match.toLowerCase()) : false
}

export const endsWithIgnoreCase = (text: string, match: string): boolean => {
  return isSane(text) && isSane(match) ? endsWith(text.toLowerCase(), match.toLowerCase()) : false
}

export const containsIgnoreCase = (text: string, match: string): boolean => {
  return isSane(text) && isSane(match) ? contains(text.toLowerCase(), match.toLowerCase()) : false
}

export const equalsIgnoreCase = (l: string, r: string): boolean => {
  return l === r || (l !== undefined && r !== undefined ? l.toLowerCase() === r.toLowerCase() : false)
}

export const padLeft = (s: string, length: number, padChar = " "): string => {
  let r = s || ""
  while (r.length < length) {
    r = padChar + r
  }
  return r
}

export const stripLeft = (s: string, stripChar: string): string => {
  if (s) {
    const idx = findIndexOf(s, (ch) => {
      return ch !== stripChar
    })
    if (idx > 0) {
      return s.substring(idx)
    }
  }
  return s
}

export const padRight = (s: string, length: number, padChar = " "): string => {
  let r = s || ""
  while (r.length < length) {
    r = r + padChar
  }
  return r
}

export const stripRight = (s: string, stripChar: string): string => {
  if (s) {
    const idx = findLastIndexOf(s, (ch) => {
      return ch !== stripChar
    })
    if (idx < s.length - 1) {
      return s.substring(0, idx + 1)
    }
  }
  return s
}

export const joinStrings = <T = any>(items: T[], textMap: IMapFunc<T, String>, separator?: string): string => {
  const elems: string[] = []
  if (items && items.length > 0) {
    let it
    items.forEach((item, idx) => {
      it = textMap(item, idx)
      if (isNotBlank(it)) {
        elems.push(it)
      }
    })
  }
  return elems.length > 0 ? elems.join(separator) : ""
}

export const capitalizeFirstLetter = (value: string): string => {
  return isSane(value) && value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

export const wordsToCamelCase = (text: string): string => {
  if (text) {
    let items = split(text, isWhitespace).filter((w) => isNotBlank(w))
    if (items.length > 0) {
      items = items.map((item, idx) => {
        return idx > 0 ? capitalizeFirstLetter(item) : item.toLowerCase()
      })
      return items.join("")
    }
  }
  return text
}

export const DefaultContainsTextOptions: IContainsTextOptions = {
  matcher: containsIgnoreCase
}

const containsTextImmediate = function(o: any, text: string, matcher: (text: string, match: string) => boolean): boolean {
  if (o) {
    if (isArray(o) || (o && isFunction(o.some))) {
      return o.some((value) => {
        return containsTextImmediate(value, text, matcher)
      })
    }

    if (isObject(o)) {
      return Object.keys(o).some((key) => {
        return containsTextImmediate(o[key], text, matcher)
      })
    }

    return matcher(String(o), text)
  }
  return false
}

export const containsText = (o: any, text: string, opts: IContainsTextOptions = DefaultContainsTextOptions) => {
  const matcher = opts.matcher ? opts.matcher : DefaultContainsTextOptions.matcher
  return containsTextImmediate(o, text, matcher)
}

export {
  each as forEach,
  eachRtl as forEachRtl,
  eachRtl as eachReverse,
  eachRtl as forEachReverse,
  someRtl as someReverse,
  everyRtl as everyReverse,
  leftTrim as trimLeft,
  rightTrim as trimRight,
  padLeft as leftPad,
  stripLeft as leftStrip,
  padRight as rightPad,
  stripRight as rightStrip,
  isWhitespace as whitespace,
  isNotWhitespace as nonWhitespace,
  isDigit as digit,
  isNotDigit as nonDigit,
  isAlpha as alpha,
  isNotAlpha as nonAlpha,
  isAlphaNumeric as alphaNumeric,
  isNotAlphaNumeric as nonAlphaNumeric
}
