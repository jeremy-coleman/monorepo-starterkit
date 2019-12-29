
import { IListingService, IListingStoreFront } from "coglite/types"

import { ListingServiceContext } from "../services"
import { SyncSupplier } from "coglite/shared/models/SyncSupplier"

class ListingStoreFrontModel extends SyncSupplier<IListingStoreFront> {
  private _service: IListingService

  get service() {
    return this._service || ListingServiceContext.value
  }
  set service(value) {
    this._service = value
  }

  protected _loadImpl() {
    return this.service.getStoreFront()
  }
}

export { ListingStoreFrontModel }
