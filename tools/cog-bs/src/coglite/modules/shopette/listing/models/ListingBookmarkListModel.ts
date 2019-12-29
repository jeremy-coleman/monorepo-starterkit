
import { IListing, IListingBookmark, IListingBookmarkListModel } from "coglite/types"
import { action } from "mobx"

import { ListingServiceContext } from "../services"
import { ListModel } from "coglite/shared/models/ListModel"

class ListingBookmarkListModel extends ListModel<IListingBookmark> implements IListingBookmarkListModel {
  protected _loadImpl() {
    return ListingServiceContext.value.getBookmarkedListings()
  }

  private _findMatchingIndex(listing: IListing) {
    if (listing && this.value) {
      return this.value.findIndex((item) => {
        return item.listing ? item.listing.id === listing.id : false
      })
    }
    return -1
  }

  private _findMatching(listing: IListing) {
    if (listing && this.value) {
      return this.value.find((item) => {
        return item.listing ? item.listing.id === listing.id : false
      })
    }
  }

  @action
  addBookmark(listing: IListing): void {
    if (listing) {
      const existing = this._findMatching(listing)
      if (!existing) {
        const bookmark: IListingBookmark = {
          listing: listing
        }
        this.items.push(bookmark)
        ListingServiceContext.value.addBookmark({ listing: { id: listing.id } }).then((b) => {
          bookmark.id = b.id
        })
      }
    }
  }

  @action
  removeBookmark(listing: IListing): void {
    if (listing) {
      const idx = this._findMatchingIndex(listing)
      if (idx >= 0) {
        const e = this.items[idx]
        this.items.splice(idx, 1)
        if (e.id) {
          ListingServiceContext.value.removeBookmark(e)
        }
      }
    }
  }

  isBookmarked(listing: IListing): boolean {
    return this.items && listing ? this.items.some((b) => b.listing && b.listing.id === listing.id) : false
  }
}

export { ListingBookmarkListModel }
