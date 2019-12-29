import { IListingActivityListModel, IListingModel } from "coglite/types"
import { ListingActivityListModel } from "./ListingActivityListModel"

const getActivity = (listing: IListingModel): IListingActivityListModel => {
  return listing.getState("activity", () => {
    return new ListingActivityListModel(listing)
  })
}

export { getActivity }
