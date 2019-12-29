import { syncRefreshItem } from "coglite/shared/components"

import { IListing, IListingListModel, IMutableSync } from "coglite/types"
import { UserAccountHostView, UserAdminContext, UserPermissionsHost } from "coglite/modules/user"
import * as React from "react"

import { ShopettePathsContext } from "../../PathsContext"
import { launch } from "../ListingLaunch"
import { ListingListStore } from "../stores"
import { ListingLaunchDialog } from "./ListingLaunchDialog"
import { ListingViewConfig } from "./ListingViewConfig"
import { UserListingsContainer } from "./UserListings"
import { Sync } from "coglite/shared/models/Sync"

class UserListingsApp extends UserPermissionsHost {
  protected get iconName(): string {
    return "Backlog"
  }
  componentWillMount() {
    this.host.setTitle(`My ${ListingViewConfig.labelPlural}`)
    this.host.icon.name = this.iconName
  }
  private _onLoadStore = () => {
    this.host.load({ path: ShopettePathsContext.value.store() })
  }
  private _onLoadAllListings = () => {
    this.host.load({ path: ShopettePathsContext.value.listings() })
  }
  get listingList(): IListingListModel {
    return ListingListStore
  }
  get launchSync(): IMutableSync<IListing> {
    return this.host.getState("appLaunchSync", () => {
      return new Sync()
    })
  }
  protected get appViewStyles() {
    return {}
  }
  protected get showLinks(): boolean {
    return true
  }
  private _onLaunchApp = (listing: IListing) => {
    this.launchSync.syncStart({ id: listing })
    launch({
      host: this.host,
      userProfile: this.userProfile,
      listingId: listing.id
    })
      .then((app) => {
        this.launchSync.syncEnd()
      })
      .catch((err) => {
        this.launchSync.syncError(err)
      })
  }
  private _onRefreshList = () => {
    this.listingList.refresh()
  }
  private _onClickInfo = (listing: IListing) => {
    this.host.load({
      path: ShopettePathsContext.value.listingDetails(listing.id)
    })
  }
  render() {
    const farItems = []
    if (this.showLinks) {
      farItems.push({
        key: "store",
        name: `${ListingViewConfig.storeLabel}`,
        iconProps: {
          iconName: "Shop"
        },
        onClick: this._onLoadStore
      })
    }
    if (this.showLinks && UserAdminContext.value(this.userProfile)) {
      farItems.push({
        key: "listings",
        name: `All ${ListingViewConfig.labelPlural}`,
        iconProps: {
          iconName: "ViewList"
        },
        onClick: this._onLoadAllListings
      })
    }
    farItems.push(
      syncRefreshItem({
        sync: this.listingList.sync,
        onClick: this._onRefreshList,
        title: `Refresh ${ListingViewConfig.labelPlural}`
      })
    )
    return (
      <UserAccountHostView
        host={this.host}
        userProfile={this.userProfile}
        commandBarProps={{ items: [], farItems: farItems }}
        styles={this.appViewStyles}
      >
        <ListingLaunchDialog sync={this.launchSync} />
        <UserListingsContainer
          userProfile={this.userProfile}
          listingList={this.listingList}
          onLaunchApp={this._onLaunchApp}
          onClickInfo={this._onClickInfo}
        />
      </UserAccountHostView>
    )
  }
}

export { UserListingsApp, UserListingsApp as default }
