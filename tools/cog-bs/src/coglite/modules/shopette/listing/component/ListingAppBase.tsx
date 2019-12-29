import { IAppProps, IListingModel } from "coglite/types"
import { UserPermissionsHost } from "coglite/modules/user"
import { autorun, IReactionDisposer } from "mobx"

import { isOwner } from "../ListingHelper"
import { ListingModel } from "../models/ListingModel"

class ListingAppBase extends UserPermissionsHost {
  private _titleSetDisposer: IReactionDisposer
  private _listing: ListingModel
  get listing(): IListingModel {
    if (!this._listing) {
      this._listing = new ListingModel()
    }
    return this._listing
  }
  get isOwner() {
    return isOwner(this.listing, this.userProfile)
  }
  protected _setupListing(props: IAppProps) {
    const listingId = props.match.params.listingId
    this.listing.id = listingId
  }
  protected _setTitleFromListing() {
    this.host.title = this.listing.title
  }
  componentWillMount() {
    this._setupListing(this.props)
    this.listing.load()
    this._titleSetDisposer = autorun(() => {
      const loadSync = this.listing.loadSync
      if (loadSync.syncing) {
        this.host.title = "Loading..."
      } else if (loadSync.error) {
        this.host.title = "Error"
      } else {
        this._setTitleFromListing()
      }
    })
  }
  componentWillReceiveProps(nextProps: IAppProps) {
    this._setupListing(nextProps)
  }
  componentWillUnount() {
    if (this._titleSetDisposer) {
      this._titleSetDisposer()
      delete this._titleSetDisposer
    }
  }
}

export { ListingAppBase }
