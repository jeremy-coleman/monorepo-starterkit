import { IAppHost, IAppProps, IListingModel, IUserProfile } from "coglite/types"
import { UserAccountHostView } from "coglite/modules/user"
import { observer } from "mobx-react"
import { IContextualMenuItem } from "@uifabric/components"
import * as React from "react"

import { ShopettePathsContext } from "../../PathsContext"
import { ListingModel } from "../models/ListingModel"
import { ListingForm } from "./ListingForm"
import { IListingUploadProps } from "./ListingUpload"
import { ListingViewConfig } from "./ListingViewConfig"

@observer
class ListingAddApp extends React.Component<IAppProps, any> {
  private _listing: ListingModel
  get host(): IAppHost {
    return this.props.match.host
  }
  get userProfile(): IUserProfile {
    return this.props.match.userProfile
  }
  private _onAfterSave = (listing: IListingModel) => {
    this.host.load({
      path: ShopettePathsContext.value.listingDetails(listing.id)
    })
  }
  private _onSave = (listing: IListingModel) => {
    listing
      .save()
      .then(() => {
        this._onAfterSave(listing)
      })
      .catch(() => {
        // we don't do anything here - the error should be reported on the model
      })
  }
  private _onSaveImmediate = () => {
    this._onSave(this._listing)
  }
  private _onCancel = () => {
    this.host.back()
  }
  private _onAfterUpload = (props: IListingUploadProps) => {
    const { listing } = props
    // if the listing now has an id, then we'll head to the edit page for it
    if (!listing.saveSync.error && listing.id) {
      this.host.load({
        path: ShopettePathsContext.value.listingEdit(listing.id),
        replace: true
      })
    }
  }
  componentWillMount() {
    this._listing = new ListingModel()
    this.host.title = `Add ${ListingViewConfig.label}`
  }
  render() {
    const items = []
    items.push(
      {
        key: "cancel",
        name: "Cancel",
        iconProps: {
          iconName: "Cancel"
        },
        onClick: this._onCancel
      },
      {
        key: "save",
        name: "Save",
        iconProps: {
          iconName: "Save"
        },
        disabled: this._listing.saveSync.syncing,
        onClick: this._onSaveImmediate
      }
    )
    return (
      <UserAccountHostView host={this.host} userProfile={this.userProfile} commandBarProps={{ items: items }}>
        <ListingForm listing={this._listing} onSave={this._onSave} onCancel={this._onCancel} onAfterUpload={this._onAfterUpload} />
      </UserAccountHostView>
    )
  }
}

export { ListingAddApp, ListingAddApp as default }
