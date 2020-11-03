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

/**
 * @example
 * {extname("/asdf") -> ""}
 * {extname("/asdf.js") -> ".js"}
 */
export const maybeGetFileExtension = (path: string) => {
  const lastExtIdx = path.lastIndexOf(".")
  if (lastExtIdx >= 0) {
    return path.substring(lastExtIdx)
  } else return ""
}

export function joinPaths(...parts: string[]) {
  return parts.join("/").replace(new RegExp("/" + "{1,}", "g"), "/")
}

export const isBlank = (text: string) => {
  if (text) {
    const tl = text.length
    for (let i = 0; i < tl; i++) {
      if (!isWhitespace(text.charAt(i))) {
        return false
      }
    }
  }
  return true
}

export const isNotBlank = (text: string) => {
  return !isBlank(text)
}

export const capitalizeFirstLetter = (value: string): string => {
  return value && value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

export const wordsToCamelCase = (text: string): string => {
  if (text) {
    let items = text.split(" ").filter((w) => isNotBlank(w))
    if (items.length > 0) {
      items = items.map((item, idx) => {
        return idx > 0 ? capitalizeFirstLetter(item) : item.toLowerCase()
      })
      return items.join("")
    }
  }
  return text
}
