import { IConsumerFunc, IRequest } from "coglite/types"
import { action, computed, observable } from "mobx"
import { ComponentTypes, WindowResizeType } from "../constants"
import { IWindow, IWindowConfig } from "../types"
import { IWindowManager } from "../types"
import { Component } from "./Component"
import { WindowAppHost } from "./WindowAppHost"
import { WindowSettings } from "./WindowSettings"

class Window extends Component implements IWindow {
  name: string
  onClose: IConsumerFunc<IWindow>
  @observable private _path: string
  @observable private _params: any
  @observable private _query: any
  @observable private _appHost: WindowAppHost
  @observable private _contentHidden: boolean
  @observable private _transient: boolean = false
  @observable private _settings: WindowSettings = new WindowSettings(this)
  @observable private _dragState: any = {}

  constructor() {
    super()
    this._appHost = new WindowAppHost(this)
  }

  @computed
  get settings() {
    return this._settings
  }

  @computed
  get appHost() {
    return this._appHost
  }

  @computed
  get path() {
    return this._path
  }
  set path(value) {
    this.setPath(value)
  }

  @action
  setPath(path: string) {
    this._path = path
  }

  @computed
  get params() {
    return Object.assign({}, this._params, this._query)
  }
  set params(value) {
    this.setParams(value)
  }
  @action
  setParams(params: any) {
    this._params = params
  }

  @computed
  get query() {
    return Object.assign({}, this._query)
  }
  set query(value) {
    this.setQuery(value)
  }
  @action
  setQuery(query: any) {
    this._query = query
  }

  @computed
  get icon() {
    return this._appHost.icon
  }

  @computed
  get title() {
    return this._appHost.title
  }
  set title(value) {
    this.setTitle(value)
  }
  @action
  setTitle(title: string) {
    this._appHost.setTitle(title)
  }

  @computed
  get contentHidden() {
    return this._contentHidden ? true : false
  }
  set contentHidden(value) {
    this.setContentHidden(value)
  }
  @action
  setContentHidden(contentHidden: boolean) {
    this._contentHidden = contentHidden
  }

  @action
  toggleContent() {
    this.setContentHidden(!this.contentHidden)
  }

  @computed
  get transient() {
    return this._transient
  }
  set transient(value) {
    this.setTransient(value)
  }

  @action
  setTransient(transient: boolean) {
    this._transient = transient
  }

  @computed
  get manager(): IWindowManager {
    const parent = this.parent
    return parent && parent.isWindowManager ? (parent as IWindowManager) : undefined
  }

  get type() {
    return ComponentTypes.window
  }

  @computed
  get active() {
    const manager = this.manager
    if (manager) {
      return manager.active === this
    }
    return false
  }

  @action
  activate() {
    const manager = this.manager
    if (manager) {
      manager.setActive(this)
    }
  }

  @computed
  get dragState() {
    return this._dragState
  }
  set dragState(value) {
    this.setDragState(value)
  }
  @action
  setDragState(dragState: any) {
    this._dragState = Object.assign({}, this._dragState, dragState)
  }
  @action
  clearDragState() {
    this._dragState = {}
  }

  @computed
  get dragging() {
    const mgr = this.manager
    return mgr ? mgr.drag === this : false
  }

  @action
  dragStart(dragState?: any): void {
    this.setDragState(dragState)
    const mgr = this.manager
    if (mgr) {
      mgr.dragStart(this)
    }
  }

  @action
  dragEnd(): void {
    this.clearDragState()
    const mgr = this.manager
    if (mgr) {
      mgr.dragEnd()
    }
  }

  @computed
  get resizing() {
    const mgr = this.manager
    return mgr ? mgr.resizing === this : false
  }

  @action
  resizeStart(type: WindowResizeType) {
    const mgr = this.manager
    if (mgr) {
      mgr.resizeStart(this, type)
    }
  }

  @action
  resizeEnd() {
    const mgr = this.manager
    if (mgr) {
      mgr.resizeEnd()
    }
  }

  @action
  maximize() {
    this.setMaximized(true)
  }

  @action
  restoreSize() {
    this.setMaximized(false)
  }

  @computed
  get maximized() {
    const mgr = this.manager
    return mgr ? mgr.maximized === this : false
  }
  set maximized(value) {
    this.setMaximized(value)
  }

  @action
  setMaximized(maximized: boolean) {
    const mgr = this.manager
    if (maximized) {
      mgr.setMaximized(this)
    } else if (mgr.maximized === this) {
      mgr.setMaximized(undefined)
    }
  }

  @computed
  get config(): IWindowConfig {
    // NOTE: for get config, the params are always considered transient
    return {
      type: this.type,
      path: this._path,
      query: this._query,
      closeDisabled: this._closeDisabled,
      contentHidden: this._contentHidden,
      settings: this._settings.config
    }
  }
  set config(value) {
    this.setConfig(value)
  }
  @action
  setConfig(config: IWindowConfig) {
    this.setTitle(config ? config.title : undefined)
    this.setCloseDisabled(config ? config.closeDisabled : undefined)
    this.setPath(config ? config.path : undefined)
    this.setQuery(config ? config.query : undefined)
    this.setParams(config ? config.params : undefined)
    this.setContentHidden(config ? config.contentHidden : undefined)
    this._settings.setConfig(config ? config.settings : undefined)
  }

  open(request: IRequest) {
    const manager = this.manager
    if (manager) {
      const openRequest = Object.assign({}, request, { opener: this._appHost })
      return manager.open(openRequest)
    }
    return Promise.reject({ code: "INVALID_STATE", message: "No Window Manager Set" })
  }

  @action
  load(request?: IRequest) {
    return this.appHost.load(request)
  }

  @action
  close(opts?: any) {
    this._appHost.emit({ type: "beforeunload" })
    this._appHost.emit({ type: "beforeclose" })
    if (this.onClose) {
      this.onClose(this)
    }
    this._appHost.emit({ type: "unload" })
    this._appHost.emit({ type: "close" })
    if (!opts || !opts.noRemove) {
      this.removeFromParent()
    }
  }
}

export { Window }
