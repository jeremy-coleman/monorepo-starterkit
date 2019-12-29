import { isBlank } from "coglite/shared/util"
import { IError, IListingLink, IListingLinkModel, IListingModel } from "coglite/types"
import { action, computed, observable } from "mobx"

class ListingLinkModel implements IListingLinkModel {
  @observable _listing: IListingModel
  @observable validationErrors: IError[] = []
  @observable name: string
  @observable url: string

  constructor(listing: IListingModel, data?: IListingLink) {
    this._listing = listing
    if (data) {
      this.setData(data)
    }
  }

  @computed
  get valid() {
    return this.validationErrors.length === 0
  }

  @computed
  get listing() {
    return this._listing
  }

  @action
  validate() {
    this.validationErrors = []
    if (isBlank(this.name)) {
      this.validationErrors.push({
        key: "name",
        keyTitle: "Name",
        message: "Name is required"
      })
    }
    if (isBlank(this.url)) {
      this.validationErrors.push({
        key: "url",
        keyTitle: "URL",
        message: "URL is required"
      })
    }
  }

  @action
  setName(name: string) {
    this.name = name
  }

  @action
  setUrl(url: string) {
    this.url = url
  }

  @action
  removeFromListing(): void {
    this.listing.removeLink(this)
  }

  @computed
  get data() {
    return { name: this.name, url: this.url }
  }
  set data(value) {
    this.setData(value)
  }

  @action
  setData(data: IListingLink) {
    this.setName(data ? data.name : undefined)
    this.setUrl(data ? data.url : undefined)
  }
}

export { ListingLinkModel }
