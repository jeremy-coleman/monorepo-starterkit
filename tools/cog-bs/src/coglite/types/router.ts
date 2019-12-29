export interface IRouterManager {
  use(pathOrRouter: string | IRouter | IRequestHandler, router?: IRouter | IRequestHandler): void
}

export interface IRouter {
  handleRequest(
    req: {
      app?: any
      basePath?: string
      path?: string
      params?: { [key: string]: any }
      [key: string]: any
    },
    next?: IRequestHandler
  ): Promise<any> | any
}

export interface IRequestHandler {
  (
    req?: {
      app?: any
      basePath?: string
      path?: string
      params?: { [key: string]: any }
      [key: string]: any
    },
    next?: IRequestHandler
  ): Promise<any> | any
}

export interface IRequest {
  app?: any
  basePath?: string
  path?: string
  params?: { [key: string]: any }
  [key: string]: any
}

export interface IPathTestResult {
  match: boolean
  params?: any
}

export interface IPathTemplateOptions {
  sensitive?: boolean
  strict?: boolean
  end?: boolean
  delimiter?: string
}

export interface IExactPathOptions {
  allowTrailingSlash?: boolean
}

export interface IReactRouterOptions {
  exportKey?: string
  exact?: boolean
  allowTrailingSlash?: boolean
  requestPropKey?: string
}

export interface IRequestContext {
  request: IRequest
  next: boolean
  value?: any
}

export interface IConfig {
  (env: any): Promise<any>
}

export interface IConfigMap {
  [key: string]: IConfig
}

export interface IConfigRouterOptions {
  env?: any
  configMap: IConfigMap
}
