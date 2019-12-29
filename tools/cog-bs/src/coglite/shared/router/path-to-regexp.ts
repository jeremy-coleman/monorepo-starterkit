export interface RegExpOptions {
  sensitive?: boolean
  strict?: boolean
  end?: boolean
  start?: boolean
  delimiter?: string
  delimiters?: string | string[]
  endsWith?: string | string[]
}

export interface ParseOptions {
  delimiter?: string
  delimiters?: string | string[]
}

export interface Key {
  name: string | number
  prefix: string
  delimiter: string
  optional: boolean
  repeat: boolean
  pattern: string
  partial: boolean
}

export interface PathFunctionOptions {
  encode?: (value: string, token: Key) => string
}

export type Token = string | Key
export type Path = string | RegExp | Array<string | RegExp>
export type PathFunction = (data?: Object, options?: PathFunctionOptions) => string

const DEFAULT_DELIMITER = "/"
const DEFAULT_DELIMITERS = "./"

const PATH_REGEXP = new RegExp(
  ["(\\\\.)", "(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?"].join("|"),
  "g"
)

export function parse(pathString: string, options?: ParseOptions): Token[] {
  const tokens = []
  let key = 0
  let index = 0
  let path = ""
  const defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER
  const delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS
  let pathEscaped = false
  let res

  while ((res = PATH_REGEXP.exec(pathString)) !== null) {
    const m = res[0]
    const escaped = res[1]
    const offset = res.index
    path += pathString.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      pathEscaped = true
      continue
    }

    let prev = ""
    const next = pathString[index]
    const name = res[2]
    const capture = res[3]
    const group = res[4]
    const modifier = res[5]

    if (!pathEscaped && path.length) {
      const k = path.length - 1

      if (delimiters.indexOf(path[k]) > -1) {
        prev = path[k]
        path = path.slice(0, k)
      }
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ""
      pathEscaped = false
    }

    const partial = prev !== "" && next !== undefined && next !== prev
    const repeat = modifier === "+" || modifier === "*"
    const optional = modifier === "?" || modifier === "*"
    const delimiter = prev || defaultDelimiter
    const pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prev,
      delimiter,
      optional,
      repeat,
      partial,
      pattern: pattern ? escapeGroup(pattern) : "[^" + escapeString(delimiter) + "]+?"
    })
  }

  // Push any remaining characters.
  if (path || index < pathString.length) {
    tokens.push(path + pathString.substr(index))
  }

  return tokens
}

export function compile(pathString: string, options?: ParseOptions): PathFunction {
  return tokensToFunction(parse(pathString, options))
}

export function tokensToFunction(tokens: Token[]): PathFunction {
  // Compile all the tokens into regexps.
  const matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === "object") {
      matches[i] = new RegExp("^(?:" + (tokens as Key[])[i].pattern + ")$")
    }
  }

  return function(data, options) {
    let path = ""
    const encode = (options && options.encode) || encodeURIComponent

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (typeof token === "string") {
        path += token
        continue
      }

      const value = data ? data[token.name] : undefined
      let segment

      if (Array.isArray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
        }

        if (value.length === 0) {
          if (token.optional) continue

          throw new TypeError('Expected "' + token.name + '" to not be empty')
        }

        for (let j = 0; j < value.length; j++) {
          segment = encode(value[j], token)

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        segment = encode(String(value), token)

        if (!matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
        }

        path += token.prefix + segment
        continue
      }

      if (token.optional) {
        // Prepend partial segment prefixes.
        if (token.partial) path += token.prefix

        continue
      }

      throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? "an array" : "a string"))
    }

    return path
  }
}

function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1")
}

function escapeGroup(group) {
  return group.replace(/([=!:$/()])/g, "\\$1")
}

function flags(options) {
  return options && options.sensitive ? "" : "i"
}

export function regexpToRegexp(path, keys) {
  if (!keys) return path

  // Use a negative lookahead to match only capturing groups.
  const groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (let i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        pattern: null
      })
    }
  }

  return path
}

export function arrayToRegexp(path, keys, options) {
  const parts = []

  for (let i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  return new RegExp("(?:" + parts.join("|") + ")", flags(options))
}

export function stringToRegexp(path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

export function tokensToRegExp(tokens: Token[], keys?: Key[], options?: RegExpOptions): RegExp {
  options = options || {}

  const strict = options.strict
  const start = options.start !== false
  const end = options.end !== false
  const delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER)
  const delimiters = options.delimiters || DEFAULT_DELIMITERS
  const endsWith = []
    .concat(options.endsWith || [])
    .map(escapeString)
    .concat("$")
    .join("|")
  let route = start ? "^" : ""
  let isEndDelimited = tokens.length === 0

  // Iterate over the tokens and create our regexp string.
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (typeof token === "string") {
      route += escapeString(token)
      isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1
    } else {
      const capture = token.repeat
        ? "(?:" + token.pattern + ")(?:" + escapeString(token.delimiter) + "(?:" + token.pattern + "))*"
        : token.pattern

      if (keys) keys.push(token)

      if (token.optional) {
        if (token.partial) {
          route += escapeString(token.prefix) + "(" + capture + ")?"
        } else {
          route += "(?:" + escapeString(token.prefix) + "(" + capture + "))?"
        }
      } else {
        route += escapeString(token.prefix) + "(" + capture + ")"
      }
    }
  }

  if (end) {
    if (!strict) route += "(?:" + delimiter + ")?"

    route += endsWith === "$" ? "$" : "(?=" + endsWith + ")"
  } else {
    if (!strict) route += "(?:" + delimiter + "(?=" + endsWith + "))?"
    if (!isEndDelimited) route += "(?=" + delimiter + "|" + endsWith + ")"
  }

  return new RegExp(route, flags(options))
}

export function pathToRegexp(path: Path, keys?: Key[], options?: RegExpOptions & ParseOptions): RegExp {
  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys)
  }

  if (Array.isArray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

export default pathToRegexp
