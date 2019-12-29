
import { action, autorun, computed, IReactionDisposer, observable, reaction } from "mobx"
import { ComponentTypes } from "../constants"
import { IComponent, IDashboard, IDashboardList } from "../types"
import { Component } from "./Component"
import { Dashboard } from "./Dashboard"
import { Stack } from "./Stack"
import { Sync } from "coglite/shared/models/Sync"

class DashboardList extends Component implements IDashboardList {
  @observable sync = new Sync()
  @observable private _activeIndex: number = -1
  @observable dashboards: IDashboard[] = []
  @observable private _createDefaultDashboard: boolean = true
  private _saveDelay: number = 1000
  loader: () => Promise<any>
  saver: (data: any) => Promise<any>
  private _configSaveDisposer: IReactionDisposer
  private _setViewportDisposer: IReactionDisposer

  constructor() {
    super()
    this._setViewportDisposer = autorun(this._setDashboardViewports)
  }

  get type() {
    return ComponentTypes.dashboardList
  }

  @computed
  get createDefaultDashboard() {
    return this._createDefaultDashboard
  }
  set createDefaultDashboard(value) {
    this.setCreateDefaultDashboard(value)
  }

  @action
  setCreateDefaultDashboard(createDefaultDashboard: boolean) {
    this._createDefaultDashboard = createDefaultDashboard
  }

  @computed
  get dashboardCount() {
    return this.dashboards ? this.dashboards.length : 0
  }

  @computed
  get activeIndex() {
    return this._activeIndex || 0
  }
  set activeIndex(value) {
    this.setActiveIndex(value)
  }

  @action
  setActiveIndex(value) {
    if (value !== this._activeIndex) {
      this._activeIndex = value
    }
  }

  @computed
  get active(): IDashboard {
    return this.activeIndex >= 0 && this.activeIndex < this.dashboards.length ? this.dashboards[this.activeIndex] : undefined
  }
  set active(value) {
    this.setActive(value)
  }

  @action
  setActive(value: IDashboard) {
    this.activeIndex = this.dashboards.indexOf(value)
  }

  @computed
  get config() {
    return {
      type: this.type,
      activeIndex: this.activeIndex,
      dashboards: this.dashboards.map((d) => d.config),
      closeDisabled: this._closeDisabled
    }
  }
  set config(value) {
    this.setConfig(value)
  }
  @action
  setConfig(value) {
    this.dashboards.forEach((d) => d.close())
    this.dashboards = []
    if (value && value.dashboards && value.dashboards.length > 0) {
      value.dashboards.forEach((dc) => {
        this.addFromConfig(dc)
      })
    }
    this.setActiveIndex(value && !isNaN(value.activeIndex) ? value.activeIndex : -1)
    this.setCloseDisabled(value ? value.removeItemsDisabled : undefined)
  }

  @action
  protected addFromConfig(config: any) {
    if (config) {
      const db = new Dashboard()
      db.parent = this
      this.dashboards.push(db)
      db.setConfig(config)
    }
  }

  @action
  add(dashboard: IDashboard, makeActive: boolean = true) {
    if (dashboard.parent !== this) {
      dashboard.removeFromParent()
      dashboard.parent = this
      this.dashboards.push(dashboard)
      if (!dashboard.component && this.addApp) {
        const s = new Stack()
        dashboard.setComponent(s)
        s.addNew()
      }
      if (makeActive) {
        this.active = dashboard
      }
    }
  }

  private addDefaultDashboard() {
    if (this.dashboardCount === 0 && this.createDefaultDashboard && this.addApp) {
      const newDashboard = new Dashboard()
      newDashboard.setTitle("Dashboard 1")
      this.add(newDashboard, true)
    }
  }

  remove(node: IComponent) {
    const idx = this.dashboards.indexOf(node as IDashboard)
    if (idx >= 0) {
      const dashboard = this.dashboards[idx]
      dashboard.parent = undefined
      this.dashboards.splice(idx, 1)

      if (this.activeIndex >= this.dashboards.length) {
        this.setActiveIndex(this.dashboards.length - 1)
      }

      dashboard.close()

      if (this.dashboardCount === 0) {
        this.addDefaultDashboard()
      }
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
    if (this.dashboardCount === 0) {
      this.addDefaultDashboard()
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
      return this.loader()
        .then(this._loadDone)
        .catch(this._loadError)
    }
    return Promise.reject({ code: "ILLEGAL_STATE", message: "A loader has not been configured" })
  }

  protected _findFirstChild(predicate) {
    let r
    this.dashboards.some((d) => {
      r = d.findFirst(predicate)
      return r ? true : false
    })
    return r
  }

  protected _findAllChildren(predicate): IComponent[] {
    let r = []
    let dr
    this.dashboards.forEach((d) => {
      dr = d.findAll(predicate)
      if (dr && dr.length > 0) {
        r = r.concat(dr)
      }
    })
    return r
  }

  @action
  close() {
    this.dashboards.forEach((db) => db.close())
    this.dashboards = []
    this.setActiveIndex(-1)
    this.addDefaultDashboard()
  }

  @action
  clear() {
    this.close()
  }

  protected _setDashboardViewports = () => {
    const active = this.active
    this.dashboards.forEach((db) => {
      db.setViewport(0, 0, db === active ? this.width : 0, db === active ? this.height : 0)
    })
  }
}

export { DashboardList , DashboardList as DashboardListModel }
