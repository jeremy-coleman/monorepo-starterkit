import { IRequest } from "@coglite/router"
import * as React from "react"
import { IAppHost } from "../models/ApplicationHost"
import { AppHost } from "../models/ApplicationHost"
import { AppHostContainer, IAppHostProps } from "./AppHost"

interface IAppProps {
  match: IRequest
}

export interface IAppContainerProps {
  request?: IAppHost["request"]
  router?: IAppHost["router"]
  launcher?: IAppHost["launcher"]
  root?: boolean
  onRenderSync?: (props: IAppHostProps) => React.ReactNode
  onRenderError?: (host: any) => React.ReactNode
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

  return (
    <AppHostContainer
      host={hostRef.current}
      onRenderSync={props.onRenderSync}
      onRenderError={props.onRenderError}
    />
  )
}
