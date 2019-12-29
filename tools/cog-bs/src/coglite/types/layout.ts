import { CSSProperties } from "react"
import { IAppHost, IAppIcon } from "./app"
import { IConsumerFunc, IMutableSync, IPredicateFunc, ISupplierFunc } from "./io"
import { IRequest, IRouter } from "./router"

type IFabricContextualMenuItem = any
type IFabricIconProps = any

export interface IDashboardLayout {
  doLayout?: (dashboard: IDashboard) => Promise<any>
  key: string
  name: string
  title?: string
  iconProps?: IFabricIconProps
  applyLayout: (dashboard: IDashboard) => Promise<any> | any
  isLayoutApplied: (dashboard: IDashboard) => boolean
  createActions?: (dashboard: IDashboard) => IFabricContextualMenuItem[]
}

export interface IPortal {
  setViewport(x: number, y: number, width: number, height: number)
  scrollIntoView(): void
  bringToFront(): void
  bringToBase(): void
  destroy(): void
}

export interface IPortalManager {
  getPortal(window: IWindow): IPortal
  destroyPortal(window: IWindow): void
  destroy(): void
}

export interface IWindowSettings {
  borderWidth: number
  headerHeight: number
  resizable: boolean
  draggable: boolean
  animatePosition: boolean
  role: string
  data: any
  setBorderWidth(border: number): void
  setHeaderHeight(headerHeight: number): void
  setResizable(resizable: boolean): void
  setDraggable(draggable: boolean): void
  setAnimatePosition(animatePosition: boolean): void
  setRole(role: string): void
  setData(data: any): void
  config: any
  setConfig(config: any): void
}

type WindowResizeType = "top" | "right" | "bottom" | "left" | "topRight" | "topLeft" | "bottomRight" | "bottomLeft"

export interface IWindowManager extends IComponent, IDragManager {
  first: IWindow
  last: IWindow
  windowCount: number
  windows: IWindow[]
  windowSettings: IWindowSettings
  resizing: IWindow
  active: IWindow
  activeIndex: number
  maximized: IWindow
  maximizedIndex: number
  resizeType: WindowResizeType
  isRequiresOverflow: boolean
  add(win: IWindow, opts?: any): void
  addNew(opts?: any): void
  open(request: IRequest): Promise<IWindow>
  resizeStart(win: IWindow, type: WindowResizeType): void
  resizeEnd()
  setActiveIndex(activeIndex: number): void
  setActive(win: IWindow): void
  setMaximized(window: IWindow): void
  setMaximizedIndex(maximizedIndex: number): void
}

export interface IWindowConfig {
  type?: string
  title?: string
  closeDisabled?: boolean
  path?: string
  query?: any
  params?: any
  contentHidden?: boolean
  settings?: any
}

export interface IWindow extends IComponent {
  name: string
  path: string
  params: any
  query: any
  icon: IAppIcon
  title: string
  onClose: IConsumerFunc<IWindow>
  active: boolean
  contentHidden: boolean
  appHost: IAppHost
  transient: boolean
  manager: IWindowManager
  settings: IWindowSettings
  dragging: boolean
  dragState: any
  resizing: boolean
  maximized: boolean
  setPath(path: string): void
  setParams(params: any): void
  setQuery(query: any): void
  setTitle(title: string): void
  activate(): void
  setContentHidden(hidden: boolean): void
  toggleContent(): void
  load(request?: IRequest): Promise<any>
  open(request: IRequest): Promise<IWindow>
  setTransient(transient: boolean): void
  setDragState(dragState: any): void
  clearDragState(): void
  dragStart(dragState?: any): void
  dragEnd(): void
  resizeStart(type: WindowResizeType): void
  resizeEnd()
  maximize()
  restoreSize()
  setMaximized(maximized: boolean): void
  config: IWindowConfig
  setConfig(config: IWindowConfig): void
}

export interface IViewport {
  x: number
  y: number
  width: number
  height: number
}

export interface IStackConfig {
  type?: string
  activeIndex?: number
  windows?: IWindowConfig[]
  closeDisabled?: boolean
}

export interface IStack extends IWindowManager, ISplittable {
  winDragStyle?: CSSProperties
  winDrag?: any
  calculateWxH?: any
  headerHeight: number
  setHeaderHeight(headerHeight: number): void
  dropWindow(refWindow?: IWindow): void
  config: IStackConfig
  setConfig(config: IStackConfig): void
}

export interface ISplittable {
  splitLeft(newComp?: IComponent): void
  splitRight(newComp?: IComponent): void
  splitTop(newComp?: IComponent): void
  splitBottom(newComp?: IComponent): void
}

export interface ISplit extends IComponent {
  offset: number
  first: IComponent
  second: IComponent
  splitActive: boolean
  setOffset(offset: number): void
  setFirst(first: IComponent): void
  setSecond(second: IComponent): void
  setSplitActive(splitActive: boolean): void
}

export interface IHSplitConfig {
  type?: string
  offset?: number
  left?: any
  right?: any
  leftWidth?: number
  minItemWidth?: number
}

export interface IHSplit extends ISplit {
  minItemWidth: number
  leftWidth: number
  rightWidth: number
  splitterWidth: number
  left: IComponent
  right: IComponent
  setLeft(left: IComponent): void
  setRight(right: IComponent): void
  setLeftWidth(leftWidth: number): void
  setRightWidth(rightWidth: number): void
  setMinItemWidth(minItemWidth: number): void
  config: IHSplitConfig
  setConfig(config: IHSplitConfig): void
  columnCount: number
}

export interface IVSplitConfig {
  type?: string
  offset?: number
  top?: any
  bottom?: any
  topHeight?: number
  minItemHeight?: number
}

export interface IVSplit extends ISplit {
  minItemHeight: number
  topHeight: number
  bottomHeight: number
  splitterHeight: number
  top: IComponent
  bottom: IComponent
  setTop(top: IComponent): void
  setBottom(bottom: IComponent): void
  setMinItemHeight(minItemHeight: number): void
  config: IVSplitConfig
  setConfig(config: IVSplitConfig): void
  rowCount: number
}

export interface IGridBounds {
  rowIndex?: number
  rowSpan?: number
  colIndex?: number
  colSpan?: number
}

export interface IGridConfig {
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

export interface IGrid extends IWindowManager {
  rows: number
  viewportRows: number
  columns: number
  viewportColumns: number
  cellSize: number
  cellMargin: number
  gridWidth: number
  gridHeight: number
  defaultWindowColSpan: number
  defaultWindowRowSpan: number
  settingsActive: boolean
  setCellSize(cellSize: number): void
  setCellMargin(cellMargin: number): void
  setDefaultWindowColSpan(defaultWindowColSpan: number): void
  setDefaultWindowRowSpan(defaultWindowRowSpan: number): void
  moveTo(colIndex: number, rowIndex: number, window?: IWindow): void
  resizeTo(colIndex: number, rowIndex: number, window?: IWindow): void
  getCollisions(pos: IGridBounds): IWindow[]
  getBounds(window: IWindow): IGridBounds
  setBounds(window: IWindow, pos: IGridBounds): void
  setSettingsActive(settingsActive: boolean): void
  config: IGridConfig
  setConfig(config: IGridConfig): void
}

export interface IDragManager {
  drag: IWindow
  dragStart(drag: IWindow): void
  dragEnd(): void
}

export interface IDashboardList extends IComponent {
  sync: IMutableSync
  active: IDashboard
  activeIndex: number
  dashboards: IDashboard[]
  dashboardCount: number
  setActive(active: IDashboard): void
  setActiveIndex(activeIndex: number): void
  add(dashboard: IDashboard, makeActive?: boolean): void
  clear(): void
  load(): Promise<any>
}

export interface IDashboardAddOptions {
  dashboardList: IDashboardList
  existing?: IDashboard
}

export interface IDashboardAdd {
  active: boolean
  dashboardList: IDashboardList
  existing: IDashboard
  dashboard: IDashboard
  saveEnabled: boolean
  makeActive: boolean

  init(opts: IDashboardAddOptions): void
  setExisting(existing: IDashboard): void
  setMakeActive(makeActive: boolean): void
  save(): void
  cancel(): void
}

export interface IDashboard extends IComponent, IDragManager {
  sync: IMutableSync
  title: string
  component: IComponent
  blockSource: IComponent
  windows: IWindow[]
  setTitle(title: string): void
  setComponent(component: IComponent): void
  componentConfig: any
  setComponentConfig(componentConfig: any): void
  setBlockSource(blockSource: IComponent): void
  clearBlockSource(): void
  clear(): void
  load(): Promise<any>
}

export interface IComponentRemoveOptions {
  component: IComponent
  saveHandler?: (component: IComponent) => void
}

export interface IComponentRemove {
  active: boolean
  component: IComponent
  init(opts: IComponentRemoveOptions): void
  save(): void
  cancel(): void
}

export interface IComponentFactory {
  (type: string): IComponent
}

export interface IComponent extends IViewport {
  id: string
  type: string
  parent: IComponent
  dashboard: IDashboard
  root: IComponent
  config: any
  router: IRouter
  isWindowManager: boolean
  componentFactory: IComponentFactory
  closeDisabled: boolean
  x: number
  rx: number
  y: number
  ry: number
  width: number
  height: number
  setRouter(router: IRouter): void
  addApp: IRequest | ISupplierFunc<IRequest>
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>): void
  setConfig(state: any): void
  remove(comp: IComponent): void
  removeFromParent(): void
  replace(newComp: IComponent, oldComp: IComponent): void
  visit(callback: IConsumerFunc<IComponent>): void
  findFirst(predicate: IPredicateFunc<IComponent>): IComponent
  findAll(predicate: IPredicateFunc<IComponent>): IComponent[]
  close(opts?: any): void
  setCloseDisabled(closeDisabled: boolean): void
  resize(width: number, height: number): void
  position(x: number, y: number): void
  setViewport(x: number, y: number, width: number, height: number): void
  resetViewport(): void
}
