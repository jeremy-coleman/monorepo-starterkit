import { getKeyErrorMessage, IError } from "./ErrorUtils"

interface ISupplierFunc<T> {
  (): T
}

interface IConsumerFunc<T = any, S = T[]> {
  (value: T, index?: number, source?: S): void
}

export interface IBinding<T = any, V = any> {
  target: T
  key?: string
  getter?: string | { (): V }
  setter?: string | IConsumerFunc<V>
}

export interface IBoundProps<T = any, V = any> {
  binding?: IBinding<T, V>
}

export const setBoundValue = <V = any>(props: IBoundProps<any, V>, value: V) => {
  const binding = props.binding
  if (binding) {
    if (binding.setter) {
      if (typeof binding.setter === "function") {
        ;(binding.setter as IConsumerFunc<V>)(value)
      } else {
        const s = binding.target[binding.setter as string]
        s.call(binding.target, value)
      }
    } else {
      binding.target[binding.key] = value
    }
  }
}

export const getBoundValue = <V = any>(props: IBoundProps<any, V>): V => {
  const binding = props.binding
  if (binding) {
    if (binding.getter) {
      if (typeof binding.getter === "function") {
        return (binding.getter as ISupplierFunc<V>)()
      }
      const s = binding.target[binding.getter as string]
      return s.call(binding.target)
    }
    return binding.target[binding.key]
  }
}

export const getErrorMessage = <V = any>(
  props: IBoundProps<any, V>,
  errorMessages: IError[]
): string => {
  const binding = props.binding
  if (binding && binding.key) {
    return getKeyErrorMessage(binding.key, errorMessages)
  }
}

type P = IBoundProps<any, any> & JSX.IntrinsicElements["input"]

export const createOnChangeHandler = (props: P) => (...args: any) => {
  setBoundValue(props, args[1])
  if (props.onChange) {
    props.onChange(args as any)
  }
}
