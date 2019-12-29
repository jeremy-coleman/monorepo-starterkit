import { IListingModel, IListingReview, IListingReviewListModel } from "coglite/types"
import { action, computed, observable } from "mobx"

import { ListingRelatedListModel } from "./ListingRelatedListModel"
import { ListingReviewModel } from "./ListingReviewModel"

class ListingReviewListModel extends ListingRelatedListModel<IListingReview> implements IListingReviewListModel {
  @observable _newReview: ListingReviewModel

  constructor(listing: IListingModel) {
    super(listing)
  }

  protected _loadImpl() {
    return this.listingService.getListingReviews({
      listingId: this.listing.id
    })
  }

  @computed
  get newReview() {
    return this._newReview
  }

  @action
  add(): void {
    this._newReview = new ListingReviewModel(this.listing)
  }

  @action
  cancelEdit(): void {
    this._newReview = undefined
  }
}

export { ListingReviewListModel }
