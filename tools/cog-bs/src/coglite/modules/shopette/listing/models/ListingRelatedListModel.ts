
import { IListingModel, IListingRelatedListModel, IListingService } from "coglite/types"
import { computed, observable } from "mobx"

import { ListingServiceContext } from "../services"
import { ListModel } from "coglite/shared/models/ListModel"

class ListingRelatedListModel<T> extends ListModel<T> implements IListingRelatedListModel<T> {
  private _listingService: IListingService

  @observable private _listing: IListingModel

  constructor(listing: IListingModel) {
    super()
    this._listing = listing
  }

  get listingService() {
    return this._listingService || ListingServiceContext.value
  }
  set listingService(value: IListingService) {
    this._listingService = value
  }

  @computed
  get listing() {
    return this._listing
  }
}

export { ListingRelatedListModel }
