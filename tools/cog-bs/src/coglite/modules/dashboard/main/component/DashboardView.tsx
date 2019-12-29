import { mergeStyleSets, css } from "@uifabric/styleguide"



import { IAppHost, IEventTarget, IRequest, IRouter, ISupplierFunc } from "coglite/types"
import { observer } from "mobx-react"
import { CommandBar, IContextualMenuItem } from "@uifabric/components"
import * as React from "react"
import { ComponentGlobals } from "../ComponentGlobals"
import { createDashboardListLayoutActions, createDashboardListMenu } from "../menus/DashboardLayoutMenuHelper"
import { createCommandBarMenuItem } from "../menus/DashboardMenuHelper"
import { ComponentFactory } from "../models/ComponentFactory"
import { Dashboard } from "../models/Dashboard"
import { ComponentRemoveStore, DashboardAddStore, DashboardListClearStore, DashboardRemoveStore } from "../stores"
import { IComponentFactory, IDashboard, IDashboardList, IWindow, IWindowManager } from "../types"
import { ComponentView } from "./ComponentView"
import { Layer, LayerHost } from "./Layer"
import { ComponentRemoveDialog, DashboardAddPanel, DashboardListClearDialog, DashboardRemoveDialog } from "./modals"
import { WindowView } from "./Window"
import { SyncComponent } from "coglite/shared/components"
import { IHostAppViewProps, HostAppView } from "coglite/modules/host/views"
import { RouterContext } from "coglite/shared/services"

const DashboardStylesheet = mergeStyleSets({
  root: [
    "dashboard",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: "transparent",
      overflow: "hidden",
      selectors: {
        "&.hidden": {
          top: -1,
          left: -1,
          width: 0,
          height: 0,
          overflow: "hidden"
        }
      }
    }
  ],
  content: [
    "dashboard-content",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden",
      background: "transparent",
      selectors: {
        "&.requires-overflow": {
          overflow: "auto"
        }
      }
    }
  ],
  overlay: [
    "dashboard-overlay",
    {
      backgroundColor: "white",
      opacity: 0.1,
      selectors: {
        "&.hsplit": {
          cursor: "ew-resize"
        },
        "&.vsplit": {
          cursor: "ns-resize"
        }
      }
    }
  ]
})

interface IDashboardProps {
  dashboard: IDashboard
  className?: string
  hidden?: boolean
  host?: IEventTarget
  styles?: any //IDashboardStyles;
}

interface IDashboardOverlayProps {
  dashboard: IDashboard
  className?: string
}

type IDashboardWindowProps = {
  window: IWindow
} & IDashboardProps

export const DashboardBlockOverlay = observer((props: IDashboardOverlayProps) => {
  if (props.dashboard.blockSource) {
    return (
      <div
        className={css(props.className, props.dashboard.blockSource.type)}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 2 }}
      />
    )
  }
  return null
})

const getLayoutHostId = (props: IDashboardProps): string => {
  return `db-layer-host-${props.dashboard.id}`
}

export const DashboardWindowLayer = observer((props: IDashboardWindowProps) => {
  return (
    <Layer hostId={getLayoutHostId(props)}>
      <WindowView {...props} />
    </Layer>
  )
})

export const DashboardPortals = observer((props: IDashboardProps) => {
  return (
    <div>
      <LayerHost id={getLayoutHostId(props)} />
      {props.dashboard.windows.map((w) => {
        return <DashboardWindowLayer key={`window-layer-${w.id}`} {...props} window={w} />
      })}
    </div>
  )
})

//export const DashboardBlockOverlay = observer((props: IDashboardOverlayProps) => {

export const DashboardView = observer((props: IDashboardProps) => {
  let _ref: HTMLDivElement
  const _onRef = (ref: HTMLDivElement) => {
    _ref = ref
  }
  const _resizeToViewport = () => {
    if (_ref) {
      const bounds = _ref.getBoundingClientRect()
      props.dashboard.resize(bounds.width, bounds.height)
    }
  }

  //the ComponentGlobals variable is toggled between true and false in another class to debounce rendering
  const _onHostResize = () => {
    if (!ComponentGlobals.ignoreResize) {
      _resizeToViewport()
    }
  }
  const _addHostListener = (host: IEventTarget) => {
    if (host) {
      host.addEventListener("resize", _onHostResize)
    }
  }
  const _removeHostListener = (host: IEventTarget) => {
    if (host) {
      host.removeEventListener("resize", _onHostResize)
    }
  }

  React.useEffect(() => {
    _addHostListener(props.host)
    _resizeToViewport()

    return () => _removeHostListener(props.host)
  })

  const { dashboard } = props
  const component = dashboard.component
  const wm = component && component.isWindowManager ? (component as IWindowManager) : undefined
  const requiresOverflow = wm ? wm.isRequiresOverflow : false
  return (
    <div id={props.dashboard.id} className={css(DashboardStylesheet.root, { hidden: props.hidden })} ref={_onRef}>
      <DashboardBlockOverlay dashboard={props.dashboard} className={DashboardStylesheet.overlay} />
      <ComponentRemoveDialog remove={ComponentRemoveStore} />
      <div className={css(DashboardStylesheet.content, { overflow: requiresOverflow ? true : false })}>
        <DashboardPortals {...props} />
        <ComponentView component={component} />
      </div>
    </div>
  )
})

export const DashboardViewContainer = observer((props: IDashboardProps) => {
  const _onRenderDone = () => {
    return <DashboardView {...props} />
  }

  return <SyncComponent sync={props.dashboard.sync} syncLabel="Loading Dashboard..." onRenderDone={_onRenderDone} />
})

const dashboardListStyles = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden"
  }
})

interface IDashboardListProps {
  dashboardList: IDashboardList
  host?: IEventTarget
  className?: string
}

@observer
class DashboardListView extends React.Component<IDashboardListProps, any> {
  componentWillUnmount() {
    this.props.dashboardList.close()
  }
  render() {
    const active = this.props.dashboardList.active
    const dashboards = this.props.dashboardList.dashboards.map((db) => {
      return <DashboardView key={db.id} hidden={db !== active} dashboard={db} host={this.props.host} />
    })
    return (
      <div className={dashboardListStyles.root}>
        <DashboardAddPanel add={DashboardAddStore} />
        <DashboardRemoveDialog supplier={DashboardRemoveStore} />
        <DashboardListClearDialog supplier={DashboardListClearStore} />
        {dashboards}
      </div>
    )
  }
}

class DashboardListViewContainer extends React.Component<IDashboardListProps, any> {
  private _onRenderDone = () => {
    return <DashboardListView {...this.props} />
  }
  render() {
    return <SyncComponent sync={this.props.dashboardList.sync} syncLabel="Loading Dashboards..." onRenderDone={this._onRenderDone} />
  }
}

export type IDashboardListAppViewProps = {
  dashboardList: IDashboardList
} & IHostAppViewProps

export let DashboardListCommandBar = observer((props: IDashboardListAppViewProps) => {
  const { dashboardList } = props
  const items: IContextualMenuItem[] = [createCommandBarMenuItem(dashboardList)]
  const layoutItem = createDashboardListMenu(dashboardList)
  if (layoutItem) {
    items.push(layoutItem)
  }
  const actionItems = createDashboardListLayoutActions(dashboardList)
  if (actionItems) {
    actionItems.forEach((i) => items.push(i))
  }
  const commandBarProps = Object.assign({}, props.commandBarProps)
  commandBarProps.items = commandBarProps.items ? commandBarProps.items.concat(items) : items
  return <CommandBar {...commandBarProps} />
})

export let DashboardListAppView = observer((props: IDashboardListAppViewProps) => {
  React.useEffect(() => {
    props.dashboardList.load()
  })

  const _onRenderMenu = () => {
    return <DashboardListCommandBar {...props} />
  }
  return (
    <HostAppView {...props} onRenderMenu={_onRenderMenu}>
      <DashboardListViewContainer dashboardList={props.dashboardList} host={props.host} />
      {props.children}
    </HostAppView>
  )
})

interface IDashboardWrapperProps {
  className?: string
  config?: any
  addApp?: IRequest | ISupplierFunc<IRequest>
  loader?: () => Promise<any>
  saver?: (data: any) => Promise<any>
  saveDelay?: number
  host?: IAppHost
  router?: IRouter
  componentFactory?: IComponentFactory
  afterConfig?: (dashboard: IDashboard) => void
}

interface IDashboardWrapper {
  dashboard: IDashboard
}

class DashboardWrapper extends React.Component<IDashboardWrapperProps, any> implements IDashboardWrapper {
  private _dashboard: Dashboard = new Dashboard()
  get dashboard() {
    return this._dashboard
  }
  constructor(props: IDashboardWrapperProps) {
    super(props)
    this._setFromProps(this.props)
  }
  private _setFromProps(props: IDashboardWrapperProps) {
    this.dashboard.router = props.router ? props.router : props.host ? props.host.router : RouterContext.value
    this.dashboard.addApp = props.addApp
    this.dashboard.loader = props.loader
    this.dashboard.saver = props.saver
    this.dashboard.saveDelay = props.saveDelay
    this.dashboard.componentFactory = props.componentFactory ? props.componentFactory : ComponentFactory
  }
  private _load(props: IDashboardWrapperProps) {
    if (props.loader) {
      this.dashboard.load()
    } else if (props.config) {
      this.dashboard.setConfig(props.config)
      if (props.afterConfig) {
        props.afterConfig(this.dashboard)
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    this.dashboard.close()
    this._setFromProps(nextProps)
    this._load(nextProps)
  }
  componentWillMount() {
    this._load(this.props)
  }
  componentWillUnmount() {
    this.dashboard.close()
  }
  render() {
    return <DashboardViewContainer className={this.props.className} dashboard={this.dashboard} host={this.props.host} />
  }
}

export { IDashboardWrapper, IDashboardWrapperProps, DashboardWrapper }
export { DashboardListViewContainer, DashboardListView }
