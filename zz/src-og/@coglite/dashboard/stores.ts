
/* -------------------------------------------------------------------------- */
/*                                   stores                                   */
/* -------------------------------------------------------------------------- */

import { Supplier } from "@coglite/app-host"
import { IComponent, Dashboard, DashboardList, HSplit, VSplit, IDashboardList, IDashboard } from "./models"
import {  ComponentRemove, IComponentRemoveOptions } from "./views"
import { action, computed, observable } from "mobx"


export type IDashboardAddOptions = {
  dashboardList: IDashboardList;
  existing?: IDashboard;
};

export class DashboardAdd {
  @observable active: boolean = false;
  @observable dashboardList: DashboardList;
  @observable existing: Dashboard;
  @observable dashboard: Dashboard;
  @observable makeActive: boolean = true;

  @action
  init(opts: IDashboardAddOptions) {
    this.dashboardList = opts.dashboardList;
    this.dashboard = new Dashboard();
    this.existing = opts.existing;
    let dashboardNumber = 1;
    let suggestedTitle;
    while (true) {
      suggestedTitle = `Dashboard ${dashboardNumber}`;
      if (
        !this.dashboardList.dashboards.some((db) => db.title === suggestedTitle)
      ) {
        break;
      } else {
        dashboardNumber++;
      }
    }
    this.dashboard.setTitle(suggestedTitle);
    this.active = true;
  }

  @action
  setExisting(existing: Dashboard) {
    this.existing = existing;
  }

  @action
  setMakeActive(makeActive: boolean) {
    this.makeActive = makeActive;
  }

  @action
  private _close() {
    this.existing = undefined;
    this.dashboardList = undefined;
    this.active = false;
  }

  @computed
  get saveEnabled() {
    return this.dashboard.title ? true : false;
    //return isNotBlank(this.dashboard.title) ? true : false;
  }

  @action
  save() {
    if (this.existing) {
      this.dashboard.setComponentConfig(this.existing.componentConfig);
    }

    this.dashboardList.add(this.dashboard, this.makeActive);
    this._close();
  }

  @action
  cancel() {
    this._close();
  }
}

export const ComponentRemoveStore = new ComponentRemove()
export const DashboardRemoveStore = new Supplier<Dashboard>()
export const DashboardListClearStore = new Supplier<DashboardList>()
export const DashboardAddStore = new DashboardAdd()

/* -------------------------------------------------------------------------- */
/*                                   actions                                  */
/* -------------------------------------------------------------------------- */

export const splitHorizontal = action((replace: IComponent, left: IComponent, right: IComponent) => {
  const split = new HSplit()
  if (replace.parent) {
    replace.parent.replace(split, replace)
  }
  split.setLeft(left)
  split.setRight(right)
})

export const splitVertical = action((replace: IComponent, top: IComponent, bottom: IComponent) => {
  const split = new VSplit()
  if (replace.parent) {
    replace.parent.replace(split, replace)
  }
  split.setTop(top)
  split.setBottom(bottom)
})

export const removeComponent = (opts: IComponentRemoveOptions) => {
  ComponentRemoveStore.init(opts)
}

export const addDashboard = action((opts: IDashboardAddOptions) => {
  DashboardAddStore.init(opts)
})

export const removeDashboard = action((dashboard: Dashboard) => {
  DashboardRemoveStore.value = dashboard
})

export const clearDashboards = action((dashboardList: DashboardList) => {
  DashboardListClearStore.value = dashboardList
})