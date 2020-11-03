
import { action, computed, observable, makeObservable } from "mobx";
import { IRouter, IRequest, parseQuerystring } from "@coglite/router";
import { Sync , toPromise } from "./Sync";
//import { EventEmitter } from "./EventEmitter";
import { Supplier } from "./Supplier";

import {EventEmitter, createEmitter} from './Mitt'

const Defaults = {
  windowAppHostKey: "__app_host_dodgy_global__",
  resolveHostMaxWait: 20000,
  resolvePollInterval: 120,
};

function joinPaths(...parts) {
  var separator = "/";
  var replace = new RegExp(separator + "{1,}", "g");
  return parts.join(separator).replace(replace, separator);
}

const extname = (path: string, noDelim = false): string => {
  if (path) {
    const lastExtIdx = path.lastIndexOf(".");
    if (lastExtIdx >= 0) {
      return path.substring(noDelim ? lastExtIdx + 1 : lastExtIdx);
    }
  }
  return "";
};

const removeLastSlash = (v) => {
  if (v.endsWith("/")) {
    return String(v.slice(0, v.length - 1));
  } else return String(v);
};

const HostComponents = new Set();

function nextId(kind) {
  let i = 1;
  while (HostComponents.has(`${kind}-host-${i}`)) {
    i++;
  }
  const id = `${kind}-host-${i}`;
  HostComponents.add(id);
  return id;
}

export type IAppHost = AppHost

export type WindowLike = Partial<Window> & {
  [key: string]: any
  open(args: any): any | Promise<any>
}

export class AppHost {
  _publicPath: string;
  _window: WindowLike
  _extension: string;
  _popMerge: any;
  _id: string;
  _router: IRouter;

  _title: string;
  _initialized = false;
  _requestHistory: IAppHost["request"][] = [];
  _root = false;
  _request: IAppHost["request"];
  view: any;
  sync = new Sync();
  //@observable _state = {};

  //@observable icon = new AppIcon();

  icon = observable({
    url: undefined,
    text: undefined,
    name: undefined,
    component: undefined,
  });

  _defaultRequest: IRequest;
  launcher: (request: IRequest) => IAppHost | Promise<IAppHost>;


  _state = {
    panelAppRequestSupplier: new Supplier(),
    // used by the listing user app (UserListingsApp.tsx)
    // this is the async value that's resolved in conjunction with dialog shown from launching an app
    // need to replace this with a usable local value and async merge behavior (if at all)
    appLaunchSync: new Sync()
  };


  constructor() {
    makeObservable(this, {
      _title: observable,
      _initialized: observable,
      _requestHistory: observable,
      _root: observable,
      _request: observable.ref,
      view: observable.ref,
      sync: observable,
      _state: observable,
      getRequestSupplier: computed,
      isWindowLike: computed,
      isNativeDomWindow: computed,
      isVirtualWindow: computed,
      root: computed,
      setRoot: action,
      setRouter: action,
      initialized: computed,
      setInitialized: action,
      title: computed,
      setTitle: action,
      setView: action,
      _loadDone: action,
      _loadError: action,
      _loadImpl: action,
      load: action,
      request: computed,
      setRequest: action,
      clearRequest: action,
      requestHistory: computed,
      canGoBack: computed,
      backRequest: computed,
      back: action,
      setIcon: action,
      state: computed,
      setState: action,
      getState: action,
      _onPopState: action
    });
  }


  get getRequestSupplier() {
    return this._state.panelAppRequestSupplier
  }

  get id() {
    if (!this._id) {
      this._id = nextId("app");
    }
    return this._id;
  }

  set id(value) {
    this.setId(value);
  }

  setId(id: string) {
    this._id = id;
  }

  get extension() {
    return this._extension;
  }

  get isWindowLike() {
    return this.window;
  }

  get isNativeDomWindow() {
    return this.window && this.window instanceof Window;
  }

  get isVirtualWindow() {
    return this.window && !this.isNativeDomWindow;
  }

  get isElectronWindow() {
    //not implemneted yet
    return false;
  }

  get root() {
    return this._root;
  }

  set root(value) {
    this.setRoot(value);
  }

  setRoot(root: boolean) {
    this._root = root;
  }

  get router() {
    if (this.isVirtualWindow) {
      return this._window.router;
    }

    return this._router;
  }

  set router(router: IRouter) {
    this.setRouter(router);
  }

  setRouter(router: IRouter) {
    if (this.isVirtualWindow) {
      this._window.setRouter(router);
      return void 0;
    }

    //app host
    if (router !== this._router) {
      this._router = router;
      if (this._initialized) {
        this._loadImpl();
      }
    }
  }

  get initialized() {
    return this._initialized;
  }
  set initialized(value) {
    this.setInitialized(value);
  }

  setInitialized(initialized: boolean) {
    this._initialized = initialized;

    if (!initialized && this.window instanceof Window) {
      this.clearRequest();
      this.window.removeEventListener("popstate", this._onPopState);
    }
  }

  get title() {
    return this._title;
  }
  set title(value: string) {
    this.setTitle(value);
  }

  setTitle(title: string) {
    this._title = title;
    // update the request history with the title
    if (this._requestHistory.length > 0) {
      this._requestHistory[this._requestHistory.length - 1].title = title;
    }

    //browser app host
    if (this.window && this.window.document) {
      this.window.document.title = title;
    }
  }

  get url() {
    return this.getUrl(this.request);
  }

  getUrl(request: IRequest): string {
    const { path = this.path, query } = request;

    let url =
      this.window instanceof Window
        ? joinPaths("/", this.publicPath, path)
        : joinPaths("/", path);

    if (this._extension) {
      url += this._extension;
    }
    return url;

    //i started to re-implement but realized we never use this anyway
    //og
    // let queryString;
    // if (query) {
    //   queryString = stringify(query);
    // }
    // if (queryString) {
    //   url += "?" + queryString;
    // }
    //unfinished new
    // let url = new URL(joinPaths("/", path))
    // url.searchParams
  }

  setView(view: any): void {
    this.view = view;
  }

  _loadDone = (value: any) => {
    this.view = value;
    this.sync.syncEnd();
    return value;
  };

  _loadError = (error: any) => {
    console.log("App Host Load Error");
    console.warn(error);
    this.sync.syncError(error);
  };

  _loadImpl(): Promise<any> {
    this.sync.syncStart();
    if (this.router) {
      const req: IRequest = Object.assign({}, this.request, {
        app: this,
        host: this,
      });
      // NOTE: merging query into params
      req.params = Object.assign({}, req.query, req.params);
      return Promise.resolve(this.router.handleRequest(req))
        .then(this._loadDone)
        .catch(this._loadError);
    } else {
      //this.setRouter(new Router())
      this._loadError({
        code: "ILLEGAL_STATE",
        message: "No Router configured",
      });
    }
  }

  _init(request?: IRequest): Promise<any> {
    // if window && browser app host
    if (this.window && this.window instanceof Window) {
      this._extension = extname(this.window.location.pathname);
      this.window.addEventListener("popstate", this._onPopState);
    }

    this.setRequest(request || this.defaultRequest);
    this._updateRequestHistory();
    return this._loadImpl();
  }

  _updateUrlHistory(url: string) {
    if (this.window instanceof Window) {
      if (this.request.replace) {
        this.window.history.replaceState({ id: this.id }, null, url);
      } else {
        this.window.history.pushState({ id: this.id }, null, url);
      }
    }
  }

  _updateRequestHistory() {
    const req = Object.assign({}, this.request, { replace: false });
    if (this.request.replace) {
      if (this._requestHistory.length > 0) {
        this._requestHistory[this._requestHistory.length - 1] = req;
      }
    } else {
      this._requestHistory.push(req);
    }
  }

  load(request?: IRequest): Promise<any> {
    if (!request && this.sync.syncing) {
      return toPromise(this.sync);
    }

    if (request && request.title) {
      this.setTitle(request.title);
    }

    if (!this._initialized) {
      this._initialized = true;
      return this._init(request);
    }

    const currentUrl = this.url;
    this.setRequest(request || this.defaultRequest);
    const url = this.getUrl(this.request);

    if (url !== currentUrl) {
      this._updateRequestHistory();
      this._updateUrlHistory(url);
    }
    return this._loadImpl();
  }

  open(request: IRequest) {
    if (this.isVirtualWindow) {
      return this._window.open(request).then((w) => {
        return w.appHost;
      });
    }

    if (this.isNativeDomWindow) {
      return this.launcher
        ? Promise.resolve(this.launcher(request))
        : this._defaultLaunch(request);
    }

    if (this.launcher) {
      const launchRequest = Object.assign({}, request, { opener: this });
      return Promise.resolve(this.launcher(launchRequest));
    }
    // fall back to load if no launcher configured (abstract impl)
    return this.load(request);

    //(default app host impl)
    // return Promise.reject({
    //   code: "ILLEGAL_STATE",
    //   message: "A launcher hasn't been configured",
    // });
  }

  get defaultRequest(): IRequest {
    if (this.isVirtualWindow) {
      return {
        path: this._window.path,
        params: this._window.params,
        query: this._window.query,
      };
    }

    if (this.isNativeDomWindow) {
      if (this._defaultRequest) {
        return Object.assign({}, this._defaultRequest);
      }
      return this.locationRequest;
    }
    //app host impl
    return Object.assign({}, this._defaultRequest);
  }

  set defaultRequest(value: IRequest) {
    this.setDefaultRequest(value);
  }

  setDefaultRequest(defaultRequest: IRequest) {
    this._defaultRequest = defaultRequest;
  }

  get request(): IRequest {
    return Object.assign({}, this._request);
  }

  set request(value) {
    this.setRequest(value);
  }

  setRequest(request: IRequest) {
    this._request = request;

    if (this.isVirtualWindow) {
      if (
        request &&
        request.replace &&
        !request.noUpdate &&
        !request.noSaveLocation
      ) {
        this._window.setPath(request.path);
        this._window.setParams(request.params);
        this._window.setQuery(request.query);
      }
    }
  }

  clearRequest() {
    this._request = undefined;
  }

  get path() {
    const r = this.request;
    return r ? r.path : undefined;
  }

  get params() {
    const r = this.request;
    return Object.assign({}, r ? r.query : undefined, r ? r.params : undefined);
  }

  get query() {
    const r = this.request;
    return Object.assign({}, r ? r.query : undefined);
  }

  get requestHistory() {
    const h = [];
    this._requestHistory.forEach((r) => h.push(r));
    return h;
  }

  get canGoBack() {
    return this._requestHistory.length > 1;
  }

  get backRequest() {
    return this._requestHistory.length > 1
      ? this._requestHistory[this._requestHistory.length - 2]
      : undefined;
  }

  back() {
    //browser app host impl
    if (this.canGoBack && this.isNativeDomWindow) {
      // so we can indicate to another part of the app using this host what request we came from
      this._popMerge = { isBackNav: true, backFrom: this.request };
      this.window.history.back();
      return void 0;
    }

    if (this.canGoBack) {
      this._requestHistory.pop();
      const backRequest = Object.assign(
        {},
        this._requestHistory[this._requestHistory.length - 1],
        {
          isBackNav: true,
          backFrom: this.request,
        }
      );
      this.setRequest(backRequest);
      this._loadImpl();
    }
  }

  setIcon(icon: IAppHost["icon"]) {
    this.icon.component = icon.component || undefined;
    this.icon.name = icon.name || undefined;
    this.icon.text = icon.text || undefined;
    this.icon.url = icon.url || undefined;
  }

  get state() {
    return this._state;
  }
  set state(value: any) {
    this.setState(value);
  }

  setState(state: any) {
    this._state = Object.assign({}, this._state, state);
  }

  getState<T = any>(key: string, factory?, shouldUpdate?) {
    let r = this._state[key];
    if (
      (r === undefined || r === null || (shouldUpdate && shouldUpdate(r))) &&
      factory
    ) {
      r = factory();
      this._state[key] = r;
    }
    return r;
  }

  toJSON() {
    return { id: this.id };
  }

  protected _events: EventEmitter;

  get events(): EventEmitter {
    if (!this._events) {
      this._events = createEmitter()  //new EventEmitter();
    }
    return this._events;
  }

  set events(value: EventEmitter) {
    this.setEvents(value);
  }

  setEvents(events: EventEmitter) {
    this._events = events;
  }


  close() {
    if (this.window) {
      this.window.close();
    }
    else return void(0)
  }

  addEventListener(type, handler): void {
    if (this.isNativeDomWindow) {
      this.window.addEventListener(type, handler);
      return void 0;
    }
    this.events.on(type, handler);
  }

  removeEventListener(type, handler): void {
    if (this.isNativeDomWindow) {
      this.window.removeEventListener(type, handler);
      return void 0;
    }

    this.events.off(type, handler);
  }

  emit(event): void {
    if (this.isNativeDomWindow) {
      this.window.dispatchEvent(event as Event);
      return void 0;
    }

    this.events.emit(event);
  }

  //opens new window
  _defaultLaunch(request: AppHost["request"]): Promise<IAppHost> {
    const url = this.getUrl(request);
    const newWindow = this.window.open(
      url,
      request ? request.windowName : undefined,
      request ? request.windowFeatures : undefined
    );
    return new Promise((resolve, reject) => {
      let interval;
      const startTs = new Date().getTime();
      interval = setInterval(() => {
        const newHost = newWindow[Defaults.windowAppHostKey] as AppHost;
        if (newHost) {
          resolve(newHost);
          clearInterval(interval);
        }
        const currentTs = new Date().getTime();
        if (currentTs - startTs > Defaults.resolveHostMaxWait) {
          clearInterval(interval);
          reject("Unable to get new app host instance");
        }
      }, Defaults.resolvePollInterval);
    });
  }

  _onPopState = (e: PopStateEvent) => {
    this._requestHistory.pop();
    this.setRequest(Object.assign({}, this.defaultRequest, this._popMerge));
    delete this._popMerge;
    this._loadImpl();
  };

  get publicPath() {
    return this._publicPath;
  }
  set publicPath(value) {
    this.setPublicPath(value);
  }
  setPublicPath(publicPath: string) {
    this._publicPath = publicPath;
  }

  get locationPath() {
    let path = this.window.location.pathname;
    if (this.publicPath) {
      const publicPath = removeLastSlash(this.publicPath);
      //const publicPath = stripRight(this.publicPath, "/");

      const publicPathIdx = path.indexOf(publicPath);
      if (publicPathIdx >= 0) {
        path = path.substring(publicPathIdx + publicPath.length);
      }
    }
    const extension = extname(path);
    if (extension) {
      path = path.substring(0, path.length - extension.length);
    }
    return path;
  }

  get locationQuery() {
    const search = this.window.location.search;
    return search && search.length > 1 ? parseQuerystring(search.substring(1)) : {};
  }

  get locationRequest() {
    return { path: this.locationPath, query: this.locationQuery };
  }

  get window() {
    return this._window;
  }
  set window(value) {
    this.setWindow(value);
  }

  setWindow(value) {
    this._window = value;
    if (value) {
      value[Defaults.windowAppHostKey] = this;
    }
  }
}
