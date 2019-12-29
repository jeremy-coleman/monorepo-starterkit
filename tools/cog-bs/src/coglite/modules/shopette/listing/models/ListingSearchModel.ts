
import { IListing, IListingSearchModel, IListingSearchRequest, IListingService } from "coglite/types"
import { action, computed, observable } from "mobx"

import { ListingServiceContext } from "../services"
import { ListModel } from "coglite/shared/models/ListModel"

const Defaults = {
  searchDelay: 0
}

class ListingSearchModel extends ListModel<IListing> implements IListingSearchModel {
  @observable _search: string
  @observable category: string[] = []
  _service: IListingService
  _searchDelay: number
  _searchTimeout: any

  get searchDelay(): number {
    return this._searchDelay !== undefined ? this._searchDelay : Defaults.searchDelay
  }
  set searchDelay(value) {
    if (value > 0) {
      this._searchDelay = value
    }
  }

  get service() {
    return this._service || ListingServiceContext.value
  }
  set service(value) {
    this._service = value
  }

  @computed
  get search() {
    return this._search
  }
  set search(value) {
    this.setSearch(value)
  }

  @action
  protected _searchImpl = () => {
    this.refresh()
  }

  @action
  setSearch(search: string) {
    this.setRequest({ search: search })
  }

  @action
  setCategory(category: string[]) {
    this.setRequest({ category: category })
  }

  private _hasCategoryChanged(newCategory: string[]): boolean {
    if (newCategory === this.category) {
      return false
    }

    if (!newCategory) {
      newCategory = []
    }
    return this.category.some((c) => newCategory.indexOf(c) < 0)
  }

  @action
  setRequest(params: IListingSearchRequest): void {
    let search = params && params.search !== undefined ? params.search : this._search
    const category = params && params.category !== undefined ? params.category : this.category
    const categoryChanged = this._hasCategoryChanged(category)
    if (search !== this._search || categoryChanged) {
      this._search = search
      if (categoryChanged) {
        this.category = []
        if (category) {
          category.forEach((c) => this.category.push(c))
        }
      }
      if (this._searchTimeout) {
        clearTimeout(this._searchTimeout)
      }
      this.sync.syncStart()
      this._searchTimeout = setTimeout(this._searchImpl, this.searchDelay)
    }
  }

  private _hasRequestChanged(params: IListingSearchRequest): boolean {
    if (params.search !== this._search) {
      return true
    }
    return this._hasCategoryChanged(params.category)
  }

  @action
  refresh(): Promise<void> {
    const request: IListingSearchRequest = {
      search: this._search,
      category: this.category.slice(0)
    }
    this.sync.syncStart()
    return this.service
      .searchListings(request)
      .then((results) => {
        if (!this._hasRequestChanged(request)) {
          this._onLoadDone(results)
        }
      })
      .catch((error) => {
        if (!this._hasRequestChanged(request)) {
          this._onLoadError(error)
        }
      })
  }
}

export { ListingSearchModel }
