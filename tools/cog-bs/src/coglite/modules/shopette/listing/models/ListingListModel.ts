
import {
  IListing,
  IListingListCounts,
  IListingListModel,
  IListingListRequest,
  IListingListResponse,
  IListingService
} from "coglite/types"
import { action, computed, observable } from "mobx"

import { ListingServiceContext } from "../services"
import { ListModel } from "coglite/shared/models/ListModel"
import { isNotBlank } from "coglite/shared/util"

class ListingListModel extends ListModel<IListing> implements IListingListModel {
  private _listingService: IListingService
  @observable searchText: string
  @observable private _counts: IListingListCounts
  private _searchDelay: number = 500
  private _searchTimeout: any

  get listingService() {
    return this._listingService || ListingServiceContext.value
  }
  set listingService(value: IListingService) {
    this._listingService = value
  }

  @action
  setSearchText(searchText: string) {
    if (searchText !== this.searchText) {
      this.searchText = searchText
      if (this._searchTimeout) {
        clearTimeout(this._searchTimeout)
      }

      this.sync.syncStart()
      this._searchTimeout = setTimeout(this._searchImpl, this._searchDelay)
    }
  }

  @computed
  get counts() {
    return Object.assign({}, this._counts)
  }

  @action
  private _refreshDone = (res: IListingListResponse) => {
    delete this._searchTimeout
    this._counts = res.counts
    this.setItems(res.listings)
    this.sync.syncEnd()
  }

  @action
  private _refreshError = (error: any) => {
    this.clearItems()
    this.sync.syncError(error)
  }

  @action
  private _searchImpl = () => {
    const search = this.searchText
    let request: IListingListRequest
    if (isNotBlank(search)) {
      request = {
        search: search
      }
    }
    return this.listingService
      .getListings(request)
      .then((results) => {
        if (search === this.searchText) {
          this._refreshDone(results)
        }
      })
      .catch((error) => {
        if (search === this.searchText) {
          this._refreshError(error)
        }
      })
  }

  @action
  refresh() {
    this.sync.syncStart()
    return this._searchImpl()
  }
}

export { ListingListModel as default, ListingListModel }
