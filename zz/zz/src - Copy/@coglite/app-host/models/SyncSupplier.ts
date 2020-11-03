import { action, computed, observable } from "mobx"
import { ISync, Sync, toPromise } from "./Sync"

export type ISyncSupplier<T> = {
  sync: ISync
  load(): Promise<void>
  refresh(): Promise<void>
  value: T
  setValue(value: T): Promise<any> | void
  clearValue(): void
}

class SyncSupplier<T = any> implements ISyncSupplier<T> {
  @observable sync = new Sync()
  @observable.ref protected _ref: T
  @observable protected _value: T
  loader: () => Promise<T>
  defaultValue: T
  defaultSupplier: () => T

  protected _loadImpl(): Promise<T> {
    if (this.loader) {
      return this.loader()
    }
    return Promise.reject({ code: "NOT_IMPLEMENTED", message: "_loadImpl() not implemented" })
  }

  @computed
  get ref() {
    return this._ref
  }

  @computed
  get value() {
    if (!this._value) {
      if (this.defaultValue) {
        return this.defaultValue
      }
      if (this.defaultSupplier) {
        return this.defaultSupplier()
      }
    }
    return this._value
  }
  set value(value: T) {
    this.setValue(value)
  }

  @action
  setValue(value: T) {
    this._ref = value
    this._value = value
  }

  @action
  clearValue() {
    this._value = undefined
  }

  @action
  protected _loadDone(data: T) {
    this.setValue(data)
  }

  @action
  protected _onLoadDone = (data: T) => {
    this._loadDone(data)
    this.sync.syncEnd()
    return data
  }

  @action
  protected _loadError(error: any) {
    this.clearValue()
  }

  @action
  protected _onLoadError = (error: any) => {
    this._loadError(error)
    this.sync.syncError(error)
  }

  @action
  refresh(): Promise<any> {
    if (this.sync.syncing) {
      return toPromise(this.sync)
    }
    this.sync.syncStart()
    return this._loadImpl()
      .then(this._onLoadDone)
      .catch(this._onLoadError)
  }

  @action
  load(): Promise<any> {
    if (this.sync.syncing) {
      return toPromise(this.sync)
    }
    if (!this.sync.hasSynced || this.sync.error) {
      return this.refresh()
    }
    return Promise.resolve(this.value)
  }
}

export { SyncSupplier }
