import { IAppHost, AppPanelContainer, createUserProfileMenu } from "@coglite/app-host"
import { ComponentFactory, DashboardList, DashboardListAppView } from "@coglite/dashboard"
import { IRequest } from "@coglite/router"
import { ShopetteRouter } from "@coglite/shopette"
import { observer } from "mobx-react-lite"
import { PanelType } from "office-ui-fabric-react"
import React from "react"
import { AppRouter } from "./AppRouter"

const DashboardStorage = new Map()

const storageKey = "dashboard-storage"

const DashboardListStore = new DashboardList()

DashboardListStore.setComponentFactory(ComponentFactory)
DashboardListStore.setRouter(AppRouter)

DashboardListStore.loader = () => {
  return DashboardStorage.get(storageKey)
}

DashboardListStore.saver = (data) => {
  return DashboardStorage.set(storageKey, data)
}

DashboardListStore.setAddApp({
  title: "My Apps",
  path: ShopetteRouter.find.userListings()
})

type P = {
  match: IRequest
}

const DashboardsApp = observer((props: P) => {
  let host: IAppHost = props.match.host
  let panelAppRequestSupplier = host.getRequestSupplier
  let userProfile = props.match.userProfile

  let _launchPanelApp = (request: IRequest) => {
    return host.open(request)
  }
  React.useEffect(() => {
    host.setTitle("Dashboards")
  })

  const items = []
  const farItems = []

  if (userProfile) {
    farItems.push(createUserProfileMenu(userProfile))
  }
  return (
    <DashboardListAppView
      dashboardList={DashboardListStore}
      host={host}
      commandBarProps={{ items: items, farItems: farItems }}
    >
      <AppPanelContainer
        requestSupplier={panelAppRequestSupplier}
        launcher={_launchPanelApp}
        router={host.router}
        panelProps={{ type: PanelType.large }}
      />
    </DashboardListAppView>
  )
})

export { DashboardsApp }
export default DashboardsApp