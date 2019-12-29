import { action } from "mobx"
import { HSplit, VSplit } from "./models/Split"
import { ComponentRemoveStore, DashboardAddStore, DashboardListClearStore, DashboardRemoveStore } from "./stores"
import { IComponent, IComponentRemoveOptions, IDashboard, IDashboardAddOptions, IDashboardList } from "./types"

const removeComponent = (opts: IComponentRemoveOptions) => {
  ComponentRemoveStore.init(opts)
}

const addDashboard = action((opts: IDashboardAddOptions) => {
  DashboardAddStore.init(opts)
})

const removeDashboard = action((dashboard: IDashboard) => {
  DashboardRemoveStore.value = dashboard
})

const clearDashboards = action((dashboardList: IDashboardList) => {
  DashboardListClearStore.value = dashboardList
})

const splitHorizontal = action((replace: IComponent, left: IComponent, right: IComponent) => {
  const split = new HSplit()
  if (replace.parent) {
    replace.parent.replace(split, replace)
  }
  split.setLeft(left)
  split.setRight(right)
})

const splitVertical = action((replace: IComponent, top: IComponent, bottom: IComponent) => {
  const split = new VSplit()
  if (replace.parent) {
    replace.parent.replace(split, replace)
  }
  split.setTop(top)
  split.setBottom(bottom)
})

export { splitHorizontal, splitVertical }
export { addDashboard, removeDashboard, clearDashboards }
export { removeComponent }
