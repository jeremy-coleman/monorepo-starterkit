export interface IError {
  key?: string
  keyTitle?: string
  prop?: string
  propTitle?: string
  code?: string
  message: string
  [key: string]: any
}

export interface IValidatable {
  validate?(errorHandler: (error: IError) => void): void
}

export interface IPreferencesModel {
  get(key: string): any
  set(key: string, value: any): void
  has(key: string): boolean
  delete(key: string): boolean
  hasPrefs(): boolean
}

export interface IViewPreferencesModel extends IPreferencesModel {
  isFieldVisible(fieldKey: string): boolean
  setFieldVisible(fieldKey: string, visible: boolean): void
}

export interface IDetailsAttributeConfig<T> {
  key: string
  name: string
  onRender?: (item: T) => void
}
