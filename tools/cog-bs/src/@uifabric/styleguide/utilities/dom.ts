import { IRectangle } from './types';

/**
 * Determines whether or not a parent element contains a given child element.
 * If `allowVirtualParents` is true, this method may return `true` if the child
 * has the parent in its virtual element hierarchy.
 *
 * @public
 */
export function elementContains(parent: HTMLElement | null, child: HTMLElement | null, allowVirtualParents: boolean = true): boolean {
  let isContained = false;
  if (parent && child) {
    if (allowVirtualParents) {
      isContained = false;
      while (child) {
        let nextParent: HTMLElement | null = getParent(child);
        if (nextParent === parent) {
          isContained = true;
          break;
        }
        child = nextParent;
      }
    } else if (parent.contains) {
      isContained = parent.contains(child);
    }
  }
  return isContained;
}

/**
 * Determines if an element, or any of its ancestors, contain the given attribute
 * @param element - element to start searching at
 * @param attribute - the attribute to search for
 * @returns the value of the first instance found
 */
export function elementContainsAttribute(element: HTMLElement, attribute: string): string | null {
  let elementMatch = findElementRecursive(element, (testElement: HTMLElement) => testElement.hasAttribute(attribute));
  return elementMatch && elementMatch.getAttribute(attribute);
}

/**
 * Finds the first parent element where the matchFunction returns true
 * @param element - element to start searching at
 * @param matchFunction - the function that determines if the element is a match
 * @returns the matched element or null no match was found
 */
export function findElementRecursive(element: HTMLElement | null, matchFunction: (element: HTMLElement) => boolean): HTMLElement | null {
  if (!element || element === document.body) {
    return null;
  }
  return matchFunction(element) ? element : findElementRecursive(getParent(element), matchFunction);
}

/**
 * Gets the elements which are child elements of the given element.
 * If `allowVirtualChildren` is `true`, this method enumerates virtual child elements
 * after the original children.
 * @param parent - The element to get the children of.
 * @param allowVirtualChildren - true if the method should enumerate virtual child elements.
 */
export function getChildren(parent: HTMLElement, allowVirtualChildren: boolean = true): HTMLElement[] {
  const children: HTMLElement[] = [];
  if (parent) {
    for (let i = 0; i < parent.children.length; i++) {
      children.push(parent.children.item(i) as HTMLElement);
    }
    if (allowVirtualChildren && isVirtualElement(parent)) {
      children.push(...parent._virtual.children);
    }
  }
  return children;
}

/**
 * Helper to get the document object. Note that in popup window cases, document
 * might be the wrong document, which is why we look at ownerDocument for the
 * truth. Also note that the SSR flag is used to test ssr scenarios even if
 * document is defined (from JSDOM for example.)
 *
 * @public
 */
export function getDocument(rootElement?: HTMLElement | null): Document | undefined {
  if (_isSSR || typeof document === 'undefined') {
    return undefined;
  } else {
    return rootElement && rootElement.ownerDocument ? rootElement.ownerDocument : document;
  }
}

/**
 * Gets the element which is the parent of a given element.
 * If `allowVirtuaParents` is `true`, this method prefers the virtual parent over
 * real DOM parent when present.
 *
 * @public
 */
export function getParent(child: HTMLElement, allowVirtualParents: boolean = true): HTMLElement | null {
  return child && ((allowVirtualParents && getVirtualParent(child)) || (child.parentNode && (child.parentNode as HTMLElement)));
}

/**
 * Helper to get bounding client rect. Passing in window will get the window size.
 *
 * @public
 */
export function getRect(element: HTMLElement | Window | null): IRectangle | undefined {
  let rect: IRectangle | undefined;
  if (element) {
    if (element === window) {
      rect = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        right: window.innerWidth,
        bottom: window.innerHeight
      };
    } else if ((element as HTMLElement).getBoundingClientRect) {
      rect = (element as HTMLElement).getBoundingClientRect();
    }
  }
  return rect;
}

/**
 * Gets the virtual parent given the child element, if it exists.
 *
 * @public
 */
export function getVirtualParent(child: HTMLElement): HTMLElement | undefined {
  let parent: HTMLElement | undefined;
  if (child && isVirtualElement(child)) {
    parent = child._virtual.parent;
  }
  return parent;
}


let _window: Window | undefined = undefined;

// Note: Accessing "window" in IE11 is somewhat expensive, and calling "typeof window"
// hits a memory leak, whereas aliasing it and calling "typeof _window" does not.
// Caching the window value at the file scope lets us minimize the impact.
try {
  _window = window;
} catch (e) {
  /* no-op */
}

/**
 * Helper to get the window object. The helper will make sure to use a cached variable
 * of "window", to avoid overhead and memory leaks in IE11. Note that in popup scenarios the
 * window object won't match the "global" window object, and for these scenarios, you should
 * pass in an element hosted within the popup.
 *
 * @public
 */
export function getWindow(rootElement?: Element | null): Window | undefined {
  if (_isSSR || typeof _window === 'undefined') {
    return undefined;
  } else {
    return rootElement && rootElement.ownerDocument && rootElement.ownerDocument.defaultView
      ? rootElement.ownerDocument.defaultView
      : _window;
  }
}


/**
 * Determines whether or not an element has the virtual hierarchy extension.
 *
 * @public
 */
export function isVirtualElement(element: HTMLElement | IVirtualElement): element is IVirtualElement {
  return element && !!(element as IVirtualElement)._virtual;
}

/**
 * Attached interface for elements which support virtual references.
 * Used internally by the virtual hierarchy methods.
 */
export interface IVirtualElement extends HTMLElement {
  _virtual: {
    parent?: IVirtualElement;
    children: IVirtualElement[];
  };
}

export function on(element: Element | Window, eventName: string, callback: (ev: Event) => void, options?: boolean): () => void {
  element.addEventListener(eventName, callback, options);

  return () => element.removeEventListener(eventName, callback, options);
}


/**
 * Determine whether a target is within a portal from perspective of root or optional parent.
 * This function only works against portal components that use the setPortalAttribute function.
 * If both parent and child are within the same portal this function will return false.
 * @param target - Element to query portal containment status of.
 * @param parent - Optional parent perspective. Search for containing portal stops at parent (or root if parent is undefined or invalid.)
 */
export function portalContainsElement(target: HTMLElement, parent?: HTMLElement): boolean {
  const elementMatch = findElementRecursive(
    target,
    (testElement: HTMLElement) => parent === testElement || testElement.hasAttribute(DATA_PORTAL_ATTRIBUTE)
  );
  return elementMatch !== null && elementMatch.hasAttribute(DATA_PORTAL_ATTRIBUTE);
}

/** Raises a click event. */
export function raiseClick(target: Element): void {
  const event = new Event('MouseEvents');

  event.initEvent('click', true, true);
  target.dispatchEvent(event);
}

export const DATA_PORTAL_ATTRIBUTE = 'data-portal-element';

/**
 * Identify element as a portal by setting an attribute.
 * @param element - Element to mark as a portal.
 */
export function setPortalAttribute(element: HTMLElement): void {
  element.setAttribute(DATA_PORTAL_ATTRIBUTE, 'true');
}

export let _isSSR = false;

/**
 * Helper to set ssr mode to simulate no window object returned from getWindow helper.
 *
 * @public
 */
export function setSSR(isEnabled: boolean): void {
  _isSSR = isEnabled;
}

/**
 * Sets the virtual parent of an element.
 * Pass `undefined` as the `parent` to clear the virtual parent.
 *
 * @public
 */
export function setVirtualParent(child: HTMLElement, parent: HTMLElement): void {
  let virtualChild = child as IVirtualElement;
  let virtualParent = parent as IVirtualElement;
  if (!virtualChild._virtual) {
    virtualChild._virtual = {
      children: []
    };
  }
  let oldParent = virtualChild._virtual.parent;
  if (oldParent && oldParent !== parent) {
    // Remove the child from its old parent.
    let index = oldParent._virtual.children.indexOf(virtualChild);
    if (index > -1) {
      oldParent._virtual.children.splice(index, 1);
    }
  }
  virtualChild._virtual.parent = virtualParent || undefined;
  if (virtualParent) {
    if (!virtualParent._virtual) {
      virtualParent._virtual = {
        children: []
      };
    }
    virtualParent._virtual.children.push(virtualChild);
  }
}
