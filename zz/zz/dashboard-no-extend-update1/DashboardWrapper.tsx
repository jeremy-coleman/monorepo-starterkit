import { IAppHost } from "@coglite/app-host";
import { useMount } from "@coglite/react-hooks";
import { IRouter } from "@coglite/router";
//import { useMount } from "@coglite/app-host";
//import { IRouter } from "coglite/shared/router";
import { observer } from "mobx-react";
import * as React from "react";
import { DashboardViewContainer } from "./DashboardView";
import { ComponentFactory, Dashboard, IComponent, IComponentFactory, IDashboard } from './models';


export interface IDashboardWrapperProps {
  className?: string
  config?: any
  addApp?: IComponent["addApp"]
  loader?: () => Promise<any>
  saver?: (data: any) => Promise<any>
  saveDelay?: number
  host?: IAppHost
  router?: IRouter
  componentFactory?: IComponentFactory
  afterConfig?: (dashboard: Dashboard) => void
}

export interface IDashboardWrapper {
  dashboard: IDashboard
}

const DashboardWrapper = observer((props: IDashboardWrapperProps) => {
  let _dashboard = React.useRef(new Dashboard())
  let dashboard = _dashboard.current

  useMount(() => {
    _setFromProps(props)
  })

  React.useEffect(() => {
    _setFromProps(props)
    _load(props)
    return () => dashboard.close()
  }, [props.host, props.router, props.loader, props.saver, props.componentFactory, props.config])

  const _setFromProps = (props: IDashboardWrapperProps) => {
    //dashboard.router = props.router ? props.router : props.host ? props.host.router : RouterContext.value
    dashboard.router = props.router ? props.router : props.host.router
    dashboard.addApp = props.addApp
    dashboard.loader = props.loader
    dashboard.saver = props.saver
    dashboard.saveDelay = props.saveDelay
    dashboard.componentFactory = props.componentFactory ? props.componentFactory : ComponentFactory
  }

  const _load = (props: IDashboardWrapperProps) => {
    if (props.loader) {
      dashboard.load()
    } 
    else if (props.config) {
      dashboard.setConfig(props.config)
    if (props.afterConfig) {
        props.afterConfig(dashboard)
      }
    }
  }
  return <DashboardViewContainer className={props.className} dashboard={dashboard} host={props.host} />
})

export { DashboardWrapper };

