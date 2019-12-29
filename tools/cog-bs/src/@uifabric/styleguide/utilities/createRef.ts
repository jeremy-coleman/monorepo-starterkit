import { RefObject } from './types';


/**
 * @deprecated Use React.createRef.
 * May be removed in 6 months (Jan '19).
 */
export function createRef<T>(): RefObject<T> {
  const refObject = ((element: T | null): void => {
    refObject.current = element;
  }) as RefObject<T>;

  // This getter is here to support the deprecated value prop on the refObject.
  Object.defineProperty(refObject, 'value', {
    get(): T | null {
      return refObject.current;
    }
  });

  refObject.current = null;

  return refObject;
}
