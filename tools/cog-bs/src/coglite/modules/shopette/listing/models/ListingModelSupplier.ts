
import { IListingModel, IListingModelSupplier } from "coglite/types"

import { ListingServiceContext } from "../services"
import { ListingModel } from "./ListingModel"
import { SyncSupplier } from "coglite/shared/models/SyncSupplier"

class ListingModelSupplier extends SyncSupplier<IListingModel> implements IListingModelSupplier {
  private _listingId: string | number
  constructor(listingId: string | number) {
    super()
    this._listingId = listingId
  }
  get listingId(): string | number {
    return this._listingId
  }
  protected _loadImpl() {
    return ListingServiceContext.value.getListing({ listingId: this._listingId }).then((data) => {
      return new ListingModel(data)
    })
  }
}

export { ListingModelSupplier }
