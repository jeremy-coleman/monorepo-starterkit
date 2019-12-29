import { IConsumerFunc, ISupplierFunc } from "coglite/types"
import { isFunction, joinStrings } from "coglite/shared/util"

export interface IBoundProps<T = any, V = any> {
  binding?: {
    target: T;
    key?: string;
    getter?: string | {(): V}
    setter?: string | {(value: V, index?: number, source?: any): void}
  }
}

export interface IError {
  key?: string;
  keyTitle?: string;
  prop?: string;
  propTitle?: string;
  code?: string;
  message: string;
  [key: string]: any;
}


export const setBoundValue = <V = any>(props: IBoundProps<any, V>, value: V) => {
  const binding = props.binding;
  if (binding) {
    if (binding.setter) {
      if (isFunction(binding.setter)) {
        (binding.setter as IConsumerFunc<V>)(value);
      } else {
        const s = binding.target[binding.setter as string];
        s.call(binding.target, value);
      }
    } else {
      binding.target[binding.key] = value;
    }
  }
};

export const getBoundValue = <V = any>(props: IBoundProps<any, V>): V => {
  const binding = props.binding;
  if (binding) {
    if (binding.getter) {
      if (isFunction(binding.getter)) {
        return (binding.getter as ISupplierFunc<V>)();
      }
      const s = binding.target[binding.getter as string];
      return s.call(binding.target);
    }
    return binding.target[binding.key];
  }
};

export const getErrorMessage = <V = any>(props: IBoundProps<any, V>, errorMessages: IError[]): string => {
  const binding = props.binding;
  if (binding && binding.key) {
    return getKeyErrorMessage(binding.key, errorMessages);
  }
};



export const getKeyErrors = (key: string, errors: IError[]): IError[] => {
  return errors ? errors.filter((e) => e.key === key || e.prop === key) : [];
};

export const getKeyErrorMessage = (key: string, errors: IError[]): string => {
  const es = getKeyErrors(key, errors);
  return es.length > 0 ? joinStrings(es, (e) => e.message) : "";
};
