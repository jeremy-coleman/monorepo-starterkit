
import { action, autorun, computed, IReactionDisposer, observable, reaction } from "mobx"
import { ComponentTypes } from "../constants"
import { IComponent, IDashboard, IDashboardList, IWindow } from "../types"
import { Component } from "./Component"
import { Sync } from "coglite/shared/models/Sync"

class Dashboard extends Component implements IDashboard {
  @observable sync = new Sync()
  @observable private _title: string
  private _setViewportDisposer: IReactionDisposer

  constructor() {
    super()
    this._setViewportDisposer = autorun(this._setComponentViewport)
  }

  private _saveDelay: number = 1000
  loader: () => Promise<any> | any
  saver: (data: any) => Promise<any> | any
  private _configSaveDisposer: IReactionDisposer

  @observable private _component: IComponent
  @observable.ref private _drag: IWindow
  @observable.ref private _blockSource: IComponent

  get type() {
    return ComponentTypes.dashboard
  }

  @computed
  get dashboardList(): IDashboardList {
    return this.parent as IDashboardList
  }

  @computed
  get component() {
    return this._component
  }
  set component(value) {
    this.setComponent(value)
  }
  @action
  setComponent(component: IComponent) {
    if (component !== this._component) {
      if (component && component.parent !== this) {
        component.removeFromParent()
      }
      this._component = component
      if (this._component) {
        this._component.parent = this
      }
      this._setComponentViewport()
    }
  }

  @computed
  get windows(): IWindow[] {
    return this.findAll((c) => c.type === ComponentTypes.window) as IWindow[]
  }

  @computed
  get drag() {
    return this._drag
  }
  @action
  dragStart(drag: IWindow) {
    this._drag = drag
  }
  @action
  dragEnd(): void {
    this._drag = undefined
  }

  @computed
  get blockSource() {
    return this._blockSource
  }
  set blockSource(value) {
    this.setBlockSource(value)
  }

  @action
  setBlockSource(blockSource: IComponent) {
    this._blockSource = blockSource
  }
  @action
  clearBlockSource() {
    this._blockSource = undefined
  }

  @computed
  get title() {
    return this._title
  }
  set title(value) {
    this.setTitle(value)
  }

  @action
  setTitle(title: string) {
    this._title = title
  }

  @computed
  get dashboard() {
    return this
  }

  @computed
  get componentConfig() {
    return this._component ? this._component.config : undefined
  }

  set componentConfig(config: any) {
    this.setComponentConfig(config)
  }

  @action
  setComponentConfig(config: any) {
    if (config) {
      const c = this.componentFactory(config.type)
      this.setComponent(c)
      c.setConfig(config)
    } else {
      this.setComponent(undefined)
    }
  }

  @computed
  get config() {
    return {
      type: this.type,
      title: this.title,
      closeDisabled: this._closeDisabled,
      component: this.componentConfig
    }
  }
  set config(value) {
    this.setConfig(value)
  }
  @action
  setConfig(value) {
    this.sync.syncStart()
    this.setTitle(value ? value.title : undefined)
    this.setCloseDisabled(value ? value.closeDisabled : undefined)
    this.setComponentConfig(value ? value.component : undefined)
    this.sync.syncEnd()
  }

  @action
  remove(comp: IComponent) {
    if (comp && this._component && comp === this._component) {
      this.setComponent(undefined)
      this.removeFromParent()
    }
  }

  @action
  replace(newComp: IComponent, oldComp: IComponent): void {
    if (oldComp === this._component) {
      this.setComponent(newComp)
    }
  }

  private _saveConfig = (config) => {
    this.saver(config)
  }

  get saveDelay() {
    return this._saveDelay
  }
  set saveDelay(value: number) {
    if (!isNaN(value) && value >= 0) {
      this._saveDelay = value
    }
  }

  @action
  private _loadDone = (config) => {
    this.setConfig(config)
    if (this.saver) {
      this._configSaveDisposer = reaction(
        () => {
          return this.config
        },
        this._saveConfig,
        { delay: this.saveDelay }
      )
    }
    this.sync.syncEnd()
  }

  @action
  private _loadError = (error: any) => {
    console.error(error)
    this.setConfig(undefined)
    this.sync.syncError(error)
  }

  @action
  load(): Promise<any> {
    if (this._configSaveDisposer) {
      this._configSaveDisposer()
      delete this._configSaveDisposer
    }
    if (this.loader) {
      this.sync.syncStart()
      return Promise.resolve(this.loader())
        .then(this._loadDone)
        .catch(this._loadError)
    }
    return Promise.reject({ code: "ILLEGAL_STATE", message: "A loader has not been configured" })
  }

  @action
  clear() {
    this.setComponent(undefined)
  }

  protected _visitChildren(callback) {
    if (this._component) {
      this._component.visit(callback)
    }
  }

  protected _findFirstChild(predicate) {
    if (this._component) {
      return this._component.findFirst(predicate)
    }
  }

  protected _findAllChildren(predicate): IComponent[] {
    if (this._component) {
      return this._component.findAll(predicate)
    }
  }

  @action
  close() {
    if (this._component) {
      this._component.close()
    }
  }

  protected _setComponentViewport = () => {
    if (this._component) {
      this._component.setViewport(0, 0, this.width, this.height)
    }
  }
}

export { Dashboard }
