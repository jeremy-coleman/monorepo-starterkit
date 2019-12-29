import { action, computed, observable } from "mobx"
import { IWindow, IWindowSettings } from "../types"

class WindowSettings implements IWindowSettings {
  @observable protected _window: IWindow
  @observable protected _borderWidth: number
  @observable protected _headerHeight: number
  @observable protected _data: any = {}
  @observable protected _resizable: boolean
  @observable protected _draggable: boolean
  @observable protected _animatePosition: boolean
  @observable protected _role: string

  constructor(window?: IWindow) {
    this._window = window
  }

  @computed
  get data() {
    return Object.assign({}, this._data)
  }
  set data(value) {
    this.setData(value)
  }
  @action
  setData(data: any) {
    this._data = Object.assign({}, this._data, data)
  }

  @computed
  get borderWidth() {
    let borderWidth = this._borderWidth
    if (borderWidth === undefined) {
      const mgr = this._window ? this._window.manager : undefined
      if (mgr) {
        borderWidth = mgr.windowSettings.borderWidth
      }
    }
    return borderWidth !== undefined ? borderWidth : 0
  }
  set borderWidth(value) {
    this.setBorderWidth(value)
  }
  @action
  setBorderWidth(borderWidth: number) {
    if (borderWidth >= 0) {
      this._borderWidth = borderWidth
    }
  }

  @computed
  get headerHeight() {
    let headerHeight = this._headerHeight
    if (headerHeight === undefined) {
      const mgr = this._window ? this._window.manager : undefined
      if (mgr) {
        headerHeight = mgr.windowSettings.headerHeight
      }
    }
    return headerHeight !== undefined ? headerHeight : 0
  }
  set headerHeight(value) {
    this.setHeaderHeight(value)
  }
  @action
  setHeaderHeight(headerHeight: number) {
    if (headerHeight >= 0) {
      this._headerHeight = headerHeight
    }
  }

  @computed
  get resizable() {
    let resizable = this._resizable
    if (resizable === undefined) {
      const mgr = this._window ? this._window.manager : undefined
      if (mgr) {
        resizable = mgr.windowSettings.resizable
      }
    }
    return resizable !== undefined ? resizable : false
  }
  set resizable(value) {
    this.setResizable(value)
  }

  @action
  setResizable(resizable: boolean) {
    if (resizable !== undefined) {
      this._resizable = resizable
    }
  }

  @computed
  get draggable() {
    let draggable = this._draggable
    if (draggable === undefined) {
      const mgr = this._window ? this._window.manager : undefined
      if (mgr) {
        draggable = mgr.windowSettings.draggable
      }
    }
    return draggable !== undefined ? draggable : false
  }
  set draggable(value) {
    this.setDraggable(value)
  }

  @action
  setDraggable(draggable: boolean) {
    if (draggable !== undefined) {
      this._draggable = draggable
    }
  }

  @computed
  get animatePosition() {
    let animatePosition = this._animatePosition
    if (animatePosition === undefined) {
      const mgr = this._window ? this._window.manager : undefined
      if (mgr) {
        animatePosition = mgr.windowSettings.animatePosition
      }
    }
    return animatePosition !== undefined ? animatePosition : false
  }
  set animatePosition(value) {
    this.setAnimatePosition(value)
  }
  @action
  setAnimatePosition(animatePosition: boolean) {
    this._animatePosition = animatePosition
  }

  @computed
  get role() {
    let role = this._role
    if (role === undefined) {
      const mgr = this._window ? this._window.manager : undefined
      if (mgr) {
        role = mgr.windowSettings.role
      }
    }
    return role
  }
  set role(value) {
    this.setRole(value)
  }
  @action
  setRole(role: string) {
    this._role = role
  }

  @computed
  get config() {
    return {
      borderWidth: this._borderWidth,
      headerHeight: this._headerHeight,
      resizable: this._resizable,
      draggable: this._draggable,
      animatePosition: this._animatePosition,
      data: this.data
    }
  }
  set config(value) {
    this.setConfig(value)
  }

  @action
  setConfig(config: any): void {
    this.setBorderWidth(config ? config.borderWidth : undefined)
    this.setHeaderHeight(config ? config.headerHeight : undefined)
    this.setResizable(config ? config.resizable : undefined)
    this.setDraggable(config ? config.draggable : undefined)
    this.setData(config ? config.data : undefined)
  }

  toJSON() {
    return this.config
  }
}

export { WindowSettings }
