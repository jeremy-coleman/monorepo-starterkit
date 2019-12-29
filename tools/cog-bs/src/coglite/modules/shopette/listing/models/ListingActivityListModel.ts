import { IListingActivity, IListingActivityListModel, IListingModel } from "coglite/types"
import { ListingRelatedListModel } from "./ListingRelatedListModel"

class ListingActivityListModel extends ListingRelatedListModel<IListingActivity> implements IListingActivityListModel {
  constructor(listing: IListingModel) {
    super(listing)
  }

  protected _loadImpl() {
    return this.listingService.getListingActivity({
      listingId: this.listing.id
    })
  }
}

export { ListingActivityListModel }
