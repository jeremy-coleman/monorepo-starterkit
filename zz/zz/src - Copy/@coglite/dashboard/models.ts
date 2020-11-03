import { AppHost, IAppHost } from "@coglite/app-host";
import { Sync } from "@coglite/app-host";
import { IRequest, IRouter } from "@coglite/router";
import { IConsumerFunc, IPredicateFunc, isFunction, ISupplierFunc } from "@coglite/app-host";
import { action, autorun, computed, IReactionDisposer, observable, reaction } from "mobx";
import { when } from "when-switch";
import { ComponentTypes, Defaults, WindowResizeType } from "./constants";
import { dispatchWindowResize } from "./DOMHelper";

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
  @observable.ref parent: IComponent;
  @observable.ref _componentFactory: IComponentFactory;
  @observable.ref _addApp: IRequest | ISupplierFunc<IRequest>;
  @observable.ref _router: IRouter;
  @observable _closeDisabled: boolean;
  @observable _needsOverflow: boolean;
  @observable _x: number = 0;
  @observable _y: number = 0;
  @observable _width: number = 0;
  @observable _height: number = 0;
  @observable sync = new Sync();
  @observable _title: string;
  @observable _component: IComponent;
  @observable.ref _drag: IWindow;
  @observable.ref _blockSource: IComponent;

  _saveDelay: number = 1000;
  loader: () => Promise<any> | any;
  saver: (data: any) => Promise<any> | any;
  _configSaveDisposer: IReactionDisposer;

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

  @computed
  get isOverflow() {
    return false;
  }

  @action
  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  @computed
  get root() {
    return this.parent ? this.parent.root : this;
  }

  @computed
  get x() {
    return this._x;
  }

  @computed
  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  @computed
  get y() {
    return this._y;
  }

  @computed
  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  @computed
  get width() {
    return this._width;
  }

  @computed
  get height() {
    return this._height;
  }

  @action
  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  @action
  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @action
  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  @computed
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

  @computed
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
  @action
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  @computed
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
  @action
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  @action
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  @computed
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

  @action
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

  @computed
  get dashboardList(): IDashboardList {
    return this.parent as IDashboardList;
  }

  @computed
  get component() {
    return this._component;
  }
  set component(value) {
    this.setComponent(value);
  }

  @action
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

  @computed
  get windows(): IWindow[] {
    return this.findAll(c => c.type === ComponentTypes.window) as IWindow[];
  }

  @computed
  get drag() {
    return this._drag;
  }
  @action
  dragStart(drag: IWindow) {
    this._drag = drag;
  }
  @action
  dragEnd(): void {
    this._drag = undefined;
  }

  @computed
  get blockSource() {
    return this._blockSource;
  }
  set blockSource(value) {
    this.setBlockSource(value);
  }

  @action
  setBlockSource(blockSource: IComponent) {
    this._blockSource = blockSource;
  }
  @action
  clearBlockSource() {
    this._blockSource = undefined;
  }

  @computed
  get title() {
    return this._title;
  }
  set title(value) {
    this.setTitle(value);
  }

  @action
  setTitle(title: string) {
    this._title = title;
  }

  @computed
  get dashboard() {
    return this;
  }

  @computed
  get componentConfig() {
    return this._component ? this._component.config : undefined;
  }

  set componentConfig(config: any) {
    this.setComponentConfig(config);
  }

  @action
  setComponentConfig(config: any) {
    if (config) {
      const c = this.componentFactory(config.type);
      this.setComponent(c);
      c.setConfig(config);
    } else {
      this.setComponent(undefined);
    }
  }

  @computed
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

  @action
  setConfig(value: IDashboard["config"]) {
    this.sync.syncStart();
    this.setTitle(value ? value.title : undefined);
    this.setCloseDisabled(value ? value.closeDisabled : undefined);
    this.setComponentConfig(value ? value.component : undefined);
    this.sync.syncEnd();
  }

  @action
  remove(comp: IComponent) {
    if (comp && this._component && comp === this._component) {
      this.setComponent(undefined);
      this.removeFromParent();
    }
  }

  @action
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

  @action
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

  @action
  _loadError = (error: any) => {
    console.error(error);
    this.setConfig(undefined);
    this.sync.syncError(error);
  };

  @action
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

  @action
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

  @action
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
  @observable.ref parent: IComponent;
  @observable.ref _componentFactory: IComponentFactory;
  @observable.ref _addApp: IRequest | ISupplierFunc<IRequest>;
  @observable.ref _router: IRouter;
  @observable _closeDisabled: boolean;
  @observable _needsOverflow: boolean;
  @observable _x: number = 0;
  @observable _y: number = 0;
  @observable _width: number = 0;
  @observable _height: number = 0;
  @observable sync = new Sync();
  @observable _activeIndex: number = -1;
  @observable dashboards: IDashboard[] = [];
  @observable _createDefaultDashboard: boolean = true;
  _saveDelay: number = 1000;
  loader: () => Promise<any>;
  saver: (data: any) => Promise<any>;
  _configSaveDisposer: IReactionDisposer;

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

  @computed
  get isOverflow() {
    return false;
  }

  @action
  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  @computed
  get root() {
    return this.parent ? this.parent.root : this;
  }

  @computed
  get x() {
    return this._x;
  }

  @computed
  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  @computed
  get y() {
    return this._y;
  }

  @computed
  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  @computed
  get width() {
    return this._width;
  }

  @computed
  get height() {
    return this._height;
  }

  @action
  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  @action
  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @action
  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  @computed
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

  @computed
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
  @action
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  @computed
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
  @action
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  @action
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  @computed
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

  @action
  setRouter(router: IRouter) {
    this._router = router;
  }

  @computed
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

  @computed
  get createDefaultDashboard() {
    return this._createDefaultDashboard;
  }
  set createDefaultDashboard(value) {
    this.setCreateDefaultDashboard(value);
  }

  @action
  setCreateDefaultDashboard(createDefaultDashboard: boolean) {
    this._createDefaultDashboard = createDefaultDashboard;
  }

  @computed
  get dashboardCount() {
    return this.dashboards ? this.dashboards.length : 0;
  }

  @computed
  get activeIndex() {
    return this._activeIndex || 0;
  }
  set activeIndex(value) {
    this.setActiveIndex(value);
  }

  @action
  setActiveIndex(value: number) {
    if (value !== this._activeIndex) {
      this._activeIndex = value;
    }
  }

  @computed
  get active(): IDashboard {
    return this.activeIndex >= 0 && this.activeIndex < this.dashboards.length
      ? this.dashboards[this.activeIndex]
      : undefined;
  }
  set active(value) {
    this.setActive(value);
  }

  @action
  setActive(value: IDashboard) {
    this.activeIndex = this.dashboards.indexOf(value);
  }

  @computed
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

  @action
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

  @action
  addFromConfig(config: any) {
    if (config) {
      const db = new Dashboard();
      db.parent = this;
      this.dashboards.push(db);
      db.setConfig(config);
    }
  }

  @action
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

  @action
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

  @action
  _loadError = (error: any) => {
    console.error(error);
    this.setConfig(undefined);
    this.sync.syncError(error);
  };

  @action
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

  @action
  close() {
    this.dashboards.forEach(db => db.close());
    this.dashboards = [];
    this.setActiveIndex(-1);
    this.addDefaultDashboard();
  }

  @action
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
  @observable.ref parent: IComponent;
  @observable.ref _componentFactory: IComponentFactory;
  @observable.ref _addApp: IRequest | ISupplierFunc<IRequest>;
  @observable.ref _router: IRouter;
  @observable _closeDisabled: boolean;
  @observable _needsOverflow: boolean;
  @observable _x: number = 0;
  @observable _y: number = 0;
  @observable _width: number = 0;
  @observable _height: number = 0;
  @observable _offset: number;
  @observable _first: IComponent;
  @observable _second: IComponent;
  @observable _splitActive: boolean = false;
  @observable _leftWidth: number;
  @observable _minItemWidth: number;
  @observable _splitterWidth: number;

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

  @computed
  get isOverflow() {
    return false;
  }

  @action
  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  @computed
  get root() {
    return this.parent ? this.parent.root : this;
  }

  @computed
  get x() {
    return this._x;
  }

  @computed
  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  @computed
  get y() {
    return this._y;
  }

  @computed
  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  @computed
  get width() {
    return this._width;
  }

  @computed
  get height() {
    return this._height;
  }

  @action
  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  @action
  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @action
  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  @computed
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

  @computed
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
  @action
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  @computed
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
  @action
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  @action
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  @computed
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

  @action
  setRouter(router: IRouter) {
    this._router = router;
  }

  @computed
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

  @computed
  get splitActive() {
    return this._splitActive;
  }
  set splitActive(value) {
    this.setSplitActive(value);
  }

  @action
  setSplitActive(splitActive: boolean) {
    this._splitActive = splitActive;
    const db = this.dashboard;
    if (splitActive) {
      db.setBlockSource(this);
    } else if (db.blockSource === this) {
      db.clearBlockSource();
    }
  }

  @computed
  get first() {
    return this._first;
  }
  set first(value: IComponent) {
    this.setFirst(value);
  }

  @action
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

  @computed
  get firstConfig() {
    return this._first ? { component: this._first.config } : undefined;
  }

  @action
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

  @computed
  get second() {
    return this._second;
  }

  set second(value: IComponent) {
    this.setSecond(value);
  }

  @computed
  get secondConfig() {
    return this._second ? { component: this._second.config } : undefined;
  }

  @action
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

  @action
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

  @computed
  get offset() {
    return this._offset !== undefined ? this._offset : Defaults.offset;
  }
  set offset(value: number) {
    this.setOffset(value);
  }

  @action
  replace(newComp: IComponent, oldComp: IComponent): void {
    if (oldComp === this._first || oldComp === this._second) {
      if (oldComp === this._first) {
        this.setFirst(newComp);
      } else if (oldComp === this._second) {
        this.setSecond(newComp);
      }
    }
  }

  @action
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

  @computed
  get minItemWidth() {
    return this._minItemWidth !== undefined ? this._minItemWidth : Defaults.minItemWidth;
  }
  set minItemWidth(value) {
    this.setMinItemWidth(value);
  }
  @action
  setMinItemWidth(minItemWidth: number) {
    if (minItemWidth >= 0) {
      this._minItemWidth = minItemWidth;
    }
  }

  @computed
  get maxItemWidth() {
    return this.width - this.minItemWidth - this.splitterWidth;
  }

  @computed
  get splitterWidth() {
    return this._splitterWidth !== undefined ? this._splitterWidth : Defaults.splitterWidth;
  }
  set splitterWidth(value) {
    this.setSplitterWidth(value);
  }
  @action
  setSplitterWidth(splitterWidth: number) {
    if (splitterWidth > 0) {
      this._splitterWidth = splitterWidth;
    }
  }

  @computed
  get left() {
    return this.first;
  }
  set left(value: IComponent) {
    this.setLeft(value);
  }
  @action
  setLeft(left: IComponent) {
    this.setFirst(left);
  }

  @computed
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
  @action
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

  @action
  setOffset(offset: number) {
    if (offset >= 0) {
      this._offset = offset;
    }
    if (this._offset !== undefined) {
      this._leftWidth = undefined;
    }
  }

  @computed
  get leftConfig() {
    return this.firstConfig;
  }
  set leftConfig(value) {
    this.setLeftConfig(value);
  }
  @action
  setLeftConfig(config: any) {
    this.setFirstConfig(config);
  }

  @computed
  get right() {
    return this.second;
  }
  set right(value: IComponent) {
    this.setRight(value);
  }
  @action
  setRight(right: IComponent) {
    this.setSecond(right);
  }

  @computed
  get rightWidth() {
    return this.width - this.leftWidth - this.splitterWidth;
  }
  set rightWidth(value) {
    this.setRightWidth(value);
  }
  @action
  setRightWidth(rightWidth: number) {
    if (rightWidth < this.minItemWidth) {
      rightWidth = this.minItemWidth;
    } else if (rightWidth > this.maxItemWidth) {
      rightWidth = this.maxItemWidth;
    }
    this.setLeftWidth(this.width - rightWidth - this.splitterWidth);
  }

  @computed
  get rightConfig() {
    return this.secondConfig;
  }
  set rightConfig(value) {
    this.setRightConfig(value);
  }
  @action
  setRightConfig(config: any) {
    this.setSecondConfig(config);
  }

  @computed
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
  @action
  setConfig(config: IHSplitConfig) {
    this.setLeftConfig(config ? config.left : undefined);
    this.setRightConfig(config ? config.right : undefined);
    this.setOffset(config ? config.offset : undefined);
    this.setLeftWidth(config ? config.leftWidth : undefined);
    this.setMinItemWidth(config ? config.minItemWidth : undefined);
  }

  @computed
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

  @action
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
  @observable.ref parent: IComponent;
  @observable.ref _componentFactory: IComponentFactory;
  @observable.ref _addApp: IRequest | ISupplierFunc<IRequest>;
  @observable.ref _router: IRouter;
  @observable _closeDisabled: boolean;
  @observable _needsOverflow: boolean;
  @observable _x: number = 0;
  @observable _y: number = 0;
  @observable _width: number = 0;
  @observable _height: number = 0;
  @observable _offset: number;
  @observable _first: IComponent;
  @observable _second: IComponent;
  @observable _splitActive: boolean = false;
  @observable _topHeight: number;
  @observable _minItemHeight: number;
  @observable _splitterHeight: number;

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

  @computed
  get isOverflow() {
    return false;
  }

  @action
  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  @computed
  get root() {
    return this.parent ? this.parent.root : this;
  }

  @computed
  get x() {
    return this._x;
  }

  @computed
  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  @computed
  get y() {
    return this._y;
  }

  @computed
  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  @computed
  get width() {
    return this._width;
  }

  @computed
  get height() {
    return this._height;
  }

  @action
  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  @action
  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @action
  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  @computed
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

  @computed
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
  @action
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  @computed
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
  @action
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  @action
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  @computed
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

  @action
  setRouter(router: IRouter) {
    this._router = router;
  }

  @computed
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

  @computed
  get splitActive() {
    return this._splitActive;
  }
  set splitActive(value) {
    this.setSplitActive(value);
  }

  @action
  setSplitActive(splitActive: boolean) {
    this._splitActive = splitActive;
    const db = this.dashboard;
    if (splitActive) {
      db.setBlockSource(this);
    } else if (db.blockSource === this) {
      db.clearBlockSource();
    }
  }

  @computed
  get first() {
    return this._first;
  }
  set first(value: IComponent) {
    this.setFirst(value);
  }

  @action
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

  @computed
  get firstConfig() {
    return this._first ? { component: this._first.config } : undefined;
  }

  @action
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

  @computed
  get second() {
    return this._second;
  }

  set second(value: IComponent) {
    this.setSecond(value);
  }

  @computed
  get secondConfig() {
    return this._second ? { component: this._second.config } : undefined;
  }

  @action
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

  @action
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

  @computed
  get offset() {
    return this._offset !== undefined ? this._offset : Defaults.offset;
  }
  set offset(value: number) {
    this.setOffset(value);
  }

  @action
  replace(newComp: IComponent, oldComp: IComponent): void {
    if (oldComp === this._first || oldComp === this._second) {
      if (oldComp === this._first) {
        this.setFirst(newComp);
      } else if (oldComp === this._second) {
        this.setSecond(newComp);
      }
    }
  }

  @action
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

  @computed
  get minItemHeight() {
    return this._minItemHeight !== undefined ? this._minItemHeight : Defaults.minItemHeight;
  }
  set minItemHeight(value) {
    this.setMinItemHeight(value);
  }
  @action
  setMinItemHeight(minItemHeight: number) {
    if (minItemHeight >= 0) {
      this._minItemHeight = minItemHeight;
    }
  }

  @computed
  get maxItemHeight() {
    return this.height - this.minItemHeight - this.splitterHeight;
  }

  @computed
  get splitterHeight() {
    return this._splitterHeight !== undefined ? this._splitterHeight : Defaults.splitterHeight;
  }
  set splitterHeight(value) {
    this.setSplitterHeight(value);
  }
  @action
  setSplitterHeight(splitterHeight: number) {
    if (splitterHeight > 0) {
      this._splitterHeight = splitterHeight;
    }
  }

  @computed
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
  @action
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

  @action
  setOffset(offset: number) {
    if (offset >= 0) {
      this._offset = offset;
    }
    if (this._offset !== undefined) {
      this._topHeight = undefined;
    }
  }

  @computed
  get top() {
    return this.first;
  }
  set top(value: IComponent) {
    this.setTop(value);
  }

  @action
  setTop(top: IComponent) {
    this.setFirst(top);
  }

  @computed
  get topConfig() {
    return this.firstConfig;
  }

  @action
  setTopConfig(config: any) {
    return this.setFirstConfig(config);
  }

  @computed
  get bottom() {
    return this.second;
  }
  set bottom(value: IComponent) {
    this.setBottom(value);
  }
  @action
  setBottom(bottom: IComponent) {
    this.setSecond(bottom);
  }

  @computed
  get bottomConfig() {
    return this.secondConfig;
  }
  set bottomConfig(value) {
    this.setBottomConfig(value);
  }
  @action
  setBottomConfig(config: any) {
    return this.setSecondConfig(config);
  }

  @computed
  get bottomHeight() {
    return this.height - this.topHeight - this.splitterHeight;
  }
  set bottomHeight(value) {
    this.setBottomHeight(value);
  }
  @action
  setBottomHeight(bottomHeight: number) {
    if (bottomHeight >= this.minItemHeight && bottomHeight <= this.maxItemHeight) {
      this.setTopHeight(this.height - bottomHeight - this.splitterHeight);
    }
  }

  @computed
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
  @action
  setConfig(config: IVSplitConfig) {
    this.setTopConfig(config ? config.top : undefined),
      this.setBottomConfig(config ? config.bottom : undefined);
    this.setOffset(config ? config.offset : undefined);
    this.setTopHeight(config ? config.topHeight : undefined);
    this.setMinItemHeight(config ? config.minItemHeight : undefined);
  }

  @computed
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

  @action
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
  @observable.ref parent: IComponent;
  @observable.ref _componentFactory: IComponentFactory;
  @observable.ref _addApp: IRequest | ISupplierFunc<IRequest>;
  @observable.ref _router: IRouter;
  @observable _closeDisabled: boolean;
  @observable _needsOverflow: boolean;
  @observable _x: number = 0;
  @observable _y: number = 0;
  @observable _width: number = 0;
  @observable _height: number = 0;
  name: string;
  onClose: IConsumerFunc<IWindow>;
  @observable _path: string;
  @observable _params: any;
  @observable _query: any;
  @observable _appHost: AppHost;
  @observable _contentHidden: boolean;
  @observable _transient: boolean = false;
  @observable _settings: WindowSettings = new WindowSettings(this);
  @observable _dragState: any = {};

  constructor() {
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

  @computed
  get isOverflow() {
    return false;
  }

  @action
  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  @computed
  get root() {
    return this.parent ? this.parent.root : this;
  }

  @computed
  get x() {
    return this._x;
  }

  @computed
  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  @computed
  get y() {
    return this._y;
  }

  @computed
  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  @computed
  get width() {
    return this._width;
  }

  @computed
  get height() {
    return this._height;
  }

  @action
  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  @action
  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @action
  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  @computed
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

  @computed
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
  @action
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  @computed
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
  @action
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  @action
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  @computed
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

  @action
  setRouter(router: IRouter) {
    this._router = router;
  }

  @computed
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

  @computed
  get settings() {
    return this._settings;
  }

  @computed
  get appHost() {
    return this._appHost;
  }

  @computed
  get path() {
    return this._path;
  }
  set path(value) {
    this.setPath(value);
  }

  @action
  setPath(path: string) {
    this._path = path;
  }

  @computed
  get params() {
    return Object.assign({}, this._params, this._query);
  }
  set params(value) {
    this.setParams(value);
  }
  @action
  setParams(params: any) {
    this._params = params;
  }

  @computed
  get query() {
    return Object.assign({}, this._query);
  }
  set query(value) {
    this.setQuery(value);
  }
  @action
  setQuery(query: any) {
    this._query = query;
  }

  @computed
  get icon() {
    return this._appHost.icon;
  }

  @computed
  get title() {
    return this._appHost.title;
  }
  set title(value) {
    this.setTitle(value);
  }
  @action
  setTitle(title: string) {
    this._appHost.setTitle(title);
  }

  @computed
  get contentHidden() {
    return this._contentHidden ? true : false;
  }
  set contentHidden(value) {
    this.setContentHidden(value);
  }
  @action
  setContentHidden(contentHidden: boolean) {
    this._contentHidden = contentHidden;
  }

  @action
  toggleContent() {
    this.setContentHidden(!this.contentHidden);
  }

  @computed
  get transient() {
    return this._transient;
  }
  set transient(value) {
    this.setTransient(value);
  }

  @action
  setTransient(transient: boolean) {
    this._transient = transient;
  }

  @computed
  get manager(): IWindowManager {
    const parent = this.parent;
    return parent && parent.isWindowManager ? (parent as IWindowManager) : undefined;
  }

  @computed
  get active() {
    const manager = this.manager;
    if (manager) {
      return manager.active === this;
    }
    return false;
  }

  @action
  activate() {
    const manager = this.manager;
    if (manager) {
      manager.setActive(this);
    }
  }

  @computed
  get dragState() {
    return this._dragState;
  }
  set dragState(value) {
    this.setDragState(value);
  }
  @action
  setDragState(dragState: any) {
    this._dragState = Object.assign({}, this._dragState, dragState);
  }
  @action
  clearDragState() {
    this._dragState = {};
  }

  @computed
  get dragging() {
    const mgr = this.manager;
    return mgr ? mgr.drag === this : false;
  }

  @action
  dragStart(dragState?: any): void {
    this.setDragState(dragState);
    const mgr = this.manager;
    if (mgr) {
      mgr.dragStart(this);
    }
  }

  @action
  dragEnd(): void {
    this.clearDragState();
    const mgr = this.manager;
    if (mgr) {
      mgr.dragEnd();
    }
  }

  @computed
  get resizing() {
    const mgr = this.manager;
    return mgr ? mgr.resizing === this : false;
  }

  @action
  resizeStart(type: WindowResizeType) {
    const mgr = this.manager;
    if (mgr) {
      mgr.resizeStart(this, type);
    }
  }

  @action
  resizeEnd() {
    const mgr = this.manager;
    if (mgr) {
      mgr.resizeEnd();
    }
  }

  @action
  maximize() {
    this.setMaximized(true);
  }

  @action
  restoreSize() {
    this.setMaximized(false);
  }

  @computed
  get maximized() {
    const mgr = this.manager;
    return mgr ? mgr.maximized === this : false;
  }
  set maximized(value) {
    this.setMaximized(value);
  }

  @action
  setMaximized(maximized: boolean) {
    const mgr = this.manager;
    if (maximized) {
      mgr.setMaximized(this);
    } else if (mgr.maximized === this) {
      mgr.setMaximized(undefined);
    }
  }

  @computed
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
  @action
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

  @action
  load(request?: IRequest) {
    return this.appHost.load(request);
  }

  @action
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
  @observable _window: IWindow;
  @observable _borderWidth: number;
  @observable _headerHeight: number;
  @observable _data: any = {};
  @observable _resizable: boolean;
  @observable _draggable: boolean;
  @observable _animatePosition: boolean;
  @observable _role: string;

  constructor(window?: IWindow) {
    this._window = window;
  }

  @computed
  get data() {
    return Object.assign({}, this._data);
  }
  set data(value) {
    this.setData(value);
  }
  @action
  setData(data: any) {
    this._data = Object.assign({}, this._data, data);
  }

  @computed
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
  @action
  setBorderWidth(borderWidth: number) {
    if (borderWidth >= 0) {
      this._borderWidth = borderWidth;
    }
  }

  @computed
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
  @action
  setHeaderHeight(headerHeight: number) {
    if (headerHeight >= 0) {
      this._headerHeight = headerHeight;
    }
  }

  @computed
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

  @action
  setResizable(resizable: boolean) {
    if (resizable !== undefined) {
      this._resizable = resizable;
    }
  }

  @computed
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

  @action
  setDraggable(draggable: boolean) {
    if (draggable !== undefined) {
      this._draggable = draggable;
    }
  }

  @computed
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
  @action
  setAnimatePosition(animatePosition: boolean) {
    this._animatePosition = animatePosition;
  }

  @computed
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
  @action
  setRole(role: string) {
    this._role = role;
  }

  @computed
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

  @action
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
  @observable.ref parent: IComponent;
  @observable.ref _componentFactory: IComponentFactory;
  @observable.ref _addApp: IRequest | ISupplierFunc<IRequest>;
  @observable.ref _router: IRouter;
  @observable _closeDisabled: boolean;
  @observable _needsOverflow: boolean;
  @observable _x: number = 0;
  @observable _y: number = 0;
  @observable _width: number = 0;
  @observable _height: number = 0;
  @observable windows: IWindow[] = [];
  @observable _windowSettings = new WindowSettings();
  @observable.ref _resizing: IWindow;
  @observable _resizeType: WindowResizeType;
  @observable.ref _drag: IWindow;
  @observable _activeIndex: number;
  @observable _maximizedIndex: number;
  @observable _headerHeight: number = 28;

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

  @computed
  get isOverflow() {
    return false;
  }

  @action
  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  @computed
  get root() {
    return this.parent ? this.parent.root : this;
  }

  @computed
  get x() {
    return this._x;
  }

  @computed
  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  @computed
  get y() {
    return this._y;
  }

  @computed
  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  @computed
  get width() {
    return this._width;
  }

  @computed
  get height() {
    return this._height;
  }

  @action
  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  @action
  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @action
  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  @computed
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

  @computed
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
  @action
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  @computed
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
  @action
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  @action
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  @computed
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

  @action
  setRouter(router: IRouter) {
    this._router = router;
  }

  @computed
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

  @computed
  get isRequiresOverflow() {
    return false;
  }

  @computed
  get windowSettings() {
    if (this.type === "stack") this._windowSettings["role"] = "tabpanel";
    return this._windowSettings;
  }

  @computed
  get first() {
    return this.windowCount > 0 ? this.windows[0] : undefined;
  }

  @computed
  get last() {
    return this.windowCount > 0 ? this.windows[this.windows.length - 1] : undefined;
  }

  @computed
  get windowCount(): number {
    return this.windows ? this.windows.length : 0;
  }

  get isWindowManager() {
    return true;
  }

  @action
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

  @action
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

  @action
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

  @action
  insertBefore(item: IWindow, refItem?: IWindow) {
    if (!refItem) {
      this.add(item);
    } else if (item) {
      this.insertAt(item, this.windows.indexOf(refItem));
    }
  }

  @action
  replace(newItem: IComponent, oldItem: IComponent): void {
    if (newItem && oldItem && oldItem.parent === this) {
      this.insertBefore(newItem as IWindow, oldItem as IWindow);
      oldItem.removeFromParent();
    }
  }

  @action
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

  @action
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

  @computed
  get drag() {
    return this._drag;
  }
  @action
  dragStart(drag: IWindow) {
    if (this.dashboard) {
      this.dashboard.dragStart(drag);
    }
    this._drag = drag;
    this._onDragStart(drag);
  }
  @action
  dragEnd(): void {
    if (this.dashboard) {
      this.dashboard.dragEnd();
    }
    this._drag = undefined;
    this._onDragEnd();
  }

  @computed
  get resizing() {
    return this._resizing;
  }

  @computed
  get resizeType() {
    return this._resizeType;
  }

  _onResizeStart(win: IWindow) {
    // does nothing by default
  }

  _onResizeEnd() {
    // does nothing by default
  }

  @action
  resizeStart(win: IWindow, type: WindowResizeType) {
    this._resizing = win;
    this._resizeType = type;
    this._onResizeStart(win);
  }

  @action
  resizeEnd() {
    this._resizing = undefined;
    this._resizeType = undefined;
    this._onResizeEnd();
  }

  @computed
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

  @action
  setActiveIndex(activeIndex: number) {
    if (activeIndex !== this._activeIndex) {
      this._activeIndex = activeIndex;
    }
  }

  @computed
  get active(): IWindow {
    const activeIndex = this.activeIndex;
    return activeIndex >= 0 && activeIndex < this.windowCount
      ? this.windows[activeIndex]
      : undefined;
  }
  set active(value: IWindow) {
    this.setActive(value);
  }

  @action
  setActive(active: IWindow) {
    this.setActiveIndex(this.windows.indexOf(active));
  }

  @computed
  get maximizedIndex() {
    return this._maximizedIndex;
  }
  set maximizedIndex(value) {
    this.setMaximizedIndex(value);
  }

  @action
  setMaximizedIndex(maximizedIndex: number) {
    if (maximizedIndex !== this._maximizedIndex) {
      this._maximizedIndex = maximizedIndex;
    }
  }

  @computed
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
  @action
  setMaximized(maximized: IWindow) {
    this.setMaximizedIndex(maximized ? this.windows.indexOf(maximized) : undefined);
    if (maximized) {
      this.setActive(maximized);
    }
  }

  @computed
  get headerHeight() {
    return this._headerHeight;
  }
  set headerHeight(value) {
    this.setHeaderHeight(value);
  }
  @action
  setHeaderHeight(headerHeight: number) {
    if (headerHeight >= 0) {
      this._headerHeight = headerHeight;
    }
  }

  _windowDropped(win: IWindow) {
    this.setActive(win);
  }

  @action
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

  @action
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

  @action
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

  @action
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

  @action
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

  @computed
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
  @action
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

  @action
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
  @observable.ref parent: IComponent;
  @observable.ref _componentFactory: IComponentFactory;
  @observable.ref _addApp: IRequest | ISupplierFunc<IRequest>;
  @observable.ref _router: IRouter;
  @observable _closeDisabled: boolean;
  @observable _needsOverflow: boolean;
  @observable _x: number = 0;
  @observable _y: number = 0;
  @observable _width: number = 0;
  @observable _height: number = 0;
  @observable windows: IWindow[] = [];
  @observable _windowSettings = new WindowSettings();
  @observable.ref _resizing: IWindow;
  @observable _resizeType: WindowResizeType;
  @observable.ref _drag: IWindow;
  @observable _activeIndex: number;
  @observable _maximizedIndex: number;
  @observable _cellSize: number;
  @observable _cellMargin: number;
  @observable _defaultWindowColSpan: number;
  @observable _defaultWindowRowSpan: number;
  @observable _settingsActive: boolean = false;
  _dragDisposer: IReactionDisposer;
  _layoutDisposer: IReactionDisposer;
  _resizeHandlers: { [key: string]: (colIndex: number, rowIndex: number, w: IWindow) => void };

  constructor() {
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

  @computed
  get isOverflow() {
    return false;
  }

  @action
  resetViewport() {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
  }

  @computed
  get root() {
    return this.parent ? this.parent.root : this;
  }

  @computed
  get x() {
    return this._x;
  }

  @computed
  get rx() {
    return this.x - (this.parent ? this.parent.x : 0);
  }

  @computed
  get y() {
    return this._y;
  }

  @computed
  get ry() {
    return this.y - (this.parent ? this.parent.y : 0);
  }

  @computed
  get width() {
    return this._width;
  }

  @computed
  get height() {
    return this._height;
  }

  @action
  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width;
      this._height = height;
    }
  }

  @action
  position(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @action
  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y);
    this.resize(width, height);
  }

  @computed
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

  @computed
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
  @action
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory;
  }

  @computed
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
  @action
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled;
  }

  @action
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp;
  }

  @computed
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

  @action
  setRouter(router: IRouter) {
    this._router = router;
  }

  @computed
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

  @computed
  get windowSettings() {
    return this._windowSettings;
  }

  @computed
  get first() {
    return this.windowCount > 0 ? this.windows[0] : undefined;
  }

  @computed
  get last() {
    return this.windowCount > 0 ? this.windows[this.windows.length - 1] : undefined;
  }

  @computed
  get windowCount(): number {
    return this.windows ? this.windows.length : 0;
  }

  get isWindowManager() {
    return true;
  }

  @action
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

  @action
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

  @action
  insertBefore(item: IWindow, refItem?: IWindow) {
    if (!refItem) {
      this.add(item);
    } else if (item) {
      this.insertAt(item, this.windows.indexOf(refItem));
    }
  }

  @action
  replace(newItem: IComponent, oldItem: IComponent): void {
    if (newItem && oldItem && oldItem.parent === this) {
      this.insertBefore(newItem as IWindow, oldItem as IWindow);
      oldItem.removeFromParent();
    }
  }

  @action
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

  @action
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

  @action
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

  @computed
  get drag() {
    return this._drag;
  }
  @action
  dragStart(drag: IWindow) {
    if (this.dashboard) {
      this.dashboard.dragStart(drag);
    }
    this._drag = drag;
    this._onDragStart(drag);
  }
  @action
  dragEnd(): void {
    if (this.dashboard) {
      this.dashboard.dragEnd();
    }
    this._drag = undefined;
    this._onDragEnd();
  }

  @computed
  get resizing() {
    return this._resizing;
  }

  @computed
  get resizeType() {
    return this._resizeType;
  }

  _onResizeEnd() {
    // does nothing by default
  }

  @action
  resizeStart(win: IWindow, type: WindowResizeType) {
    this._resizing = win;
    this._resizeType = type;
    this._onResizeStart(win);
  }

  @action
  resizeEnd() {
    this._resizing = undefined;
    this._resizeType = undefined;
    this._onResizeEnd();
  }

  @computed
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

  @action
  setActiveIndex(activeIndex: number) {
    if (activeIndex !== this._activeIndex) {
      this._activeIndex = activeIndex;
    }
  }

  @computed
  get active(): IWindow {
    const activeIndex = this.activeIndex;
    return activeIndex >= 0 && activeIndex < this.windowCount
      ? this.windows[activeIndex]
      : undefined;
  }
  set active(value: IWindow) {
    this.setActive(value);
  }

  @action
  setActive(active: IWindow) {
    this.setActiveIndex(this.windows.indexOf(active));
  }

  @computed
  get maximizedIndex() {
    return this._maximizedIndex;
  }
  set maximizedIndex(value) {
    this.setMaximizedIndex(value);
  }

  @action
  setMaximizedIndex(maximizedIndex: number) {
    if (maximizedIndex !== this._maximizedIndex) {
      this._maximizedIndex = maximizedIndex;
    }
  }

  @computed
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
  @action
  setMaximized(maximized: IWindow) {
    this.setMaximizedIndex(maximized ? this.windows.indexOf(maximized) : undefined);
    if (maximized) {
      this.setActive(maximized);
    }
  }

  @computed
  get isRequiresOverflow() {
    return this.maximized ? false : true;
  }

  @computed
  get cellSize() {
    return this._cellSize !== undefined ? this._cellSize : Defaults.cellSize;
  }
  set cellSize(value) {
    this.setCellSize(value);
  }
  @action
  setCellSize(cellSize: number) {
    if (cellSize > 0) {
      this._cellSize = cellSize;
    }
  }

  @computed
  get cellMargin() {
    return this._cellMargin !== undefined ? this._cellMargin : Defaults.cellMargin;
  }
  set cellMargin(value) {
    this.setCellMargin(value);
  }
  @action
  setCellMargin(cellMargin: number) {
    if (cellMargin >= 0) {
      this._cellMargin = cellMargin;
    }
  }

  @computed
  get rows() {
    const b = this.bottomMostRow + 1;
    const vp = this.viewportRows;
    return b > vp ? b : vp;
  }

  @computed
  get columns() {
    const r = this.rightMostColumn + 1;
    const vp = this.viewportColumns;
    return r > vp ? r : vp;
  }

  @computed
  get defaultWindowColSpan() {
    return this._defaultWindowColSpan !== undefined
      ? this._defaultWindowColSpan
      : Defaults.defaultWindowColSpan;
  }
  set defaultWindowColSpan(value) {
    this.setDefaultWindowColSpan(value);
  }
  @action
  setDefaultWindowColSpan(defaultWindowColSpan: number) {
    if (defaultWindowColSpan > 0) {
      this._defaultWindowColSpan = defaultWindowColSpan;
    }
  }

  @computed
  get defaultWindowRowSpan() {
    return this._defaultWindowRowSpan !== undefined
      ? this._defaultWindowRowSpan
      : Defaults.defaultWindowRowSpan;
  }
  set defaultWindowRowSpan(value) {
    this.setDefaultWindowRowSpan(value);
  }
  @action
  setDefaultWindowRowSpan(defaultWindowRowSpan: number) {
    if (defaultWindowRowSpan > 0) {
      this._defaultWindowRowSpan = defaultWindowRowSpan;
    }
  }

  @computed
  get gridWidth(): number {
    return this.cellMargin + this.columns * (this.cellSize + this.cellMargin);
  }

  @computed
  get gridHeight(): number {
    return this.cellMargin + this.rows * (this.cellSize + this.cellMargin);
  }

  @computed
  get settingsActive() {
    return this._settingsActive;
  }
  set settingsActive(value) {
    this.setSettingsActive(value);
  }
  @action
  setSettingsActive(settingsActive: boolean) {
    this._settingsActive = settingsActive;
  }

  @computed
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
  @action
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

  @action
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

  @action
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

  @computed
  get rightMost() {
    return this.getRightMost(this.windows);
  }

  @computed
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

  @computed
  get bottomMost() {
    return this.getBottomMost(this.windows);
  }

  @computed
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

  @action
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

  @action
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

  @action
  applyDragStartPositions(boss: IWindow) {
    if (boss) {
      this.windows.forEach(w => {
        if (w !== boss) {
          this.applyDragStartPosition(w);
        }
      });
    }
  }

  @action
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

  @action
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

  @computed
  get viewportColumns() {
    const r = Math.floor((this.width - this.cellMargin) / (this.cellMargin + this.cellSize));
    return r < 0 ? 0 : r;
  }

  @computed
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

  @action
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
