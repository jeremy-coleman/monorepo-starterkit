import { exactPath, Router } from "coglite/shared/router"
import * as React from "react"

const createSampleRouter = (): Router => {
  const r = new Router()

  r.use(
    "/samples/opener",
    exactPath((req) => {
      return import("./Opener").then((m) => {
        return <m.OpenerApp host={req.app} />
      })
    })
  )

  r.use(
    "/samples/home",
    exactPath((req) => {
      return import("./Home").then((m) => {
        return <m.Home host={req.app} />
      })
    })
  )

  r.use(
    "/samples",
    exactPath((req) => {
      return import("./Home").then((m) => {
        return <m.Home host={req.app} />
      })
    })
  )

  return r
}

export { createSampleRouter }
