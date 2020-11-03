import { action, computed, observable, makeObservable } from "mobx";
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
  sync = new Sync();
  protected _ref: T;
  protected _value: T;
  loader: () => Promise<T>
  defaultValue: T
  defaultSupplier: () => T

  constructor() {
    makeObservable<SyncSupplier, "_ref" | "_value" | "_loadDone" | "_onLoadDone" | "_loadError" | "_onLoadError">(this, {
      sync: observable,
      _ref: observable.ref,
      _value: observable,
      ref: computed,
      value: computed,
      setValue: action,
      clearValue: action,
      _loadDone: action,
      _onLoadDone: action,
      _loadError: action,
      _onLoadError: action,
      refresh: action,
      load: action
    });
  }

  protected _loadImpl(): Promise<T> {
    if (this.loader) {
      return this.loader()
    }
    return Promise.reject({ code: "NOT_IMPLEMENTED", message: "_loadImpl() not implemented" })
  }

  get ref() {
    return this._ref
  }

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

  setValue(value: T) {
    this._ref = value
    this._value = value
  }

  clearValue() {
    this._value = undefined
  }

  protected _loadDone(data: T) {
    this.setValue(data)
  }

  protected _onLoadDone = (data: T) => {
    this._loadDone(data)
    this.sync.syncEnd()
    return data
  };

  protected _loadError(error: any) {
    this.clearValue()
  }

  protected _onLoadError = (error: any) => {
    this._loadError(error)
    this.sync.syncError(error)
  };

  refresh(): Promise<any> {
    if (this.sync.syncing) {
      return toPromise(this.sync)
    }
    this.sync.syncStart()
    return this._loadImpl()
      .then(this._onLoadDone)
      .catch(this._onLoadError)
  }

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
