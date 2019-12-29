import { PanelType } from "@uifabric/components"
import { DashboardListStore } from "coglite/env"
import { ListingViewConfig, ShopettePathsContext } from "coglite/modules/shopette"
import { IAppProps, IRequest } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"
import { BrandButton } from "../../shared/components/common/BrandButton"
import { DashboardListAppView } from "../dashboard"
import { AppPanelContainer } from "../host/views/AppPanel"
import { createUserProfileMenu } from "coglite/modules/user"

//import { getRequestSupplier } from "../host/views/AppPanelUtils";

const DashboardsApp = observer((props: IAppProps) => {
  let host = props.match.host
  let panelAppRequestSupplier = host.state.panelAppRequestSupplier
  //let panelAppRequestSupplier = getRequestSupplier(host)
  let userProfile = props.match.userProfile

  let _onClickHelp = () => {
    panelAppRequestSupplier.value = {
      path: "/help",
      panelProps: { type: PanelType.medium }
    }
  }
  let _onClickAbout = () => {
    panelAppRequestSupplier.value = {
      path: "/about",
      panelProps: { type: PanelType.medium }
    }
  }
  let _onClickBrand = () => {
    host.load({ path: "/index" })
  }
  let _onClickShop = () => {
    panelAppRequestSupplier.value = {
      path: ShopettePathsContext.value.store()
    }
  }
  let _launchPanelApp = (request: IRequest) => {
    return host.open(request)
  }
  React.useEffect(() => {
    host.setTitle("Dashboards")
  })

  let _onRenderBrand = () => {
    return <BrandButton onClick={_onClickBrand} />
  }

  const items = [
    {
      key: "brand",
      text: "Coglite",
      onRender: _onRenderBrand
    }
  ]
  const farItems = []
  // shop/store
  const storeMenu = {
    key: "store",
    title: ListingViewConfig.storeLabel,
    iconProps: {
      iconName: "Shop"
    },
    onClick: _onClickShop
  }
  farItems.push(storeMenu)

  // help
  const helpMenu = {
    key: "helpMenu",
    iconProps: {
      iconName: "Help"
    },
    subMenuProps: {
      items: [
        {
          key: "help",
          text: "Coglite help",
          iconProps: {
            iconName: "Help"
          },
          onClick: _onClickHelp
        },
        {
          key: "about",
          text: "About Coglite",
          iconProps: {
            iconName: "Info"
          },
          onClick: _onClickAbout
        }
      ]
    }
  }
  farItems.push(helpMenu)

  // user profile
  if (userProfile) {
    farItems.push(createUserProfileMenu(userProfile))
  }
  return (
    <DashboardListAppView dashboardList={DashboardListStore} host={host} commandBarProps={{ items: items, farItems: farItems }}>
      <AppPanelContainer
        requestSupplier={panelAppRequestSupplier}
        launcher={_launchPanelApp}
        router={host.router}
        panelProps={{ type: PanelType.large }}
      />
    </DashboardListAppView>
  )
})

export { DashboardsApp, DashboardsApp as default }
