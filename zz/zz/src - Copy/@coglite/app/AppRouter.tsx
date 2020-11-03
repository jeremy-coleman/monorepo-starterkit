import { reactRouter, Router, IRequest } from "@coglite/router"
import { ShopetteRouter } from "@coglite/shopette"
import { createSamplesRouter } from "./SamplesHost"
import { IUser } from "@coglite/app-host"

const injectUserProfile = (v: IUser["profile"]) => (req: IRequest, next) => {
  if (!req.userProfile) {
    const nextReq = Object.assign({}, req, {
      userProfile: v
    })
    return next(nextReq)
  }
  return next()
}

const userProfile = {
  id: 1,
  display_name: "Mock User",
  bio: "Mock User Bio",
  user: {
    username: "mock",
    email: "mock@coglite.com",
    groups: [
      { name: "USER" },
      { name: "APPS_MALL_STEWARD" },
      { name: "Retail Taxonomy" },
      { name: "Healthcare Group" },
      { name: "Market Risk User" }
    ]
  }
}

const r = new Router()

r.use(createSamplesRouter())
r.use(injectUserProfile(userProfile))
r.use(ShopetteRouter)

r.use(
  "/chat",
  reactRouter(() => import("@coglite/chat/main"))
)
//r.use("/apps/arrowtable", reactRouter(() => import("@coglite/apps/arrow-table/main")));
r.use("/blank", (req) => null)

r.use((req, next) => {
  if (req.path === "/" || req.path === "/index" || req.path === "/dashboard") {
    return reactRouter(() => import("./DashboardsApp"), { exact: false })(req, next)
  }
  return next(req)
})

export { r as default, r as AppRouter }
