import { action, autorun, computed, IReactionDisposer, observable } from "mobx"
import { ComponentTypes, WindowResizeType } from "../constants"
import { IGrid, IGridBounds, IGridConfig, IWindow } from "../types"
import { Window } from "./Window"
import { WindowManager } from "./WindowManager"

const isCollision = (a: IGridBounds, b: IGridBounds) => {
  if (b.colIndex + b.colSpan <= a.colIndex) {
    return false
  }
  if (b.colIndex >= a.colIndex + a.colSpan) {
    return false
  }
  if (b.rowIndex + b.rowSpan <= a.rowIndex) {
    return false
  }
  if (b.rowIndex >= a.rowIndex + a.rowSpan) {
    return false
  }
  return true
}

const Defaults = {
  cellSize: 80,
  cellMargin: 8,
  defaultWindowColSpan: 6,
  defaultWindowRowSpan: 4
}

const isSamePosition = (a: IGridBounds, b: IGridBounds): boolean => {
  return a.colIndex === b.colIndex && a.rowIndex === b.rowIndex
}

const isSameSize = (a: IGridBounds, b: IGridBounds): boolean => {
  return a.colSpan === b.colSpan && a.rowSpan === b.rowSpan
}

class Grid extends WindowManager implements IGrid {
  @observable private _cellSize: number
  @observable private _cellMargin: number
  @observable private _defaultWindowColSpan: number
  @observable private _defaultWindowRowSpan: number
  @observable private _settingsActive: boolean = false
  protected _dragDisposer: IReactionDisposer
  protected _layoutDisposer: IReactionDisposer
  private _resizeHandlers: { [key: string]: (colIndex: number, rowIndex: number, w: IWindow) => void }

  constructor() {
    super()
    this.windowSettings.borderWidth = 1
    this.windowSettings.headerHeight = 28
    this.windowSettings.resizable = true
    this.windowSettings.draggable = true
    this.windowSettings.animatePosition = true
    this._resizeHandlers = {}
    this._resizeHandlers[WindowResizeType.top] = this._resizeTop
    this._resizeHandlers[WindowResizeType.right] = this._resizeRight
    this._resizeHandlers[WindowResizeType.bottom] = this._resizeBottom
    this._resizeHandlers[WindowResizeType.left] = this._resizeLeft
    this._resizeHandlers[WindowResizeType.bottomRight] = this._resizeBottomRight
    this._resizeHandlers[WindowResizeType.topRight] = this._resizeTopRight
    this._resizeHandlers[WindowResizeType.bottomLeft] = this._resizeBottomLeft
    this._resizeHandlers[WindowResizeType.topLeft] = this._resizeTopLeft
    this._layoutDisposer = autorun(this._layout)
  }

  get type() {
    return ComponentTypes.grid
  }

  @computed
  get isRequiresOverflow() {
    return this.maximized ? false : true
  }

  @computed
  get cellSize() {
    return this._cellSize !== undefined ? this._cellSize : Defaults.cellSize
  }
  set cellSize(value) {
    this.setCellSize(value)
  }
  @action
  setCellSize(cellSize: number) {
    if (cellSize > 0) {
      this._cellSize = cellSize
    }
  }

  @computed
  get cellMargin() {
    return this._cellMargin !== undefined ? this._cellMargin : Defaults.cellMargin
  }
  set cellMargin(value) {
    this.setCellMargin(value)
  }
  @action
  setCellMargin(cellMargin: number) {
    if (cellMargin >= 0) {
      this._cellMargin = cellMargin
    }
  }

  @computed
  get rows() {
    const b = this.bottomMostRow + 1
    const vp = this.viewportRows
    return b > vp ? b : vp
  }

  @computed
  get columns() {
    const r = this.rightMostColumn + 1
    const vp = this.viewportColumns
    return r > vp ? r : vp
  }

  @computed
  get defaultWindowColSpan() {
    return this._defaultWindowColSpan !== undefined ? this._defaultWindowColSpan : Defaults.defaultWindowColSpan
  }
  set defaultWindowColSpan(value) {
    this.setDefaultWindowColSpan(value)
  }
  @action
  setDefaultWindowColSpan(defaultWindowColSpan: number) {
    if (defaultWindowColSpan > 0) {
      this._defaultWindowColSpan = defaultWindowColSpan
    }
  }

  @computed
  get defaultWindowRowSpan() {
    return this._defaultWindowRowSpan !== undefined ? this._defaultWindowRowSpan : Defaults.defaultWindowRowSpan
  }
  set defaultWindowRowSpan(value) {
    this.setDefaultWindowRowSpan(value)
  }
  @action
  setDefaultWindowRowSpan(defaultWindowRowSpan: number) {
    if (defaultWindowRowSpan > 0) {
      this._defaultWindowRowSpan = defaultWindowRowSpan
    }
  }

  @computed
  get gridWidth(): number {
    return this.cellMargin + this.columns * (this.cellSize + this.cellMargin)
  }

  @computed
  get gridHeight(): number {
    return this.cellMargin + this.rows * (this.cellSize + this.cellMargin)
  }

  @computed
  get settingsActive() {
    return this._settingsActive
  }
  set settingsActive(value) {
    this.setSettingsActive(value)
  }
  @action
  setSettingsActive(settingsActive: boolean) {
    this._settingsActive = settingsActive
  }

  @computed
  get config(): IGridConfig {
    return {
      type: this.type,
      cellSize: this._cellSize,
      cellMargin: this._cellMargin,
      defaultWindowColSpan: this._defaultWindowColSpan,
      defaultWindowRowSpan: this._defaultWindowRowSpan,
      windows: this.windows.filter((w) => !w.transient).map((w) => w.config),
      closeDisabled: this._closeDisabled,
      maximizedIndex: this._maximizedIndex,
      activeIndex: this._activeIndex
    }
  }
  set config(value) {
    this.setConfig(value)
  }
  @action
  setConfig(config: IGridConfig) {
    this.windows = []
    if (config && config.windows && config.windows.length > 0) {
      config.windows.forEach((wc) => {
        const w = new Window()
        this.add(w)
        w.setConfig(wc)
      })
    }
    this.setCellSize(config ? config.cellSize : undefined)
    this.setCellMargin(config ? config.cellMargin : undefined)
    this.setDefaultWindowColSpan(config ? config.defaultWindowColSpan : undefined)
    this.setDefaultWindowRowSpan(config ? config.defaultWindowRowSpan : undefined)
    this.setCloseDisabled(config ? config.closeDisabled : undefined)
    this.setMaximizedIndex(config ? config.maximizedIndex : undefined)
    this.setActiveIndex(config ? config.activeIndex : undefined)
  }

  getBounds(w: IWindow): IGridBounds {
    let r = w.settings.data.grid as IGridBounds
    if (!r) {
      r = { colIndex: 0, rowIndex: 0, colSpan: this.defaultWindowColSpan, rowSpan: this.defaultWindowRowSpan }
    }
    return r
  }

  @action
  setBounds(w: IWindow, bounds: IGridBounds) {
    w.settings.setData({ grid: bounds })
  }

  isWindowCollision(a: IWindow, b: IWindow) {
    return isCollision(this.getBounds(a), this.getBounds(b))
  }

  dontMessWith(boss: IWindow, w: IWindow) {
    const bb = this.getBounds(boss)
    const b = this.getBounds(w)
    const viewportColumns = this.viewportColumns
    let newPos
    if (bb.colIndex + bb.colSpan + b.colSpan <= viewportColumns) {
      newPos = Object.assign({}, b, { colIndex: bb.colIndex + bb.colSpan })
    } else {
      newPos = Object.assign({}, b, { colIndex: 0, rowIndex: bb.rowIndex + bb.rowSpan })
    }
    this.setBounds(w, newPos)
  }

  getCollisions(pos: IGridBounds): IWindow[] {
    return this.windows.filter((w) => {
      return isCollision(pos, this.getBounds(w))
    })
  }

  hasCollision(pos: IGridBounds, ignore?: IWindow[]): boolean {
    return this.windows.some((w) => {
      return (!ignore || ignore.indexOf(w) < 0) && isCollision(pos, this.getBounds(w))
    })
  }

  windowHasCollision(win: IWindow): boolean {
    return this.windows.some((w) => {
      return w !== win && this.isWindowCollision(win, w)
    })
  }

  getWindowCollisions(win: IWindow, ignore?: IWindow[]): IWindow[] {
    return this.windows.filter((w) => {
      return w !== win && (!ignore || ignore.indexOf(w) < 0) && this.isWindowCollision(w, win)
    })
  }

  getFirstWindowCollision(win: IWindow, ignore?: IWindow[]): IWindow {
    return this.windows.find((w) => {
      return w !== win && (!ignore || ignore.indexOf(w) < 0) && this.isWindowCollision(w, win)
    })
  }

  @action
  makeWayFor(win: IWindow, ignore?: IWindow[]): void {
    const cs = this.getWindowCollisions(win, ignore)
    if (cs.length > 0) {
      cs.forEach((c) => {
        this.dontMessWith(win, c)
      })
      let nextIgnore = [win]
      if (ignore) {
        nextIgnore = nextIgnore.concat(ignore)
      }
      this.makeWayFor(cs[0], nextIgnore)
    }
  }

  @computed
  get rightMost() {
    return this.getRightMost(this.windows)
  }

  @computed
  get rightMostColumn() {
    const r = this.rightMost
    if (r) {
      const rb = this.getBounds(r)
      return rb.colIndex + rb.colSpan
    }
    return 0
  }

  getRightMost(windows: IWindow[]): IWindow {
    let r: IWindow
    windows.forEach((w) => {
      if (!r) {
        r = w
      } else {
        const b = this.getBounds(w)
        const rb = this.getBounds(r)
        if (b.colIndex + b.colSpan > rb.colIndex + rb.colSpan) {
          r = w
        }
      }
    })
    return r
  }

  isViewportSpaceToRight(target: IWindow, w: IWindow): boolean {
    const tb = this.getBounds(target)
    const wb = this.getBounds(w)
    return tb.colIndex + tb.colSpan + wb.colSpan <= this.viewportColumns
  }

  @computed
  get bottomMost() {
    return this.getBottomMost(this.windows)
  }

  @computed
  get bottomMostRow() {
    const b = this.bottomMost
    if (b) {
      const bb = this.getBounds(b)
      return bb.rowIndex + bb.rowSpan
    }
    return 0
  }

  getBottomMost(windows: IWindow[]): IWindow {
    let r: IWindow
    windows.forEach((w) => {
      if (!r) {
        r = w
      } else {
        const b = this.getBounds(w)
        const rb = this.getBounds(r)
        if (b.rowIndex + b.rowSpan > rb.rowIndex + rb.rowSpan) {
          r = w
        }
      }
    })
    return r
  }

  isViewportSpaceBelow(target: IWindow, w: IWindow): boolean {
    const tb = this.getBounds(target)
    const wb = this.getBounds(w)
    return tb.rowIndex + tb.rowSpan + wb.rowSpan <= this.viewportRows
  }

  @action
  newHere(win: IWindow): void {
    let collisions: IWindow[]
    while (true) {
      collisions = this.getWindowCollisions(win)
      if (collisions.length > 0) {
        this.dontMessWith(collisions[0], win)
      } else {
        break
      }
    }
  }

  @action
  applyDragStartPosition(w: IWindow) {
    const pos = this.getBounds(w)
    const dragStartPos = w.dragState.gridBounds as IGridBounds
    if (dragStartPos && !isSamePosition(pos, dragStartPos) && !this.hasCollision(dragStartPos, [w])) {
      this.setBounds(w, dragStartPos)
    }
  }

  @action
  applyDragStartPositions(boss: IWindow) {
    if (boss) {
      this.windows.forEach((w) => {
        if (w !== boss) {
          this.applyDragStartPosition(w)
        }
      })
    }
  }

  @action
  moveTo(colIndex: number, rowIndex: number, w: IWindow = this.drag) {
    if (w && w.parent === this) {
      const pos = this.getBounds(w)

      if (colIndex < 0) {
        colIndex = 0
      }

      if (rowIndex < 0) {
        rowIndex = 0
      }

      if (colIndex !== pos.colIndex || rowIndex !== pos.rowIndex) {
        this.setBounds(w, Object.assign({}, pos, { colIndex: colIndex, rowIndex: rowIndex }))
        this.makeWayFor(w)
        this.applyDragStartPositions(this.drag)
      }
    }
  }

  private _resizeRight = (colIndex: number, rowIndex: number, w: IWindow) => {
    const pos = this.getBounds(w)
    let colSpan = colIndex - pos.colIndex + 1

    if (colSpan <= 0) {
      colSpan = 1
    }

    if (colSpan !== pos.colSpan) {
      this.setBounds(w, Object.assign({}, pos, { colSpan: colSpan }))
    }
  }

  private _resizeLeft = (colIndex: number, rowIndex: number, w: IWindow) => {
    const pos = this.getBounds(w)
    const rightColIndex = pos.colIndex + pos.colSpan
    let colSpan = rightColIndex - colIndex
    if (colSpan <= 0) {
      colSpan = 1
    }
    if (colSpan !== pos.colSpan) {
      this.setBounds(w, Object.assign({}, pos, { colIndex: colIndex, colSpan: colSpan }))
    }
  }

  private _resizeBottom = (colIndex: number, rowIndex: number, w: IWindow) => {
    const pos = this.getBounds(w)
    let rowSpan = rowIndex - pos.rowIndex + 1

    if (rowSpan <= 0) {
      rowSpan = 1
    }

    if (rowSpan !== pos.rowSpan) {
      this.setBounds(w, Object.assign({}, pos, { rowSpan: rowSpan }))
    }
  }

  private _resizeTop = (colIndex: number, rowIndex: number, w: IWindow) => {
    const pos = this.getBounds(w)
    const bottomRowIndex = pos.rowIndex + pos.rowSpan
    let rowSpan = bottomRowIndex - rowIndex
    if (rowSpan <= 0) {
      rowSpan = 1
    }
    if (rowSpan !== pos.rowSpan) {
      this.setBounds(w, Object.assign({}, pos, { rowIndex: rowIndex, rowSpan: rowSpan }))
    }
  }

  private _resizeBottomRight = (colIndex: number, rowIndex: number, w: IWindow) => {
    this._resizeBottom(colIndex, rowIndex, w)
    this._resizeRight(colIndex, rowIndex, w)
  }

  private _resizeTopRight = (colIndex: number, rowIndex: number, w: IWindow) => {
    this._resizeTop(colIndex, rowIndex, w)
    this._resizeRight(colIndex, rowIndex, w)
  }

  private _resizeBottomLeft = (colIndex: number, rowIndex: number, w: IWindow) => {
    this._resizeBottom(colIndex, rowIndex, w)
    this._resizeLeft(colIndex, rowIndex, w)
  }

  private _resizeTopLeft = (colIndex: number, rowIndex: number, w: IWindow) => {
    this._resizeTop(colIndex, rowIndex, w)
    this._resizeLeft(colIndex, rowIndex, w)
  }

  @action
  resizeTo(colIndex: number, rowIndex: number, w: IWindow = this.resizing) {
    if (w && w.parent === this) {
      const h = this._resizeHandlers[this.resizeType]
      if (h) {
        h(colIndex, rowIndex, w)
        this.makeWayFor(w)
        this.applyDragStartPositions(this.resizing)
      }
    }
  }

  getViewportX(colIndex: number): number {
    return this.x + this.cellMargin + colIndex * (this.cellSize + this.cellMargin)
  }

  getWindowViewportX(w: IWindow): number {
    return this.getViewportX(this.getBounds(w).colIndex)
  }

  getViewportWidth(colSpan: number): number {
    return colSpan * this.cellSize + (colSpan - 1) * this.cellMargin
  }

  getWindowViewportWidth(w: IWindow): number {
    return this.getViewportWidth(this.getBounds(w).colSpan)
  }

  getViewportY(rowIndex: number): number {
    return this.y + this.cellMargin + rowIndex * (this.cellSize + this.cellMargin)
  }

  getWindowViewportY(w: IWindow): number {
    return this.getViewportY(this.getBounds(w).rowIndex)
  }

  getViewportHeight(rowSpan: number): number {
    return rowSpan * this.cellSize + (rowSpan - 1) * this.cellMargin
  }

  getWindowViewportHeight(w: IWindow): number {
    return this.getViewportHeight(this.getBounds(w).rowSpan)
  }

  @computed
  get viewportColumns() {
    const r = Math.floor((this.width - this.cellMargin) / (this.cellMargin + this.cellSize))
    return r < 0 ? 0 : r
  }

  @computed
  get viewportRows() {
    const r = Math.floor((this.height - this.cellMargin) / (this.cellMargin + this.cellSize))
    return r < 0 ? 0 : r
  }

  private _layout = () => {
    if (this.maximized) {
      this.windows.forEach((w) => {
        if (w !== this.maximized) {
          w.setViewport(0, 0, 0, 0)
        }
      })
      this.maximized.setViewport(this.x, this.y, this.width, this.height)
    } else {
      this.windows.forEach((w) => {
        const pos = this.getBounds(w)
        const vx = this.getViewportX(pos.colIndex)
        const vy = this.getViewportY(pos.rowIndex)
        const width = this.getViewportWidth(pos.colSpan)
        const height = this.getViewportHeight(pos.rowSpan)
        w.setViewport(vx, vy, width, height)
      })
    }
  }

  @action
  add(win: IWindow, opts?: any): void {
    super.add(win, opts)
    if (win) {
      this.newHere(win)
    }
  }

  protected _onDragStart(drag: IWindow) {
    this.windows.forEach((w) => {
      w.setDragState({ gridBounds: Object.assign({}, this.getBounds(w)) })
    })
  }

  protected _onResizeStart(win: IWindow) {
    this._onDragStart(win)
  }
}

export { Grid }
