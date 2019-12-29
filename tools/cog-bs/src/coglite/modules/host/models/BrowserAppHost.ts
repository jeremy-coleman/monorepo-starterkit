import { IAppHost, IRequest } from "coglite/types"
import { extname, joinPaths, stripRight } from "coglite/shared/util"
import { action } from "mobx"
//import { parse, stringify } from "qs";
import { AbstractAppHost } from "./AbstractAppHost"

import { stringify, parseQuerystring as parse } from "coglite/shared/router"

const Defaults = {
  windowAppHostKey: "__app_host_dodgy_global__",
  resolveHostMaxWait: 20000,
  resolvePollInterval: 120
}

export class BrowserAppHost extends AbstractAppHost {
  private _publicPath: string
  private _window: Window
  private _extension: string
  private _popMerge: any

  get extension() {
    return this._extension
  }

  get window() {
    return this._window
  }
  set window(value) {
    this.setWindow(value)
  }
  setWindow(value: Window) {
    this._window = value
    if (value) {
      value[Defaults.windowAppHostKey] = this
    }
  }

  get publicPath() {
    return this._publicPath
  }
  set publicPath(value) {
    this.setPublicPath(value)
  }
  setPublicPath(publicPath: string) {
    this._publicPath = publicPath
  }

  @action
  setTitle(title: string) {
    super.setTitle(title)
    this.window.document.title = title
  }

  getUrl(request: IRequest): string {
    let url = joinPaths("/", this.publicPath, request && request.path ? request.path : this.path)
    if (this._extension) {
      url += this._extension
    }

    let queryString
    if (request && request.query) {
      queryString = stringify(request.query)
    }

    if (queryString) {
      url += "?" + queryString
    }

    return url
  }

  @action
  setInitialized(initialized: boolean) {
    this._initialized = initialized
    if (!initialized) {
      this.clearRequest()
      this.window.removeEventListener("popstate", this._onPopState)
    }
  }

  get locationPath() {
    let path = this.window.location.pathname
    if (this.publicPath) {
      const publicPath = stripRight(this.publicPath, "/")
      const publicPathIdx = path.indexOf(publicPath)
      if (publicPathIdx >= 0) {
        path = path.substring(publicPathIdx + publicPath.length)
      }
    }
    const extension = extname(path)
    if (extension) {
      path = path.substring(0, path.length - extension.length)
    }
    return path
  }
  get locationQuery() {
    const search = this.window.location.search
    return search && search.length > 1 ? parse(search.substring(1)) : {}
  }

  get locationRequest() {
    return { path: this.locationPath, query: this.locationQuery }
  }

  @action
  _onPopState = (e: PopStateEvent) => {
    this._requestHistory.pop()
    this.setRequest(Object.assign({}, this.defaultRequest, this._popMerge))
    delete this._popMerge
    this._loadImpl()
  }

  _updateUrlHistory(url: string) {
    if (this.request.replace) {
      this.window.history.replaceState({ id: this.id }, null, url)
    } else {
      this.window.history.pushState({ id: this.id }, null, url)
    }
  }

  _init(request?: IRequest): Promise<any> {
    this._extension = extname(this.window.location.pathname)
    this.window.addEventListener("popstate", this._onPopState)
    return super._init(request)
  }

  _defaultLaunch(request: IRequest): Promise<IAppHost> {
    const url = this.getUrl(request)
    const newWindow = this.window.open(url, request ? request.windowName : undefined, request ? request.windowFeatures : undefined)
    return new Promise((resolve, reject) => {
      let interval
      const startTs = new Date().getTime()
      interval = setInterval(() => {
        const newHost = newWindow[Defaults.windowAppHostKey] as BrowserAppHost
        if (newHost) {
          resolve(newHost)
          clearInterval(interval)
        }
        const currentTs = new Date().getTime()
        if (currentTs - startTs > Defaults.resolveHostMaxWait) {
          clearInterval(interval)
          reject("Unable to get new app host instance")
        }
      }, Defaults.resolvePollInterval)
    })
  }

  open(request: IRequest): Promise<IAppHost> {
    return this.launcher ? Promise.resolve(this.launcher(request)) : this._defaultLaunch(request)
  }

  close() {
    this.window.close()
  }

  back() {
    if (this._requestHistory.length > 0) {
      // so we can indicate to another part of the app using this host what request we came from
      this._popMerge = { isBackNav: true, backFrom: this.request }
      this.window.history.back()
    }
  }

  addEventListener(type, handler): void {
    this.window.addEventListener(type, handler)
  }
  removeEventListener(type, handler): void {
    this.window.removeEventListener(type, handler)
  }
  emit(event) {
    this.window.dispatchEvent(event as Event)
  }

  get defaultRequest(): IRequest {
    if (this._defaultRequest) {
      return Object.assign({}, this._defaultRequest)
    }
    return this.locationRequest
  }

  set defaultRequest(value: IRequest) {
    this.setDefaultRequest(value)
  }
}
