interface IListingViewConfig {
  label: string
  labelPlural: string
  storeLabel: string
  bookmarksEnabled?: boolean
}

const ListingViewConfig: IListingViewConfig = {
  label: "App",
  labelPlural: "Apps",
  storeLabel: "Store",
  bookmarksEnabled: true
}

export { ListingViewConfig, IListingViewConfig }
