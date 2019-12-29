export interface ISupplierFunc<T> {
  (): T
}

export interface ISupplier<T> {
  readonly value: T
}

export interface ISync<I = any> {
  id?: I
  type?: any
  startDate: Date
  endDate: Date
  error: any
  syncing: boolean
  hasSynced: boolean
}

export interface ISyncHandle<T> extends IHandle<T> {
  sync: ISync
  load(): Promise<void>
  refresh(): Promise<void>
}

enum SyncType {
  create,
  read,
  update,
  delete
}

export interface ISyncSupplier<T> extends IMutableSupplier<T> {
  sync: ISync
  load(): Promise<void>
  refresh(): Promise<void>
}

export interface ISyncStartOptions {
  id?: any
  type?: any
}

export interface ISyncModel extends ISync {
  hasSynced: boolean
  syncStart(opts?: ISyncStartOptions): void
  syncEnd(): void
  syncError(error: any): void
  clear(): void
}

export interface ISyncHandleModel<T = any> extends ISyncHandle<T>, IHandleModel<T> {
  refresh(): Promise<any>
  load(): Promise<any>
}

export interface ISyncOptions<I = any> {
  id?: I
  type?: any
}

export interface IMutableSync<I = any> extends ISync<I> {
  syncStart(opts?: ISyncOptions<I>): void
  syncEnd(): void
  syncError(error: any): void
  clear(): void
}

export interface IMutableSupplier<T> extends ISupplier<T> {
  value: T
  setValue(value: T): Promise<any> | void
  clearValue(): void
}

export interface IHandle<T> {
  value?: T
  ref?: T
}

export interface IHandleModel<T> extends IHandle<T> {
  setValue(value: T): Promise<any> | void
  clearValue(): void
  setRef(value: T): Promise<any> | void
  clearRef(): void
}

export interface IFieldTransformer<T = any> {
  (item: T, field: string): any
}

export interface IEvent {
  type: string
  [key: string]: any
}

export interface IEventListener {
  handleEvent(event: IEvent): void
}

export interface IEventListenerFunc {
  (event: IEvent): void
}

export interface IEventTarget {
  addEventListener(type: string, handler: IEventListener | IEventListenerFunc): void
  removeEventListener(type: string, handler: IEventListener | IEventListenerFunc): void
}

export interface IEventEmitter extends IEventTarget {
  emit(event: IEvent): void
}

export interface IConsumerFunc<T = any, S = T[]> {
  (value: T, index?: number, source?: S): void
}

export interface IPredicateFunc<T = any, S = T[]> {
  (value: T, index?: number, source?: S): boolean
}

export interface IBinding<T = any, V = any> {
  target: T
  key?: string
  getter?: string | ISupplierFunc<V>
  setter?: string | IConsumerFunc<V>
}

export interface IBoundProps<T = any, V = any> {
  binding?: IBinding<T, V>
}

export interface IFieldTransformerMap<T = any> {
  [key: string]: IFieldTransformer<T>
}

export type ItemTransformer = (item: any) => string[]

export interface ISyncOptions<I = any> {
  id?: I
  type?: any
}

export interface IMutableSync<I = any> extends ISync<I> {
  syncStart(opts?: ISyncOptions<I>): void
  syncEnd(): void
  syncError(error: any): void
  clear(): void
}
