import { syncRefreshItem } from "coglite/shared/components"

import { IListing, IMutableSync } from "coglite/types"
import { UserAccountHostView, UserPermissionsHost } from "coglite/modules/user"
import { IContextualMenuItem } from "@uifabric/components"
import * as React from "react"

import { ShopettePathsContext } from "../../PathsContext"
import { launch } from "../ListingLaunch"
import { ListingListModel } from "../models/ListingListModel"
import { ListingLaunchDialog } from "./ListingLaunchDialog"
import { ListingListPage } from "./ListingListPage"
import { ListingViewConfig } from "./ListingViewConfig"
import { Sync } from "coglite/shared/models/Sync"

class ListingListApp extends UserPermissionsHost {
  private _onSelectItem = (item: IListing) => {
    this.host.load({
      path: ShopettePathsContext.value.listingDetails(item.id)
    })
  }
  private _onAdd = () => {
    this.host.load({ path: ShopettePathsContext.value.listingAdd() })
  }
  private _onRefresh = () => {
    this.listings.refresh()
  }
  get launchSync(): IMutableSync<IListing> {
    return this.host.getState("appLaunchSync", () => {
      return new Sync()
    })
  }
  private _onLaunchApp = (listing: IListing) => {
    this.launchSync.syncStart({ id: listing })
    launch({
      host: this.host,
      userProfile: this.userProfile,
      listingId: listing.id,
      noReplace: true
    })
      .then((app) => {
        this.launchSync.syncEnd()
      })
      .catch((err) => {
        this.launchSync.syncError(err)
      })
  }
  get listings() {
    return this.host.getState("allListings", () => {
      return new ListingListModel()
    })
  }
  componentWillMount() {
    this.host.title = `All ${ListingViewConfig.labelPlural}`
    // we deliberately refresh here
    this.listings.load()
  }
  render() {
    const items = []
    items.push({
      key: "add",
      name: `Add ${ListingViewConfig.label}`,
      title: `Add a new ${ListingViewConfig.label}`,
      iconProps: {
        iconName: "Add"
      },
      onClick: this._onAdd
    })
    const farItems = [syncRefreshItem({ sync: this.listings.sync, onClick: this._onRefresh })]
    return (
      <UserAccountHostView host={this.host} userProfile={this.userProfile} commandBarProps={{ items: items, farItems: farItems }}>
        <ListingLaunchDialog sync={this.launchSync} />
        <ListingListPage compact wrapping listings={this.listings} onSelectItem={this._onSelectItem} onLaunch={this._onLaunchApp} />
      </UserAccountHostView>
    )
  }
}

export { ListingListApp, ListingListApp as default }
