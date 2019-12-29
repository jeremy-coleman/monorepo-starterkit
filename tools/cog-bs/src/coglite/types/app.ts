import { IEventEmitter, IPredicateFunc, ISupplierFunc, ISync } from "./io"
import { IRequest, IRouter } from "./router"

export interface IStateManager {
  state: any
  setState(state: any): void
  getState<T = any>(key: string, factory?: ISupplierFunc<T>, shouldUpdate?: IPredicateFunc<T>): T
}

export interface IAppProps {
  match: IRequest
}

export interface IAppletProps {
  host: IAppHost
}

export interface IAppLauncher {
  (request: IRequest): IAppHost | Promise<IAppHost>
}

export interface IAppIcon {
  url?: string
  text?: string
  name?: string
  component?: any
}

export interface IAppHostBaseProps {
  host: IAppHost
}

export interface IAppHost extends IEventEmitter, IStateManager {
  id: string
  sync: ISync
  root: boolean
  title: string
  icon: IAppIcon
  view: any
  path: string
  params: any
  query: any
  initialized: boolean
  router: IRouter
  canGoBack: boolean
  backRequest: IRequest
  back(): void
  setRouter(router: IRouter): void
  setTitle(title: string): void
  getUrl(request?: IRequest): string
  load(request?: IRequest): Promise<any>
  getUrl(request: IRequest): string
  open(request: IRequest): Promise<IAppHost>
  close(): void
  setRoot(root: boolean): void
  setIcon(icon: IAppIcon): void
}

export interface IAppFrame {
  containerRef: HTMLDivElement
  frameRef: HTMLIFrameElement
}

export interface IApp {
  config: IAppConfig | any
  router: IRouter
  rootAppHost: IAppHost
}

export interface IAppConfig {
  production?: boolean
  configName?: string
  basePath?: string
  fabricFontBasePath?: string
  fabricIconBasePath?: string
  buildVersion: string
  buildDate: Date
}
