import { IListingModel } from "coglite/types"
import { CategoryListModel, ListingBookmarkListModel, ListingListModel, ListingTypeListModel } from "./models"
import { SyncSupplier } from "coglite/shared/models/SyncSupplier"

const ListingTypeListStore = new ListingTypeListModel()
const ListingListStore = new ListingListModel()
const ListingDeleteStore = new SyncSupplier<IListingModel>()
const ListingBookmarkListStore = new ListingBookmarkListModel()
const CategoryListStore = new CategoryListModel()

export { CategoryListStore }
export { ListingBookmarkListStore }
export { ListingDeleteStore }
export { ListingListStore }
export { ListingTypeListStore }
