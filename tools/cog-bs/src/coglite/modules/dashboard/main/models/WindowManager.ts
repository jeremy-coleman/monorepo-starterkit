import { IAppHost, IRequest, ISupplierFunc } from "coglite/types"
import { action, computed, observable } from "mobx"
import { WindowResizeType } from "../constants"
import { IComponent, IWindow, IWindowManager } from "../types"
import { Component } from "./Component"
import { Window } from "./Window"
import { WindowSettings } from "./WindowSettings"
import { isFunction } from "coglite/shared/util"

class WindowManager extends Component implements IWindowManager {
  @observable windows: IWindow[] = []
  @observable protected _windowSettings = new WindowSettings()
  @observable.ref private _resizing: IWindow
  @observable private _resizeType: WindowResizeType
  @observable.ref private _drag: IWindow
  @observable protected _activeIndex: number
  @observable protected _maximizedIndex: number

  get type() {
    return null
  }

  @computed
  get isRequiresOverflow() {
    return false
  }

  @computed
  get windowSettings() {
    return this._windowSettings
  }

  @computed
  get first() {
    return this.windowCount > 0 ? this.windows[0] : undefined
  }

  @computed
  get last() {
    return this.windowCount > 0 ? this.windows[this.windows.length - 1] : undefined
  }

  @computed
  get windowCount(): number {
    return this.windows ? this.windows.length : 0
  }

  get isWindowManager() {
    return true
  }

  @action
  add(win: IWindow, opts?: any): void {
    if (win) {
      if (win.parent !== this) {
        win.removeFromParent()
        win.parent = this
      } else {
        const itemIdx = this.windows.indexOf(win)
        this.windows.splice(itemIdx, 1)
      }
      this.windows.push(win)
      if ((opts && opts.makeActive) || this.windows.length === 1) {
        this.setActive(win)
      }
    }
  }

  @action
  addNew(opts?: any) {
    if (this.addApp) {
      let addApp = isFunction(this.addApp) ? (this.addApp as ISupplierFunc<IRequest>)() : this.addApp
      if (opts) {
        addApp = Object.assign({}, addApp, opts)
      }
      return this.open(addApp)
    }
    return Promise.resolve()
  }

  @action
  insertAt(item: IWindow, index: number) {
    if (item && index >= 0 && index < this.windows.length) {
      let refStackItem = this.windows[index]
      let insertIdx: number = -1
      if (item.parent !== this) {
        item.removeFromParent()
        item.parent = this
        insertIdx = index
      } else {
        const itemIdx = this.windows.indexOf(item)
        if (itemIdx >= 0 && itemIdx !== index) {
          this.windows.splice(itemIdx, 1)
          insertIdx = this.windows.indexOf(refStackItem)
        }
      }

      if (insertIdx >= 0) {
        this.windows.splice(insertIdx, 0, item)
      }
    } else {
      this.add(item)
    }
  }

  @action
  insertBefore(item: IWindow, refItem?: IWindow) {
    if (!refItem) {
      this.add(item)
    } else if (item) {
      this.insertAt(item, this.windows.indexOf(refItem))
    }
  }

  @action
  replace(newItem: IComponent, oldItem: IComponent): void {
    if (newItem && oldItem && oldItem.parent === this) {
      this.insertBefore(newItem as IWindow, oldItem as IWindow)
      oldItem.removeFromParent()
    }
  }

  @action
  open(request: IRequest): Promise<IWindow> {
    let win
    if (request && request.replace && request.name) {
      const db = this.dashboard
      win = db.findFirst((w) => {
        return w.type === "window" ? (w as IWindow).name === request.name : false
      })
    }
    if (!win) {
      win = new Window()
      if (request) {
        win.name = request.name
        win.setPath(request.path)
        win.setParams(request.params)
        win.setQuery(request.query)
        win.setTitle(request.title)
        win.setTransient(request.transient ? true : false)
        if (request.transient && request.opener) {
          const opener = request.opener as IAppHost
          win.icon.url = opener.icon.url
          win.icon.text = opener.icon.text
          win.icon.name = opener.icon.name
          win.icon.component = opener.icon.component
        }
      }
      this.add(win, Object.assign({}, request, { makeActive: true }))
    } else {
      win.load(request)
    }
    return Promise.resolve(win)
  }

  protected _visitChildren(callback) {
    this.windows.forEach((w) => w.visit(callback))
  }

  protected _findFirstChild(predicate) {
    let r
    this.windows.some((w) => {
      r = w.findFirst(predicate)
      return r ? true : false
    })
    return r
  }

  protected _findAllChildren(predicate): IComponent[] {
    let r = []
    let wr
    this.windows.forEach((w) => {
      wr = w.findAll(predicate)
      if (wr && wr.length > 0) {
        r = r.concat(wr)
      }
    })
    return r
  }

  @action
  remove(node: IComponent) {
    const idx = this.windows.indexOf(node as IWindow)
    if (idx >= 0) {
      const w = this.windows[idx]
      w.parent = undefined
      this.windows.splice(idx, 1)

      if (this.windows.length === 0) {
        this.removeFromParent()
      }
    }
  }

  @action
  close() {
    if (!this.closeDisabled) {
      while (this.windowCount > 0) {
        this.windows[0].close()
      }
      this.removeFromParent()
    }
  }

  protected _onDragStart(drag: IWindow) {
    // does nothing by default
  }

  protected _onDragEnd() {
    // does nothing by default
  }

  @computed
  get drag() {
    return this._drag
  }
  @action
  dragStart(drag: IWindow) {
    if (this.dashboard) {
      this.dashboard.dragStart(drag)
    }
    this._drag = drag
    this._onDragStart(drag)
  }
  @action
  dragEnd(): void {
    if (this.dashboard) {
      this.dashboard.dragEnd()
    }
    this._drag = undefined
    this._onDragEnd()
  }

  @computed
  get resizing() {
    return this._resizing
  }

  @computed
  get resizeType() {
    return this._resizeType
  }

  protected _onResizeStart(win: IWindow) {
    // does nothing by default
  }

  protected _onResizeEnd() {
    // does nothing by default
  }

  @action
  resizeStart(win: IWindow, type: WindowResizeType) {
    this._resizing = win
    this._resizeType = type
    this._onResizeStart(win)
  }

  @action
  resizeEnd() {
    this._resizing = undefined
    this._resizeType = undefined
    this._onResizeEnd()
  }

  @computed
  get activeIndex() {
    if (this._activeIndex >= 0 && this._activeIndex < this.windowCount) {
      return this._activeIndex
    }
    if (this._activeIndex >= this.windowCount && this.windowCount > 0) {
      return this.windowCount - 1
    }
    return 0
  }
  set activeIndex(value) {
    this.setActiveIndex(value)
  }

  @action
  setActiveIndex(activeIndex: number) {
    if (activeIndex !== this._activeIndex) {
      this._activeIndex = activeIndex
    }
  }

  @computed
  get active(): IWindow {
    const activeIndex = this.activeIndex
    return activeIndex >= 0 && activeIndex < this.windowCount ? this.windows[activeIndex] : undefined
  }
  set active(value: IWindow) {
    this.setActive(value)
  }

  @action
  setActive(active: IWindow) {
    this.setActiveIndex(this.windows.indexOf(active))
  }

  @computed
  get maximizedIndex() {
    return this._maximizedIndex
  }
  set maximizedIndex(value) {
    this.setMaximizedIndex(value)
  }

  @action
  setMaximizedIndex(maximizedIndex: number) {
    if (maximizedIndex !== this._maximizedIndex) {
      this._maximizedIndex = maximizedIndex
    }
  }

  @computed
  get maximized(): IWindow {
    const maximizedIndex = this.maximizedIndex
    return maximizedIndex !== undefined && maximizedIndex >= 0 && maximizedIndex < this.windows.length
      ? this.windows[maximizedIndex]
      : undefined
  }
  set maximized(value: IWindow) {
    this.setMaximized(value)
  }
  @action
  setMaximized(maximized: IWindow) {
    this.setMaximizedIndex(maximized ? this.windows.indexOf(maximized) : undefined)
    if (maximized) {
      this.setActive(maximized)
    }
  }
}

export { WindowManager }
