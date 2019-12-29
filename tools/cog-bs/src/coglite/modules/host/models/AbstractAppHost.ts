import { Sync } from "coglite/shared/models/Sync"
import { toPromise } from "coglite/shared/models/SyncUtils"
import { IAppHost, IAppIcon, IAppLauncher, IRequest, IRouter } from "coglite/types"
//import { joinPaths } from "coglite/util";
import { action, computed, observable } from "mobx"
import { stringify } from "coglite/shared/router"
import { Supplier } from "coglite/shared/models/Supplier"

export const bindHostProp = (host: IAppHost, key = "panelAppRequestSupplier") => {
  return host.getState(key, () => {
    return new Supplier<IRequest>()
  })
}

function joinPaths(...parts) {
  var separator = "/"
  var replace = new RegExp(separator + "{1,}", "g")
  return parts.join(separator).replace(replace, separator)
}

const HostComponents = new Set()

function nextId(kind) {
  let i = 1
  while (HostComponents.has(`${kind}-host-${i}`)) {
    i++
  }
  const id = `${kind}-host-${i}`
  HostComponents.add(id)
  return id
}

export abstract class AbstractAppHost implements IAppHost {
  _id: string
  _router: IRouter
  @observable _title: string
  @observable _initialized = false
  @observable _requestHistory: IRequest[] = []
  @observable _root = false

  @observable.ref _request: IRequest
  @observable.ref view: any

  @observable
  _state = {
    panelAppRequestSupplier: new Supplier()
  }

  @computed
  get getRequestSupplier() {
    return this.state.panelAppRequestSupplier
  }

  @observable
  icon = {
    url: undefined,
    text: undefined,
    name: undefined,
    component: undefined,
    setUrl: (v) => {
      this.icon.url = v
    },
    setText: (v) => {
      this.icon.text = v
    },
    setName: (v) => {
      this.icon.name = v
    },
    setComponent: (v) => {
      this.icon.component = v
    }
  }

  @observable sync = new Sync()

  _defaultRequest: IRequest
  launcher: IAppLauncher

  get id() {
    if (!this._id) {
      this._id = nextId("app")
      console.log(this._id)
    }
    return this._id
  }
  set id(value) {
    this.setId(value)
  }
  setId(id: string) {
    this._id = id
  }

  @computed
  get root() {
    return this._root
  }
  set root(value) {
    this.setRoot(value)
  }
  @action
  setRoot(root: boolean) {
    this._root = root
  }

  get router() {
    return this._router
  }
  set router(router: IRouter) {
    this.setRouter(router)
  }

  @action
  setRouter(router: IRouter) {
    if (router !== this._router) {
      this._router = router
      if (this._initialized) {
        this._loadImpl()
      }
    }
  }

  @computed
  get initialized() {
    return this._initialized
  }
  set initialized(value) {
    this.setInitialized(value)
  }

  @action
  setInitialized(initialized: boolean) {
    this._initialized = initialized
  }

  @computed
  get title() {
    return this._title
  }
  set title(value: string) {
    this.setTitle(value)
  }
  @action
  setTitle(title: string) {
    this._title = title
    // update the request history with the title
    if (this._requestHistory.length > 0) {
      this._requestHistory[this._requestHistory.length - 1].title = title
    }
  }

  get url() {
    return this.getUrl(this.request)
  }

  getUrl(request: IRequest): string {
    const initPath = request && request.path ? request.path : this.path
    let url = initPath ? joinPaths("/", initPath) : ""

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
  setView(view: any): void {
    this.view = view
  }

  @action
  protected _loadDone = (value: any) => {
    this.view = value
    this.sync.syncEnd()
    return value
  }

  @action
  protected _loadError = (error: any) => {
    console.log("App Host Load Error")
    console.warn(error)
    this.sync.syncError(error)
  }

  @action
  protected _loadImpl(): Promise<any> {
    this.sync.syncStart()
    if (this.router) {
      const req: IRequest = Object.assign({}, this.request, {
        app: this,
        host: this
      })
      // NOTE: merging query into params
      req.params = Object.assign({}, req.query, req.params)
      return Promise.resolve(this.router.handleRequest(req))
        .then(this._loadDone)
        .catch(this._loadError)
    } else {
      //this.setRouter(new Router())
      this._loadError({ code: "ILLEGAL_STATE", message: "No Router configured" })
    }
  }

  protected _init(request?: IRequest): Promise<any> {
    this.setRequest(request || this.defaultRequest)
    this._updateRequestHistory()
    return this._loadImpl()
  }

  // does nothing by default
  protected _updateUrlHistory(url: string) {}

  protected _updateRequestHistory() {
    const req = Object.assign({}, this.request, { replace: false })
    if (this.request.replace) {
      if (this._requestHistory.length > 0) {
        this._requestHistory[this._requestHistory.length - 1] = req
      }
    } else {
      this._requestHistory.push(req)
    }
  }

  @action
  load(request?: IRequest): Promise<any> {
    if (!request && this.sync.syncing) {
      return toPromise(this.sync)
    }

    if (request && request.title) {
      this.setTitle(request.title)
    }

    if (!this._initialized) {
      this._initialized = true
      return this._init(request)
    }

    const currentUrl = this.url
    this.setRequest(request || this.defaultRequest)
    const url = this.getUrl(this.request)

    if (url !== currentUrl) {
      this._updateRequestHistory()
      this._updateUrlHistory(url)
    }
    return this._loadImpl()
  }

  open(request: IRequest) {
    if (this.launcher) {
      const launchRequest = Object.assign({}, request, { opener: this })
      return Promise.resolve(this.launcher(launchRequest))
    }
    return Promise.reject({
      code: "ILLEGAL_STATE",
      message: "A launcher hasn't been configured"
    })
  }

  get defaultRequest(): IRequest {
    return Object.assign({}, this._defaultRequest)
  }
  set defaultRequest(value: IRequest) {
    this.setDefaultRequest(value)
  }
  setDefaultRequest(defaultRequest: IRequest) {
    this._defaultRequest = defaultRequest
  }

  @computed
  get request(): IRequest {
    return Object.assign({}, this._request)
  }
  set request(value) {
    this.setRequest(value)
  }

  @action
  protected setRequest(request: IRequest) {
    this._request = request
  }

  @action
  clearRequest() {
    this._request = undefined
  }

  get path() {
    const r = this.request
    return r ? r.path : undefined
  }

  get params() {
    const r = this.request
    return Object.assign({}, r ? r.query : undefined, r ? r.params : undefined)
  }

  get query() {
    const r = this.request
    return Object.assign({}, r ? r.query : undefined)
  }

  @computed
  get requestHistory() {
    const h = []
    this._requestHistory.forEach((r) => h.push(r))
    return h
  }

  @computed
  get canGoBack() {
    return this._requestHistory.length > 1
  }

  @computed
  get backRequest() {
    return this._requestHistory.length > 1 ? this._requestHistory[this._requestHistory.length - 2] : undefined
  }

  @action
  back() {
    if (this.canGoBack) {
      this._requestHistory.pop()
      const backRequest = Object.assign({}, this._requestHistory[this._requestHistory.length - 1], {
        isBackNav: true,
        backFrom: this.request
      })
      this.setRequest(backRequest)
      this._loadImpl()
    }
  }

  @action
  setIcon(icon: IAppIcon) {
    this.icon.setComponent(icon ? icon.component : undefined)
    this.icon.setName(icon ? icon.name : undefined)
    this.icon.setText(icon ? icon.text : undefined)
    this.icon.setUrl(icon ? icon.url : undefined)
  }

  abstract close()
  abstract addEventListener(type, handler): void
  abstract removeEventListener(type, handler): void
  abstract emit(event): void

  // @observable
  // protected _state = {};

  @computed
  get state() {
    return this._state
  }
  set state(value: any) {
    this.setState(value)
  }

  @action
  setState(state: any) {
    this._state = Object.assign({}, this._state, state)
  }

  @action
  getState<T = any>(key: string, factory?, shouldUpdate?) {
    let r = this._state[key]
    if ((r === undefined || r === null || (shouldUpdate && shouldUpdate(r))) && factory) {
      r = factory()
      this._state[key] = r
    }
    return r
  }

  toJSON() {
    return { id: this.id }
  }
}
