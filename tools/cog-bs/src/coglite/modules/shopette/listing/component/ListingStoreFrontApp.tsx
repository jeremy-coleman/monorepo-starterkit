import { syncRefreshItem } from "coglite/shared/components"

import { IListing, IMutableSync } from "coglite/types"
import { UserAccountHostView, UserPermissionsHost } from "coglite/modules/user"
import { IContextualMenuItem } from "@uifabric/components"
import * as React from "react"

import { ShopettePathsContext } from "../../PathsContext"
import { launch } from "../ListingLaunch"
import { ListingSearchModel } from "../models/ListingSearchModel"
import { ListingLaunchDialog } from "./ListingLaunchDialog"
import { ListingSearch } from "./ListingSearch"
import { ListingViewConfig } from "./ListingViewConfig"
import { Sync } from "coglite/shared/models/Sync"

class ListingStoreFrontApp extends UserPermissionsHost {
  get searchText(): string {
    return this.props.match.params.search
  }
  get category(): string[] {
    return this.props.match.params.category
  }
  private _onSelectItem = (listing: IListing) => {
    this.host.load({
      path: ShopettePathsContext.value.listingDetails(listing.id)
    })
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
  private _onAdd = () => {
    this.host.load({ path: ShopettePathsContext.value.listingAdd() })
  }
  private _onOpenAllListings = () => {
    this.host.load({ path: ShopettePathsContext.value.listings() })
  }
  private _onRefresh = () => {
    this.listingSearch.refresh()
  }
  get listingSearch() {
    return this.host.getState("listingSearch", () => {
      return new ListingSearchModel()
    })
  }
  componentWillMount() {
    this.host.title = `${ListingViewConfig.storeLabel}`
    if (this.searchText || this.category) {
      this.listingSearch.setRequest({
        search: this.searchText,
        category: this.category
      })
    }
  }
  render() {
    const items = []
    const farItems = []
    if (this.isAdmin) {
      items.push({
        key: "add",
        name: `Add ${ListingViewConfig.label}`,
        title: `Add a new ${ListingViewConfig.label}`,
        iconProps: {
          iconName: "Add"
        },
        onClick: this._onAdd
      })
      farItems.push({
        key: "listings",
        name: `All ${ListingViewConfig.labelPlural}`,
        iconProps: {
          iconName: "ViewList"
        },
        onClick: this._onOpenAllListings
      })
      farItems.push(
        syncRefreshItem({
          sync: this.listingSearch.sync,
          onClick: this._onRefresh
        })
      )
    }

    return (
      <UserAccountHostView host={this.host} userProfile={this.userProfile} commandBarProps={{ items: items, farItems: farItems }}>
        <ListingLaunchDialog sync={this.launchSync} />
        <ListingSearch search={this.listingSearch} onSelectItem={this._onSelectItem} onLaunch={this._onLaunchApp} hideStatus />
      </UserAccountHostView>
    )
  }
}

export { ListingStoreFrontApp, ListingStoreFrontApp as default }
