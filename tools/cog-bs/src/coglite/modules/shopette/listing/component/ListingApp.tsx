import { syncRefreshItem } from "coglite/shared/components"
import { ICategory, IListing, IMutableSync } from "coglite/types"
import { UserAccountHostView } from "coglite/modules/user"
import * as React from "react"
import { ShopettePathsContext } from "../../PathsContext"
import { launch } from "../ListingLaunch"
import { ListingDeleteStore } from "../stores"
import { ListingContainer, ListingDeleteDialog } from "./Listing"
import {
  listingApproveMenuItem,
  listingDeleteMenuItem,
  listingEditMenuItem,
  listingRejectMenuItem,
  listingWorkflowSubmitMenuItem
} from "./ListingAction"
import { ListingAppBase } from "./ListingAppBase"
import { ListingLaunchDialog } from "./ListingLaunchDialog"
import { Sync } from "coglite/shared/models/Sync"

class ListingApp extends ListingAppBase {
  private _onEdit = () => {
    this.host.load({
      path: ShopettePathsContext.value.listingEdit(this.listing.id)
    })
  }
  private _onDelete = () => {
    ListingDeleteStore.setValue(this.listing)
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
  private _onSubmit = () => {
    this.listing.submitForApproval()
  }
  private _onApprove = () => {
    this.listing.approve()
  }
  private _onReject = () => {
    this.listing.reject()
  }
  private _onRefresh = () => {
    this.listing.refresh()
  }
  private _onSelectCategory = (category: ICategory) => {
    console.log("-- On Select Category: " + JSON.stringify(category))
  }
  render() {
    const items = []
    if (this.isAdmin || this.isOwner) {
      items.push(
        listingEditMenuItem({ listing: this.listing, onClick: this._onEdit }),
        listingWorkflowSubmitMenuItem({
          listing: this.listing,
          onClick: this._onSubmit
        })
      )
      if (this.isAdmin) {
        items.push(
          listingApproveMenuItem({
            listing: this.listing,
            onClick: this._onApprove
          }),
          listingRejectMenuItem({
            listing: this.listing,
            onClick: this._onReject
          }),
          listingDeleteMenuItem({
            listing: this.listing,
            onClick: this._onDelete
          })
        )
      }
    }
    const farItems = [syncRefreshItem({ sync: this.listing.loadSync, onClick: this._onRefresh })]
    return (
      <UserAccountHostView host={this.host} userProfile={this.userProfile} commandBarProps={{ items: items, farItems: farItems }}>
        <ListingLaunchDialog sync={this.launchSync} />
        <ListingDeleteDialog listingSupplier={ListingDeleteStore} />
        <ListingContainer
          listing={this.listing}
          onEdit={this._onEdit}
          onDelete={this._onDelete}
          onLaunch={this._onLaunchApp}
          onSelectCategory={this._onSelectCategory}
        />
      </UserAccountHostView>
    )
  }
}

export { ListingApp, ListingApp as default }
