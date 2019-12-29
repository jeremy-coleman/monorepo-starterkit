import { reactRouter, Router } from "coglite/shared/router"
import { ShopettePaths, ShopettePathsContext, ShopetteRouter } from "coglite/modules/shopette"
import * as React from "react"
import { createSampleRouter } from "coglite/modules/app-shell/sampleRouter"
const sampleRouter = createSampleRouter()

import {injectUserProfile} from 'coglite/modules/user'

const r = new Router()

r.use(sampleRouter)

// shopette config
r.use(injectUserProfile())

r.use("/about", reactRouter(() => import("coglite/modules/app-shell/About")))
r.use("/help", reactRouter(() => import("coglite/modules/app-shell/Help")))

ShopettePathsContext.value = new ShopettePaths("/appstore")
r.use("/appstore", ShopetteRouter)

r.use("/mesh/sample/embedded", reactRouter(() => import("coglite/modules/app-shell/embedded")))

r.use("/blank", (req) => null)

const dashboardRouter = reactRouter(() => import("coglite/modules/app-shell/DashboardsApp"), { exact: false })

r.use((req, next) => {
  if (req.path === "/" || req.path === "/index" || req.path === "/dashboard") {
    return dashboardRouter(req, next)
  }
  return next(req)
})

r.use((req, next) => {
  if (req.path === "/" || req.path === "/index" || req.path === "/home") {
    return import("coglite/modules/app-shell/Home").then((m) => {
      return <m.Home host={req.app} />
    })
  }
  //console.log(JSON.stringify(req))
  return next()
})

r.defaultHandler = (req) => {
  return import("coglite/modules/app-shell/SampleHostAppView").then((m) => {
    return (
      <m.SampleHostAppView host={req.host}>
        <div>We haven't got anything useful at {req.path}</div>
      </m.SampleHostAppView>
    )
  })
}

export { r as default, r as AppRouter }
