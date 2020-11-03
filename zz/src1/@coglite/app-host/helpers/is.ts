export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

export function isBase64(value: any): value is string {
  const base64: RegExp = new RegExp(
    /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/
  )
  return isString(value) && base64.test(value)
}

export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean"
}

export function isDate(value: any): value is Date {
  return Object.prototype.toString.call(value) === "[object Date]"
}

export function isDateValid(value: any): value is Date {
  return isDate(value) && !isNaN(value.getTime())
}

export function isDefined(value: any): boolean {
  return typeof value !== "undefined"
}

export function isError(value: any): value is Error {
  return Object.prototype.toString.call(value) === "[object Error]" || value instanceof Error
}

export function isFunction(value: any): value is Function {
  return typeof value === "function"
}

export function isGuid(value: any): value is string {
  const guid: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return isString(value) && guid.test(value)
}

export function isInfinity(value: any): value is number {
  return value === Infinity || value === -Infinity
}

export function isNull(value: any): value is null {
  return value === null
}

export function isUndefined(value: any): value is undefined {
  return typeof value === "undefined"
}

export function isNullOrUndefined(value: any): value is undefined {
  return typeof value === "undefined" || value === null
}

export function isNil(value: any): value is undefined {
  return typeof value === "undefined" || value === null
}

export function isNumber(value: any): value is number {
  return typeof value === "number"
}

export function isObject(value: any): value is object {
  return typeof value === "object"
}

export function isPlainObject(value: any): value is object {
  return isObject(value) && Object.prototype.toString.call(value) === "[object Object]"
}

export function isRegExp(value: any): value is RegExp {
  return Object.prototype.toString.call(value) === "[object RegExp]"
}

export function isString(value: any): value is string {
  return typeof value === "string"
}

export function isSymbol(value: any): value is symbol {
  return typeof value === "symbol"
}

export function isES6Map(v): v is Map<any, any> {
  return v instanceof Map
}

/** null|undefined|number|string|boolean */
export function isPrimitive(x) {
  return Object(x) !== x
}

// taken from https://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
export function isNode(o) {
  return typeof Node === "object"
    ? o instanceof Node
    : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
}

export function isElement(o) {
  return typeof HTMLElement === "object"
    ? o instanceof HTMLElement // DOM2
    : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
}

export type TTypeChecker<T> = (o: any) => o is T

export function makeTypeGuard<T>(
  type: { new (): T },
  tester: (val: any) => boolean
): TTypeChecker<T> {
  return tester as TTypeChecker<T>
}

export function isReactClass(Component: any): Component is React.ComponentClass<any> {
  return (
    typeof Component !== "undefined" &&
    typeof Component.prototype !== "undefined" &&
    typeof Component.prototype.constructor !== "undefined" &&
    typeof Component.prototype.render !== "undefined"
  )
}

export function isStream(s) {
  return s && typeof s.pipe === "function"
}

export const LangUtils = {
  isArray,
  isElement,
  isObject,
  isPlainObject,
  isString,
  isNumber,
  isDate,
  isBoolean,
  isDefined,
  isUndefined
}
