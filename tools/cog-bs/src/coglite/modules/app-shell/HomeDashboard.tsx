import { AppRouter } from "coglite/AppRouter"
import { DashboardListAppView } from "coglite/modules/dashboard"
import { ComponentFactory } from "coglite/modules/dashboard"
import { DashboardListModel } from "coglite/modules/dashboard"
import { InMemoryDataStore } from "coglite/shared/services/storage"
import { observer } from "mobx-react"
import * as React from "react"

const storageKey = "coglite-dashboard-list"
const storageService = new InMemoryDataStore()

//this is the samples db and storage setup, the main one is in coglite/env
export const DashboardListStore = new DashboardListModel()

DashboardListStore.setRouter(AppRouter)
DashboardListStore.loader = () => storageService.getItem(storageKey)
DashboardListStore.saver = (data) => storageService.setItem(storageKey, data)

DashboardListStore.addApp = { title: "My Apps", path: "/home" }
DashboardListStore.componentFactory = ComponentFactory

export let DashboardsApp = observer((props) => (
  <DashboardListAppView dashboardList={DashboardListStore} host={props.match.host} commandBarProps={props.commandBarProps}>
    {props.children}
  </DashboardListAppView>
))

export default DashboardsApp
