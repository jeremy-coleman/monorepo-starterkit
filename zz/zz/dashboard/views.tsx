import { action, autorun, computed, IReactionDisposer, observable, reaction } from "mobx"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { EffectCallback, FC, useEffect } from "react"
import { when } from "when-switch"

import {
  Checkbox,
  CommandBar,
  ContextualMenuItemType,
  css,
  DefaultButton,
  DefaultPalette,
  Dialog,
  DialogFooter,
  Dropdown,
  FontSizes,
  FontWeights,
  Icon,
  IContextualMenuItem,
  IContextualMenuProps,
  IDropdownOption,
  IIconProps,
  KeyCodes,
  mergeStyleSets,
  Panel,
  PanelType,
  PrimaryButton,
  Slider
} from "@fluentui/react"

import {
  AppHostContainer,
  BoundTextField,
  HostAppIcon,
  HostAppView,
  IHostAppViewProps,
  ListModel,
  Supplier,
  Sync,
  SyncComponent,
  IAppHost,
  ISupplier,
  IConsumerFunc,
  IPredicateFunc,
  AppHost
} from "@coglite/app-host"

import { IRequest, IRouter, Router } from "@coglite/router"

const RouterContext = observable({
  value: new Router()
})



import {
  IConsumerFunc,
  IPredicateFunc, Sync
} from "@coglite/app-host"
import { IRequest, IRouter } from "@coglite/router"
import { action, autorun, computed, IReactionDisposer, observable, reaction } from "mobx"
import { when } from "when-switch"






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

export { dispatchWindowResize }
export { ComponentFactory, componentRegistry }
export { Dashboard }
export { DashboardList, DashboardList as DashboardListModel }
export { Grid }
export { HSplit, VSplit }
export { Stack }
export { Window }
export { WindowAppHost }
export { WindowSettings }


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
  opener?: WindowAppHost;
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
      this.sync.syncStart();
      return this.loader()
        .then(this._loadDone)
        .catch(this._loadError);
    }
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
  @observable _appHost = new WindowAppHost(this);
  @observable _contentHidden: boolean;
  @observable _transient: boolean = false;
  @observable _settings: WindowSettings = new WindowSettings(this);
  @observable _dragState: any = {};

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

class WindowAppHost extends AbstractAppHost {
  _window: IWindow;

  constructor(window: IWindow) {
    super();
    this._window = window;
  }

  get defaultRequest() {
    return {
      path: this._window.path,
      params: this._window.params,
      query: this._window.query
    };
  }

  get router(): IRouter {
    return this._window.router;
  }
  set router(value: IRouter) {
    this.setRouter(value);
  }

  @action
  setRouter(router: IRouter) {
    this._window.setRouter(router);
  }

  // Promise<IAppHost>
  async open(request: IRequest): Promise<any> {
    const w = await this._window.open(request);
    return w.appHost;
  }

  @action
  setRequest(request: IRequest) {
    super.setRequest(request);
    if (request && request.replace && !request.noUpdate && !request.noSaveLocation) {
      this._window.setPath(request.path);
      this._window.setParams(request.params);
      this._window.setQuery(request.query);
    }
  }

  close() {
    this._window.close();
  }
}

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



/* -------------------------------------------------------------------------- */
/*                                    views                                   */
/* -------------------------------------------------------------------------- */

const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, [])
}

const useMount = (fn: () => void) => {
  useEffectOnce(() => {
    fn()
  })
}

const Defaults = {
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

export type IDashboardLayout = {
  doLayout?: (dashboard: IDashboard) => Promise<any>
  key: string
  name: string
  title?: string
  iconProps?: IIconProps
  applyLayout: (dashboard: IDashboard) => Promise<any> | any
  isLayoutApplied: (dashboard: IDashboard) => boolean
  createActions?: (dashboard: IDashboard) => IContextualMenuItem[]
}

export type IGridBounds = {
  rowIndex?: number
  rowSpan?: number
  colIndex?: number
  colSpan?: number
}

export type IWindowConfig = {
  type?: string
  title?: string
  closeDisabled?: boolean
  path?: string
  query?: any
  params?: any
  contentHidden?: boolean
  settings?: any
}

export type IStackConfig = {
  type?: string
  activeIndex?: number
  windows?: IWindowConfig[]
  closeDisabled?: boolean
}

export type IHSplitConfig = {
  type?: string
  offset?: number
  left?: any
  right?: any
  leftWidth?: number
  minItemWidth?: number
}

export type IVSplitConfig = {
  type?: string
  offset?: number
  top?: any
  bottom?: any
  topHeight?: number
  minItemHeight?: number
}

export type IGridConfig = {
  type?: string
  cellSize?: number
  cellMargin?: number
  defaultWindowColSpan?: number
  defaultWindowRowSpan?: number
  windows?: IWindowConfig[]
  closeDisabled?: boolean
  maximizedIndex?: number
  activeIndex?: number
}

export type IDashboardAddOptions = {
  dashboardList: IDashboardList
  existing?: IDashboard
}

export type IWindowSettings = WindowSettings
export type IWindowManager = WindowManager
export type IWindow = Window
export type ISplit = Split
export type IStack = Stack
export type IHSplit = HSplit
export type IVSplit = VSplit
export type IGrid = Grid
export type IDashboardList = DashboardList
export type IDashboardAdd = DashboardAdd
export type IDashboard = Dashboard
export type IComponentRemove = ComponentRemove
export type IComponentFactory = typeof ComponentFactory

type IComponent = ReturnType<typeof ComponentFactory> | Component

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

//maybe use weakset for active instances
const ComponentRegistry = new Set()

function nextComponentId(kind) {
  let i = 1
  while (ComponentRegistry.has(`${kind}-comp-${i}`)) {
    i++
  }
  const id = `${kind}-comp-${i}`
  ComponentRegistry.add(id)
  return id
}

const NotConfiguredComponentFactory = (type: string) => {
  throw {
    code: "ILLEGAL_STATE",
    message: "A component factory has not been configured"
  }
}


export type IWindowAppHost = AppHost


/* -------------------------------------------------------------------------- */
/*                                   stores                                   */
/* -------------------------------------------------------------------------- */

export const ComponentRemoveStore = new ComponentRemove()
export const DashboardRemoveStore = new Supplier<Dashboard>()
export const DashboardListClearStore = new Supplier<DashboardList>()
export const DashboardAddStore = new DashboardAdd()

/* -------------------------------------------------------------------------- */
/*                                   actions                                  */
/* -------------------------------------------------------------------------- */

export const splitHorizontal = action((replace: Component, left: Component, right: Component) => {
  const split = new HSplit()
  if (replace.parent) {
    replace.parent.replace(split, replace)
  }
  split.setLeft(left)
  split.setRight(right)
})

export const splitVertical = action((replace: Component, top: Component, bottom: Component) => {
  const split = new VSplit()
  if (replace.parent) {
    replace.parent.replace(split, replace)
  }
  split.setTop(top)
  split.setBottom(bottom)
})

export const removeComponent = (opts: IComponentRemoveOptions) => {
  ComponentRemoveStore.init(opts)
}

export const addDashboard = action((opts: IDashboardAddOptions) => {
  DashboardAddStore.init(opts)
})

export const removeDashboard = action((dashboard: Dashboard) => {
  DashboardRemoveStore.value = dashboard
})

export const clearDashboards = action((dashboardList: DashboardList) => {
  DashboardListClearStore.value = dashboardList
})

/* -------------------------------------------------------------------------- */
/*                                   factory                                  */
/* -------------------------------------------------------------------------- */

type K = "window" | "hsplit" | "vsplit" | "stack" | "grid" | "basic"

export const ComponentFactory = (kind: K) => {
  return when(kind)
    .is("window", () => new Window())
    .is("stack", () => new Stack())
    .is("basic", () => new Stack())
    .is("hsplit", () => new HSplit())
    .is("vsplit", () => new VSplit())
    .is("grid", () => new Grid())
    .else(() => new Stack())
}

export { DashboardList as DashboardListModel }

type E = React.MouseEvent<HTMLButtonElement>

const renderView = (comp: IComponent) => {
  return when(comp && comp.type)
    .is("stack", <StackView stack={comp as Stack} />)
    .is("hsplit", <HSplitView hsplit={comp as HSplit} />)
    .is("vsplit", <VSplitView vsplit={comp as VSplit} />)
    .is("grid", <GridView grid={comp as Grid} />)
    .else(() => <StackView stack={comp as Stack} />)
}

type Props = {
  component: IComponent
}

export const ComponentView = observer((props: Props) => {
  return renderView(props.component)
})

const DashboardStylesheet = mergeStyleSets({
  root: {
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
  },
  content: {
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
  },
  overlay: {
    backgroundColor: DefaultPalette.white,
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
})

type IDashboardProps = {
  dashboard: Dashboard
  className?: string
  hidden?: boolean
  host?: IAppHost
}

const DashboardBlockOverlay: React.FC<{ dashboard: Dashboard; className: string }> = observer(
  ({ dashboard, className }) => {
    return (
      <>
        {dashboard.blockSource && (
          <div
            className={css(className, dashboard.blockSource.type)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 2
            }}
          />
        )}
      </>
    )
  }
)

export const DashboardPortals = observer((props: IDashboardProps) => {
  return (
    <>
      {props.dashboard.windows.map((w) => {
        return <WindowView key={`window-layer-${w.id}`} {...props} window={w} />
      })}
    </>
  )
})

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

  const _onHostResize = () => {
    _resizeToViewport()
  }

  const _addHostListener = (host: IAppHost) => {
    if (host) {
      host.addEventListener("resize", _onHostResize)
    }
  }

  const _removeHostListener = (host: IAppHost) => {
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
  const wm = component && component.isWindowManager ? (component as WindowManager) : undefined
  const requiresOverflow = wm ? wm.isRequiresOverflow : false
  return (
    <div
      id={props.dashboard.id}
      className={css(DashboardStylesheet.root, { hidden: props.hidden })}
      ref={_onRef}
    >
      <DashboardBlockOverlay dashboard={props.dashboard} className={DashboardStylesheet.overlay} />
      <ComponentRemoveDialog remove={ComponentRemoveStore} />
      <div
        className={css(DashboardStylesheet.content, { overflow: requiresOverflow ? true : false })}
      >
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
  return (
    <SyncComponent
      sync={props.dashboard.sync}
      syncLabel="Loading Dashboard..."
      onRenderDone={_onRenderDone}
    />
  )
})

export interface IDashboardWrapperProps {
  className?: string
  config?: any
  addApp?: Component["addApp"]
  loader?: () => Promise<any>
  saver?: (data: any) => Promise<any>
  saveDelay?: number
  host?: IAppHost
  router?: IRouter
  componentFactory?: IComponentFactory
  afterConfig?: (dashboard: Dashboard) => void
}

export interface IDashboardWrapper {
  dashboard: Dashboard
}

export const DashboardWrapper = observer((props: IDashboardWrapperProps) => {
  let _dashboard = React.useRef(new Dashboard())
  let dashboard = _dashboard.current

  useMount(() => {
    _setFromProps(props)
  })

  React.useEffect(() => {
    // dashboard.close();
    // _setFromProps(nextProps);
    _setFromProps(props)
    _load(props)
    return () => dashboard.close()
  }, [props.host, props.router, props.loader, props.saver, props.componentFactory])

  const _setFromProps = (props: IDashboardWrapperProps) => {
    dashboard.router = props.router
      ? props.router
      : props.host
      ? props.host.router
      : RouterContext.value
    dashboard.addApp = props.addApp
    dashboard.loader = props.loader
    dashboard.saver = props.saver
    dashboard.saveDelay = props.saveDelay
    dashboard.componentFactory = props.componentFactory ? props.componentFactory : ComponentFactory
  }

  const _load = (props: IDashboardWrapperProps) => {
    if (props.loader) {
      dashboard.load()
    } else if (props.config) {
      dashboard.setConfig(props.config)
      if (props.afterConfig) {
        props.afterConfig(dashboard)
      }
    }
  }
  return (
    <DashboardViewContainer className={props.className} dashboard={dashboard} host={props.host} />
  )
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
  dashboardList: DashboardList
  host?: IAppHost
  className?: string
}

export const DashboardListView = observer((props: IDashboardListProps) => {
  React.useEffect(() => {
    return () => props.dashboardList.close()
  }, [props.dashboardList])

  const dashboards = props.dashboardList.dashboards.map((db) => {
    return (
      <DashboardView
        key={db.id}
        hidden={db !== props.dashboardList.active}
        dashboard={db}
        host={props.host}
      />
    )
  })
  return (
    <div className={dashboardListStyles.root}>
      <DashboardAddPanel add={DashboardAddStore} />
      <DashboardRemoveDialog supplier={DashboardRemoveStore} />
      <DashboardListClearDialog supplier={DashboardListClearStore} />
      {dashboards}
    </div>
  )
})

export const DashboardListViewContainer = observer((props: IDashboardListProps) => {
  let _onRenderDone = () => {
    return <DashboardListView {...props} />
  }
  return (
    <SyncComponent
      sync={props.dashboardList.sync}
      syncLabel="Loading Dashboards..."
      onRenderDone={_onRenderDone}
    />
  )
})

type DashboardListProps = {
  dashboardList: DashboardList
  children?: any
} & IHostAppViewProps

export const DashboardListCommandBar = observer((props: DashboardListProps) => {
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

export const DashboardListAppView = observer((props: DashboardListProps) => {
  React.useEffect(() => {
    props.dashboardList.load()
  }, [props.dashboardList])

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

const GridStylesheet = mergeStyleSets({
  root: {},
  gridCells: {},
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "white",
    opacity: 0.1,
    zIndex: 2
  },
  row: {
    display: "flex"
  },
  cell: {
    backgroundColor: "gainsboro"
  }
})

export interface IGridProps {
  grid: Grid
  className?: string
  moveTimeout?: number
}

const getRowIndex = (grid: Grid, vy: number): number => {
  if (vy < 0) {
    return 0
  }
  const y = vy - grid.y
  return Math.floor(y / (grid.cellSize + grid.cellMargin))
}

const getColIndex = (grid: Grid, vx: number): number => {
  if (vx < 0) {
    return 0
  }
  const x = vx - grid.x
  return Math.floor(x / (grid.cellSize + grid.cellMargin))
}

const GridCells = observer((props: IGridProps) => {
  var _renderCell = (row: number, column: number): React.ReactNode => {
    return (
      <div
        key={column}
        className={GridStylesheet.cell}
        role="gridcell"
        style={{
          minWidth: props.grid.cellSize,
          width: props.grid.cellSize,
          minHeight: props.grid.cellSize,
          height: props.grid.cellSize,
          marginLeft: props.grid.cellMargin
        }}
      />
    )
  }

  var _renderRow = (row: number): React.ReactNode => {
    const cells = []
    for (let i = 0; i < props.grid.columns; i++) {
      cells.push(_renderCell(row, i))
    }
    return (
      <div
        role="row"
        className={GridStylesheet.row}
        key={row}
        style={{ marginTop: props.grid.cellMargin }}
      >
        {cells}
      </div>
    )
  }

  const { grid } = props
  const rows = []
  for (let r = 0; r < grid.rows; r++) {
    rows.push(_renderRow(r))
  }
  return <div className={GridStylesheet.gridCells}>{rows}</div>
})

const GridDragOverlay = observer((props: IGridProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var moveTimeout = props.moveTimeout >= 0 ? props.moveTimeout : Defaults.moveTimeout

  var _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const { grid } = props
    e.stopPropagation()
    e.preventDefault()
    try {
      e.dataTransfer.dropEffect = "move"
    } catch (ex) {}
    const drag = grid.drag
    const rootBounds = ref.current && ref.current.getBoundingClientRect()
    let vx = e.clientX - rootBounds.left
    let vy = e.clientY - rootBounds.top
    const dx = drag.dragState.offsetX || 0
    const dy = drag.dragState.offsetY || 0
    vx -= dx
    vy -= dy
    const colIndex = getColIndex(grid, vx)
    const rowIndex = getRowIndex(grid, vy)
    // delayed move to deal with row index changing
    // TODO: move this to a utility
    const current = new Date().getTime()
    const init = drag.dragState.init
    if (!init) {
      drag.setDragState({
        init: current,
        colIndex: colIndex,
        rowIndex: rowIndex
      })
    } else {
      if (current - init > moveTimeout) {
        if (colIndex === drag.dragState.colIndex && rowIndex === drag.dragState.rowIndex) {
          grid.moveTo(colIndex, rowIndex)
        } else {
          drag.setDragState({
            init: current,
            colIndex: colIndex,
            rowIndex: rowIndex
          })
        }
      }
    }
  }
  var _onDrop = (e: React.DragEvent<HTMLElement>) => {
    const { grid } = props
    const drag = grid.drag
    e.stopPropagation()
    e.preventDefault()
    const rootBounds = ref.current && ref.current.getBoundingClientRect()
    let vx = e.clientX - rootBounds.left
    let vy = e.clientY - rootBounds.top
    const dx = drag.dragState.offsetX || 0
    const dy = drag.dragState.offsetY || 0
    vx -= dx
    vy -= dy
    const colIndex = getColIndex(grid, vx)
    const rowIndex = getRowIndex(grid, vy)
    grid.moveTo(colIndex, rowIndex)
  }

  const { grid } = props
  if (grid.drag) {
    return (
      <div
        className={css(GridStylesheet.overlay, "drag")}
        onDragOver={_onDragOver}
        onDrop={_onDrop}
        ref={ref}
      />
    )
  }
  return null
})

const GridResizeOverlay = observer((props: IGridProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const { grid } = props
    const rootBounds = ref.current && ref.current.getBoundingClientRect()
    let vx = e.clientX - rootBounds.left
    let vy = e.clientY - rootBounds.top
    const colIndex = getColIndex(grid, vx)
    const rowIndex = getRowIndex(grid, vy)
    props.grid.resizeTo(colIndex, rowIndex)
  }
  var _onDrop = (e: React.MouseEvent<HTMLElement>) => {
    props.grid.resizeEnd()
  }

  if (props.grid.resizing) {
    return (
      <div
        className={css(GridStylesheet.overlay, "resize", props.grid.resizeType)}
        onDragOver={_onDragOver}
        onDrop={_onDrop}
        ref={ref}
      />
    )
  }
  return null
})

export const GridView = observer((props: IGridProps) => {
  const { grid } = props
  return (
    <div
      className={GridStylesheet.root}
      role="grid"
      style={{
        position: "relative",
        width: grid.maximized ? 0 : grid.gridWidth,
        height: grid.maximized ? 0 : grid.gridHeight,
        overflow: grid.maximized ? "hidden" : undefined
      }}
    >
      <GridCells {...props} />
      <GridDragOverlay {...props} />
      <GridResizeOverlay {...props} />
    </div>
  )
})

const HSplitStyles = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  splitter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "gray" //theme.palette.themeDark
  },
  splitterHandle: {
    cursor: "ew-resize",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -2,
    right: -2,
    overflow: "hidden",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    transition: "background-color 0.3s ease",
    selectors: {
      ":hover": {
        backgroundColor: "grey", //theme.palette.themeDark,
        opacity: 0.5
      },
      ".hsplit-icon": {
        fontSize: "10px",
        visibility: "hidden",
        color: "white" //theme.palette.white
      },
      "&.active": {
        backgroundColor: "gray", //theme.palette.themeDark,
        opacity: 1.0,
        selectors: {
          ".hsplit-icon": {
            visibility: "visible"
          }
        }
      }
    }
  },
  leftPane: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden"
  },
  leftContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  },
  rightPane: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden"
  },
  rightContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  }
})

export const HSplitView: React.FC<{ hsplit: HSplit }> = observer(({ hsplit }) => {
  var ref = React.useRef<HTMLDivElement>()
  var splitterRef = React.useRef<HTMLDivElement>()

  function _resize(e: MouseEvent) {
    if (!ref.current || !splitterRef.current) return
    const minItemWidth = hsplit.minItemWidth
    const bounds = ref.current && ref.current.getBoundingClientRect()
    const splitterBounds = ref.current && splitterRef.current.getBoundingClientRect()
    const max = bounds.width - splitterBounds.width - minItemWidth
    let splitterPos = e.clientX - bounds.left
    if (splitterPos <= minItemWidth) {
      splitterPos = minItemWidth
    } else if (splitterPos >= max) {
      splitterPos = max
    }
    hsplit.setOffset(splitterPos / bounds.width)
  }

  function _onDocumentMouseUp(e: MouseEvent) {
    if (!ref.current || !splitterRef.current) return
    ref.current.ownerDocument.removeEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.removeEventListener("mouseup", _onDocumentMouseUp)
    hsplit.setSplitActive(false)
  }
  function _onDocumentMouseMove(e: MouseEvent) {
    e.preventDefault()
    _resize(e)
  }

  function _onSplitterMouseDown(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    //if(!ref.current || !splitterRef.current) return;

    ref.current.ownerDocument.addEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.addEventListener("mouseup", _onDocumentMouseUp)
    hsplit.setSplitActive(true)
  }

  return (
    <div className={HSplitStyles.root} ref={ref}>
      <div className={HSplitStyles.leftPane} style={{ width: hsplit.leftWidth }}>
        <div className={HSplitStyles.leftContent}>
          <ComponentView component={hsplit.left} />
        </div>
      </div>
      <div
        className={css(HSplitStyles.splitter, { active: hsplit.splitActive })}
        onMouseDown={_onSplitterMouseDown}
        style={{ left: hsplit.leftWidth, width: hsplit.splitterWidth }}
        ref={splitterRef}
      >
        <div className={css(HSplitStyles.splitterHandle, { active: hsplit.splitActive })}>
          <Icon iconName="GripperBarVertical" className="hsplit-icon" />
        </div>
      </div>
      <div
        className={HSplitStyles.rightPane}
        style={{ left: hsplit.leftWidth + hsplit.splitterWidth, width: hsplit.rightWidth }}
      >
        <div className={HSplitStyles.rightContent}>
          <ComponentView component={hsplit.right} />
        </div>
      </div>
    </div>
  )
})

export const getColumnCount = (dashboard: Dashboard): number => {
  return dashboard && dashboard.component && dashboard.component.type === ComponentTypes.hsplit
    ? (dashboard.component as HSplit).columnCount
    : 0
}

export const getRowCount = (dashboard: Dashboard): number => {
  return dashboard && dashboard.component && dashboard.component.type === ComponentTypes.vsplit
    ? (dashboard.component as VSplit).rowCount
    : 0
}

export const assignWindows = (windows: IWindow[], stacks: Stack[]) => {
  if (windows && windows.length > 0) {
    const stackQuota = Math.ceil(windows.length / stacks.length)
    let stackIdx = 0
    let c
    windows.forEach((w) => {
      c = stacks[stackIdx]
      if (c.windowCount === stackQuota) {
        stackIdx++
        c = stacks[stackIdx]
      }
      c.add(w, false)
    })
    stacks.forEach((c) => {
      if (c.windowCount > 0) {
        c.setActiveIndex(0)
      } else {
        c.addNew()
      }
    })
  }
}

class GridLayout {
  static applyLayout = (dashboard: Dashboard) => {
    const windows = dashboard.windows
    const grid = new Grid()
    dashboard.setComponent(grid)
    windows.forEach((w) => grid.add(w))
  }
  static isLayoutApplied = (dashboard: Dashboard) => {
    return dashboard.component && dashboard.component.type === ComponentTypes.grid
  }
}

const onRenderGridCellSize = (item: IContextualMenuItem) => {
  const grid = item.grid as Grid
  return <GridCellSizeSlider key={item.key} grid={grid} />
}

const onRenderGridCellMargin = (item: IContextualMenuItem) => {
  const grid = item.grid as Grid
  return <GridCellMarginSlider key={item.key} grid={grid} />
}

export const GridDashboardLayout: IDashboardLayout = {
  key: "grid",
  name: "Grid (BETA)",
  title: "Grid (BETA) - NOTE: this is still a work in progress",
  iconProps: { iconName: "GridViewMedium" },
  applyLayout: GridLayout.applyLayout,
  isLayoutApplied: GridLayout.isLayoutApplied,
  createActions(dashboard: Dashboard) {
    const items: IContextualMenuItem[] = []
    const grid = dashboard.component as Grid
    // this is the grid settings icon
    items.push({
      key: "settings",
      iconProps: {
        iconName: "Equalizer"
      },
      subMenuProps: {
        shouldFocusOnContainer: true,
        items: [
          {
            key: "gridCellSizeHeader",
            itemType: ContextualMenuItemType.Header,
            name: "Cell Size"
          },
          {
            key: "gridCellSize",
            name: "Cell Size",
            grid: grid,
            onRender: onRenderGridCellSize
          },
          {
            key: "gridCellMarginHeader",
            itemType: ContextualMenuItemType.Header,
            name: "Cell Margin"
          },
          {
            key: "gridCellMargin",
            name: "Cell Margin",
            grid: grid,
            onRender: onRenderGridCellMargin
          }
        ]
      }
    })
    if (grid.addApp) {
      items.push({
        key: "add",
        name: "Add",
        iconProps: {
          iconName: "Add"
        },
        onClick() {
          grid.addNew()
        }
      })
    }
    return items
  }
}

class TabLayout {
  static applyLayout = (dashboard: Dashboard) => {
    // grab windows
    const windows = dashboard.windows
    // grab active window
    const active = windows.find((w) => w.active)
    const stack = new Stack()
    dashboard.setComponent(stack)
    windows.forEach((w) => {
      stack.add(w)
    })
    if (active) {
      stack.setActive(active)
    } else {
      stack.setActiveIndex(0)
    }
  }

  static isLayoutApplied = (dashboard: Dashboard) => {
    return dashboard.component && dashboard.component.type === ComponentTypes.stack
  }
}

export const TabDashboardLayout: IDashboardLayout = {
  key: "tabs",
  name: "Tabs",
  iconProps: { iconName: "BrowserTab" },
  applyLayout: TabLayout.applyLayout,
  isLayoutApplied: TabLayout.isLayoutApplied,
  createActions(dashboard: Dashboard) {
    const items: IContextualMenuItem[] = []
    const tabStack = dashboard.component as Stack
    // this is the grid settings icon
    items.push({
      key: "settings",
      iconProps: {
        iconName: "ArrangeSendToBack"
      },
      subMenuProps: {
        shouldFocusOnContainer: true,
        items: [
          {
            key: "gridCellSizeHeader",
            itemType: ContextualMenuItemType.Header,
            name: "Cell Size"
          },
          {
            key: "gridCellSize",
            name: "Cell Size",
            grid: tabStack
            // onRender: onRenderGridCellSize
          },
          {
            key: "gridCellMarginHeader",
            itemType: ContextualMenuItemType.Header,
            name: "Cell Margin"
          },
          {
            key: "gridCellMargin",
            name: "Cell Margin",
            grid: tabStack
            //onRender: onRenderGridCellMargin
          }
        ]
      }
    })
    if (tabStack.addApp) {
      items.push({
        key: "add",
        name: "Add",
        iconProps: {
          iconName: "Add"
        },
        onClick() {
          tabStack.addNew()
        }
      })
    }
    return items
  }
}

class ThreeColumnLayout {
  static applyLayout = (dashboard: Dashboard) => {
    const windows = dashboard.windows
    const stacks = [new Stack(), new Stack(), new Stack()]
    const outerSplit = new HSplit()
    outerSplit.setOffset(0.33)
    const innerSplit = new HSplit()
    outerSplit.setLeft(stacks[0])
    outerSplit.setRight(innerSplit)
    innerSplit.setLeft(stacks[1])
    innerSplit.setRight(stacks[2])
    dashboard.setComponent(outerSplit)
    assignWindows(windows, stacks)
  }

  static isLayoutApplied = (dashboard: Dashboard) => {
    return getColumnCount(dashboard) === 3
  }
}

export const ThreeColumnSplitDashboardLayout: IDashboardLayout = {
  key: "threeColumnSplit",
  name: "Three Columns",
  iconProps: { iconName: "TripleColumn" },
  applyLayout: ThreeColumnLayout.applyLayout,
  isLayoutApplied: ThreeColumnLayout.isLayoutApplied
}

class TwoColumnLayout {
  static applyLayout = (dashboard: Dashboard) => {
    const windows = dashboard.windows
    // create the new containers
    const stacks = [new Stack(), new Stack()]
    const split = new HSplit()
    split.setLeft(stacks[0])
    split.setRight(stacks[1])
    dashboard.setComponent(split)
    assignWindows(windows, stacks)
  }

  static isLayoutApplied = (dashboard: Dashboard) => {
    return getColumnCount(dashboard) === 2
  }
}

export const TwoColumnSplitDashboardLayout: IDashboardLayout = {
  key: "twoColumnSplit",
  name: "Two Columns",
  iconProps: { iconName: "DoubleColumn" },
  applyLayout: TwoColumnLayout.applyLayout,
  isLayoutApplied: TwoColumnLayout.isLayoutApplied
}

// the dashboard layout register - initialized with defaults
export const DashboardLayoutRegistry = new ListModel<IDashboardLayout>([
  TabDashboardLayout,
  TwoColumnSplitDashboardLayout,
  ThreeColumnSplitDashboardLayout,
  GridDashboardLayout
])

const onClickDashboardLayoutItem = (
  e: React.MouseEvent<HTMLButtonElement>,
  item: IContextualMenuItem
) => {
  item.applyLayout(item.dashboard)
}

export const createDashboardLayoutMenuItem = (
  dashboard: Dashboard,
  item: IDashboardLayout
): IContextualMenuItem => {
  return {
    key: item.key,
    title: item.title,
    name: item.name,
    iconProps: item.iconProps,
    dashboard: dashboard,
    applyLayout: item.applyLayout,
    canCheck: true,
    checked: item.isLayoutApplied(dashboard),
    onClick: onClickDashboardLayoutItem
  }
}

export const createDashboardLayoutMenuItems = (
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const isAnyLayoutApplied = items.some((item) => item.isLayoutApplied(dashboard))
  const r = items.map((item) => {
    return createDashboardLayoutMenuItem(dashboard, item)
  })
  r.push({
    dashboard: dashboard,
    key: "other",
    name: "Custom",
    iconProps: { iconName: "ViewDashboard" },
    checked: !isAnyLayoutApplied,
    canCheck: true,
    disabled: true
  })
  return r
}

export const createDashboardLayoutMenuSection = (
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutItems: IContextualMenuItem[] = createDashboardLayoutMenuItems(dashboard, items)
  return {
    key: "layoutSectionItem",
    itemType: ContextualMenuItemType.Section,
    sectionProps: {
      key: "layoutSection",
      title: "Layout",
      items: layoutItems
    }
  }
}

export const createDashboardMenu = (
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutSectionItem = createDashboardLayoutMenuSection(dashboard, items)
  const current = layoutSectionItem.sectionProps.items.find((item) => item.checked)
  return {
    key: "dashboardLayout",
    name: dashboard.sync.syncing
      ? "Loading..."
      : dashboard.sync.error
      ? "Error"
      : current
      ? current.name
      : "Layout",
    iconProps: current ? current.iconProps : { iconName: "ViewDashboard" },
    subMenuProps: {
      items: [layoutSectionItem]
    }
  }
}

export const createDashboardSettingsItem = (
  name: string,
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutSectionItem = createDashboardLayoutMenuSection(dashboard, items)
  return {
    key: "dashboardSettings",
    name: name,
    iconProps: { iconName: "Settings" },
    subMenuProps: {
      items: [layoutSectionItem]
    }
  }
}

export const createDashboardListMenu = (
  dashboardList: DashboardList,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  return !sync.syncing && active ? createDashboardMenu(active, items) : undefined
}

export const createDashboardLayoutActions = (
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const currentLayout = items.find((item) => {
    return item.isLayoutApplied(dashboard)
  })
  let actions: IContextualMenuItem[]
  if (currentLayout && currentLayout.createActions) {
    actions = currentLayout.createActions(dashboard)
  }
  if (!actions) {
    actions = []
  }
  return actions
}

export const createDashboardListLayoutActions = (
  dashboardList: DashboardList,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  return !sync.syncing && active ? createDashboardLayoutActions(active, items) : []
}

const onAddDashboardClick = (e, item) => {
  addDashboard({ dashboardList: item.dashboardList })
}
const onDashboardClick = (e, item) => {
  item.dashboardList.setActive(item.dashboard)
}
const onRemoveAllDashboardsClick = (e, item) => {
  clearDashboards(item.dashboardList)
}
const onClickCopyItem = (e, item) => {
  addDashboard({
    dashboardList: item.dashboardList,
    existing: item.dashboard
  })
}
const onClickRemoveItem = (e, item) => {
  removeDashboard(item.dashboard)
}

export const createMenuItems = (dashboardList: DashboardList): IContextualMenuItem[] => {
  const items: IContextualMenuItem[] = []
  const dashboards = dashboardList.dashboards
  const active = dashboardList.active
  if (dashboards.length > 0) {
    const dashboardItems: IContextualMenuItem[] = dashboards.map((d) => {
      return {
        key: d.id,
        name: d.title,
        canCheck: true,
        checked: d === active,
        dashboardList: dashboardList,
        dashboard: d,
        onClick: onDashboardClick,
        split: true,
        subMenuProps: {
          items: [
            {
              key: "copy",
              name: "Copy",
              iconProps: { iconName: "Copy" },
              dashboardList: dashboardList,
              dashboard: d,
              onClick: onClickCopyItem
            },
            {
              key: "remove",
              name: "Remove",
              iconProps: { iconName: "ChromeClose" },
              dashboardList: dashboardList,
              dashboard: d,
              onClick: onClickRemoveItem
            }
          ]
        }
      }
    })
    const dashboardSectionItem: IContextualMenuItem = {
      key: "dashboardSectionItem",
      itemType: ContextualMenuItemType.Section,
      sectionProps: {
        key: "dashboardSection",
        title: "Dashboards",
        items: dashboardItems
      }
    }
    items.push(dashboardSectionItem)
  }
  const actionItems: IContextualMenuItem[] = []
  actionItems.push({
    key: "add",
    name: "Add Dashboard",
    dashboardList: dashboardList,
    onClick: onAddDashboardClick,
    iconProps: { iconName: "Add" },
    disabled: dashboardList.sync.syncing
  })

  if (dashboardList.dashboards.length > 0) {
    actionItems.push({
      key: "removeAllSep",
      name: "-"
    })
    actionItems.push({
      key: "removeAll",
      name: "Remove All Dashboards",
      dashboardList: dashboardList,
      onClick: onRemoveAllDashboardsClick,
      iconProps: { iconName: "Clear" }
    })
  }
  const actionSectionItem: IContextualMenuItem = {
    key: "actionSectionItem",
    itemType: ContextualMenuItemType.Section,
    sectionProps: {
      key: "actionSection",
      title: "Actions",
      items: actionItems,
      topDivider: true
    }
  }
  items.push(actionSectionItem)
  return items
}

export const createCommandBarMenuItem = (dashboardList: DashboardList): IContextualMenuItem => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  const title = sync.syncing
    ? "Loading Dashboards..."
    : sync.error
    ? "Error"
    : active
    ? active.title
    : "Dashboards"
  return {
    key: "dashboardsCommbarBarItem",
    name: title,
    subMenuProps: {
      items: createMenuItems(dashboardList)
    }
  }
}

export interface IDashboardListMenuButtonProps {
  dashboardList: DashboardList
}
export const DashboardListMenuButton = observer((props: IDashboardListMenuButtonProps) => {
  const items = createMenuItems(props.dashboardList)
  const active = props.dashboardList.active
  const title = active ? active.title : "Dashboards"
  const menuProps: IContextualMenuProps = {
    items: items
  }
  return (
    <DefaultButton className="dashboard-list-menu-button app-menu-button" menuProps={menuProps}>
      {title}
    </DefaultButton>
  )
})

export const DashboardListMenuButtonContainer = observer((props: IDashboardListMenuButtonProps) => {
  const _onRenderSync = () => {
    return (
      <DefaultButton className="dashboard-list-menu-button app-menu-button">
        Loading...
      </DefaultButton>
    )
  }
  const _onRenderDone = () => {
    return <DashboardListMenuButton {...props} />
  }
  const _onRenderError = () => {
    return (
      <DefaultButton className="dashboard-list-menu-button app-menu-button error">
        Error
      </DefaultButton>
    )
  }

  return (
    <SyncComponent
      sync={props.dashboardList.sync}
      onRenderSync={_onRenderSync}
      onRenderDone={_onRenderDone}
    />
  )
})

interface IGridSettingsProps {
  grid: Grid
}

export interface IGridCellSliderProps extends IGridSettingsProps {
  min?: number
  max?: number
  label?: string
}

export const GridCellMarginSlider = observer((props: IGridCellSliderProps) => {
  const _onChange = (value: number) => {
    props.grid.setCellMargin(value)
  }
  return (
    <Slider
      label={props.label}
      ariaLabel={`Grid Cell Margin ${props.grid.cellMargin}`}
      min={props.min || 0}
      max={props.max || 16}
      value={props.grid.cellMargin}
      onChange={_onChange}
    />
  )
})

export const GridCellSizeSlider = observer((props: IGridCellSliderProps) => {
  const _onChange = (value: number) => {
    props.grid.setCellSize(value)
  }
  return (
    <Slider
      label={props.label}
      ariaLabel={`Grid Cell Size ${props.grid.cellSize}`}
      min={props.min || 10}
      max={props.max || 160}
      value={props.grid.cellSize}
      onChange={_onChange}
    />
  )
})

export const GridSettings = observer((props: IGridSettingsProps) => {
  return (
    <div>
      <h2>Grid Settings</h2>
      <div style={{ padding: 8 }}>
        <GridCellMarginSlider grid={props.grid} label="Cell Margin" />
      </div>
      <div style={{ padding: 8 }}>
        <GridCellSizeSlider grid={props.grid} label="Cell Size" />
      </div>
    </div>
  )
})

type DashboardDialogViewProps = {
  add?: DashboardAdd
  className?: string
  actionClassName?: string
  remove?: ComponentRemove
  dashboard?: Dashboard
}

// export type DashboardDialogProps<T = any> = DashboardDialogViewProps & {
//   supplier?: IMutableSupplier<T>
// }

const DashboardAddPanelStylesheet = mergeStyleSets({
  root: ["dashboard-add", {}],
  editor: [
    "dashboard-add-editor",
    {
      padding: 8
    }
  ],
  actions: ["dashboard-add-actions", {}],
  action: [
    "dasboard-add-action",
    {
      marginRight: 8
    }
  ]
})

//type IDashboardAddStyles = typeof DashboardAddPanelStylesheet

type ClearDialogProps = DashboardDialogViewProps & { supplier?: ISupplier<DashboardList> }
export const DashboardListClearDialog = observer((props: ClearDialogProps) => {
  const _onClickCancel = () => {
    props.supplier.clearValue()
  }
  const _onClickSave = () => {
    props.supplier.value.clear()
    props.supplier.clearValue()
  }
  const _onDismissed = () => {
    props.supplier.clearValue()
  }

  return (
    <>
      {props.supplier && props.supplier.value && (
        <Dialog
          hidden={!props.supplier.value}
          modalProps={{
            onDismissed: _onDismissed
          }}
          dialogContentProps={{
            title: props.supplier.value ? "Remove all Dashboards" : "",
            subText: props.supplier.value ? `Are you sure you want to remove all Dashboards?` : ""
          }}
        >
          <DialogFooter>
            <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
            <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
          </DialogFooter>
        </Dialog>
      )}
    </>
  )
})


const DashboardPropertyEditor = observer((props: {dashboard: IDashboard}) => {
  const { dashboard } = props
  return (
    <div className="dashboard-property-editor">
      <BoundTextField
        label="Title"
        binding={{
          target: dashboard,
          key: "title",
          setter: "setTitle"
        }}
      />
    </div>
  )
})

const DashboardAddActions = observer((props: DashboardDialogViewProps) => {
  const _onClickCancel = () => {
    props.add.cancel()
  }
  const _onClickSave = () => {
    props.add.save()
  }

  return (
    <div className={props.className}>
      <DefaultButton className={props.actionClassName} onClick={_onClickCancel}>
        Cancel
      </DefaultButton>
      <PrimaryButton
        className={props.actionClassName}
        onClick={_onClickSave}
        disabled={!props.add.saveEnabled}
      >
        OK
      </PrimaryButton>
    </div>
  )
})

const ExistingDashboardSelector = observer((props: DashboardDialogViewProps) => {
  const options: IDropdownOption[] = props.add.dashboardList.dashboards.map((db) => {
    return {
      key: db.id,
      text: db.title
    }
  })
  options.unshift({
    key: "",
    text: ""
  })
  const _onChange = (option: IDropdownOption) => {
    const dashboard = props.add.dashboardList.dashboards.find((db) => db.id === option.key)
    props.add.setExisting(dashboard)
  }

  return (
    <>
      {props.add && props.add.dashboardList.dashboardCount > 0 && (
        <Dropdown
          label="From Existing"
          options={options}
          onChanged={_onChange}
          selectedKey={props.add.existing ? props.add.existing.id : ""}
        />
      )}
    </>
  )
})

const DashboardAddEditor = observer((props: DashboardDialogViewProps) => {
  
  const _onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.which === KeyCodes.enter && props.add.saveEnabled) {
      props.add.save()
    }
  }

  const _onMakeActiveChange = (e, checked) => {
    props.add.setMakeActive(checked)
  }
  return (
    <>
      {props.add.active && (
        <div className={props.className}>
          <DashboardPropertyEditor dashboard={props.add.dashboard} />
          <ExistingDashboardSelector {...props} />
          <Checkbox
            label="Set Dashboard Active"
            onChange={_onMakeActiveChange}
            checked={props.add.makeActive}
            styles={{ root: { marginTop: 8 } }}
          />
        </div>
      )}
    </>
  )
})

export const DashboardAddPanel = observer((props: DashboardDialogViewProps) => {
  const _onRenderActions = () => {
    return (
      <DashboardAddActions
        add={props.add}
        className={DashboardAddPanelStylesheet.actions}
        actionClassName={DashboardAddPanelStylesheet.action}
      />
    )
  }
  const _onRenderEditor = () => {
    return <DashboardAddEditor add={props.add} className={DashboardAddPanelStylesheet.editor} />
  }
  const _onDismiss = () => {
    props.add.cancel()
  }

  const effectiveRootStyle = css([DashboardAddPanelStylesheet.root, props.className])
  return (
    <>
      {props.add.active && (
        <Panel
          className={effectiveRootStyle}
          isOpen={props.add.active}
          isLightDismiss={true}
          onRenderFooterContent={_onRenderActions}
          onRenderBody={_onRenderEditor}
          headerText="Add Dashboard"
          type={PanelType.medium}
          onDismiss={_onDismiss}
        />
      )}
    </>
  )
})

export const ComponentRemoveDialog = observer((props: DashboardDialogViewProps) => {
  const _onClickCancel = () => {
    props.remove.cancel()
  }
  const _onClickSave = () => {
    props.remove.save()
  }
  const _onDismissed = () => {
    props.remove.cancel()
  }

  const c = props.remove.component
  let title
  if (c) {
    if (c.type === "stack" || c.type === "list") {
      title = "all Tabs"
    }
  }
  if (!title) {
    title = "the Tab"
  }

  return (
    <React.Fragment>
      {props.remove && props.remove.active && (
        <Dialog
          hidden={!props.remove.active}
          modalProps={{
            onDismiss: _onDismissed
          }}
          dialogContentProps={{
            title: `Close ${title}`,
            subText: `Are you sure you want to close ${title}?`
          }}
        >
          <DialogFooter>
            <DefaultButton className="dashboard-form-action" onClick={_onClickCancel}>
              Cancel
            </DefaultButton>
            <PrimaryButton className="dashboard-form-action" onClick={_onClickSave}>
              OK
            </PrimaryButton>
          </DialogFooter>
        </Dialog>
      )}
    </React.Fragment>
  )
})

type DashboardSupplier = { supplier: ISupplier<Dashboard> }

export const DashboardRemoveDialog = observer(({ supplier }: DashboardSupplier) => {
  const _onClickCancel = () => {
    supplier.clearValue()
  }
  const _onClickSave = () => {
    supplier.value.removeFromParent()
    supplier.clearValue()
  }
  const _onDismissed = () => {
    supplier.clearValue()
  }

  return (
    <Dialog
      hidden={!supplier.value}
      onDismiss={_onDismissed}
      dialogContentProps={{
        title: supplier.value ? "Remove Dashboard" : "",
        subText:
          (supplier.value && `Are you sure you want to remove ${supplier.value.title}?`) || ""
      }}
    >
      <DialogFooter>
        <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
        <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
})

const stackStyles = mergeStyleSets({
  root: ["stack", {}],
  header: [
    "stack-header",
    {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.white,
      overflow: "hidden"
    }
  ],
  tabBar: [
    "stack-tab-bar",
    {
      background: "transparent",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      height: "100%"
    }
  ],
  actionBar: [
    "stack-action-bar",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralQuaternary
    }
  ],
  action: [
    "stack-action",
    {
      color: DefaultPalette.neutralPrimary,
      height: "100%",
      background: "transparent",
      border: "none",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      selectors: {
        "&.close-action": {
          selectors: {
            ":hover": {
              color: DefaultPalette.white,
              backgroundColor: DefaultPalette.redDark
            }
          }
        }
      }
    }
  ],
  actionIcon: [
    "stack-action-icon",
    {
      fontSize: FontSizes.small,
      fontWeight: FontWeights.regular
    }
  ],
  addAction: [
    "stack-add-action",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.neutralPrimary,
      outline: "none",
      border: "none",
      height: "100%",
      width: 28,
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      selectors: {
        ":hover": {
          backgroundColor: DefaultPalette.neutralQuaternaryAlt
        },
        "&.stack-add-action-icon": {
          color: DefaultPalette.neutralPrimary,
          fontSize: FontSizes.medium
        }
      }
    }
  ],
  addActionIcon: ["stack-add-action-icon", {}],
  tab: [
    "stack-tab",
    {
      position: "relative",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      overflow: "hidden",
      //color of the tab when its not active
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.neutralSecondary,
      cursor: "pointer",
      height: "100%",
      transition: "background-color 0.3s ease",
      zIndex: 0,
      selectors: {
        ".close-action": {
          visibility: "hidden"
        },
        "&.active": {
          //color of the tab when it's active
          backgroundColor: "white", //DefaultPalette.neutralLighter,
          color: DefaultPalette.neutralPrimary,
          boxShadow: `3px 0px 3px -2px ${DefaultPalette.neutralTertiary}, -3px 0px 3px -2px ${DefaultPalette.neutralTertiary}`,
          zIndex: 1,
          selectors: {
            ".close-action": {
              visibility: "visible"
            },
            ":hover": {
              backgroundColor: "white" //DefaultPalette.neutralLighter
            }
          }
        },
        ":hover": {
          selectors: {
            ".close-action": {
              visibility: "visible"
            }
          },
          backgroundColor: DefaultPalette.neutralQuaternaryAlt
        }
      }
    }
  ],
  tabIconContainer: [
    "stack-tab-icon-container",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 20,
      height: 20,
      maxHeight: 20,
      maxWidth: 20,
      overflow: "hidden",
      marginLeft: 4
    }
  ],
  tabTitleContainer: [
    "stack-tab-title-container",
    {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      maxWidth: 130,
      overflow: "hidden",
      paddingLeft: 8,
      paddingRight: 8
    }
  ],
  tabTitle: [
    "stack-tab-title",
    {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontSize: FontSizes.small
    }
  ],

  tabActionBar: [
    "stack-tab-action-bar",
    {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    }
  ],
  tabAction: [
    "stack-tab-action",
    {
      color: DefaultPalette.neutralPrimary,
      marginLeft: 4,
      marginRight: 4,
      height: 20,
      width: 20,
      lineHeight: 0, //16,
      padding: "0px",
      outline: "none",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      selectors: {
        "&.active": {
          color: DefaultPalette.neutralPrimary
        },
        "&.close-action": {
          selectors: {
            ":hover": {
              color: DefaultPalette.white,
              backgroundColor: DefaultPalette.redDark
            }
          }
        }
      }
    }
  ],
  tabActionIcon: [
    "stack-tab-action-icon",
    {
      lineHeight: FontSizes.mini,
      fontSize: FontSizes.mini,
      fontWeight: FontWeights.regular,
      margin: 0,
      height: FontSizes.mini,
      width: FontSizes.mini
    }
  ],
  tabPanel: ["stack-tab-panel", {}],
  body: [
    "stack-body",
    {
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: DefaultPalette.white,
      boxShadow: `0px -3px 3px -2px ${DefaultPalette.neutralTertiary}`
    }
  ],
  dragOverlay: [
    "stack-drag-overlay",
    {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      background: DefaultPalette.white,
      opacity: 0.2,
      zIndex: 3
    }
  ],
  dragFeedbackContainer: [
    "stack-drag-feedback-container",
    {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      background: "transparent",
      zIndex: 2
    }
  ],
  dragFeedback: [
    "stack-drag-feedback",
    {
      position: "absolute",
      transition: "all 100ms ease",
      backgroundColor: DefaultPalette.neutralTertiary,
      opacity: 0.5
    }
  ]
})

//export type IStackStyles = typeof stackStyles;

export type IStackProps = {
  stack?: Stack
  className?: string
  window?: Window
  first?: boolean
  last?: boolean
}

const StackTabIcon = observer((props: IStackProps) => (
  <div className={stackStyles.tabIconContainer}>
    <HostAppIcon host={props.window.appHost} />
  </div>
))

// const StackTabIcon = observer((props: IStackProps) => {
//   const host = props.window.appHost
//   const icon = host.icon
//   if (icon.name || icon.text || icon.url || icon.component) {
//     return (
//       <div className={stackStyles.tabIconContainer}>
//         <Icon iconName={icon.name} />
//       </div>
//     )
//   }
//   return null
// })

//-- THIS IS ONLY THE END X ON THE FAR RIGHT SIDE, STYLING THE <CLOSE/> DOESNT EFFECT ANYTHING ELSE --//
const StackCloseAction = observer((props: IStackProps) => {
  let _onRemoveConfirm = () => {
    props.stack.close()
  }
  let _onClick = () => {
    if (props.stack.windowCount > 1) {
      removeComponent({ component: props.stack, saveHandler: _onRemoveConfirm })
    } else {
      props.stack.close()
    }
  }

  const { stack } = props
  if (!stack.closeDisabled) {
    return (
      <button
        type="button"
        style={{ width: stack.headerHeight }}
        className={css(stackStyles.action, "close-action")}
        title="Close all Tabs"
        onClick={_onClick}
      >
        <Icon className={stackStyles.actionIcon} iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

// -------- this is the toolbar that holds the tabs and the X on the right -----------//

const StackActionBar = observer((props: IStackProps) => (
  <div
    className={stackStyles.actionBar}
    style={{ position: "absolute", top: 0, right: 0, bottom: 0 }}
  >
    <StackCloseAction {...props} />
  </div>
))

const StackTabTitle = observer((props: IStackProps) => (
  <span className={css(stackStyles.tabTitleContainer, stackStyles.tabTitle)}>
    {props.window.title}
  </span>
))

const StackTabCloseAction = observer((props: IStackProps) => {
  let _onMouseDown = (e: E) => e.stopPropagation()

  let _onClick = (e: E) => {
    e.stopPropagation()
    props.window.close()
  }

  if (props.window && !props.window.closeDisabled) {
    return (
      <button
        type="button"
        className={css(stackStyles.tabAction, "close-action", { active: props.window.active })}
        title={`Close ${props.window.title || "Tab"}`}
        onMouseDown={_onMouseDown}
        onClick={_onClick}
      >
        <Icon className={stackStyles.tabActionIcon} iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

const StackTabActionBar = observer((props: IStackProps) => {
  return <StackTabCloseAction {...props} />
})

let DragData = {
  _dragOverStart: undefined
}

const StackTab = observer((props: IStackProps) => {
  let ref = React.useRef<HTMLDivElement>()

  let _onClick = () => {
    props.stack.setActive(props.window)
  }

  let _onDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    const transferText = String(JSON.stringify(props.window.config))
    e.dataTransfer.setData("text", transferText)

    window.setTimeout(() => {
      props.window.dragStart()
    }, 16)
  }
  let _onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    delete DragData._dragOverStart
    props.window.dragEnd()
  }
  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const db = props.stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag) {
      e.stopPropagation()
      if (drag !== props.window) {
        e.preventDefault()
        try {
          e.dataTransfer.dropEffect = "move"
        } catch (ex) {}
      }
    } else {
      if (!props.window.active) {
        if (!DragData._dragOverStart) {
          DragData._dragOverStart = new Date().getTime()
        } else {
          const diff = new Date().getTime() - DragData._dragOverStart
          if (diff >= 600) {
            props.window.activate()
            delete DragData._dragOverStart
          }
        }
      }
    }
  }

  let _onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (e.relatedTarget !== ref.current && !ref.current.contains(e.relatedTarget as HTMLElement)) {
      delete DragData._dragOverStart
    }
  }

  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    delete DragData._dragOverStart
    e.stopPropagation()
    e.preventDefault()
    props.stack.dropWindow(props.window)
  }

  return (
    <div
      className={css(stackStyles.tab, {
        active: props.window.active,
        first: props.first,
        last: props.last
      })}
      role="tab"
      id={`${props.window.id}-tab`}
      aria-controls={props.window.id}
      title={props.window.title}
      ref={ref}
      onClick={_onClick}
      draggable={true}
      onDragStart={_onDragStart}
      onDragEnd={_onDragEnd}
      onDragOver={_onDragOver}
      onDrop={_onDrop}
      onDragLeave={_onDragLeave}
    >
      <StackTabIcon {...props} />
      <StackTabTitle {...props} />
      <StackTabActionBar {...props} />
    </div>
  )
})

const StackTabPanel = observer((props: IStackProps) => {
  const active = props.window.active
  let style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden"
  }
  if (active) {
    style.right = 0
    style.bottom = 0
  } else {
    style.width = 0
    style.height = 0
  }
  return (
    <div
      className={css({ active: active })}
      style={style}
      role="tabpanel"
      id={`${props.window.id}-tab-panel`}
    />
  )
})

const StackAddAction = observer((props: IStackProps) => {
  var _onClick = () => props.stack.addNew({ makeActive: true })

  const { stack } = props
  if (stack.addApp) {
    return (
      <button
        type="button"
        title="Add Tab"
        className={stackStyles.addAction}
        onClick={_onClick}
        style={{ width: stack.headerHeight }}
      >
        <Icon className={stackStyles.addActionIcon} iconName="add" />
      </button>
    )
  }
  return null
})

const StackTabBar = observer((props: IStackProps) => {
  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const stack = props.stack
    const db = stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag && (drag.parent !== stack || (stack.windowCount > 1 && drag !== stack.last))) {
      e.stopPropagation()
      e.preventDefault()
      try {
        e.dataTransfer.dropEffect = "move"
      } catch (ex) {}
    }
  }
  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    props.stack.dropWindow()
  }
  return (
    <div className={stackStyles.tabBar} role="tablist" onDragOver={_onDragOver} onDrop={_onDrop}>
      {props.stack &&
        props.stack.windows &&
        props.stack.windows.map((w, idx) => (
          <StackTab
            key={w.id}
            stack={props.stack}
            window={w}
            first={idx === 0}
            last={idx === props.stack.windowCount - 1}
          />
        ))}
      <StackAddAction {...props} />
    </div>
  )
})

const StackHeader = observer((props: IStackProps) => (
  <div className={stackStyles.header} style={{ height: props.stack.headerHeight }}>
    <StackTabBar {...props} />
    <StackActionBar {...props} />
  </div>
))

let uselessDropHandler = () => {}
let _dropHandler = uselessDropHandler


const StackDragOverlay = observer((props:IStackProps) => {
  let overlayRef = React.useRef<HTMLDivElement>()

  let _onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    if (drag) {
      drag.setDragState({ pos: null, over: null })
    }
    _dropHandler = uselessDropHandler
  }

  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    _dropHandler()
    props.stack.dragEnd()
  }

  let _dropLeft = () => {
    props.stack.splitLeft(props.stack.dashboard.drag)
  }

  let _setDropZoneLeft = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropLeft
    const styles: React.CSSProperties = {
      top: 0,
      left: 0,
      width: Math.floor(width / 2),
      height: height
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropRight = () => {
    props.stack.splitRight(props.stack.dashboard.drag)
  }

  let _setDropZoneRight = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropRight
    const left = Math.floor(width / 2)
    const styles: React.CSSProperties = {
      top: 0,
      left: left,
      width: width - left,
      height: height
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropTop = () => {
    props.stack.splitTop(props.stack.dashboard.drag)
  }

  let _setDropZoneTop = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropTop
    const styles: React.CSSProperties = {
      top: 0,
      left: 0,
      width: width,
      height: Math.floor(height / 2)
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropBottom = () => {
    props.stack.splitBottom(props.stack.dashboard.drag)
  }

  let _setDropZoneBottom = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropBottom
    const top = Math.floor(height / 2)
    const styles: React.CSSProperties = {
      top: top,
      left: 0,
      width: width,
      height: height - top
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropAdd = () => {
    props.stack.add(props.stack.dashboard.drag, { makeActive: true })
  }

  let _setDropZoneAdd = () => {
    _dropHandler = _dropAdd
  }

  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const stack = props.stack
    const db = stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag) {
      e.stopPropagation()
      if ((drag.parent !== stack && stack.windowCount > 0) || stack.windowCount > 1) {
        e.preventDefault()
        const bounds = overlayRef.current.getBoundingClientRect()
        const leftRightZoneWidth = Math.floor(bounds.width / 6)
        const topBottomZoneHeight = Math.floor(bounds.height / 2)
        if (e.clientX >= bounds.left && e.clientX <= bounds.left + leftRightZoneWidth) {
          _setDropZoneLeft(bounds.width, bounds.height)
        } else if (
          e.clientX >= bounds.left + bounds.width - leftRightZoneWidth &&
          e.clientX <= bounds.left + bounds.width
        ) {
          _setDropZoneRight(bounds.width, bounds.height)
        } else if (e.clientY >= bounds.top && e.clientY <= bounds.top + topBottomZoneHeight) {
          _setDropZoneTop(bounds.width, bounds.height)
        } else {
          _setDropZoneBottom(bounds.width, bounds.height)
        }
      } else if (stack.windowCount === 0) {
        e.preventDefault()
        _setDropZoneAdd()
      }
    }
  }

  let motionlessStyle = {
    top: 0,
    left: 0,
    height: 0,
    width: 0
  }

  const { stack } = props
  const headerHeight: React.CSSProperties = { top: stack.headerHeight }
  //const drag = stack.dashboard ? stack.dashboard.drag : undefined

  if (stack.dashboard && stack.dashboard.drag) {
    let drag = stack.dashboard.drag
    const feedbackStyles =
      drag.dragState.over === stack ? drag.dragState.feedbackStyles : motionlessStyle
    return (
      <React.Fragment>
        {[
          <div
            key="overlay"
            className={stackStyles.dragOverlay}
            onDragOver={_onDragOver}
            onDrop={_onDrop}
            onDragLeave={_onDragLeave}
            ref={overlayRef}
            style={{ ...headerHeight }}
          />,
          <div
            key="feedbackContainer"
            className={stackStyles.dragFeedbackContainer}
            style={{ top: stack.headerHeight }}
          >
            <div
              className={css(stackStyles.dragFeedback, drag.dragState.pos)}
              style={{ ...feedbackStyles }}
            />
          </div>
        ]}
      </React.Fragment>
    )
  }
  return null
})

const StackBody = observer((props: IStackProps) => (
  <div className={stackStyles.body} style={{ top: props.stack.headerHeight }}>
    {props.stack &&
      props.stack.windows &&
      props.stack.windows.map((w) => <StackTabPanel key={w.id} stack={props.stack} window={w} />)}
  </div>
))

export const StackView = observer((props: IStackProps) => {
  return (
    <>
      {props.stack && (
        <div id={props.stack.id} className={stackStyles.root}>
          <StackDragOverlay {...props} />
          <StackHeader {...props} />
          <StackBody {...props} />
        </div>
      )}
    </>
  )
})

const VSplitStylesheet = mergeStyleSets({
  root: [
    "vsplit",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  ],
  splitter: [
    "vsplit-splitter",
    {
      cursor: "ns-resize",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      backgroundColor: "gray", //theme.palette.themeDark,
      left: 0,
      right: 0
    }
  ],
  splitterHandle: [
    "vsplit-splitter-content",
    {
      position: "absolute",
      top: -2,
      right: 0,
      bottom: -2,
      left: 0,
      overflow: "hidden",
      backgroundColor: "transparent",
      color: "gray", //theme.palette.themeDark,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      transition: "background-color 0.3s ease",
      selectors: {
        ":hover": {
          backgroundColor: "gray", //theme.palette.themeDark,
          opacity: 0.5
        },
        ".vsplit-icon": {
          fontSize: "10px",
          visibility: "hidden",
          color: "white" //theme.palette.white
        },
        "&.active": {
          backgroundColor: "gray", //theme.palette.themeDark,
          opacity: 1.0,
          selectors: {
            ".vsplit-icon": {
              visibility: "visible"
            }
          }
        }
      }
    }
  ],
  topPane: [
    "vsplit-top-pane",
    {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      overflow: "hidden"
    }
  ],
  topContent: [
    "vsplit-top-content",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "auto"
    }
  ],
  bottomPane: [
    "vsplit-bottom-pane",
    {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      overflow: "hidden"
    }
  ],
  bottomContent: [
    "vsplit-bottom-content",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "auto"
    }
  ]
})
interface IVSplitProps {
  vsplit
  className?: string
}

//export type VSplitView = typeof VSplitView
export const VSplitView = observer((props: IVSplitProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var splitterRef = React.useRef<HTMLDivElement>()

  var _resize = (e: MouseEvent) => {
    if (!ref.current || !splitterRef.current) return
    const minItemHeight = props.vsplit.minItemHeight
    const bounds = ref.current.getBoundingClientRect()
    const splitterBounds = splitterRef.current.getBoundingClientRect()
    const max = bounds.height - splitterBounds.height - minItemHeight
    let splitterPos = e.clientY - bounds.top
    if (splitterPos <= minItemHeight) {
      splitterPos = minItemHeight
    } else if (splitterPos >= max) {
      splitterPos = max
    }
    const offset = splitterPos / bounds.height
    props.vsplit.setOffset(offset)
  }
  var _onDocumentMouseUp = (e: MouseEvent) => {
    if (!ref.current || !splitterRef.current) return
    ref.current.ownerDocument.removeEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.removeEventListener("mouseup", _onDocumentMouseUp)
    props.vsplit.setSplitActive(false)
  }
  var _onDocumentMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    _resize(e)
  }

  var _onSplitterMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    ref.current.ownerDocument.addEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.addEventListener("mouseup", _onDocumentMouseUp)
    props.vsplit.setSplitActive(true)
  }

  return (
    <div className={VSplitStylesheet.root} ref={ref}>
      <div className={VSplitStylesheet.topPane} style={{ height: props.vsplit.topHeight }}>
        <div className={VSplitStylesheet.topContent}>
          <ComponentView component={props.vsplit.top} />
        </div>
      </div>
      <div
        className={css(VSplitStylesheet.splitter, { active: props.vsplit.splitActive })}
        onMouseDown={_onSplitterMouseDown}
        style={{ top: props.vsplit.topHeight, height: props.vsplit.splitterHeight }}
        ref={splitterRef}
      >
        <div className={css(VSplitStylesheet.splitterHandle, { active: props.vsplit.splitActive })}>
          <Icon iconName="GripperBarHorizontal" className="vsplit-icon" />
        </div>
      </div>
      <div className={VSplitStylesheet.bottomPane} style={{ height: props.vsplit.bottomHeight }}>
        <div className={VSplitStylesheet.bottomContent}>
          <ComponentView component={props.vsplit.bottom} />
        </div>
      </div>
    </div>
  )
})

const windowStyles = mergeStyleSets({
  root: {
    backgroundColor: DefaultPalette.white,
    borderColor: DefaultPalette.neutralSecondary,
    borderStyle: "solid",
    selectors: {
      "&.content-hidden": {
        height: 28
      },
      "&.animate-position": {
        transition:
          "top 0.2s ease, right 0.2s ease, bottom 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease"
      },
      "&.manager-type-grid": {
        boxShadow: `0 0 ${5}px 0 rgba(0, 0, 0, 0.4)`
      }
    }
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    cursor: "pointer",
    overflow: "hidden",
    backgroundColor: DefaultPalette.neutralSecondary,
    color: DefaultPalette.white
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    maxHeight: 20,
    maxWidth: 20,
    overflow: "hidden",
    marginLeft: 4
  },
  titleContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    paddingLeft: 8,
    paddingRight: 8
  },
  title: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: FontSizes.small
  },
  action: {
    color: DefaultPalette.white,
    height: 28,
    width: 28,
    lineHeight: 28,
    cursor: "pointer",
    padding: "0px",
    outline: "none",
    border: "none",
    background: "transparent",
    selectors: {
      ":hover": {
        color: DefaultPalette.white,
        backgroundColor: DefaultPalette.neutralTertiary
      },
      "&.close-action": {
        selectors: {
          ":hover": {
            color: DefaultPalette.white,
            backgroundColor: DefaultPalette.redDark
          }
        }
      },
      "& .window-action-icon": {
        lineHeight: "16px",
        fontSize: FontSizes.mini,
        fontWeight: FontWeights.regular,
        margin: "0px",
        height: "16px",
        width: "16px"
      }
    }
  },
  actionBar: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  body: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    overflow: "auto",
    backgroundColor: DefaultPalette.white,
    selectors: {
      "&.content-hidden": {
        height: 0,
        overflow: "hidden"
      }
    }
  },
  resize: {
    selectors: {
      "&.top": {
        position: "absolute",
        zIndex: 2,
        top: -2,
        height: 5,
        left: 0,
        right: 0,
        cursor: "n-resize"
      },
      "&.right": {
        position: "absolute",
        zIndex: 2,
        right: -2,
        width: 5,
        top: 0,
        bottom: 0,
        cursor: "e-resize"
      },
      "&.bottom": {
        position: "absolute",
        zIndex: 2,
        bottom: -2,
        height: 5,
        left: 0,
        right: 0,
        cursor: "s-resize"
      },
      "&.left": {
        position: "absolute",
        zIndex: 2,
        left: -2,
        width: 5,
        top: 0,
        bottom: 0,
        cursor: "w-resize"
      },
      "&.topLeft": {
        position: "absolute",
        zIndex: 3,
        left: -4,
        top: -4,
        width: 10,
        height: 10,
        cursor: "nw-resize"
      },
      "&.topRight": {
        position: "absolute",
        zIndex: 3,
        right: -4,
        top: -4,
        width: 10,
        height: 10,
        cursor: "ne-resize"
      },
      "&.bottomLeft": {
        position: "absolute",
        zIndex: 3,
        left: -4,
        bottom: -4,
        width: 10,
        height: 10,
        cursor: "sw-resize"
      },
      "&.bottomRight": {
        position: "absolute",
        zIndex: 3,
        right: -4,
        bottom: -4,
        width: 10,
        height: 10,
        cursor: "se-resize"
      }
    }
  }
})

export interface IWindowProps {
  window: Window
  className?: string
}

export const WindowCloseAction = observer((props: IWindowProps) => {
  const _onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }
  const _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    props.window.close()
  }

  if (props.window && !props.window.closeDisabled) {
    return (
      <button
        type="button"
        className={css(props.className, "close-action")}
        title={`Close ${props.window.title || "App"}`}
        onClick={_onClick}
        onMouseDown={_onMouseDown}
      >
        <Icon className="window-action-icon" iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

export const WindowMaximizeAction = observer((props: IWindowProps) => {
  const _onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }
  const _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    props.window.setMaximized(!props.window.maximized)
  }

  if (props.window) {
    return (
      <button
        type="button"
        className={css(props.className, "maximize-action")}
        title={props.window.maximized ? "Restore" : "Maximize"}
        onClick={_onClick}
        onMouseDown={_onMouseDown}
      >
        <Icon
          className="window-action-icon"
          iconName={props.window.maximized ? "BackToWindow" : "FullScreen"}
        />
      </button>
    )
  }
  return null
})

export const WindowIconContainer: FC<{ windowHost: Window }> = observer(({ windowHost }) => {
  const host = windowHost.appHost
  const icon = host.icon
  if (icon.name || icon.text || icon.url || icon.component) {
    return (
      <div className={windowStyles.iconContainer}>
        <HostAppIcon host={host} />
      </div>
    )
  }
  return null
})

type WindowResizeHandleProps = {
  windowHost: IWindow,
  resizeType: any
}

const WindowResizeHandle = observer((props: WindowResizeHandleProps) => {
  const { windowHost, resizeType } = props
  const _resizeDragStartHandler = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.dataTransfer.setData("text", "Resizing Window " + windowHost.id)
    //windowHost.resizeStart(resizeType)
    //Promise.resolve().then(() => windowHost.resizeStart(resizeType))
    window.setTimeout(() => {
      windowHost.resizeStart(resizeType)
    }, 1)
  }

  const _onResizeDragEnd = (e: React.DragEvent<HTMLElement>) => {
    windowHost.resizeEnd()
  }

  return (
    <>
      {windowHost.settings.resizable && !windowHost.maximized && (
        <div
          className={css(windowStyles.resize, resizeType)}
          draggable
          onDragStart={_resizeDragStartHandler}
          onDragEnd={_onResizeDragEnd}
        />
      )}
    </>
  )
})


type WindowHeaderProps = {
  windowHost: IWindow
} & JSX.IntrinsicElements["div"];

const WindowHeader = observer((props: WindowHeaderProps) => {
  const { onMouseDown, windowHost, children } = props
  const _onHeaderDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    windowHost.setMaximized(!windowHost.maximized)
  }

  return (
    <>
      <div
        className={windowStyles.header}
        onMouseDown={onMouseDown}
        onDoubleClick={_onHeaderDoubleClick}
        style={{ top: 0, right: 0, left: 0, height: windowHost.settings.headerHeight }}
      >
        {children}
      </div>
    </>
  )
})

export const WindowView = observer((props: IWindowProps) => {
  let windowRef = React.useRef<HTMLDivElement>()
  let _canDrag: boolean = false
  let _dragOffsetX: number
  let _dragOffsetY: number

  const _onHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (props.window.settings.draggable) {
      _canDrag = true
      windowRef.current.draggable = true
      const bounds = windowRef.current.getBoundingClientRect()
      _dragOffsetX = e.clientX - bounds.left
      _dragOffsetY = e.clientY - bounds.top
    }
  }

  const _onDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (_canDrag) {
      e.stopPropagation()
      const transferText = String(JSON.stringify(props.window.config))
      e.dataTransfer.setData("text", transferText)
      window.setTimeout(() => {
        props.window.dragStart({ offsetX: _dragOffsetX, offsetY: _dragOffsetY })
      }, 1)
    } else {
      e.preventDefault()
    }
  }
  const _onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    _canDrag = false
    windowRef.current.draggable = false
    props.window.dragEnd()
  }

  const notifyResize = () => {
    props.window.appHost.emit({ type: "resize" })
    //dispatchWindowResize()
  }
  const _onTransitionEnd = () => {
    notifyResize()
  }

  React.useEffect(() => {
    notifyResize()
  })

  //const { window, className } = props
  const { draggable } = props.window.settings
  const style: React.CSSProperties = {
    position: "absolute",
    top: props.window.y,
    left: props.window.x,
    width: props.window.width,
    height: props.window.height,
    overflow: "hidden",
    zIndex: props.window.maximized ? 4 : 1,
    borderWidth: props.window.maximized ? 0 : props.window.settings.borderWidth
  }
  return (
    <div
      id={props.window.id}
      className={css(
        windowStyles.root,
        `manager-type-${props.window.manager ? props.window.manager.type : "unknown"}`,
        {
          maximized: props.window.maximized,
          "animate-position": props.window.settings.animatePosition
        }
      )}
      style={style}
      onDragStart={draggable ? _onDragStart : undefined}
      onDragEnd={draggable ? _onDragEnd : undefined}
      onTransitionEnd={props.window.settings.animatePosition ? _onTransitionEnd : undefined}
      role={props.window.settings.role}
      ref={windowRef}
    >
      {
        <>
          {props.window.settings.headerHeight > 0 && (
            <WindowHeader
              onMouseDown={_onHeaderMouseDown}
              //onDoubleClick={_onHeaderDoubleClick}
              windowHost={props.window}
            >
              <WindowIconContainer windowHost={props.window} />
              <div id="window-title" className={windowStyles.titleContainer}>
                <div className={windowStyles.title}>{props.window.title}</div>
              </div>

              <div id="window-action-bar" className={windowStyles.actionBar}>
                <WindowMaximizeAction
                  {...props}
                  className={css(windowStyles.action, "maximize-action")}
                />
                <WindowCloseAction
                  {...props}
                  className={css(windowStyles.action, "close-action")}
                />
              </div>
            </WindowHeader>
          )}
        </>
      }
      <div
        id="window-body"
        className={css(windowStyles.body, { "content-hidden": props.window.contentHidden })}
        style={{
          top: props.window.settings.headerHeight,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <AppHostContainer host={props.window.appHost} />
      </div>
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.top} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.right} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottom} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.left} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.topRight} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.topLeft} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottomRight} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottomLeft} />
    </div>
  )
})
