import { observable, action, computed } from "mobx"

export type IReadOnlySupplier<T> = {
  readonly value: T
}

export type ISupplier<T> = {
  value: T
  setValue(value: T): Promise<any> | void
  clearValue(): void
}

class Supplier<T = any> implements ISupplier<T> {
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

export { Supplier }
