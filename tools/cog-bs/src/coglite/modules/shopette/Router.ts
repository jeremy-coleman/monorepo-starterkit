import { Router } from "coglite/shared/router"
import { exactPath, reactRouter } from "coglite/shared/router"

import { launchHandler } from "./listing/ListingLaunch"

const ShopetteRouter = new Router()
ShopetteRouter.use("/bookmarks", reactRouter(() => import("./listing/component/ListingBookmarksApp")))
ShopetteRouter.use("/store", reactRouter(() => import("./listing/component/ListingStoreFrontApp")))
ShopetteRouter.use("/listings", reactRouter(() => import("./listing/component/ListingListApp")))
ShopetteRouter.use("/listings/user", reactRouter(() => import("./listing/component/UserListingsApp")))
ShopetteRouter.use("/listings/add", reactRouter(() => import("./listing/component/ListingAddApp")))
ShopetteRouter.use("/listings/:listingId", reactRouter(() => import("./listing/component/ListingApp")))
ShopetteRouter.use("/listings/:listingId/launch", exactPath(launchHandler))
ShopetteRouter.use("/listings/:listingId/edit", reactRouter(() => import("./listing/component/ListingEditApp")))

export { ShopetteRouter }
export default ShopetteRouter
