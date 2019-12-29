
export class EventEmitter {
  private _listeners: any

  private _getTypeListeners(type: string) {
    if (!this._listeners) {
      this._listeners = {}
    }
    let tl = this._listeners[type]
    if (!tl) {
      tl = []
      this._listeners[type] = tl
    }
    return tl
  }

  protected _hasTypeListener(type: string) {
    return this._listeners && this._listeners[type] ? true : false
  }

  hasListenerOfType(type: string) {
    return this._hasTypeListener(type)
  }

  containsListener(type: string, listener: any) {
    if (this._hasTypeListener(type)) {
      const tl = this._listeners[type]
      return tl.some((reg) => {
        return reg.o === listener
      })
    }
    return false
  }

  addEventListener(type, listener) {
    if (type && listener && !this.containsListener(type, listener)) {
      const tl = this._getTypeListeners(type)
      if (typeof listener === "function") {
        tl.push({ o: listener, f: listener })
      } else {
        tl.push({
          o: listener,
          f: (event) => {
            listener.handleEvent(event)
          }
        })
      }
    }
  }

  on(type, listener) {
    this.addEventListener(type, listener)
  }

  removeEventListener(type, listener) {
    if (this._hasTypeListener(type)) {
      const tl = this._listeners[type]
      const idx = tl.findIndex((reg: any, idx: number) => {
        return reg.o === listener
      })
      if (idx >= 0) {
        tl.splice(idx, 1)
        if (tl.length === 0) {
          delete this._listeners[type]
        }
      }
    }
  }

  off(type, listener) {
    this.removeEventListener(type, listener)
  }

  emit(event: Event): void {
    if (event && event.type && this._hasTypeListener(event.type)) {
      const tl = this._listeners[event.type]
      tl.forEach((reg: any) => {
        reg.f(event)
      })
    }
  }
}

export class WindowEventEmitter {
  private _window: Window

  constructor(window: Window) {
    this._window = window
  }
  addEventListener(type, handler): void {
    this._window.addEventListener(type, handler)
  }

  removeEventListener(type, handler): void {
    this._window.addEventListener(type, handler)
  }

  emit(event): void {
    this._window.dispatchEvent(event as Event)
  }
}
