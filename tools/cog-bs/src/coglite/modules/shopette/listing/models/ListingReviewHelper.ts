import { IListingModel, IListingReviewListModel } from "coglite/types"

import { ListingReviewListModel } from "./ListingReviewListModel"

const getReviews = (listing: IListingModel): IListingReviewListModel => {
  return listing.getState("reviews", () => {
    return new ListingReviewListModel(listing)
  })
}

export { getReviews }
