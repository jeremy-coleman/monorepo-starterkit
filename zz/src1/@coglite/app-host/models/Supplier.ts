import { observable, action, computed, makeObservable } from "mobx";

export type IReadOnlySupplier<T> = {
  readonly value: T
}

export type ISupplier<T> = {
  value: T
  setValue(value: T): Promise<any> | void
  clearValue(): void
}

class Supplier<T = any> implements ISupplier<T> {
  protected _value: T;

  constructor() {
    makeObservable<Supplier, "_value">(this, {
      _value: observable.ref,
      value: computed,
      setValue: action,
      clearValue: action
    });
  }

  get value() {
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
}

export { Supplier }
