import { IAppHost, AppLink, HostAppView } from "@coglite/app-host"
import { exactPath, IRequest, IRequestHandler, IRouterManager, Router } from "@coglite/router"
import { observer } from "mobx-react-lite"
import { DefaultPalette, IContextualMenuItem, mergeStyleSets } from "@fluentui/react"
import * as React from "react"
import { ISampleRoute, sampleRoutes } from "./routes"

interface P {
  src?: string
  className?: string
  host?: Partial<EventTarget>
  page?: any
}

const NextPageIFrame = (props: P) => {
  const containerRef = React.useRef<HTMLDivElement>()
  const frameRef = React.useRef<HTMLIFrameElement>()

  const onResize = () => {
    if (containerRef.current && frameRef.current) {
      const bounds = containerRef.current.getBoundingClientRect()
      frameRef.current.width = String(bounds.width)
      frameRef.current.height = String(bounds.height)
    }
  }

  React.useEffect(() => {
    const host = props.host
    if (host) {
      host.addEventListener("resize", onResize)
      onResize()
      return () => {
        host.removeEventListener("resize", onResize)
        if (frameRef.current) {
          frameRef.current.src = "about:blank"
        }
      }
    }
  }, [props.host])

  let p = {
    src: "http://localhost:3000/" + props.page
  }

  return (
    <div
      className={props.className}
      style={{
        overflow: "hidden",
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }}
      ref={containerRef}
    >
      <iframe
        style={{ position: "absolute", top: 0, left: 0, border: "none" }}
        ref={frameRef}
        src={p.src}
      />
    </div>
  )
}

let appTileStyles = mergeStyleSets({
  outline: {
    position: "relative",
    width: 100,
    height: 100,
    margin: 10,
    boxShadow: "0 0 5px 0px rgba(0,0,0,0.4)"
  },
  topHalf: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 60,
    backgroundColor: DefaultPalette.white
  },
  title: { display: "flex", alignItems: "center", justifyContent: "center", padding: 8 },
  bottomHalf: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    fontSize: 10,
    top: 60,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: DefaultPalette.themePrimary,
    color: DefaultPalette.white
  }
})

interface IHomeAppTileLinkProps extends SampleProps {
  request: IRequest
  classes?: any
}

const HomeAppTileLink = observer((props: IHomeAppTileLinkProps) => {
  return (
    <AppLink
      host={props.host}
      request={props.request}
      style={{ textDecoration: "none" }}
      title={props.request.title}
    >
      <div className={appTileStyles.outline}>
        <div className={appTileStyles.topHalf}>{"s"}</div>
        <div className={appTileStyles.bottomHalf}>
          <div className={appTileStyles.title}>{props.request.title}</div>
        </div>
      </div>
    </AppLink>
  )
})

export type LinkProps = {
  href: any
  as?: any
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
  passHref?: boolean
  prefetch?: boolean
}

export type SampleProps = {
  host: IAppHost
  onRenderSync?: (props: SampleProps) => React.ReactElement
  onRenderError?: (props: SampleProps) => React.ReactElement
  noLoadOnMount?: boolean
  title?: string
} & React.HTMLProps<any>

export let Sample = observer((props: SampleProps) => {
  return (
    <SamplesHost host={props.host} title="Samples">
      <div>
        <div style={{ padding: 8 }}>
          <h2>Samples</h2>
          <div>
            {sampleRoutes.map((group) => {
              return (
                <div key={group.key}>
                  <h3>{group.title}</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", padding: 8 }}>
                    {group.items.map((item) => {
                      return (
                        <HomeAppTileLink
                          key={item.path}
                          host={props.host}
                          request={Object.assign({}, item, { replace: true })}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </SamplesHost>
  )
})

type CommandItems = {
  items: IContextualMenuItem[]
  farItems: IContextualMenuItem[]
}

const SamplesHost = observer((props: SampleProps) => {
  const _onClickItem = (e, item) => {
    props.host.load({ path: item.path, replace: true })
  }
  function _updateHostTitle(props: SampleProps) {
    props.host.setTitle(props.title || "")
  }

  React.useEffect(() => {
    _updateHostTitle(props)
  }, [props.host])

  const groupItems = sampleRoutes.map((g) => {
    const groupItem: IContextualMenuItem = {
      key: g.key,
      name: g.title
    }
    const sampleItems = g.items.map((item) => {
      return {
        key: item.path,
        path: item.path,
        name: item.title,
        canCheck: true,
        checked: props.host.path === item.path,
        onClick: _onClickItem
      }
    })
    groupItem.subMenuProps = {
      items: sampleItems
    }
    return groupItem
  })

  const commandBarItems: CommandItems = {
    items: [{ key: "samples", name: "Samples", subMenuProps: { items: groupItems } }],
    farItems: []
  }

  if (props.host.root) {
    commandBarItems.items.push({ key: "title", name: `${props.host.title}` })
  }

  return (
    <HostAppView host={props.host} commandBarProps={commandBarItems} showBackLabel={true}>
      {props.children}
    </HostAppView>
  )
})

const sampleRouteHandler = (sampleApp: ISampleRoute): IRequestHandler => {
  return (req) => {
    if (sampleApp.moduleLoader) {
      return sampleApp.moduleLoader().then((m) => {
        const componentType = m[sampleApp.moduleComponent || "default"]
        if (!componentType) {
          throw { code: "NOT_FOUND", message: "Unable to resolve component type [Sample]" }
        }
        return (
          <SamplesHost host={req.app} title={sampleApp.title}>
            {React.createElement(componentType, Object.assign({}, req, { host: req.host }))}
          </SamplesHost>
        )
      })
    }

    if (sampleApp.page) {
      return (
        <SamplesHost host={req.app} title={sampleApp.title}>
          <NextPageIFrame host={req.app} page={sampleApp.page} />
        </SamplesHost>
      )
    }
  }
}

const registerRoutes = (sampleRoute: ISampleRoute, router: IRouterManager) => {
  //this will get called after recursing through items:[] in the routes
  if (sampleRoute.path && (sampleRoute.moduleLoader || sampleRoute.page)) {
    console.log("-- Registering Sample: " + sampleRoute.key)
    router.use(sampleRoute.path, exactPath(sampleRouteHandler(sampleRoute)))
  }

  // recursive
  if (sampleRoute.items) {
    sampleRoute.items.forEach((item) => {
      registerRoutes(item, router)
    })
  }
}

const createSamplesRouter = (): Router => {
  const r = new Router()

  r.use("/samples", (req, next) => {
    if (req.basePath === req.path) {
      return <Sample host={req.app} />
    }
    return next()
  })

  sampleRoutes.forEach((sampleRoute) => {
    //@ts-ignore
    registerRoutes(sampleRoute, r)
  })

  return r
}

export { createSamplesRouter }
export { SamplesHost, sampleRouteHandler }
