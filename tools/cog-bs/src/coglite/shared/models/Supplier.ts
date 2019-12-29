import { IMutableSupplier, ISupplierFunc } from "coglite/types"
import { action, computed, observable } from "mobx"

export const constant = <T = any>(value: T): ISupplierFunc<T> => {
  return () => {
    return value
  }
}

export const alwaysTrue = constant(true)
export const alwaysFalse = constant(false)
export const alwaysNull = constant(null)

export class Supplier<T = any> implements IMutableSupplier<T> {
  @observable.ref protected _value: T

  @computed
  get value() {
    return this._value
  }
  set value(value: T) {
    this.setValue(value)
  }

  @action
  setValue(value: T) {
    this._value = value
  }

  @action
  clearValue() {
    this._value = undefined
  }
}
