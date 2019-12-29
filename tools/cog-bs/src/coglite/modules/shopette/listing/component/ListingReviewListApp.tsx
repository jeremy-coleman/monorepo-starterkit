import { IAppHostBaseProps } from "coglite/types"
import { UserAccountHostView } from "coglite/modules/user"
import * as React from "react"

import { getReviews } from "../models/ListingReviewHelper"
import { ListingContainer } from "./Listing"
import { ListingAppBase } from "./ListingAppBase"
import { ListingReviewListContainer } from "./ListingReviewList"

interface IListingReviewListAppProps extends IAppHostBaseProps {
  listingId: number
}

class ListingReviewListApp extends ListingAppBase {
  private _onRenderListing = () => {
    return <ListingReviewListContainer reviewList={getReviews(this.listing)} />
  }
  protected _setTitleFromListing() {
    this.host.title = `Reviews for ${this.listing.title}`
  }
  render() {
    return (
      <UserAccountHostView host={this.host}>
        <ListingContainer listing={this.listing} onRenderListing={this._onRenderListing} />
      </UserAccountHostView>
    )
  }
}

export { IListingReviewListAppProps, ListingReviewListApp }
