import { IHandle, IMutableSupplier, ISupplierFunc } from "coglite/types"
import { observable } from "mobx"

export interface IContextOptions<T> {
  id?: string
  value?: T
  factory?: ISupplierFunc<T>
}

class CtxValue {
  constructor(data) {
    Object.assign(this, data)
  }
}

class SingletonScopeValue {
  constructor(scope, value) {
    if (scope[value]) {
      return scope[value]
    } else scope[value] = observable.box(scope[value])
  }
}

export class Context<T> implements IHandle<T>, IMutableSupplier<T> {
  private _id: string
  private _origValue: T
  private _value: T
  private _factory: ISupplierFunc<T>
  constructor(opts?: IContextOptions<T>) {
    this._id = opts ? opts.id : undefined
    this._origValue = opts ? opts.value : undefined
    this._value = opts ? opts.value : undefined
    this._factory = opts ? opts.factory : undefined
  }
  get id() {
    return this._id
  }
  get value(): T {
    if (!this._value) {
      if (!this._origValue && this._factory) {
        this._origValue = this._factory()
      }
      this._value = this._origValue
    }
    return this._value
  }
  set value(value: T) {
    this.setValue(value)
  }
  setValue(value: T) {
    this._value = value
  }
  clearValue() {
    this._value = undefined
  }
  get factory(): ISupplierFunc<T> {
    return this._factory
  }
  set factory(value) {
    this.setFactory(value)
  }
  setFactory(factory: ISupplierFunc<T>) {
    if (factory !== this._factory) {
      this._factory = factory
      if (this._factory) {
        this.clearValue()
      }
    }
  }
  get ref() {
    return this.value
  }
  set ref(value: T) {
    this.value = value
  }
}

export { Context as default }
