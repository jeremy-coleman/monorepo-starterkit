export type IFieldTransformer<T = any> = {
  (item: T, field: string): any
}
export type IConsumerFunc<T = any, S = T[]> = {
  (value: T, index?: number, source?: S): void
}

export type IPredicateFunc<T = any, S = T[]> = {
  (value: T, index?: number, source?: S): boolean
}

export type IFieldTransformerMap<T = any> = {
  [key: string]: IFieldTransformer<T>
}

export type ItemTransformer = (item: any) => string[]

export type IKeyedTextItem = {
  text: string
} & IKeyedItem

export type IKeyedValue<K, V> = {
  key: K
  value: V
}

export type IKeyMapFunc<I = any, O = any> = {
  (value: I, key: string | number): O
}

export type IMapFunc<I = any, O = any, S = I[]> = {
  (value: I, index?: number, source?: S): O
}

export type IKeyedItem = {
  key: string
  keyAliases?: string[]
  [field: string]: any
}

export type IRefList = {
  getItemByKey(key: string, defaultValue?: IKeyedItem): IKeyedItem
  items: IKeyedItem[]
  itemsSorted: IKeyedItem[]
}

export type ITypedValue<V = any> = {
  type: string
  value: V
}

export type ISupplierFunc<T> = {
  (): T
}

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never
