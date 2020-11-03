import { AppHost, IAppHost } from "@coglite/app-host";
import { Sync } from "@coglite/app-host";
import { IRequest, IRouter } from "@coglite/router";
import { IConsumerFunc, IPredicateFunc, isFunction, ISupplierFunc } from "@coglite/app-host";
import {
  action,
  autorun,
  computed,
  IReactionDisposer,
  observable,
  reaction,
  makeObservable,
} from "mobx";
import { when } from "when-switch";

export type IComponent = Window | Dashboard | DashboardList | Grid | Stack | VSplit | HSplit;

export type IComponentFactory = typeof ComponentFactory;
export type IWindowManager = Stack | Grid;
export type IDashboardList = DashboardList;
export type IDashboard = Dashboard;
export type IHSplit = HSplit;
export type IVSplit = VSplit;
export type IGrid = Grid;
export type IWindow = Window;
export type IWindowSettings = WindowSettings;
export type IStack = Stack;


export const ComponentGlobals = {
  ignoreResize: false
};


export enum ComponentTypes {
  dashboard = "dashboard",
  dashboardList = "dashboardList",
  stack = "stack",
  grid = "grid",
  hsplit = "hsplit",
  vsplit = "vsplit",
  window = "window",
  basic = "basic"
}

export enum WindowResizeType {
  top = "top",
  right = "right",
  bottom = "bottom",
  left = "left",
  topRight = "topRight",
  topLeft = "topLeft",
  bottomRight = "bottomRight",
  bottomLeft = "bottomLeft"
}

export const Defaults = {
  offset: 0.5,
  minItemHeight: 28,
  minItemWidth: 28,
  splitterHeight: 1,
  splitterWidth: 1,
  moveTimeout: 200,
  cellSize: 80,
  cellMargin: 8,
  defaultWindowColSpan: 6,
  defaultWindowRowSpan: 4
}

const dispatchWindowResize = () => {
    ComponentGlobals.ignoreResize = true;
    window && window.dispatchEvent(new CustomEvent("resize", {bubbles: true, cancelable: true}));
    ComponentGlobals.ignoreResize = false;
};

export { dispatchWindowResize };


type WindowRequest = {
  name?: any;
  title?: any;
  transient?: boolean;
  opener?: IAppHost;
} & IRequest;

export type IStackConfig = {
  type?: string;
  activeIndex?: number;
  windows?: IWindowConfig[];
  closeDisabled?: boolean;
};

export type IWindowConfig = {
  type?: string;
  title?: string;
  closeDisabled?: boolean;
  path?: string;
  query?: any;
  params?: any;
  contentHidden?: boolean;
  settings?: any;
};

export type IGridBounds = {
  rowIndex?: number;
  rowSpan?: number;
  colIndex?: number;
  colSpan?: number;
};

export type IGridConfig = {
  type?: string;
  cellSize?: number;
  cellMargin?: number;
  defaultWindowColSpan?: number;
  defaultWindowRowSpan?: number;
  windows?: IWindowConfig[];
  closeDisabled?: boolean;
  maximizedIndex?: number;
  activeIndex?: number;
};

interface IHSplitConfig {
  type?: string;
  offset?: number;
  left?: any;
  right?: any;
  leftWidth?: number;
  minItemWidth?: number;
}

interface IVSplitConfig {
  type?: string;
  offset?: number;
  top?: any;
  bottom?: any;
  topHeight?: number;
  minItemHeight?: number;
}

//type K = "window" | "hsplit" | "vsplit" | "stack" | "grid" | "basic";

class ComponentRegistry {
  record = new Set();
  next(kind: string) {
    let i = 1;
    while (this.record.has(`${kind}-comp-${i}`)) {
      i++;
    }
    const id = `${kind}-comp-${i}`;
    this.record.add(id);
    return id;
  }
}

const componentRegistry = new ComponentRegistry();

var NotConfiguredComponentFactory: IComponentFactory = (type: string) => {
  throw {
    code: "ILLEGAL_STATE",
    message: "A component factory has not been configured"
  };
};

// const ComponentFactory1 = (kind: K) => {
//      switch(kind) {
//         case 'window': return new Window()
//         case 'stack': return new Stack()
//         case 'hsplit': return new HSplit()
//         case 'vsplit': return new VSplit()
//         case 'grid': return new Grid()
//         default: return new Stack()
//     }
// };

const ComponentFactory = (kind: keyof typeof ComponentTypes) => {
  return when(kind)
    .is("window", () => new Window())
    .is("stack", () => new Stack())
    .is("basic", () => new Stack())
    .is("hsplit", () => new HSplit())
    .is("vsplit", () => new VSplit())
    .is("grid", () => new Grid())
    .else(() => new Stack());
};

class Dashboard {
  _id: string;
  parent: IComponent;
  _componentFactory: IComponentFactory;
  _addApp: IRequest | ISupplierFunc<IRequest>;
  _router: IRouter;
  _closeDisabled: boolean;
  _needsOverflow: boolean;
  _x: number = 0;
  _y: number = 0;
  _width: number = 0;
  _height: number = 0;
  sync = new Sync();
  _title: string;
  _component: IComponent;
  _drag: IWindow;
  _blockSource: IComponent;

  _saveDelay: number = 1000;
  loader: () => Promise<any> | any;
  saver: (data: any) => Promise<any> | any;
  _configSaveDisposer: IReactionDisposer;

  constructor() {
    makeObservable(this, {
      parent: observable.ref,
      _componentFactory: observable.ref,
      _addApp: observable.ref,
      _router: observable.ref,
      _closeDisabled: observable,
      _needsOverflow: observable,
      _x: observable,
      _y: observable,
      _width: observable,
      _height: observable,
      sync: observable,
      _title: observable,
      _component: observable,
      _drag: observable.ref,
      _blockSource: observable.ref,
      isOverflow: computed,
      resetViewport: action,
      root: computed,
      x: computed,
      rx: computed,
      y: computed,
      ry: computed,
      width: computed,
      height: computed,
      resize: action,
      position: action,
      setViewport: action,
      addApp: computed,
      componentFactory: computed,
      setComponentFactory: action,
      closeDisabled: computed,
      setCloseDisabled: action,
      setAddApp: action,
      router: computed,
      setRouter: action,
      dashboardList: computed,
      component: computed,
      setComponent: action,
      windows: computed,
      drag: computed,
      dragStart: action,
      dragEnd: action,
      blockSource: computed,
      setBlockSource: action,
      clearBlockSource: action,
      title: computed,
      setTitle: action,
      dashboard: computed,
      componentConfig: computed,
      setComponentConfig: action,
      config: computed,
      setConfig: action,
      remove: action,
      replace: action,
      _loadDone: action,
      _loadError: action,
      load: action,
      clear: action,
      close: action
    });
  }

  get type() {
    return ComponentTypes.dashboard;
  }

  get id() {
    if (!this._id) {
      this._id = componentRegistry.next(this.type);
      console.log(this._id);
    }
    return this._id;
  }

  get isWindowManager() {
    return false;
  }

  get isOverflow() {
    return false;
  }

  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  get root() {
    return this.parent ? this.parent.root : this;
  }

  get x() {
    return this._x;
  }

  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  get y() {
    return this._y;
  }

  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  get addApp() {
    if (this._addApp !== undefined) {
      return this._addApp;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.addApp : undefined;
  }

  set addApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this.setAddApp(addApp);
  }

  get componentFactory(): IComponentFactory {
    if (this._componentFactory !== undefined) {
      return this._componentFactory;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.componentFactory : NotConfiguredComponentFactory;
  }
  set componentFactory(value) {
    this.setComponentFactory(value);
  }
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  get closeDisabled(): boolean {
    if (this._closeDisabled !== undefined) {
      return this._closeDisabled;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.closeDisabled : false;
  }
  set closeDisabled(value) {
    this.setCloseDisabled(value);
  }
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  get router() {
    if (this._router !== undefined) {
      return this._router;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.router : undefined;
  }
  set router(value) {
    this.setRouter(value);
  }

  setRouter(router: IRouter) {
    this._router = router;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = undefined;
    }
  }

  visit(callback: IConsumerFunc<IComponent>): void {
    callback(this);
  }

  findFirst(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    if (predicate(this)) {
      return this;
    }
    return this._findFirstChild(predicate);
  }

  findAll(predicate: IPredicateFunc<IComponent>): IComponent[] {
    let r = [];
    if (predicate(this)) {
      r.push(this);
    }
    const tr = this._findAllChildren(predicate);
    if (tr && tr.length > 0) {
      r = r.concat(tr);
    }
    return r;
  }

  get dashboardList(): IDashboardList {
    return this.parent as IDashboardList;
  }

  get component() {
    return this._component;
  }
  set component(value) {
    this.setComponent(value);
  }

  setComponent(component: IComponent) {
    if (component !== this._component) {
      if (component && component.parent !== this) {
        component.removeFromParent();
      }
      this._component = component;
      if (this._component) {
        this._component.parent = this;
      }
      this._setComponentViewport();
    }
  }

  get windows(): IWindow[] {
    return this.findAll(c => c.type === ComponentTypes.window) as IWindow[];
  }

  get drag() {
    return this._drag;
  }
  dragStart(drag: IWindow) {
    this._drag = drag;
  }
  dragEnd(): void {
    this._drag = undefined;
  }

  get blockSource() {
    return this._blockSource;
  }
  set blockSource(value) {
    this.setBlockSource(value);
  }

  setBlockSource(blockSource: IComponent) {
    this._blockSource = blockSource;
  }
  clearBlockSource() {
    this._blockSource = undefined;
  }

  get title() {
    return this._title;
  }
  set title(value) {
    this.setTitle(value);
  }

  setTitle(title: string) {
    this._title = title;
  }

  get dashboard() {
    return this;
  }

  get componentConfig() {
    return this._component ? this._component.config : undefined;
  }

  set componentConfig(config: any) {
    this.setComponentConfig(config);
  }

  setComponentConfig(config: any) {
    if (config) {
      const c = this.componentFactory(config.type);
      this.setComponent(c);
      c.setConfig(config);
    } else {
      this.setComponent(undefined);
    }
  }

  get config() {
    return {
      type: this.type,
      title: this.title,
      closeDisabled: this._closeDisabled,
      component: this.componentConfig
    };
  }
  set config(value) {
    this.setConfig(value);
  }

  setConfig(value: IDashboard["config"]) {
    this.sync.syncStart();
    this.setTitle(value ? value.title : undefined);
    this.setCloseDisabled(value ? value.closeDisabled : undefined);
    this.setComponentConfig(value ? value.component : undefined);
    this.sync.syncEnd();
  }

  remove(comp: IComponent) {
    if (comp && this._component && comp === this._component) {
      this.setComponent(undefined);
      this.removeFromParent();
    }
  }

  replace(newComp: IComponent, oldComp: IComponent): void {
    if (oldComp === this._component) {
      this.setComponent(newComp);
    }
  }

  _saveConfig = (config: any) => {
    this.saver(config);
  };

  get saveDelay() {
    return this._saveDelay;
  }
  set saveDelay(value: number) {
    if (!isNaN(value) && value >= 0) {
      this._saveDelay = value;
    }
  }

  _loadDone = (config: IDashboard["config"]) => {
    this.setConfig(config);
    if (this.saver) {
      this._configSaveDisposer = reaction(
        () => {
          return this.config;
        },
        this._saveConfig,
        { delay: this.saveDelay }
      );
    }
    this.sync.syncEnd();
  };

  _loadError = (error: any) => {
    console.error(error);
    this.setConfig(undefined);
    this.sync.syncError(error);
  };

  load(): Promise<any> {
    if (this._configSaveDisposer) {
      this._configSaveDisposer();
      delete this._configSaveDisposer;
    }
    if (this.loader) {
      this.sync.syncStart();
      return Promise.resolve(this.loader())
        .then(this._loadDone)
        .catch(this._loadError);
    }
    return Promise.reject({
      code: "ILLEGAL_STATE",
      message: "A loader has not been configured"
    });
  }

  clear() {
    this.setComponent(undefined);
  }

  _visitChildren(callback: IConsumerFunc<IComponent, IComponent[]>) {
    if (this._component) {
      this._component.visit(callback);
    }
  }

  _findFirstChild(predicate: any) {
    if (this._component) {
      return this._component.findFirst(predicate);
    }
  }

  _findAllChildren(predicate: IPredicateFunc<IComponent, IComponent[]>): IComponent[] {
    if (this._component) {
      return this._component.findAll(predicate);
    }
  }

  close() {
    if (this._component) {
      this._component.close();
    }
  }

  _setComponentViewport = () => {
    if (this._component) {
      this._component.setViewport(0, 0, this.width, this.height);
    }
  };

  _setViewportDisposer = autorun(this._setComponentViewport);

  toJSON() {
    return this.config;
  }
}

class DashboardList {
  _id: string;
  parent: IComponent;
  _componentFactory: IComponentFactory;
  _addApp: IRequest | ISupplierFunc<IRequest>;
  _router: IRouter;
  _closeDisabled: boolean;
  _needsOverflow: boolean;
  _x: number = 0;
  _y: number = 0;
  _width: number = 0;
  _height: number = 0;
  sync = new Sync();
  _activeIndex: number = -1;
  dashboards: IDashboard[] = [];
  _createDefaultDashboard: boolean = true;
  _saveDelay: number = 1000;
  loader: () => Promise<any>;
  saver: (data: any) => Promise<any> | any;
  _configSaveDisposer: IReactionDisposer;

  constructor() {
    makeObservable(this, {
      parent: observable.ref,
      _componentFactory: observable.ref,
      _addApp: observable.ref,
      _router: observable.ref,
      _closeDisabled: observable,
      _needsOverflow: observable,
      _x: observable,
      _y: observable,
      _width: observable,
      _height: observable,
      sync: observable,
      _activeIndex: observable,
      dashboards: observable,
      _createDefaultDashboard: observable,
      isOverflow: computed,
      resetViewport: action,
      root: computed,
      x: computed,
      rx: computed,
      y: computed,
      ry: computed,
      width: computed,
      height: computed,
      resize: action,
      position: action,
      setViewport: action,
      addApp: computed,
      componentFactory: computed,
      setComponentFactory: action,
      closeDisabled: computed,
      setCloseDisabled: action,
      setAddApp: action,
      router: computed,
      setRouter: action,
      dashboard: computed,
      createDefaultDashboard: computed,
      setCreateDefaultDashboard: action,
      dashboardCount: computed,
      activeIndex: computed,
      setActiveIndex: action,
      active: computed,
      setActive: action,
      config: computed,
      setConfig: action,
      addFromConfig: action,
      add: action,
      _loadDone: action,
      _loadError: action,
      load: action,
      close: action,
      clear: action
    });
  }

  get type() {
    return ComponentTypes.dashboardList;
  }

  get id() {
    if (!this._id) {
      this._id = componentRegistry.next(this.type);
      console.log(this._id);
    }
    return this._id;
  }

  get isWindowManager() {
    return false;
  }

  get isOverflow() {
    return false;
  }

  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  get root() {
    return this.parent ? this.parent.root : this;
  }

  get x() {
    return this._x;
  }

  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  get y() {
    return this._y;
  }

  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  get addApp() {
    if (this._addApp !== undefined) {
      return this._addApp;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.addApp : undefined;
  }

  set addApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this.setAddApp(addApp);
  }

  get componentFactory(): IComponentFactory {
    if (this._componentFactory !== undefined) {
      return this._componentFactory;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.componentFactory : NotConfiguredComponentFactory;
  }
  set componentFactory(value) {
    this.setComponentFactory(value);
  }
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  get closeDisabled(): boolean {
    if (this._closeDisabled !== undefined) {
      return this._closeDisabled;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.closeDisabled : false;
  }
  set closeDisabled(value) {
    this.setCloseDisabled(value);
  }
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  get router() {
    if (this._router !== undefined) {
      return this._router;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.router : undefined;
  }
  set router(value) {
    this.setRouter(value);
  }

  setRouter(router: IRouter) {
    this._router = router;
  }

  get dashboard(): IDashboard {
    const p = this.parent;
    if (p === this) {
      console.warn("-- Dashboard Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.dashboard : undefined;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = undefined;
    }
  }

  replace(newItem: IComponent, oldItem: IComponent): void {
    // does nothing by default
  }

  _visitChildren(callback: IConsumerFunc<IComponent>): void {
    // does nothing by default
  }

  visit(callback: IConsumerFunc<IComponent>): void {
    callback(this);
  }

  findFirst(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    if (predicate(this)) {
      return this;
    }
    return this._findFirstChild(predicate);
  }

  findAll(predicate: IPredicateFunc<IComponent>): IComponent[] {
    let r = [];
    if (predicate(this)) {
      r.push(this);
    }
    const tr = this._findAllChildren(predicate);
    if (tr && tr.length > 0) {
      r = r.concat(tr);
    }
    return r;
  }

  get createDefaultDashboard() {
    return this._createDefaultDashboard;
  }
  set createDefaultDashboard(value) {
    this.setCreateDefaultDashboard(value);
  }

  setCreateDefaultDashboard(createDefaultDashboard: boolean) {
    this._createDefaultDashboard = createDefaultDashboard;
  }

  get dashboardCount() {
    return this.dashboards ? this.dashboards.length : 0;
  }

  get activeIndex() {
    return this._activeIndex || 0;
  }
  set activeIndex(value) {
    this.setActiveIndex(value);
  }

  setActiveIndex(value: number) {
    if (value !== this._activeIndex) {
      this._activeIndex = value;
    }
  }

  get active(): IDashboard {
    return this.activeIndex >= 0 && this.activeIndex < this.dashboards.length
      ? this.dashboards[this.activeIndex]
      : undefined;
  }
  set active(value) {
    this.setActive(value);
  }

  setActive(value: IDashboard) {
    this.activeIndex = this.dashboards.indexOf(value);
  }

  get config() {
    return {
      type: this.type,
      activeIndex: this.activeIndex,
      dashboards: this.dashboards.map(d => d.config),
      closeDisabled: this._closeDisabled
    };
  }
  set config(value) {
    this.setConfig(value);
  }

  setConfig(value: IDashboardList["config"]) {
    this.dashboards.forEach(d => d.close());
    this.dashboards = [];
    if (value && value.dashboards && value.dashboards.length > 0) {
      value.dashboards.forEach((dc: any) => {
        this.addFromConfig(dc);
      });
    }
    this.setActiveIndex(value && !isNaN(value.activeIndex) ? value.activeIndex : -1);
    this.setCloseDisabled(value ? value.closeDisabled : undefined);
  }

  addFromConfig(config: any) {
    if (config) {
      const db = new Dashboard();
      db.parent = this;
      this.dashboards.push(db);
      db.setConfig(config);
    }
  }

  add(dashboard: IDashboard, makeActive: boolean = true) {
    if (dashboard.parent !== this) {
      dashboard.removeFromParent();
      dashboard.parent = this;
      this.dashboards.push(dashboard);
      if (!dashboard.component && this.addApp) {
        const s = new Stack();
        dashboard.setComponent(s);
        s.addNew();
      }
      if (makeActive) {
        this.active = dashboard;
      }
    }
  }

  addDefaultDashboard() {
    if (this.dashboardCount === 0 && this.createDefaultDashboard && this.addApp) {
      const newDashboard = new Dashboard();
      newDashboard.setTitle("Dashboard 1");
      this.add(newDashboard, true);
    }
  }

  remove(node: IComponent) {
    const idx = this.dashboards.indexOf(node as IDashboard);
    if (idx >= 0) {
      const dashboard = this.dashboards[idx];
      dashboard.parent = undefined;
      this.dashboards.splice(idx, 1);

      if (this.activeIndex >= this.dashboards.length) {
        this.setActiveIndex(this.dashboards.length - 1);
      }

      dashboard.close();

      if (this.dashboardCount === 0) {
        this.addDefaultDashboard();
      }
    }
  }

  _saveConfig = (config: any) => {
    this.saver(config);
  };

  get saveDelay() {
    return this._saveDelay;
  }
  set saveDelay(value: number) {
    if (!isNaN(value) && value >= 0) {
      this._saveDelay = value;
    }
  }

  _loadDone = (config: any) => {
    this.setConfig(config);
    if (this.saver) {
      this._configSaveDisposer = reaction(() => this.config, this._saveConfig, {
        delay: this.saveDelay
      });
    }
    if (this.dashboardCount === 0) {
      this.addDefaultDashboard();
    }
    this.sync.syncEnd();
  };

  _loadError = (error: any) => {
    console.error(error);
    this.setConfig(undefined);
    this.sync.syncError(error);
  };

  load(): Promise<any> {

    if (this._configSaveDisposer) {
      this._configSaveDisposer();
      delete this._configSaveDisposer;
    }

    if (this.loader) {
      this.sync.syncStart()
      return Promise.resolve(this.loader())
        .then(this._loadDone)
        .catch(this._loadError)
    }

    // if (this.loader) {
    //   this.sync.syncStart();
    //   return this.loader()
    //     .then(this._loadDone)
    //     .catch(this._loadError);
    // }

    return Promise.reject({
      code: "ILLEGAL_STATE",
      message: "A loader has not been configured"
    });
  }

  _findFirstChild(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    let r: IComponent;
    this.dashboards.some(d => {
      r = d.findFirst(predicate);
      return r ? true : false;
    });
    return r;
  }

  _findAllChildren(predicate: IPredicateFunc<IComponent, IComponent[]>): IComponent[] {
    let r = [];
    let dr: IComponent[];
    this.dashboards.forEach(d => {
      dr = d.findAll(predicate);
      if (dr && dr.length > 0) {
        r = r.concat(dr);
      }
    });
    return r;
  }

  close() {
    this.dashboards.forEach(db => db.close());
    this.dashboards = [];
    this.setActiveIndex(-1);
    this.addDefaultDashboard();
  }

  clear() {
    this.close();
  }

  _setDashboardViewports = () => {
    const active = this.active;
    this.dashboards.forEach(db => {
      db.setViewport(0, 0, db === active ? this.width : 0, db === active ? this.height : 0);
    });
  };

  _setViewportDisposer = autorun(this._setDashboardViewports);

  toJSON() {
    return this.config;
  }
}

const isCollision = (a: IGridBounds, b: IGridBounds) => {
  if (b.colIndex + b.colSpan <= a.colIndex) {
    return false;
  }
  if (b.colIndex >= a.colIndex + a.colSpan) {
    return false;
  }
  if (b.rowIndex + b.rowSpan <= a.rowIndex) {
    return false;
  }
  if (b.rowIndex >= a.rowIndex + a.rowSpan) {
    return false;
  }
  return true;
};

class HSplit {
  _id: string;
  parent: IComponent;
  _componentFactory: IComponentFactory;
  _addApp: IRequest | ISupplierFunc<IRequest>;
  _router: IRouter;
  _closeDisabled: boolean;
  _needsOverflow: boolean;
  _x: number = 0;
  _y: number = 0;
  _width: number = 0;
  _height: number = 0;
  _offset: number;
  _first: IComponent;
  _second: IComponent;
  _splitActive: boolean = false;
  _leftWidth: number;
  _minItemWidth: number;
  _splitterWidth: number;

  constructor() {
    makeObservable(this, {
      parent: observable.ref,
      _componentFactory: observable.ref,
      _addApp: observable.ref,
      _router: observable.ref,
      _closeDisabled: observable,
      _needsOverflow: observable,
      _x: observable,
      _y: observable,
      _width: observable,
      _height: observable,
      _offset: observable,
      _first: observable,
      _second: observable,
      _splitActive: observable,
      _leftWidth: observable,
      _minItemWidth: observable,
      _splitterWidth: observable,
      isOverflow: computed,
      resetViewport: action,
      root: computed,
      x: computed,
      rx: computed,
      y: computed,
      ry: computed,
      width: computed,
      height: computed,
      resize: action,
      position: action,
      setViewport: action,
      addApp: computed,
      componentFactory: computed,
      setComponentFactory: action,
      closeDisabled: computed,
      setCloseDisabled: action,
      setAddApp: action,
      router: computed,
      setRouter: action,
      dashboard: computed,
      splitActive: computed,
      setSplitActive: action,
      first: computed,
      setFirst: action,
      firstConfig: computed,
      setFirstConfig: action,
      second: computed,
      secondConfig: computed,
      setSecond: action,
      setSecondConfig: action,
      offset: computed,
      replace: action,
      remove: action,
      minItemWidth: computed,
      setMinItemWidth: action,
      maxItemWidth: computed,
      splitterWidth: computed,
      setSplitterWidth: action,
      left: computed,
      setLeft: action,
      leftWidth: computed,
      setLeftWidth: action,
      setOffset: action,
      leftConfig: computed,
      setLeftConfig: action,
      right: computed,
      setRight: action,
      rightWidth: computed,
      setRightWidth: action,
      rightConfig: computed,
      setRightConfig: action,
      config: computed,
      setConfig: action,
      columnCount: computed,
      close: action
    });
  }

  get type() {
    return ComponentTypes.hsplit;
  }

  get id() {
    if (!this._id) {
      this._id = componentRegistry.next(this.type);
      console.log(this._id);
    }
    return this._id;
  }

  get isWindowManager() {
    return false;
  }

  get isOverflow() {
    return false;
  }

  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  get root() {
    return this.parent ? this.parent.root : this;
  }

  get x() {
    return this._x;
  }

  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  get y() {
    return this._y;
  }

  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  get addApp() {
    if (this._addApp !== undefined) {
      return this._addApp;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.addApp : undefined;
  }

  set addApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this.setAddApp(addApp);
  }

  get componentFactory(): IComponentFactory {
    if (this._componentFactory !== undefined) {
      return this._componentFactory;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.componentFactory : NotConfiguredComponentFactory;
  }
  set componentFactory(value) {
    this.setComponentFactory(value);
  }
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  get closeDisabled(): boolean {
    if (this._closeDisabled !== undefined) {
      return this._closeDisabled;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.closeDisabled : false;
  }
  set closeDisabled(value) {
    this.setCloseDisabled(value);
  }
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  get router() {
    if (this._router !== undefined) {
      return this._router;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.router : undefined;
  }
  set router(value) {
    this.setRouter(value);
  }

  setRouter(router: IRouter) {
    this._router = router;
  }

  get dashboard(): IDashboard {
    const p = this.parent;
    if (p === this) {
      console.warn("-- Dashboard Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.dashboard : undefined;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = undefined;
    }
  }

  visit(callback: IConsumerFunc<IComponent>): void {
    callback(this);
  }

  findFirst(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    if (predicate(this)) {
      return this;
    }
    return this._findFirstChild(predicate);
  }

  findAll(predicate: IPredicateFunc<IComponent>): IComponent[] {
    let r = [];
    if (predicate(this)) {
      r.push(this);
    }
    const tr = this._findAllChildren(predicate);
    if (tr && tr.length > 0) {
      r = r.concat(tr);
    }
    return r;
  }

  get splitActive() {
    return this._splitActive;
  }
  set splitActive(value) {
    this.setSplitActive(value);
  }

  setSplitActive(splitActive: boolean) {
    this._splitActive = splitActive;
    const db = this.dashboard;
    if (splitActive) {
      db.setBlockSource(this);
    } else if (db.blockSource === this) {
      db.clearBlockSource();
    }
  }

  get first() {
    return this._first;
  }
  set first(value: IComponent) {
    this.setFirst(value);
  }

  setFirst(first: IComponent) {
    if (first !== this._first) {
      if (first && first.parent !== this) {
        first.removeFromParent();
      }
      this._first = first;
      if (this._first) {
        this._first.parent = this;
      }
    }
  }

  get firstConfig() {
    return this._first ? { component: this._first.config } : undefined;
  }

  setFirstConfig(config: any) {
    let first: IComponent;
    if (config && config.component) {
      first = this.componentFactory(config.component.type);
    }
    // NOTE: if this order seems odd it's because we want the hierarchy established
    // before setting the code (otherwise subsequent componentFactory usage is dodgy)
    this.setFirst(first);
    if (first) {
      first.setConfig(config.component);
    }
  }

  get second() {
    return this._second;
  }

  set second(value: IComponent) {
    this.setSecond(value);
  }

  get secondConfig() {
    return this._second ? { component: this._second.config } : undefined;
  }

  setSecond(second: IComponent) {
    if (second !== this._second) {
      if (second && second.parent !== this) {
        second.removeFromParent();
      }
      this._second = second;
      if (this._second) {
        this._second.parent = this;
      }
    }
  }

  setSecondConfig(config: any) {
    let second: IComponent;
    if (config && config.component) {
      second = this.componentFactory(config.component.type);
    }
    // NOTE: if this order seems odd it's because we want the hierarchy established
    // before setting the code (otherwise subsequent componentFactory usage is dodgy)
    this.setSecond(second);
    if (second) {
      second.setConfig(config.component);
    }
  }

  get offset() {
    return this._offset !== undefined ? this._offset : Defaults.offset;
  }
  set offset(value: number) {
    this.setOffset(value);
  }

  replace(newComp: IComponent, oldComp: IComponent): void {
    if (oldComp === this._first || oldComp === this._second) {
      if (oldComp === this._first) {
        this.setFirst(newComp);
      } else if (oldComp === this._second) {
        this.setSecond(newComp);
      }
    }
  }

  remove(comp: IComponent) {
    if (comp === this._first || comp === this._second) {
      const replacement = comp === this._first ? this._second : this._first;
      // clear the parent for both left and right
      if (this._first) {
        this._first.parent = undefined;
      }
      if (this._second) {
        this._second.parent = undefined;
      }
      if (this.parent) {
        this.parent.replace(replacement, this);
      }
    }
  }

  _visitChildren(callback: IConsumerFunc<IComponent, IComponent[]>) {
    if (this._first) {
      this._first.visit(callback);
    }
    if (this._second) {
      this._second.visit(callback);
    }
  }

  _findFirstChild(predicate) {
    let r: IComponent;
    if (this._first) {
      r = this._first.findFirst(predicate);
    }
    if (!r) {
      r = this._second.findFirst(predicate);
    }
    return r;
  }

  _findAllChildren(predicate: IPredicateFunc<IComponent, IComponent[]>): IComponent[] {
    let r = [];
    const lr = this._first ? this._first.findAll(predicate) : undefined;
    const rr = this._second ? this._second.findAll(predicate) : undefined;
    if (lr) {
      r = r.concat(lr);
    }
    if (rr) {
      r = r.concat(rr);
    }
    return r;
  }

  get minItemWidth() {
    return this._minItemWidth !== undefined ? this._minItemWidth : Defaults.minItemWidth;
  }
  set minItemWidth(value) {
    this.setMinItemWidth(value);
  }
  setMinItemWidth(minItemWidth: number) {
    if (minItemWidth >= 0) {
      this._minItemWidth = minItemWidth;
    }
  }

  get maxItemWidth() {
    return this.width - this.minItemWidth - this.splitterWidth;
  }

  get splitterWidth() {
    return this._splitterWidth !== undefined ? this._splitterWidth : Defaults.splitterWidth;
  }
  set splitterWidth(value) {
    this.setSplitterWidth(value);
  }
  setSplitterWidth(splitterWidth: number) {
    if (splitterWidth > 0) {
      this._splitterWidth = splitterWidth;
    }
  }

  get left() {
    return this.first;
  }
  set left(value: IComponent) {
    this.setLeft(value);
  }
  setLeft(left: IComponent) {
    this.setFirst(left);
  }

  get leftWidth() {
    if (this._offset === undefined) {
      if (this._leftWidth !== undefined) {
        return this._leftWidth;
      }
    }
    let r = Math.floor(this.offset * this.width);
    if (r < this.minItemWidth) {
      r = this.minItemWidth;
    }
    return r;
  }
  set leftWidth(value) {
    this.setLeftWidth(value);
  }
  setLeftWidth(leftWidth: number) {
    if (leftWidth < this.minItemWidth) {
      leftWidth = this.minItemWidth;
    } else if (this.maxItemWidth > 0 && leftWidth > this.maxItemWidth) {
      leftWidth = this.maxItemWidth;
    }
    if (this._offset === undefined) {
      this._leftWidth = leftWidth;
    } else {
      this.setOffset(leftWidth / this.width);
    }
  }

  setOffset(offset: number) {
    if (offset >= 0) {
      this._offset = offset;
    }
    if (this._offset !== undefined) {
      this._leftWidth = undefined;
    }
  }

  get leftConfig() {
    return this.firstConfig;
  }
  set leftConfig(value) {
    this.setLeftConfig(value);
  }
  setLeftConfig(config: any) {
    this.setFirstConfig(config);
  }

  get right() {
    return this.second;
  }
  set right(value: IComponent) {
    this.setRight(value);
  }
  setRight(right: IComponent) {
    this.setSecond(right);
  }

  get rightWidth() {
    return this.width - this.leftWidth - this.splitterWidth;
  }
  set rightWidth(value) {
    this.setRightWidth(value);
  }
  setRightWidth(rightWidth: number) {
    if (rightWidth < this.minItemWidth) {
      rightWidth = this.minItemWidth;
    } else if (rightWidth > this.maxItemWidth) {
      rightWidth = this.maxItemWidth;
    }
    this.setLeftWidth(this.width - rightWidth - this.splitterWidth);
  }

  get rightConfig() {
    return this.secondConfig;
  }
  set rightConfig(value) {
    this.setRightConfig(value);
  }
  setRightConfig(config: any) {
    this.setSecondConfig(config);
  }

  get config(): IHSplitConfig {
    return {
      type: this.type,
      offset: this._offset,
      left: this.leftConfig,
      right: this.rightConfig,
      leftWidth: this._leftWidth,
      minItemWidth: this._minItemWidth
    };
  }
  set config(value) {
    this.setConfig(value);
  }
  setConfig(config: IHSplitConfig) {
    this.setLeftConfig(config ? config.left : undefined);
    this.setRightConfig(config ? config.right : undefined);
    this.setOffset(config ? config.offset : undefined);
    this.setLeftWidth(config ? config.leftWidth : undefined);
    this.setMinItemWidth(config ? config.minItemWidth : undefined);
  }

  get columnCount() {
    const left = this.left;
    const right = this.right;
    const leftCount =
      left && left.type === ComponentTypes.hsplit ? (left as IHSplit).columnCount : 1;
    const rightCount =
      right && right.type === ComponentTypes.hsplit ? (right as IHSplit).columnCount : 1;
    return leftCount + rightCount;
  }

  _setPaneViewports = () => {
    if (this.left) {
      this.left.setViewport(this.x, this.y, this.leftWidth, this.height);
    }
    if (this.right) {
      this.right.setViewport(
        this.x + this.leftWidth + this.splitterWidth,
        this.y,
        this.rightWidth,
        this.height
      );
    }
  };

  _setViewportDisposer = autorun(this._setPaneViewports);

  close() {
    if (this.first) {
      this.first.close();
    }
    if (this.second) {
      this.second.close();
    }
    if (this._setViewportDisposer) {
      this._setViewportDisposer();
    }
  }

  toJSON() {
    return this.config;
  }
}

class VSplit {
  _id: string;
  parent: IComponent;
  _componentFactory: IComponentFactory;
  _addApp: IRequest | ISupplierFunc<IRequest>;
  _router: IRouter;
  _closeDisabled: boolean;
  _needsOverflow: boolean;
  _x: number = 0;
  _y: number = 0;
  _width: number = 0;
  _height: number = 0;
  _offset: number;
  _first: IComponent;
  _second: IComponent;
  _splitActive: boolean = false;
  _topHeight: number;
  _minItemHeight: number;
  _splitterHeight: number;

  constructor() {
    makeObservable(this, {
      parent: observable.ref,
      _componentFactory: observable.ref,
      _addApp: observable.ref,
      _router: observable.ref,
      _closeDisabled: observable,
      _needsOverflow: observable,
      _x: observable,
      _y: observable,
      _width: observable,
      _height: observable,
      _offset: observable,
      _first: observable,
      _second: observable,
      _splitActive: observable,
      _topHeight: observable,
      _minItemHeight: observable,
      _splitterHeight: observable,
      isOverflow: computed,
      resetViewport: action,
      root: computed,
      x: computed,
      rx: computed,
      y: computed,
      ry: computed,
      width: computed,
      height: computed,
      resize: action,
      position: action,
      setViewport: action,
      addApp: computed,
      componentFactory: computed,
      setComponentFactory: action,
      closeDisabled: computed,
      setCloseDisabled: action,
      setAddApp: action,
      router: computed,
      setRouter: action,
      dashboard: computed,
      splitActive: computed,
      setSplitActive: action,
      first: computed,
      setFirst: action,
      firstConfig: computed,
      setFirstConfig: action,
      second: computed,
      secondConfig: computed,
      setSecond: action,
      setSecondConfig: action,
      offset: computed,
      replace: action,
      remove: action,
      minItemHeight: computed,
      setMinItemHeight: action,
      maxItemHeight: computed,
      splitterHeight: computed,
      setSplitterHeight: action,
      topHeight: computed,
      setTopHeight: action,
      setOffset: action,
      top: computed,
      setTop: action,
      topConfig: computed,
      setTopConfig: action,
      bottom: computed,
      setBottom: action,
      bottomConfig: computed,
      setBottomConfig: action,
      bottomHeight: computed,
      setBottomHeight: action,
      config: computed,
      setConfig: action,
      rowCount: computed,
      close: action
    });
  }

  get type() {
    return ComponentTypes.vsplit;
  }

  get id() {
    if (!this._id) {
      this._id = componentRegistry.next(this.type);
      console.log(this._id);
    }
    return this._id;
  }

  get isWindowManager() {
    return false;
  }

  get isOverflow() {
    return false;
  }

  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  get root() {
    return this.parent ? this.parent.root : this;
  }

  get x() {
    return this._x;
  }

  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  get y() {
    return this._y;
  }

  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  get addApp() {
    if (this._addApp !== undefined) {
      return this._addApp;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.addApp : undefined;
  }

  set addApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this.setAddApp(addApp);
  }

  get componentFactory(): IComponentFactory {
    if (this._componentFactory !== undefined) {
      return this._componentFactory;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.componentFactory : NotConfiguredComponentFactory;
  }
  set componentFactory(value) {
    this.setComponentFactory(value);
  }
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  get closeDisabled(): boolean {
    if (this._closeDisabled !== undefined) {
      return this._closeDisabled;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.closeDisabled : false;
  }
  set closeDisabled(value) {
    this.setCloseDisabled(value);
  }
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  get router() {
    if (this._router !== undefined) {
      return this._router;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.router : undefined;
  }
  set router(value) {
    this.setRouter(value);
  }

  setRouter(router: IRouter) {
    this._router = router;
  }

  get dashboard(): IDashboard {
    const p = this.parent;
    if (p === this) {
      console.warn("-- Dashboard Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.dashboard : undefined;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = undefined;
    }
  }

  visit(callback: IConsumerFunc<IComponent>): void {
    callback(this);
  }

  findFirst(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    if (predicate(this)) {
      return this;
    }
    return this._findFirstChild(predicate);
  }

  findAll(predicate: IPredicateFunc<IComponent>): IComponent[] {
    let r = [];
    if (predicate(this)) {
      r.push(this);
    }
    const tr = this._findAllChildren(predicate);
    if (tr && tr.length > 0) {
      r = r.concat(tr);
    }
    return r;
  }

  get splitActive() {
    return this._splitActive;
  }
  set splitActive(value) {
    this.setSplitActive(value);
  }

  setSplitActive(splitActive: boolean) {
    this._splitActive = splitActive;
    const db = this.dashboard;
    if (splitActive) {
      db.setBlockSource(this);
    } else if (db.blockSource === this) {
      db.clearBlockSource();
    }
  }

  get first() {
    return this._first;
  }
  set first(value: IComponent) {
    this.setFirst(value);
  }

  setFirst(first: IComponent) {
    if (first !== this._first) {
      if (first && first.parent !== this) {
        first.removeFromParent();
      }
      this._first = first;
      if (this._first) {
        this._first.parent = this;
      }
    }
  }

  get firstConfig() {
    return this._first ? { component: this._first.config } : undefined;
  }

  setFirstConfig(config: any) {
    let first: IComponent;
    if (config && config.component) {
      first = this.componentFactory(config.component.type);
    }
    // NOTE: if this order seems odd it's because we want the hierarchy established
    // before setting the code (otherwise subsequent componentFactory usage is dodgy)
    this.setFirst(first);
    if (first) {
      first.setConfig(config.component);
    }
  }

  get second() {
    return this._second;
  }

  set second(value: IComponent) {
    this.setSecond(value);
  }

  get secondConfig() {
    return this._second ? { component: this._second.config } : undefined;
  }

  setSecond(second: IComponent) {
    if (second !== this._second) {
      if (second && second.parent !== this) {
        second.removeFromParent();
      }
      this._second = second;
      if (this._second) {
        this._second.parent = this;
      }
    }
  }

  setSecondConfig(config: any) {
    let second: IComponent;
    if (config && config.component) {
      second = this.componentFactory(config.component.type);
    }
    // NOTE: if this order seems odd it's because we want the hierarchy established
    // before setting the code (otherwise subsequent componentFactory usage is dodgy)
    this.setSecond(second);
    if (second) {
      second.setConfig(config.component);
    }
  }

  get offset() {
    return this._offset !== undefined ? this._offset : Defaults.offset;
  }
  set offset(value: number) {
    this.setOffset(value);
  }

  replace(newComp: IComponent, oldComp: IComponent): void {
    if (oldComp === this._first || oldComp === this._second) {
      if (oldComp === this._first) {
        this.setFirst(newComp);
      } else if (oldComp === this._second) {
        this.setSecond(newComp);
      }
    }
  }

  remove(comp: IComponent) {
    if (comp === this._first || comp === this._second) {
      const replacement = comp === this._first ? this._second : this._first;
      // clear the parent for both left and right
      if (this._first) {
        this._first.parent = undefined;
      }
      if (this._second) {
        this._second.parent = undefined;
      }
      if (this.parent) {
        this.parent.replace(replacement, this);
      }
    }
  }

  _visitChildren(callback) {
    if (this._first) {
      this._first.visit(callback);
    }
    if (this._second) {
      this._second.visit(callback);
    }
  }

  _findFirstChild(predicate) {
    let r: IComponent;
    if (this._first) {
      r = this._first.findFirst(predicate);
    }
    if (!r) {
      r = this._second.findFirst(predicate);
    }
    return r;
  }

  _findAllChildren(predicate): IComponent[] {
    let r = [];
    const lr = this._first ? this._first.findAll(predicate) : undefined;
    const rr = this._second ? this._second.findAll(predicate) : undefined;
    if (lr) {
      r = r.concat(lr);
    }
    if (rr) {
      r = r.concat(rr);
    }
    return r;
  }

  get minItemHeight() {
    return this._minItemHeight !== undefined ? this._minItemHeight : Defaults.minItemHeight;
  }
  set minItemHeight(value) {
    this.setMinItemHeight(value);
  }
  setMinItemHeight(minItemHeight: number) {
    if (minItemHeight >= 0) {
      this._minItemHeight = minItemHeight;
    }
  }

  get maxItemHeight() {
    return this.height - this.minItemHeight - this.splitterHeight;
  }

  get splitterHeight() {
    return this._splitterHeight !== undefined ? this._splitterHeight : Defaults.splitterHeight;
  }
  set splitterHeight(value) {
    this.setSplitterHeight(value);
  }
  setSplitterHeight(splitterHeight: number) {
    if (splitterHeight > 0) {
      this._splitterHeight = splitterHeight;
    }
  }

  get topHeight() {
    if (this._offset === undefined) {
      if (this._topHeight !== undefined) {
        return this._topHeight;
      }
    }
    let r = Math.floor(this.height * this.offset);
    if (r < this.minItemHeight) {
      r = this.minItemHeight;
    }
    return r;
  }
  set topHeight(value) {
    this.setTopHeight(value);
  }
  setTopHeight(topHeight: number) {
    if (topHeight < this.minItemHeight) {
      topHeight = this.minItemHeight;
    } else if (this.maxItemHeight > 0 && topHeight > this.maxItemHeight) {
      topHeight = this.maxItemHeight;
    }
    if (this._offset === undefined) {
      this._topHeight = topHeight;
    } else {
      this.setOffset(topHeight / this.height);
    }
  }

  setOffset(offset: number) {
    if (offset >= 0) {
      this._offset = offset;
    }
    if (this._offset !== undefined) {
      this._topHeight = undefined;
    }
  }

  get top() {
    return this.first;
  }
  set top(value: IComponent) {
    this.setTop(value);
  }

  setTop(top: IComponent) {
    this.setFirst(top);
  }

  get topConfig() {
    return this.firstConfig;
  }

  setTopConfig(config: any) {
    return this.setFirstConfig(config);
  }

  get bottom() {
    return this.second;
  }
  set bottom(value: IComponent) {
    this.setBottom(value);
  }
  setBottom(bottom: IComponent) {
    this.setSecond(bottom);
  }

  get bottomConfig() {
    return this.secondConfig;
  }
  set bottomConfig(value) {
    this.setBottomConfig(value);
  }
  setBottomConfig(config: any) {
    return this.setSecondConfig(config);
  }

  get bottomHeight() {
    return this.height - this.topHeight - this.splitterHeight;
  }
  set bottomHeight(value) {
    this.setBottomHeight(value);
  }
  setBottomHeight(bottomHeight: number) {
    if (bottomHeight >= this.minItemHeight && bottomHeight <= this.maxItemHeight) {
      this.setTopHeight(this.height - bottomHeight - this.splitterHeight);
    }
  }

  get config(): IVSplitConfig {
    return {
      type: this.type,
      offset: this._offset,
      top: this.topConfig,
      bottom: this.bottomConfig,
      topHeight: this._topHeight,
      minItemHeight: this._minItemHeight
    };
  }
  set config(value) {
    this.setConfig(value);
  }
  setConfig(config: IVSplitConfig) {
    this.setTopConfig(config ? config.top : undefined),
      this.setBottomConfig(config ? config.bottom : undefined);
    this.setOffset(config ? config.offset : undefined);
    this.setTopHeight(config ? config.topHeight : undefined);
    this.setMinItemHeight(config ? config.minItemHeight : undefined);
  }

  get rowCount() {
    const top = this.top;
    const bottom = this.bottom;
    const topCount = top && top.type === ComponentTypes.vsplit ? (top as IVSplit).rowCount : 1;
    const bottomCount =
      bottom && bottom.type === ComponentTypes.vsplit ? (bottom as IVSplit).rowCount : 1;
    return topCount + bottomCount;
  }

  _setPaneViewports = () => {
    if (this.top) {
      this.top.setViewport(this.x, this.y, this.width, this.topHeight);
    }
    if (this.bottom) {
      this.bottom.setViewport(
        this.x,
        this.y + this.topHeight + this.splitterHeight,
        this.width,
        this.bottomHeight
      );
    }
  };

  _setViewportDisposer = autorun(this._setPaneViewports);

  close() {
    if (this.first) {
      this.first.close();
    }
    if (this.second) {
      this.second.close();
    }
    if (this._setViewportDisposer) {
      this._setViewportDisposer();
    }
  }

  toJSON() {
    return this.config;
  }
}

const splitHorizontal = action((replace: IComponent, left: IComponent, right: IComponent) => {
  const split = new HSplit();
  if (replace.parent) {
    replace.parent.replace(split, replace);
  }
  split.setLeft(left);
  split.setRight(right);
});

const splitVertical = action((replace: IComponent, top: IComponent, bottom: IComponent) => {
  const split = new VSplit();
  if (replace.parent) {
    replace.parent.replace(split, replace);
  }
  split.setTop(top);
  split.setBottom(bottom);
});

class Window {
  _id: string;
  parent: IComponent;
  _componentFactory: IComponentFactory;
  _addApp: IRequest | ISupplierFunc<IRequest>;
  _router: IRouter;
  _closeDisabled: boolean;
  _needsOverflow: boolean;
  _x: number = 0;
  _y: number = 0;
  _width: number = 0;
  _height: number = 0;
  name: string;
  onClose: IConsumerFunc<IWindow>;
  _path: string;
  _params: any;
  _query: any;
  _appHost: AppHost;
  _contentHidden: boolean;
  _transient: boolean = false;
  _settings: WindowSettings = new WindowSettings(this);
  _dragState: any = {};

  constructor() {
    makeObservable(this, {
      parent: observable.ref,
      _componentFactory: observable.ref,
      _addApp: observable.ref,
      _router: observable.ref,
      _closeDisabled: observable,
      _needsOverflow: observable,
      _x: observable,
      _y: observable,
      _width: observable,
      _height: observable,
      _path: observable,
      _params: observable,
      _query: observable,
      _appHost: observable,
      _contentHidden: observable,
      _transient: observable,
      _settings: observable,
      _dragState: observable,
      isOverflow: computed,
      resetViewport: action,
      root: computed,
      x: computed,
      rx: computed,
      y: computed,
      ry: computed,
      width: computed,
      height: computed,
      resize: action,
      position: action,
      setViewport: action,
      addApp: computed,
      componentFactory: computed,
      setComponentFactory: action,
      closeDisabled: computed,
      setCloseDisabled: action,
      setAddApp: action,
      router: computed,
      setRouter: action,
      dashboard: computed,
      settings: computed,
      appHost: computed,
      path: computed,
      setPath: action,
      params: computed,
      setParams: action,
      query: computed,
      setQuery: action,
      icon: computed,
      title: computed,
      setTitle: action,
      contentHidden: computed,
      setContentHidden: action,
      toggleContent: action,
      transient: computed,
      setTransient: action,
      manager: computed,
      active: computed,
      activate: action,
      dragState: computed,
      setDragState: action,
      clearDragState: action,
      dragging: computed,
      dragStart: action,
      dragEnd: action,
      resizing: computed,
      resizeStart: action,
      resizeEnd: action,
      maximize: action,
      restoreSize: action,
      maximized: computed,
      setMaximized: action,
      config: computed,
      setConfig: action,
      load: action,
      close: action
    });

    this._appHost = new AppHost()
    this._appHost.setWindow(this)
  }

  get type() {
    return ComponentTypes.window;
  }

  get id() {
    if (!this._id) {
      this._id = componentRegistry.next(this.type);
      console.log(this._id);
    }
    return this._id;
  }

  get isWindowManager() {
    return false;
  }

  get isOverflow() {
    return false;
  }

  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  get root() {
    return this.parent ? this.parent.root : this;
  }

  get x() {
    return this._x;
  }

  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  get y() {
    return this._y;
  }

  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  get addApp() {
    if (this._addApp !== undefined) {
      return this._addApp;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.addApp : undefined;
  }

  set addApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this.setAddApp(addApp);
  }

  get componentFactory(): IComponentFactory {
    if (this._componentFactory !== undefined) {
      return this._componentFactory;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.componentFactory : NotConfiguredComponentFactory;
  }
  set componentFactory(value) {
    this.setComponentFactory(value);
  }
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  get closeDisabled(): boolean {
    if (this._closeDisabled !== undefined) {
      return this._closeDisabled;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.closeDisabled : false;
  }
  set closeDisabled(value) {
    this.setCloseDisabled(value);
  }
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  get router() {
    if (this._router !== undefined) {
      return this._router;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.router : undefined;
  }
  set router(value) {
    this.setRouter(value);
  }

  setRouter(router: IRouter) {
    this._router = router;
  }

  get dashboard(): IDashboard {
    const p = this.parent;
    if (p === this) {
      console.warn("-- Dashboard Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.dashboard : undefined;
  }

  remove(comp: IComponent): void {
    // does nothing by default
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = undefined;
    }
  }

  replace(newItem: IComponent, oldItem: IComponent): void {
    // does nothing by default
  }

  _visitChildren(callback: IConsumerFunc<IComponent>): void {
    // does nothing by default
  }

  visit(callback: IConsumerFunc<IComponent>): void {
    callback(this);
  }

  _findFirstChild(predicate: IPredicateFunc<IComponent>): IComponent {
    return undefined;
  }

  findFirst(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    if (predicate(this)) {
      return this;
    }
    return this._findFirstChild(predicate);
  }

  _findAllChildren(predicate: IPredicateFunc<IComponent>): IComponent[] {
    return [];
  }

  findAll(predicate: IPredicateFunc<IComponent>): IComponent[] {
    let r = [];
    if (predicate(this)) {
      r.push(this);
    }
    const tr = this._findAllChildren(predicate);
    if (tr && tr.length > 0) {
      r = r.concat(tr);
    }
    return r;
  }

  get settings() {
    return this._settings;
  }

  get appHost() {
    return this._appHost;
  }

  get path() {
    return this._path;
  }
  set path(value) {
    this.setPath(value);
  }

  setPath(path: string) {
    this._path = path;
  }

  get params() {
    return Object.assign({}, this._params, this._query);
  }
  set params(value) {
    this.setParams(value);
  }
  setParams(params: any) {
    this._params = params;
  }

  get query() {
    return Object.assign({}, this._query);
  }
  set query(value) {
    this.setQuery(value);
  }
  setQuery(query: any) {
    this._query = query;
  }

  get icon() {
    return this._appHost.icon;
  }

  get title() {
    return this._appHost.title;
  }
  set title(value) {
    this.setTitle(value);
  }
  setTitle(title: string) {
    this._appHost.setTitle(title);
  }

  get contentHidden() {
    return this._contentHidden ? true : false;
  }
  set contentHidden(value) {
    this.setContentHidden(value);
  }
  setContentHidden(contentHidden: boolean) {
    this._contentHidden = contentHidden;
  }

  toggleContent() {
    this.setContentHidden(!this.contentHidden);
  }

  get transient() {
    return this._transient;
  }
  set transient(value) {
    this.setTransient(value);
  }

  setTransient(transient: boolean) {
    this._transient = transient;
  }

  get manager(): IWindowManager {
    const parent = this.parent;
    return parent && parent.isWindowManager ? (parent as IWindowManager) : undefined;
  }

  get active() {
    const manager = this.manager;
    if (manager) {
      return manager.active === this;
    }
    return false;
  }

  activate() {
    const manager = this.manager;
    if (manager) {
      manager.setActive(this);
    }
  }

  get dragState() {
    return this._dragState;
  }
  set dragState(value) {
    this.setDragState(value);
  }
  setDragState(dragState: any) {
    this._dragState = Object.assign({}, this._dragState, dragState);
  }
  clearDragState() {
    this._dragState = {};
  }

  get dragging() {
    const mgr = this.manager;
    return mgr ? mgr.drag === this : false;
  }

  dragStart(dragState?: any): void {
    this.setDragState(dragState);
    const mgr = this.manager;
    if (mgr) {
      mgr.dragStart(this);
    }
  }

  dragEnd(): void {
    this.clearDragState();
    const mgr = this.manager;
    if (mgr) {
      mgr.dragEnd();
    }
  }

  get resizing() {
    const mgr = this.manager;
    return mgr ? mgr.resizing === this : false;
  }

  resizeStart(type: WindowResizeType) {
    const mgr = this.manager;
    if (mgr) {
      mgr.resizeStart(this, type);
    }
  }

  resizeEnd() {
    const mgr = this.manager;
    if (mgr) {
      mgr.resizeEnd();
    }
  }

  maximize() {
    this.setMaximized(true);
  }

  restoreSize() {
    this.setMaximized(false);
  }

  get maximized() {
    const mgr = this.manager;
    return mgr ? mgr.maximized === this : false;
  }
  set maximized(value) {
    this.setMaximized(value);
  }

  setMaximized(maximized: boolean) {
    const mgr = this.manager;
    if (maximized) {
      mgr.setMaximized(this);
    } else if (mgr.maximized === this) {
      mgr.setMaximized(undefined);
    }
  }

  get config(): IWindowConfig {
    // NOTE: for get config, the params are always considered transient
    return {
      type: this.type,
      path: this._path,
      query: this._query,
      closeDisabled: this._closeDisabled,
      contentHidden: this._contentHidden,
      settings: this._settings.config
    };
  }
  set config(value) {
    this.setConfig(value);
  }
  setConfig(config: IWindowConfig) {
    this.setTitle(config ? config.title : undefined);
    this.setCloseDisabled(config ? config.closeDisabled : undefined);
    this.setPath(config ? config.path : undefined);
    this.setQuery(config ? config.query : undefined);
    this.setParams(config ? config.params : undefined);
    this.setContentHidden(config ? config.contentHidden : undefined);
    this._settings.setConfig(config ? config.settings : undefined);
  }

  open(request: IRequest) {
    const manager = this.manager;
    if (manager) {
      const openRequest = Object.assign({}, request, { opener: this._appHost });
      return manager.open(openRequest);
    }
    return Promise.reject({
      code: "INVALID_STATE",
      message: "No Window Manager Set"
    });
  }

  load(request?: IRequest) {
    return this.appHost.load(request);
  }

  close(opts?: any) {
    //if (this.id === "window-comp-1") return <- causes stack overflow idk
    this._appHost.emit({ type: "beforeunload" });
    this._appHost.emit({ type: "beforeclose" });
    if (this.onClose) {
      this.onClose(this);
    }
    this._appHost.emit({ type: "unload" });
    this._appHost.emit({ type: "close" });
    if (!opts || !opts.noRemove) {
      this.removeFromParent();
    }
  }

  toJSON() {
    return this.config;
  }


}


// class WindowAppHost extends IAppHost {
//   _window: IWindow;

//   constructor(window: IWindow) {
//     super();
//     this._window = window;
//   }

//   get defaultRequest() {
//     return {
//       path: this._window.path,
//       params: this._window.params,
//       query: this._window.query
//     };
//   }

//   get router(): IRouter {
//     return this._window.router;
//   }
//   set router(value: IRouter) {
//     this.setRouter(value);
//   }

//   @action
//   setRouter(router: IRouter) {
//     this._window.setRouter(router);
//   }

//   // Promise<IAppHost>
//   async open(request: IRequest): Promise<any> {
//     const w = await this._window.open(request);
//     return w.appHost;
//   }

//   @action
//   setRequest(request: IRequest) {
//     super.setRequest(request);
//     if (request && request.replace && !request.noUpdate && !request.noSaveLocation) {
//       this._window.setPath(request.path);
//       this._window.setParams(request.params);
//       this._window.setQuery(request.query);
//     }
//   }

//   close() {
//     this._window.close();
//   }
// }

class WindowSettings {
  _window: IWindow;
  _borderWidth: number;
  _headerHeight: number;
  _data: any = {};
  _resizable: boolean;
  _draggable: boolean;
  _animatePosition: boolean;
  _role: string;

  constructor(window?: IWindow) {
    makeObservable(this, {
      _window: observable,
      _borderWidth: observable,
      _headerHeight: observable,
      _data: observable,
      _resizable: observable,
      _draggable: observable,
      _animatePosition: observable,
      _role: observable,
      data: computed,
      setData: action,
      borderWidth: computed,
      setBorderWidth: action,
      headerHeight: computed,
      setHeaderHeight: action,
      resizable: computed,
      setResizable: action,
      draggable: computed,
      setDraggable: action,
      animatePosition: computed,
      setAnimatePosition: action,
      role: computed,
      setRole: action,
      config: computed,
      setConfig: action
    });

    this._window = window;
  }

  get data() {
    return Object.assign({}, this._data);
  }
  set data(value) {
    this.setData(value);
  }
  setData(data: any) {
    this._data = Object.assign({}, this._data, data);
  }

  get borderWidth() {
    let borderWidth = this._borderWidth;
    if (borderWidth === undefined) {
      const mgr = this._window ? this._window.manager : undefined;
      if (mgr) {
        borderWidth = mgr.windowSettings.borderWidth;
      }
    }
    return borderWidth !== undefined ? borderWidth : 0;
  }
  set borderWidth(value) {
    this.setBorderWidth(value);
  }
  setBorderWidth(borderWidth: number) {
    if (borderWidth >= 0) {
      this._borderWidth = borderWidth;
    }
  }

  get headerHeight() {
    let headerHeight = this._headerHeight;
    if (headerHeight === undefined) {
      const mgr = this._window ? this._window.manager : undefined;
      if (mgr) {
        headerHeight = mgr.windowSettings.headerHeight;
      }
    }
    return headerHeight !== undefined ? headerHeight : 0;
  }
  set headerHeight(value) {
    this.setHeaderHeight(value);
  }
  setHeaderHeight(headerHeight: number) {
    if (headerHeight >= 0) {
      this._headerHeight = headerHeight;
    }
  }

  get resizable() {
    let resizable = this._resizable;
    if (resizable === undefined) {
      const mgr = this._window ? this._window.manager : undefined;
      if (mgr) {
        resizable = mgr.windowSettings.resizable;
      }
    }
    return resizable !== undefined ? resizable : false;
  }
  set resizable(value) {
    this.setResizable(value);
  }

  setResizable(resizable: boolean) {
    if (resizable !== undefined) {
      this._resizable = resizable;
    }
  }

  get draggable() {
    let draggable = this._draggable;
    if (draggable === undefined) {
      const mgr = this._window ? this._window.manager : undefined;
      if (mgr) {
        draggable = mgr.windowSettings.draggable;
      }
    }
    return draggable !== undefined ? draggable : false;
  }
  set draggable(value) {
    this.setDraggable(value);
  }

  setDraggable(draggable: boolean) {
    if (draggable !== undefined) {
      this._draggable = draggable;
    }
  }

  get animatePosition() {
    let animatePosition = this._animatePosition;
    if (animatePosition === undefined) {
      const mgr = this._window ? this._window.manager : undefined;
      if (mgr) {
        animatePosition = mgr.windowSettings.animatePosition;
      }
    }
    return animatePosition !== undefined ? animatePosition : false;
  }
  set animatePosition(value) {
    this.setAnimatePosition(value);
  }
  setAnimatePosition(animatePosition: boolean) {
    this._animatePosition = animatePosition;
  }

  get role() {
    let role = this._role;
    if (role === undefined) {
      const mgr = this._window ? this._window.manager : undefined;
      if (mgr) {
        role = mgr.windowSettings.role;
      }
    }
    return role;
  }
  set role(value) {
    this.setRole(value);
  }
  setRole(role: string) {
    this._role = role;
  }

  get config() {
    return {
      borderWidth: this._borderWidth,
      headerHeight: this._headerHeight,
      resizable: this._resizable,
      draggable: this._draggable,
      animatePosition: this._animatePosition,
      data: this.data
    };
  }
  set config(value) {
    this.setConfig(value);
  }

  setConfig(config: IWindowSettings["config"]): void {
    this.setBorderWidth(config ? config.borderWidth : undefined);
    this.setHeaderHeight(config ? config.headerHeight : undefined);
    this.setResizable(config ? config.resizable : undefined);
    this.setDraggable(config ? config.draggable : undefined);
    this.setData(config ? config.data : undefined);
  }

  toJSON() {
    return this.config;
  }
}

class Stack {
  _id: string;
  parent: IComponent;
  _componentFactory: IComponentFactory;
  _addApp: IRequest | ISupplierFunc<IRequest>;
  _router: IRouter;
  _closeDisabled: boolean;
  _needsOverflow: boolean;
  _x: number = 0;
  _y: number = 0;
  _width: number = 0;
  _height: number = 0;
  windows: IWindow[] = [];
  _windowSettings = new WindowSettings();
  _resizing: IWindow;
  _resizeType: WindowResizeType;
  _drag: IWindow;
  _activeIndex: number;
  _maximizedIndex: number;
  _headerHeight: number = 28;

  constructor() {
    makeObservable(this, {
      parent: observable.ref,
      _componentFactory: observable.ref,
      _addApp: observable.ref,
      _router: observable.ref,
      _closeDisabled: observable,
      _needsOverflow: observable,
      _x: observable,
      _y: observable,
      _width: observable,
      _height: observable,
      windows: observable,
      _windowSettings: observable,
      _resizing: observable.ref,
      _resizeType: observable,
      _drag: observable.ref,
      _activeIndex: observable,
      _maximizedIndex: observable,
      _headerHeight: observable,
      isOverflow: computed,
      resetViewport: action,
      root: computed,
      x: computed,
      rx: computed,
      y: computed,
      ry: computed,
      width: computed,
      height: computed,
      resize: action,
      position: action,
      setViewport: action,
      addApp: computed,
      componentFactory: computed,
      setComponentFactory: action,
      closeDisabled: computed,
      setCloseDisabled: action,
      setAddApp: action,
      router: computed,
      setRouter: action,
      dashboard: computed,
      isRequiresOverflow: computed,
      windowSettings: computed,
      first: computed,
      last: computed,
      windowCount: computed,
      add: action,
      addNew: action,
      insertAt: action,
      insertBefore: action,
      replace: action,
      open: action,
      close: action,
      drag: computed,
      dragStart: action,
      dragEnd: action,
      resizing: computed,
      resizeType: computed,
      resizeStart: action,
      resizeEnd: action,
      activeIndex: computed,
      setActiveIndex: action,
      active: computed,
      setActive: action,
      maximizedIndex: computed,
      setMaximizedIndex: action,
      maximized: computed,
      setMaximized: action,
      headerHeight: computed,
      setHeaderHeight: action,
      splitLeft: action,
      splitRight: action,
      splitTop: action,
      splitBottom: action,
      dropWindow: action,
      config: computed,
      setConfig: action,
      remove: action
    });
  }

  get type() {
    return ComponentTypes.stack;
  }

  get id() {
    if (!this._id) {
      this._id = componentRegistry.next(this.type);
      console.log(this._id);
    }
    return this._id;
  }

  get isOverflow() {
    return false;
  }

  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  get root() {
    return this.parent ? this.parent.root : this;
  }

  get x() {
    return this._x;
  }

  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  get y() {
    return this._y;
  }

  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  get addApp() {
    if (this._addApp !== undefined) {
      return this._addApp;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.addApp : undefined;
  }

  set addApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this.setAddApp(addApp);
  }

  get componentFactory(): IComponentFactory {
    if (this._componentFactory !== undefined) {
      return this._componentFactory;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.componentFactory : NotConfiguredComponentFactory;
  }
  set componentFactory(value) {
    this.setComponentFactory(value);
  }
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  get closeDisabled(): boolean {
    if (this._closeDisabled !== undefined) {
      return this._closeDisabled;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.closeDisabled : false;
  }
  set closeDisabled(value) {
    this.setCloseDisabled(value);
  }
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  get router() {
    if (this._router !== undefined) {
      return this._router;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.router : undefined;
  }
  set router(value) {
    this.setRouter(value);
  }

  setRouter(router: IRouter) {
    this._router = router;
  }

  get dashboard(): IDashboard {
    const p = this.parent;
    if (p === this) {
      console.warn("-- Dashboard Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.dashboard : undefined;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = undefined;
    }
  }

  visit(callback: IConsumerFunc<IComponent>): void {
    callback(this);
  }

  findFirst(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    if (predicate(this)) {
      return this;
    }
    return this._findFirstChild(predicate);
  }

  findAll(predicate: IPredicateFunc<IComponent>): IComponent[] {
    let r = [];
    if (predicate(this)) {
      r.push(this);
    }
    const tr = this._findAllChildren(predicate);
    if (tr && tr.length > 0) {
      r = r.concat(tr);
    }
    return r;
  }

  get isRequiresOverflow() {
    return false;
  }

  get windowSettings() {
    if (this.type === "stack") this._windowSettings["role"] = "tabpanel";
    return this._windowSettings;
  }

  get first() {
    return this.windowCount > 0 ? this.windows[0] : undefined;
  }

  get last() {
    return this.windowCount > 0 ? this.windows[this.windows.length - 1] : undefined;
  }

  get windowCount(): number {
    return this.windows ? this.windows.length : 0;
  }

  get isWindowManager() {
    return true;
  }

  add(win: IWindow, opts?: any): void {
    if (win) {
      if (win.parent !== this) {
        win.removeFromParent();
        win.parent = this;
      } else {
        const itemIdx = this.windows.indexOf(win);
        this.windows.splice(itemIdx, 1);
      }
      this.windows.push(win);
      if ((opts && opts.makeActive) || this.windows.length === 1) {
        this.setActive(win);
      }
    }
    dispatchWindowResize();
  }

  addNew(opts?: any) {
    if (this.addApp) {
      let addApp = isFunction(this.addApp)
        ? (this.addApp as ISupplierFunc<IRequest>)()
        : this.addApp;
      if (opts) {
        addApp = Object.assign({}, addApp, opts);
      }
      return this.open(addApp);
    }
    return Promise.resolve();
  }

  insertAt(item: IWindow, index: number) {
    if (item && index >= 0 && index < this.windows.length) {
      let refStackItem = this.windows[index];
      let insertIdx: number = -1;
      if (item.parent !== this) {
        item.removeFromParent();
        item.parent = this;
        insertIdx = index;
      } else {
        const itemIdx = this.windows.indexOf(item);
        if (itemIdx >= 0 && itemIdx !== index) {
          this.windows.splice(itemIdx, 1);
          insertIdx = this.windows.indexOf(refStackItem);
        }
      }

      if (insertIdx >= 0) {
        this.windows.splice(insertIdx, 0, item);
      }
    } else {
      this.add(item);
    }
  }

  insertBefore(item: IWindow, refItem?: IWindow) {
    if (!refItem) {
      this.add(item);
    } else if (item) {
      this.insertAt(item, this.windows.indexOf(refItem));
    }
  }

  replace(newItem: IComponent, oldItem: IComponent): void {
    if (newItem && oldItem && oldItem.parent === this) {
      this.insertBefore(newItem as IWindow, oldItem as IWindow);
      oldItem.removeFromParent();
    }
  }

  open(request: WindowRequest): Promise<IWindow> {
    let win: any | IWindow;
    if (request && request.replace && request.name) {
      const db = this.dashboard;
      win = db.findFirst((w: IWindow) => {
        return w.type === "window" ? (w as IWindow).name === request.name : false;
      });
    }
    if (!win) {
      win = new Window();
      if (request) {
        win.name = request.name;
        win.setPath(request.path);
        win.setParams(request.params);
        win.setQuery(request.query);
        win.setTitle(request.title);
        win.setTransient(request.transient ? true : false);
        if (request.transient && request.opener) {
          const opener = request.opener; //as IAppHost;
          win.icon.url = opener.icon.url;
          win.icon.text = opener.icon.text;
          win.icon.name = opener.icon.name;
          win.icon.component = opener.icon.component;
        }
      }
      this.add(win, Object.assign({}, request, { makeActive: true }));
    } else {
      win.load(request);
    }
    return Promise.resolve(win);
  }

  _visitChildren(callback: IConsumerFunc<IComponent, IComponent[]>) {
    this.windows.forEach(w => w.visit(callback));
  }

  _findFirstChild(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    let r: IComponent;
    this.windows.some(w => {
      r = w.findFirst(predicate);
      return r ? true : false;
    });
    return r;
  }

  _findAllChildren(predicate: IPredicateFunc<IComponent, IComponent[]>): IComponent[] {
    let r: IComponent[] = [];
    let wr: IComponent[];
    this.windows.forEach(w => {
      wr = w.findAll(predicate);
      if (wr && wr.length > 0) {
        r = r.concat(wr);
      }
    });
    return r;
  }

  close() {
    //if (this.id === "stack-comp-1") return
    if (!this.closeDisabled) {
      while (this.windowCount > 0) {
        this.windows[0].close();
      }
      this.removeFromParent();
    }
    //if (!this.closeDisabled) {}
  }

  _onDragStart(drag: IWindow) {
    // does nothing by default
  }

  _onDragEnd() {
    // does nothing by default
  }

  get drag() {
    return this._drag;
  }
  dragStart(drag: IWindow) {
    if (this.dashboard) {
      this.dashboard.dragStart(drag);
    }
    this._drag = drag;
    this._onDragStart(drag);
  }
  dragEnd(): void {
    if (this.dashboard) {
      this.dashboard.dragEnd();
    }
    this._drag = undefined;
    this._onDragEnd();
  }

  get resizing() {
    return this._resizing;
  }

  get resizeType() {
    return this._resizeType;
  }

  _onResizeStart(win: IWindow) {
    // does nothing by default
  }

  _onResizeEnd() {
    // does nothing by default
  }

  resizeStart(win: IWindow, type: WindowResizeType) {
    this._resizing = win;
    this._resizeType = type;
    this._onResizeStart(win);
  }

  resizeEnd() {
    this._resizing = undefined;
    this._resizeType = undefined;
    this._onResizeEnd();
  }

  get activeIndex() {
    if (this._activeIndex >= 0 && this._activeIndex < this.windowCount) {
      return this._activeIndex;
    }
    if (this._activeIndex >= this.windowCount && this.windowCount > 0) {
      return this.windowCount - 1;
    }
    return 0;
  }
  set activeIndex(value) {
    this.setActiveIndex(value);
  }

  setActiveIndex(activeIndex: number) {
    if (activeIndex !== this._activeIndex) {
      this._activeIndex = activeIndex;
    }
  }

  get active(): IWindow {
    const activeIndex = this.activeIndex;
    return activeIndex >= 0 && activeIndex < this.windowCount
      ? this.windows[activeIndex]
      : undefined;
  }
  set active(value: IWindow) {
    this.setActive(value);
  }

  setActive(active: IWindow) {
    this.setActiveIndex(this.windows.indexOf(active));
  }

  get maximizedIndex() {
    return this._maximizedIndex;
  }
  set maximizedIndex(value) {
    this.setMaximizedIndex(value);
  }

  setMaximizedIndex(maximizedIndex: number) {
    if (maximizedIndex !== this._maximizedIndex) {
      this._maximizedIndex = maximizedIndex;
    }
  }

  get maximized(): IWindow {
    const maximizedIndex = this.maximizedIndex;
    return maximizedIndex !== undefined &&
      maximizedIndex >= 0 &&
      maximizedIndex < this.windows.length
      ? this.windows[maximizedIndex]
      : undefined;
  }
  set maximized(value: IWindow) {
    this.setMaximized(value);
  }
  setMaximized(maximized: IWindow) {
    this.setMaximizedIndex(maximized ? this.windows.indexOf(maximized) : undefined);
    if (maximized) {
      this.setActive(maximized);
    }
  }

  get headerHeight() {
    return this._headerHeight;
  }
  set headerHeight(value) {
    this.setHeaderHeight(value);
  }
  setHeaderHeight(headerHeight: number) {
    if (headerHeight >= 0) {
      this._headerHeight = headerHeight;
    }
  }

  _windowDropped(win: IWindow) {
    this.setActive(win);
  }

  splitLeft(newComp?: IComponent) {
    const newStack = new Stack();
    newStack.setCloseDisabled(this.closeDisabled);
    if (newComp) {
      newStack.add(newComp as IWindow);
    } else {
      newStack.addNew();
    }
    splitHorizontal(this, newStack, this);
  }

  splitRight(newComp?: IComponent) {
    const newStack = new Stack();
    newStack.setCloseDisabled(this.closeDisabled);
    if (newComp) {
      newStack.add(newComp as IWindow);
    } else {
      newStack.addNew();
    }
    splitHorizontal(this, this, newStack);
  }

  splitTop(newComp?: IComponent) {
    const newStack = new Stack();
    newStack.setCloseDisabled(this.closeDisabled);
    if (newComp) {
      newStack.add(newComp as IWindow);
    } else {
      newStack.addNew();
    }
    splitVertical(this, newStack, this);
  }

  splitBottom(newComp?: IComponent) {
    const newStack = new Stack();
    newStack.setCloseDisabled(this.closeDisabled);
    if (newComp) {
      newStack.add(newComp as IWindow);
    } else {
      newStack.addNew();
    }
    splitVertical(this, this, newStack);
  }

  dropWindow(refWindow?: IWindow): void {
    const drag = this.dashboard ? this.dashboard.drag : undefined;
    if (drag) {
      const win = drag as IWindow;
      if (refWindow) {
        if (drag.parent === this) {
          const dragIdx = this.windows.indexOf(win);
          const refIdx = this.windows.indexOf(refWindow);
          this.insertAt(win, dragIdx > refIdx ? refIdx : refIdx + 1);
        } else {
          this.insertBefore(win, refWindow);
        }
      } else {
        this.add(win);
      }
      this._windowDropped(win);
      this.dragEnd();
    }
  }

  get config(): IStackConfig {
    return {
      type: this.type,
      activeIndex: this._activeIndex,
      windows: this.windows.filter(w => !w.transient).map(w => w.config),
      closeDisabled: this._closeDisabled
    };
  }
  set config(value) {
    this.setConfig(value);
  }
  setConfig(config: IStackConfig): void {
    this.windows.forEach(w => w.close({ noRemove: true }));
    this.windows = [];
    if (config && config.windows && config.windows.length > 0) {
      config.windows.forEach(wc => {
        const w = new Window();
        this.add(w);
        w.setConfig(wc);
      });
    }
    this.setActiveIndex(config && !isNaN(config.activeIndex) ? config.activeIndex : 0);
    this.setCloseDisabled(config ? config.closeDisabled : undefined);
  }

  remove(node: IComponent) {
    const idx = this.windows.indexOf(node as IWindow);
    if (idx >= 0) {
      const w = this.windows[idx];
      w.parent = undefined;
      this.windows.splice(idx, 1);

      if (this.windows.length === 0) {
        this.removeFromParent();
      }
    }
    if (this.windows.length > 0) {
      if (this.activeIndex >= this.windows.length) {
        this.setActiveIndex(this.windows.length - 1);
      }
    }
  }

  _setWindowViewports = () => {
    const childY = this.y + this.headerHeight;
    const childHeight = this.height - this.headerHeight;
    const active = this.active;
    this.windows.forEach(w => {
      w.setViewport(this.x, childY, w === active ? this.width : 0, w === active ? childHeight : 0);
    });
  };

  _setViewportDisposer = autorun(this._setWindowViewports);

  toJSON() {
    return this.config;
  }
}

const isSamePosition = (a: IGridBounds, b: IGridBounds): boolean => {
  return a.colIndex === b.colIndex && a.rowIndex === b.rowIndex;
};

const isSameSize = (a: IGridBounds, b: IGridBounds): boolean => {
  return a.colSpan === b.colSpan && a.rowSpan === b.rowSpan;
};

class Grid {
  _id: string;
  parent: IComponent;
  _componentFactory: IComponentFactory;
  _addApp: IRequest | ISupplierFunc<IRequest>;
  _router: IRouter;
  _closeDisabled: boolean;
  _needsOverflow: boolean;
  _x: number = 0;
  _y: number = 0;
  _width: number = 0;
  _height: number = 0;
  windows: IWindow[] = [];
  _windowSettings = new WindowSettings();
  _resizing: IWindow;
  _resizeType: WindowResizeType;
  _drag: IWindow;
  _activeIndex: number;
  _maximizedIndex: number;
  _cellSize: number;
  _cellMargin: number;
  _defaultWindowColSpan: number;
  _defaultWindowRowSpan: number;
  _settingsActive: boolean = false;
  _dragDisposer: IReactionDisposer;
  _layoutDisposer: IReactionDisposer;
  _resizeHandlers: { [key: string]: (colIndex: number, rowIndex: number, w: IWindow) => void };

  constructor() {
    makeObservable(this, {
      parent: observable.ref,
      _componentFactory: observable.ref,
      _addApp: observable.ref,
      _router: observable.ref,
      _closeDisabled: observable,
      _needsOverflow: observable,
      _x: observable,
      _y: observable,
      _width: observable,
      _height: observable,
      windows: observable,
      _windowSettings: observable,
      _resizing: observable.ref,
      _resizeType: observable,
      _drag: observable.ref,
      _activeIndex: observable,
      _maximizedIndex: observable,
      _cellSize: observable,
      _cellMargin: observable,
      _defaultWindowColSpan: observable,
      _defaultWindowRowSpan: observable,
      _settingsActive: observable,
      isOverflow: computed,
      resetViewport: action,
      root: computed,
      x: computed,
      rx: computed,
      y: computed,
      ry: computed,
      width: computed,
      height: computed,
      resize: action,
      position: action,
      setViewport: action,
      addApp: computed,
      componentFactory: computed,
      setComponentFactory: action,
      closeDisabled: computed,
      setCloseDisabled: action,
      setAddApp: action,
      router: computed,
      setRouter: action,
      dashboard: computed,
      windowSettings: computed,
      first: computed,
      last: computed,
      windowCount: computed,
      addNew: action,
      insertAt: action,
      insertBefore: action,
      replace: action,
      open: action,
      remove: action,
      close: action,
      drag: computed,
      dragStart: action,
      dragEnd: action,
      resizing: computed,
      resizeType: computed,
      resizeStart: action,
      resizeEnd: action,
      activeIndex: computed,
      setActiveIndex: action,
      active: computed,
      setActive: action,
      maximizedIndex: computed,
      setMaximizedIndex: action,
      maximized: computed,
      setMaximized: action,
      isRequiresOverflow: computed,
      cellSize: computed,
      setCellSize: action,
      cellMargin: computed,
      setCellMargin: action,
      rows: computed,
      columns: computed,
      defaultWindowColSpan: computed,
      setDefaultWindowColSpan: action,
      defaultWindowRowSpan: computed,
      setDefaultWindowRowSpan: action,
      gridWidth: computed,
      gridHeight: computed,
      settingsActive: computed,
      setSettingsActive: action,
      config: computed,
      setConfig: action,
      setBounds: action,
      makeWayFor: action,
      rightMost: computed,
      rightMostColumn: computed,
      bottomMost: computed,
      bottomMostRow: computed,
      newHere: action,
      applyDragStartPosition: action,
      applyDragStartPositions: action,
      moveTo: action,
      resizeTo: action,
      viewportColumns: computed,
      viewportRows: computed,
      add: action
    });

    this.windowSettings.borderWidth = 1;
    this.windowSettings.headerHeight = 28;
    this.windowSettings.resizable = true;
    this.windowSettings.draggable = true;
    this.windowSettings.animatePosition = true;
    this._resizeHandlers = {};
    this._resizeHandlers[WindowResizeType.top] = this._resizeTop;
    this._resizeHandlers[WindowResizeType.right] = this._resizeRight;
    this._resizeHandlers[WindowResizeType.bottom] = this._resizeBottom;
    this._resizeHandlers[WindowResizeType.left] = this._resizeLeft;
    this._resizeHandlers[WindowResizeType.bottomRight] = this._resizeBottomRight;
    this._resizeHandlers[WindowResizeType.topRight] = this._resizeTopRight;
    this._resizeHandlers[WindowResizeType.bottomLeft] = this._resizeBottomLeft;
    this._resizeHandlers[WindowResizeType.topLeft] = this._resizeTopLeft;
    this._layoutDisposer = autorun(this._layout);
  }

  get type() {
    return ComponentTypes.grid;
  }

  get id() {
    if (!this._id) {
      this._id = componentRegistry.next(this.type);
      console.log(this._id);
    }
    return this._id;
  }

  get isOverflow() {
    return false;
  }

  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  get root() {
    return this.parent ? this.parent.root : this;
  }

  get x() {
    return this._x;
  }

  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  get y() {
    return this._y;
  }

  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  get addApp() {
    if (this._addApp !== undefined) {
      return this._addApp;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.addApp : undefined;
  }

  set addApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this.setAddApp(addApp);
  }

  get componentFactory(): IComponentFactory {
    if (this._componentFactory !== undefined) {
      return this._componentFactory;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.componentFactory : NotConfiguredComponentFactory;
  }
  set componentFactory(value) {
    this.setComponentFactory(value);
  }
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  get closeDisabled(): boolean {
    if (this._closeDisabled !== undefined) {
      return this._closeDisabled;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.closeDisabled : false;
  }
  set closeDisabled(value) {
    this.setCloseDisabled(value);
  }
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  get router() {
    if (this._router !== undefined) {
      return this._router;
    }
    const p = this.parent;
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.router : undefined;
  }
  set router(value) {
    this.setRouter(value);
  }

  setRouter(router: IRouter) {
    this._router = router;
  }

  get dashboard(): IDashboard {
    const p = this.parent;
    if (p === this) {
      console.warn("-- Dashboard Resolution Cycle Detected");
      return undefined;
    }
    return p ? p.dashboard : undefined;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = undefined;
    }
  }

  visit(callback: IConsumerFunc<IComponent>): void {
    callback(this);
  }

  findFirst(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    if (predicate(this)) {
      return this;
    }
    return this._findFirstChild(predicate);
  }

  findAll(predicate: IPredicateFunc<IComponent>): IComponent[] {
    let r = [];
    if (predicate(this)) {
      r.push(this);
    }
    const tr = this._findAllChildren(predicate);
    if (tr && tr.length > 0) {
      r = r.concat(tr);
    }
    return r;
  }

  toJSON() {
    return this.config;
  }

  get windowSettings() {
    return this._windowSettings;
  }

  get first() {
    return this.windowCount > 0 ? this.windows[0] : undefined;
  }

  get last() {
    return this.windowCount > 0 ? this.windows[this.windows.length - 1] : undefined;
  }

  get windowCount(): number {
    return this.windows ? this.windows.length : 0;
  }

  get isWindowManager() {
    return true;
  }

  addNew(opts?: any) {
    if (this.addApp) {
      let addApp = isFunction(this.addApp)
        ? (this.addApp as ISupplierFunc<IRequest>)()
        : this.addApp;
      if (opts) {
        addApp = Object.assign({}, addApp, opts);
      }
      return this.open(addApp);
    }
    return Promise.resolve();
  }

  insertAt(item: IWindow, index: number) {
    if (item && index >= 0 && index < this.windows.length) {
      let refStackItem = this.windows[index];
      let insertIdx: number = -1;
      if (item.parent !== this) {
        item.removeFromParent();
        item.parent = this;
        insertIdx = index;
      } else {
        const itemIdx = this.windows.indexOf(item);
        if (itemIdx >= 0 && itemIdx !== index) {
          this.windows.splice(itemIdx, 1);
          insertIdx = this.windows.indexOf(refStackItem);
        }
      }

      if (insertIdx >= 0) {
        this.windows.splice(insertIdx, 0, item);
      }
    } else {
      this.add(item);
    }
  }

  insertBefore(item: IWindow, refItem?: IWindow) {
    if (!refItem) {
      this.add(item);
    } else if (item) {
      this.insertAt(item, this.windows.indexOf(refItem));
    }
  }

  replace(newItem: IComponent, oldItem: IComponent): void {
    if (newItem && oldItem && oldItem.parent === this) {
      this.insertBefore(newItem as IWindow, oldItem as IWindow);
      oldItem.removeFromParent();
    }
  }

  open(request: WindowRequest): Promise<IWindow> {
    let win: any | IWindow;
    if (request && request.replace && request.name) {
      const db = this.dashboard;
      win = db.findFirst((w: IWindow) => {
        return w.type === "window" ? (w as IWindow).name === request.name : false;
      });
    }
    if (!win) {
      win = new Window();
      if (request) {
        win.name = request.name;
        win.setPath(request.path);
        win.setParams(request.params);
        win.setQuery(request.query);
        win.setTitle(request.title);
        win.setTransient(request.transient ? true : false);
        if (request.transient && request.opener) {
          const opener = request.opener; //as IAppHost;
          win.icon.url = opener.icon.url;
          win.icon.text = opener.icon.text;
          win.icon.name = opener.icon.name;
          win.icon.component = opener.icon.component;
        }
      }
      this.add(win, Object.assign({}, request, { makeActive: true }));
    } else {
      win.load(request);
    }
    return Promise.resolve(win);
  }

  _visitChildren(callback: IConsumerFunc<IComponent, IComponent[]>) {
    this.windows.forEach(w => w.visit(callback));
  }

  _findFirstChild(predicate: IPredicateFunc<IComponent, IComponent[]>) {
    let r: IComponent;
    this.windows.some(w => {
      r = w.findFirst(predicate);
      return r ? true : false;
    });
    return r;
  }

  _findAllChildren(predicate: IPredicateFunc<IComponent, IComponent[]>): IComponent[] {
    let r = [];
    let wr: IComponent[];
    this.windows.forEach(w => {
      wr = w.findAll(predicate);
      if (wr && wr.length > 0) {
        r = r.concat(wr);
      }
    });
    return r;
  }

  remove(node: IComponent) {
    const idx = this.windows.indexOf(node as IWindow);
    if (idx >= 0) {
      const w = this.windows[idx];
      w.parent = undefined;
      this.windows.splice(idx, 1);

      if (this.windows.length === 0) {
        this.removeFromParent();
      }
    }
  }

  close() {
    //if (this.id === "stack-comp-1") return
    if (!this.closeDisabled) {
      while (this.windowCount > 0) {
        this.windows[0].close();
      }
      this.removeFromParent();
    }
    //if (!this.closeDisabled) {}
  }

  _onDragEnd() {
    // does nothing by default
  }

  get drag() {
    return this._drag;
  }
  dragStart(drag: IWindow) {
    if (this.dashboard) {
      this.dashboard.dragStart(drag);
    }
    this._drag = drag;
    this._onDragStart(drag);
  }
  dragEnd(): void {
    if (this.dashboard) {
      this.dashboard.dragEnd();
    }
    this._drag = undefined;
    this._onDragEnd();
  }

  get resizing() {
    return this._resizing;
  }

  get resizeType() {
    return this._resizeType;
  }

  _onResizeEnd() {
    // does nothing by default
  }

  resizeStart(win: IWindow, type: WindowResizeType) {
    this._resizing = win;
    this._resizeType = type;
    this._onResizeStart(win);
  }

  resizeEnd() {
    this._resizing = undefined;
    this._resizeType = undefined;
    this._onResizeEnd();
  }

  get activeIndex() {
    if (this._activeIndex >= 0 && this._activeIndex < this.windowCount) {
      return this._activeIndex;
    }
    if (this._activeIndex >= this.windowCount && this.windowCount > 0) {
      return this.windowCount - 1;
    }
    return 0;
  }
  set activeIndex(value) {
    this.setActiveIndex(value);
  }

  setActiveIndex(activeIndex: number) {
    if (activeIndex !== this._activeIndex) {
      this._activeIndex = activeIndex;
    }
  }

  get active(): IWindow {
    const activeIndex = this.activeIndex;
    return activeIndex >= 0 && activeIndex < this.windowCount
      ? this.windows[activeIndex]
      : undefined;
  }
  set active(value: IWindow) {
    this.setActive(value);
  }

  setActive(active: IWindow) {
    this.setActiveIndex(this.windows.indexOf(active));
  }

  get maximizedIndex() {
    return this._maximizedIndex;
  }
  set maximizedIndex(value) {
    this.setMaximizedIndex(value);
  }

  setMaximizedIndex(maximizedIndex: number) {
    if (maximizedIndex !== this._maximizedIndex) {
      this._maximizedIndex = maximizedIndex;
    }
  }

  get maximized(): IWindow {
    const maximizedIndex = this.maximizedIndex;
    return maximizedIndex !== undefined &&
      maximizedIndex >= 0 &&
      maximizedIndex < this.windows.length
      ? this.windows[maximizedIndex]
      : undefined;
  }
  set maximized(value: IWindow) {
    this.setMaximized(value);
  }
  setMaximized(maximized: IWindow) {
    this.setMaximizedIndex(maximized ? this.windows.indexOf(maximized) : undefined);
    if (maximized) {
      this.setActive(maximized);
    }
  }

  get isRequiresOverflow() {
    return this.maximized ? false : true;
  }

  get cellSize() {
    return this._cellSize !== undefined ? this._cellSize : Defaults.cellSize;
  }
  set cellSize(value) {
    this.setCellSize(value);
  }
  setCellSize(cellSize: number) {
    if (cellSize > 0) {
      this._cellSize = cellSize;
    }
  }

  get cellMargin() {
    return this._cellMargin !== undefined ? this._cellMargin : Defaults.cellMargin;
  }
  set cellMargin(value) {
    this.setCellMargin(value);
  }
  setCellMargin(cellMargin: number) {
    if (cellMargin >= 0) {
      this._cellMargin = cellMargin;
    }
  }

  get rows() {
    const b = this.bottomMostRow + 1;
    const vp = this.viewportRows;
    return b > vp ? b : vp;
  }

  get columns() {
    const r = this.rightMostColumn + 1;
    const vp = this.viewportColumns;
    return r > vp ? r : vp;
  }

  get defaultWindowColSpan() {
    return this._defaultWindowColSpan !== undefined
      ? this._defaultWindowColSpan
      : Defaults.defaultWindowColSpan;
  }
  set defaultWindowColSpan(value) {
    this.setDefaultWindowColSpan(value);
  }
  setDefaultWindowColSpan(defaultWindowColSpan: number) {
    if (defaultWindowColSpan > 0) {
      this._defaultWindowColSpan = defaultWindowColSpan;
    }
  }

  get defaultWindowRowSpan() {
    return this._defaultWindowRowSpan !== undefined
      ? this._defaultWindowRowSpan
      : Defaults.defaultWindowRowSpan;
  }
  set defaultWindowRowSpan(value) {
    this.setDefaultWindowRowSpan(value);
  }
  setDefaultWindowRowSpan(defaultWindowRowSpan: number) {
    if (defaultWindowRowSpan > 0) {
      this._defaultWindowRowSpan = defaultWindowRowSpan;
    }
  }

  get gridWidth(): number {
    return this.cellMargin + this.columns * (this.cellSize + this.cellMargin);
  }

  get gridHeight(): number {
    return this.cellMargin + this.rows * (this.cellSize + this.cellMargin);
  }

  get settingsActive() {
    return this._settingsActive;
  }
  set settingsActive(value) {
    this.setSettingsActive(value);
  }
  setSettingsActive(settingsActive: boolean) {
    this._settingsActive = settingsActive;
  }

  get config(): IGridConfig {
    return {
      type: this.type,
      cellSize: this._cellSize,
      cellMargin: this._cellMargin,
      defaultWindowColSpan: this._defaultWindowColSpan,
      defaultWindowRowSpan: this._defaultWindowRowSpan,
      windows: this.windows.filter(w => !w.transient).map(w => w.config),
      closeDisabled: this._closeDisabled,
      maximizedIndex: this._maximizedIndex,
      activeIndex: this._activeIndex
    };
  }
  set config(value) {
    this.setConfig(value);
  }
  setConfig(config: IGridConfig) {
    this.windows = [];
    if (config && config.windows && config.windows.length > 0) {
      config.windows.forEach(wc => {
        const w = new Window();
        this.add(w);
        w.setConfig(wc);
      });
    }
    this.setCellSize(config ? config.cellSize : undefined);
    this.setCellMargin(config ? config.cellMargin : undefined);
    this.setDefaultWindowColSpan(config ? config.defaultWindowColSpan : undefined);
    this.setDefaultWindowRowSpan(config ? config.defaultWindowRowSpan : undefined);
    this.setCloseDisabled(config ? config.closeDisabled : undefined);
    this.setMaximizedIndex(config ? config.maximizedIndex : undefined);
    this.setActiveIndex(config ? config.activeIndex : undefined);
  }

  getBounds(w: IWindow): IGridBounds {
    let r = w.settings.data.grid as IGridBounds;
    if (!r) {
      r = {
        colIndex: 0,
        rowIndex: 0,
        colSpan: this.defaultWindowColSpan,
        rowSpan: this.defaultWindowRowSpan
      };
    }
    return r;
  }

  setBounds(w: IWindow, bounds: IGridBounds) {
    w.settings.setData({ grid: bounds });
  }

  isWindowCollision(a: IWindow, b: IWindow) {
    return isCollision(this.getBounds(a), this.getBounds(b));
  }

  dontMessWith(boss: IWindow, w: IWindow) {
    const bb = this.getBounds(boss);
    const b = this.getBounds(w);
    const viewportColumns = this.viewportColumns;
    let newPos: IGridBounds;
    if (bb.colIndex + bb.colSpan + b.colSpan <= viewportColumns) {
      newPos = Object.assign({}, b, { colIndex: bb.colIndex + bb.colSpan });
    } else {
      newPos = Object.assign({}, b, { colIndex: 0, rowIndex: bb.rowIndex + bb.rowSpan });
    }
    this.setBounds(w, newPos);
  }

  getCollisions(pos: IGridBounds): IWindow[] {
    return this.windows.filter(w => {
      return isCollision(pos, this.getBounds(w));
    });
  }

  hasCollision(pos: IGridBounds, ignore?: IWindow[]): boolean {
    return this.windows.some(w => {
      return (!ignore || ignore.indexOf(w) < 0) && isCollision(pos, this.getBounds(w));
    });
  }

  windowHasCollision(win: IWindow): boolean {
    return this.windows.some(w => {
      return w !== win && this.isWindowCollision(win, w);
    });
  }

  getWindowCollisions(win: IWindow, ignore?: IWindow[]): IWindow[] {
    return this.windows.filter(w => {
      return w !== win && (!ignore || ignore.indexOf(w) < 0) && this.isWindowCollision(w, win);
    });
  }

  getFirstWindowCollision(win: IWindow, ignore?: IWindow[]): IWindow {
    return this.windows.find(w => {
      return w !== win && (!ignore || ignore.indexOf(w) < 0) && this.isWindowCollision(w, win);
    });
  }

  makeWayFor(win: IWindow, ignore?: IWindow[]): void {
    const cs = this.getWindowCollisions(win, ignore);
    if (cs.length > 0) {
      cs.forEach(c => {
        this.dontMessWith(win, c);
      });
      let nextIgnore = [win];
      if (ignore) {
        nextIgnore = nextIgnore.concat(ignore);
      }
      this.makeWayFor(cs[0], nextIgnore);
    }
  }

  get rightMost() {
    return this.getRightMost(this.windows);
  }

  get rightMostColumn() {
    const r = this.rightMost;
    if (r) {
      const rb = this.getBounds(r);
      return rb.colIndex + rb.colSpan;
    }
    return 0;
  }

  getRightMost(windows: IWindow[]): IWindow {
    let r: IWindow;
    windows.forEach(w => {
      if (!r) {
        r = w;
      } else {
        const b = this.getBounds(w);
        const rb = this.getBounds(r);
        if (b.colIndex + b.colSpan > rb.colIndex + rb.colSpan) {
          r = w;
        }
      }
    });
    return r;
  }

  isViewportSpaceToRight(target: IWindow, w: IWindow): boolean {
    const tb = this.getBounds(target);
    const wb = this.getBounds(w);
    return tb.colIndex + tb.colSpan + wb.colSpan <= this.viewportColumns;
  }

  get bottomMost() {
    return this.getBottomMost(this.windows);
  }

  get bottomMostRow() {
    const b = this.bottomMost;
    if (b) {
      const bb = this.getBounds(b);
      return bb.rowIndex + bb.rowSpan;
    }
    return 0;
  }

  getBottomMost(windows: IWindow[]): IWindow {
    let r: IWindow;
    windows.forEach(w => {
      if (!r) {
        r = w;
      } else {
        const b = this.getBounds(w);
        const rb = this.getBounds(r);
        if (b.rowIndex + b.rowSpan > rb.rowIndex + rb.rowSpan) {
          r = w;
        }
      }
    });
    return r;
  }

  isViewportSpaceBelow(target: IWindow, w: IWindow): boolean {
    const tb = this.getBounds(target);
    const wb = this.getBounds(w);
    return tb.rowIndex + tb.rowSpan + wb.rowSpan <= this.viewportRows;
  }

  newHere(win: IWindow): void {
    let collisions: IWindow[];
    while (true) {
      collisions = this.getWindowCollisions(win);
      if (collisions.length > 0) {
        this.dontMessWith(collisions[0], win);
      } else {
        break;
      }
    }
  }

  applyDragStartPosition(w: IWindow) {
    const pos = this.getBounds(w);
    const dragStartPos = w.dragState.gridBounds as IGridBounds;
    if (
      dragStartPos &&
      !isSamePosition(pos, dragStartPos) &&
      !this.hasCollision(dragStartPos, [w])
    ) {
      this.setBounds(w, dragStartPos);
    }
  }

  applyDragStartPositions(boss: IWindow) {
    if (boss) {
      this.windows.forEach(w => {
        if (w !== boss) {
          this.applyDragStartPosition(w);
        }
      });
    }
  }

  moveTo(colIndex: number, rowIndex: number, w: IWindow = this.drag) {
    if (w && w.parent === this) {
      const pos = this.getBounds(w);

      if (colIndex < 0) {
        colIndex = 0;
      }

      if (rowIndex < 0) {
        rowIndex = 0;
      }

      if (colIndex !== pos.colIndex || rowIndex !== pos.rowIndex) {
        this.setBounds(w, Object.assign({}, pos, { colIndex: colIndex, rowIndex: rowIndex }));
        this.makeWayFor(w);
        this.applyDragStartPositions(this.drag);
      }
    }
  }

  _resizeRight = (colIndex: number, rowIndex: number, w: IWindow) => {
    const pos = this.getBounds(w);
    let colSpan = colIndex - pos.colIndex + 1;

    if (colSpan <= 0) {
      colSpan = 1;
    }

    if (colSpan !== pos.colSpan) {
      this.setBounds(w, Object.assign({}, pos, { colSpan: colSpan }));
    }
  };

  _resizeLeft = (colIndex: number, rowIndex: number, w: IWindow) => {
    const pos = this.getBounds(w);
    const rightColIndex = pos.colIndex + pos.colSpan;
    let colSpan = rightColIndex - colIndex;
    if (colSpan <= 0) {
      colSpan = 1;
    }
    if (colSpan !== pos.colSpan) {
      this.setBounds(w, Object.assign({}, pos, { colIndex: colIndex, colSpan: colSpan }));
    }
  };

  _resizeBottom = (colIndex: number, rowIndex: number, w: IWindow) => {
    const pos = this.getBounds(w);
    let rowSpan = rowIndex - pos.rowIndex + 1;

    if (rowSpan <= 0) {
      rowSpan = 1;
    }

    if (rowSpan !== pos.rowSpan) {
      this.setBounds(w, Object.assign({}, pos, { rowSpan: rowSpan }));
    }
  };

  _resizeTop = (colIndex: number, rowIndex: number, w: IWindow) => {
    const pos = this.getBounds(w);
    const bottomRowIndex = pos.rowIndex + pos.rowSpan;
    let rowSpan = bottomRowIndex - rowIndex;
    if (rowSpan <= 0) {
      rowSpan = 1;
    }
    if (rowSpan !== pos.rowSpan) {
      this.setBounds(w, Object.assign({}, pos, { rowIndex: rowIndex, rowSpan: rowSpan }));
    }
  };

  _resizeBottomRight = (colIndex: number, rowIndex: number, w: IWindow) => {
    this._resizeBottom(colIndex, rowIndex, w);
    this._resizeRight(colIndex, rowIndex, w);
  };

  _resizeTopRight = (colIndex: number, rowIndex: number, w: IWindow) => {
    this._resizeTop(colIndex, rowIndex, w);
    this._resizeRight(colIndex, rowIndex, w);
  };

  _resizeBottomLeft = (colIndex: number, rowIndex: number, w: IWindow) => {
    this._resizeBottom(colIndex, rowIndex, w);
    this._resizeLeft(colIndex, rowIndex, w);
  };

  _resizeTopLeft = (colIndex: number, rowIndex: number, w: IWindow) => {
    this._resizeTop(colIndex, rowIndex, w);
    this._resizeLeft(colIndex, rowIndex, w);
  };

  resizeTo(colIndex: number, rowIndex: number, w: IWindow = this.resizing) {
    if (w && w.parent === this) {
      const h = this._resizeHandlers[this.resizeType];
      if (h) {
        h(colIndex, rowIndex, w);
        this.makeWayFor(w);
        this.applyDragStartPositions(this.resizing);
      }
    }
  }

  getViewportX(colIndex: number): number {
    return this.x + this.cellMargin + colIndex * (this.cellSize + this.cellMargin);
  }

  getWindowViewportX(w: IWindow): number {
    return this.getViewportX(this.getBounds(w).colIndex);
  }

  getViewportWidth(colSpan: number): number {
    return colSpan * this.cellSize + (colSpan - 1) * this.cellMargin;
  }

  getWindowViewportWidth(w: IWindow): number {
    return this.getViewportWidth(this.getBounds(w).colSpan);
  }

  getViewportY(rowIndex: number): number {
    return this.y + this.cellMargin + rowIndex * (this.cellSize + this.cellMargin);
  }

  getWindowViewportY(w: IWindow): number {
    return this.getViewportY(this.getBounds(w).rowIndex);
  }

  getViewportHeight(rowSpan: number): number {
    return rowSpan * this.cellSize + (rowSpan - 1) * this.cellMargin;
  }

  getWindowViewportHeight(w: IWindow): number {
    return this.getViewportHeight(this.getBounds(w).rowSpan);
  }

  get viewportColumns() {
    const r = Math.floor((this.width - this.cellMargin) / (this.cellMargin + this.cellSize));
    return r < 0 ? 0 : r;
  }

  get viewportRows() {
    const r = Math.floor((this.height - this.cellMargin) / (this.cellMargin + this.cellSize));
    return r < 0 ? 0 : r;
  }

  _layout = () => {
    if (this.maximized) {
      this.windows.forEach(w => {
        if (w !== this.maximized) {
          w.setViewport(0, 0, 0, 0);
        }
      });
      this.maximized.setViewport(this.x, this.y, this.width, this.height);
    } else {
      this.windows.forEach(w => {
        const pos = this.getBounds(w);
        const vx = this.getViewportX(pos.colIndex);
        const vy = this.getViewportY(pos.rowIndex);
        const width = this.getViewportWidth(pos.colSpan);
        const height = this.getViewportHeight(pos.rowSpan);
        w.setViewport(vx, vy, width, height);
      });
    }
  };

  add(win: IWindow, opts?: any): void {
    if (win) {
      if (win.parent !== this) {
        win.removeFromParent();
        win.parent = this;
      } else {
        const itemIdx = this.windows.indexOf(win);
        this.windows.splice(itemIdx, 1);
      }
      this.windows.push(win);
      if ((opts && opts.makeActive) || this.windows.length === 1) {
        this.setActive(win);
      }
      this.newHere(win);
    }
    dispatchWindowResize();
  }

  _onDragStart(drag: IWindow) {
    this.windows.forEach(w => {
      w.setDragState({ gridBounds: Object.assign({}, this.getBounds(w)) });
    });
  }

  _onResizeStart(win: IWindow) {
    this._onDragStart(win);
  }
}

export { ComponentFactory, componentRegistry };
export { Dashboard };
export { DashboardList, DashboardList as DashboardListModel };
export { Grid };
export { HSplit, VSplit };
export { Stack };
export { Window };
//export { WindowAppHost };
export { WindowSettings };
