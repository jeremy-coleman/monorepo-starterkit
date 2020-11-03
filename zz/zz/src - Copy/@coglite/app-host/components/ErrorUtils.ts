export type IError = {
  key?: string
  keyTitle?: string
  prop?: string
  propTitle?: string
  code?: string
  message: string
  [key: string]: any
}

export type IValidatable = {
  validate?(errorHandler: (error: IError) => void): void
}

export const getKeyErrors = (key: string, errors: IError[]): IError[] => {
  return errors ? errors.filter((e) => e.key === key || e.prop === key) : []
}

export const joinErrors = <T = any>(items: T[], textMap) => {
  const elems: string[] = []
  if (items && items.length > 0) {
    let it
    items.forEach((item, idx) => {
      it = textMap(item, idx)
      if (it) {
        elems.push(it)
      }
    })
  }
  return elems.length > 0 ? elems.join() : ""
}

export const getKeyErrorMessage = (key: string, errors: IError[]): string => {
  const es = getKeyErrors(key, errors)
  return es.length > 0 ? joinErrors(es, (e) => e.message) : ""
}
