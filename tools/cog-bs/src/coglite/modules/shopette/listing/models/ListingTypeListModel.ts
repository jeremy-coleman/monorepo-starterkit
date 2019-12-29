
import { IListingService, IListingType } from "coglite/types"

import { ListingServiceContext } from "../services"
import { ListModel } from "coglite/shared/models/ListModel"

class ListingTypeListModel extends ListModel<IListingType> {
  private _service: IListingService
  get service() {
    return this._service || ListingServiceContext.value
  }
  set service(value) {
    this._service = value
  }

  protected _loadImpl() {
    return this.service.getListingTypes()
  }
}

export { ListingTypeListModel }
