import { UserAccountHostView } from "coglite/modules/user"
import { IContextualMenuItem } from "@uifabric/components"
import * as React from "react"

import { ShopettePathsContext } from "../../PathsContext"
import { listingEditCancelMenuItem, listingSaveMenuItem, listingWorkflowSubmitMenuItem } from "./ListingAction"
import { ListingAppBase } from "./ListingAppBase"
import { ListingFormContainer } from "./ListingForm"
import { ListingViewConfig } from "./ListingViewConfig"

class ListingEditApp extends ListingAppBase {
  private _onBack = () => {
    if (this.host.canGoBack) {
      this.host.back()
    } else {
      this.host.load({
        path: ShopettePathsContext.value.listingDetails(this.listing.id)
      })
    }
  }
  private _onSaveDone = () => {
    if (!this.listing.saveSync.error) {
      this._onBack()
    }
  }
  private _onSave = () => {
    this.listing.save().then(this._onSaveDone)
  }
  private _onSubmitToWorkflowDone = () => {
    if (!this.listing.saveSync.error) {
      this._onBack()
    }
  }
  private _onSubmitToWorkflow = () => {
    this.listing.submitForApproval().then(this._onSubmitToWorkflowDone)
  }

  render() {
    const items = []
    items.push(
      listingEditCancelMenuItem({
        listing: this.listing,
        onClick: this._onBack
      }),
      listingSaveMenuItem({ listing: this.listing, onClick: this._onSave }),
      listingWorkflowSubmitMenuItem({
        listing: this.listing,
        onClick: this._onSubmitToWorkflow
      })
    )
    const backFallback = {
      key: "backFallback",
      title: `Back to ${ListingViewConfig.label} Details`,
      iconProps: {
        iconName: "Back"
      },
      onClick: this._onBack
    }
    return (
      <UserAccountHostView host={this.host} userProfile={this.userProfile} commandBarProps={{ items: items }} backFallback={backFallback}>
        <ListingFormContainer
          listing={this.listing}
          onSave={this._onSave}
          onSubmitForApproval={this._onSubmitToWorkflow}
          onCancel={this._onBack}
        />
      </UserAccountHostView>
    )
  }
}

export { ListingEditApp, ListingEditApp as default }
