export interface IKeyedTextItem extends IKeyedItem {
  text: string
}

export interface IKeyedValue<K, V> {
  key: K
  value: V
}

export interface IKeyMapFunc<I = any, O = any> {
  (value: I, key: string | number): O
}

export interface IMapFunc<I = any, O = any, S = I[]> {
  (value: I, index?: number, source?: S): O
}

export interface IKeyedItem {
  key: string
  keyAliases?: string[]
  [field: string]: any
}

export interface IRefList {
  getItemByKey(key: string, defaultValue?: IRefListItem): IRefListItem
  items: IRefListItem[]
  itemsSorted: IRefListItem[]
}

export interface IRefListItem extends IKeyedTextItem {}

export interface IRefList {
  getItemByKey(key: string, defaultValue?: IRefListItem): IRefListItem
  items: IRefListItem[]
  itemsSorted: IRefListItem[]
}

export interface ITypedValue<V = any> {
  type: string
  value: V
}

export interface IOption extends IKeyedItem {
  key: string
  keyAliases?: string[]
  [field: string]: any
  text: string
  data?: any
}
