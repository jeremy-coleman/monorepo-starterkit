interface IShopettePaths {
  bookmarks(): string
  store(): string
  listings(): string
  listingAdd(): string
  listingDetails(listingId: string | number): string
  listingLaunch(listingId: string | number): string
  listingEdit(listingId: string | number): string
  userListings(): string
}

class ShopettePaths implements IShopettePaths {
  private _basePath: string
  constructor(basePath?: string) {
    this._basePath = basePath
  }
  get basePath() {
    return this._basePath || ""
  }
  bookmarks(): string {
    return `${this.basePath}/bookmarks`
  }
  store(): string {
    return `${this.basePath}/store`
  }
  listings(): string {
    return `${this.basePath}/listings`
  }
  listingAdd(): string {
    return `${this.listings()}/add`
  }
  listingDetails(listingId: string | number): string {
    return `${this.listings()}/${encodeURIComponent(String(listingId))}`
  }
  listingLaunch(listingId: string | number): string {
    return `${this.listingDetails(listingId)}/launch`
  }
  listingEdit(listingId: string | number): string {
    return `${this.listingDetails(listingId)}/edit`
  }
  userListings() {
    return `${this.listings()}/user`
  }
}

export { IShopettePaths, ShopettePaths }
