import { observable, action, computed } from "mobx"
import { IDashboardList } from "../types"
import { IDashboard } from "../types"
import { Dashboard } from "./Dashboard"
import { IDashboardAdd, IDashboardAddOptions } from "../types"
import { isNotBlank } from "coglite/shared/util"

class DashboardAdd implements IDashboardAdd {
  @observable active: boolean = false
  @observable dashboardList: IDashboardList
  @observable existing: IDashboard
  @observable dashboard: IDashboard
  @observable makeActive: boolean = true

  @action
  init(opts: IDashboardAddOptions) {
    this.dashboardList = opts.dashboardList
    this.dashboard = new Dashboard()
    this.existing = opts.existing
    let dashboardNumber = 1
    let suggestedTitle
    while (true) {
      suggestedTitle = `Dashboard ${dashboardNumber}`
      if (!this.dashboardList.dashboards.some((db) => db.title === suggestedTitle)) {
        break
      } else {
        dashboardNumber++
      }
    }
    this.dashboard.setTitle(suggestedTitle)
    this.active = true
  }

  @action
  setExisting(existing: IDashboard) {
    this.existing = existing
  }

  @action
  setMakeActive(makeActive: boolean) {
    this.makeActive = makeActive
  }

  @action
  private _close() {
    this.existing = undefined
    this.dashboardList = undefined
    this.active = false
  }

  @computed
  get saveEnabled() {
    return isNotBlank(this.dashboard.title) ? true : false
  }

  @action
  save() {
    if (this.existing) {
      this.dashboard.setComponentConfig(this.existing.componentConfig)
    }

    this.dashboardList.add(this.dashboard, this.makeActive)
    this._close()
  }

  @action
  cancel() {
    this._close()
  }
}

export { DashboardAdd }
