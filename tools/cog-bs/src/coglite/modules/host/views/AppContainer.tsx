import { IAppHost, IAppLauncher, IRequest, IRouter } from "coglite/types"
import * as React from "react"
import { AppHost } from "../models/AppHost"
import { AppHostContainer, IAppHostProps } from "./AppHost"

interface IAppProps {
  match: IRequest
}

export interface IAppContainerProps {
  request?: IRequest
  router?: IRouter
  launcher?: IAppLauncher
  root?: boolean
  onRenderSync?: (props: IAppHostProps) => React.ReactElement
  onRenderError?: (host: IAppHostProps) => React.ReactElement
}

export interface IAppContainer {
  host: IAppHost
}

export const AppContainer = (props: IAppContainerProps) => {
  const hostRef = React.useRef<AppHost>(new AppHost())
  const host = hostRef.current
  host.root = props.root ? true : false
  host.router = props.router
  host.launcher = props.launcher

  React.useEffect(() => {
    hostRef.current.load(props.request)
  }, [props.request, props.router])

  return <AppHostContainer host={hostRef.current} onRenderSync={props.onRenderSync} onRenderError={props.onRenderError} />
}
