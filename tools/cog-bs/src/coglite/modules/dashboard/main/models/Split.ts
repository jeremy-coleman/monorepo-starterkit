import { action, autorun, computed, IReactionDisposer, observable } from "mobx"
import { ComponentTypes } from "../constants"
import { IComponent, IHSplit, IHSplitConfig, ISplit, IVSplit, IVSplitConfig } from "../types"
import { Component } from "./Component"

const Defaults = {
  offset: 0.5,
  minItemHeight: 28,
  minItemWidth: 28,
  splitterHeight: 1,
  splitterWidth: 1
}

class Split extends Component implements ISplit {
  @observable protected _offset: number
  @observable protected _first: IComponent
  @observable protected _second: IComponent
  @observable protected _splitActive: boolean = false

  @computed
  get splitActive() {
    return this._splitActive
  }
  set splitActive(value) {
    this.setSplitActive(value)
  }

  @action
  setSplitActive(splitActive: boolean) {
    this._splitActive = splitActive
    const db = this.dashboard
    if (splitActive) {
      db.setBlockSource(this)
    } else if (db.blockSource === this) {
      db.clearBlockSource()
    }
  }

  @computed
  get first() {
    return this._first
  }
  set first(value: IComponent) {
    this.setFirst(value)
  }

  @action
  setFirst(first: IComponent) {
    if (first !== this._first) {
      if (first && first.parent !== this) {
        first.removeFromParent()
      }
      this._first = first
      if (this._first) {
        this._first.parent = this
      }
    }
  }

  @computed
  get firstConfig() {
    return this._first ? { component: this._first.config } : undefined
  }

  @action
  setFirstConfig(config: any) {
    let first: IComponent
    if (config && config.component) {
      first = this.componentFactory(config.component.type)
    }
    // NOTE: if this order seems odd it's because we want the hierarchy established
    // before setting the code (otherwise subsequent componentFactory usage is dodgy)
    this.setFirst(first)
    if (first) {
      first.setConfig(config.component)
    }
  }

  @computed
  get second() {
    return this._second
  }

  set second(value: IComponent) {
    this.setSecond(value)
  }

  @computed
  get secondConfig() {
    return this._second ? { component: this._second.config } : undefined
  }

  @action
  setSecond(second: IComponent) {
    if (second !== this._second) {
      if (second && second.parent !== this) {
        second.removeFromParent()
      }
      this._second = second
      if (this._second) {
        this._second.parent = this
      }
    }
  }

  @action
  setSecondConfig(config: any) {
    let second: IComponent
    if (config && config.component) {
      second = this.componentFactory(config.component.type)
    }
    // NOTE: if this order seems odd it's because we want the hierarchy established
    // before setting the code (otherwise subsequent componentFactory usage is dodgy)
    this.setSecond(second)
    if (second) {
      second.setConfig(config.component)
    }
  }

  @computed
  get offset() {
    return this._offset !== undefined ? this._offset : Defaults.offset
  }
  set offset(value: number) {
    this.setOffset(value)
  }

  @action
  setOffset(offset: number) {
    if (offset >= 0) {
      this._offset = offset
    }
  }

  @action
  replace(newComp: IComponent, oldComp: IComponent): void {
    if (oldComp === this._first || oldComp === this._second) {
      if (oldComp === this._first) {
        this.setFirst(newComp)
      } else if (oldComp === this._second) {
        this.setSecond(newComp)
      }
    }
  }

  @action
  remove(comp: IComponent) {
    if (comp === this._first || comp === this._second) {
      const replacement = comp === this._first ? this._second : this._first
      // clear the parent for both left and right
      if (this._first) {
        this._first.parent = undefined
      }
      if (this._second) {
        this._second.parent = undefined
      }
      if (this.parent) {
        this.parent.replace(replacement, this)
      }
    }
  }

  protected _visitChildren(callback) {
    if (this._first) {
      this._first.visit(callback)
    }
    if (this._second) {
      this._second.visit(callback)
    }
  }

  protected _findFirstChild(predicate) {
    let r
    if (this._first) {
      r = this._first.findFirst(predicate)
    }
    if (!r) {
      r = this._second.findFirst(predicate)
    }
    return r
  }

  protected _findAllChildren(predicate): IComponent[] {
    let r = []
    const lr = this._first ? this._first.findAll(predicate) : undefined
    const rr = this._second ? this._second.findAll(predicate) : undefined
    if (lr) {
      r = r.concat(lr)
    }
    if (rr) {
      r = r.concat(rr)
    }
    return r
  }

  @action
  close() {
    if (this.first) {
      this.first.close()
    }
    if (this.second) {
      this.second.close()
    }
  }
}

class HSplit extends Split implements IHSplit {
  @observable private _leftWidth: number
  @observable private _minItemWidth: number
  @observable private _splitterWidth: number
  private _setViewportDisposer: IReactionDisposer

  constructor() {
    super()
    this._setViewportDisposer = autorun(this._setPaneViewports)
  }

  get type() {
    return ComponentTypes.hsplit
  }

  @computed
  get minItemWidth() {
    return this._minItemWidth !== undefined ? this._minItemWidth : Defaults.minItemWidth
  }
  set minItemWidth(value) {
    this.setMinItemWidth(value)
  }
  @action
  setMinItemWidth(minItemWidth: number) {
    if (minItemWidth >= 0) {
      this._minItemWidth = minItemWidth
    }
  }

  @computed
  get maxItemWidth() {
    return this.width - this.minItemWidth - this.splitterWidth
  }

  @computed
  get splitterWidth() {
    return this._splitterWidth !== undefined ? this._splitterWidth : Defaults.splitterWidth
  }
  set splitterWidth(value) {
    this.setSplitterWidth(value)
  }
  @action
  setSplitterWidth(splitterWidth: number) {
    if (splitterWidth > 0) {
      this._splitterWidth = splitterWidth
    }
  }

  @computed
  get left() {
    return this.first
  }
  set left(value: IComponent) {
    this.setLeft(value)
  }
  @action
  setLeft(left: IComponent) {
    this.setFirst(left)
  }

  @computed
  get leftWidth() {
    if (this._offset === undefined) {
      if (this._leftWidth !== undefined) {
        return this._leftWidth
      }
    }
    let r = Math.floor(this.offset * this.width)
    if (r < this.minItemWidth) {
      r = this.minItemWidth
    }
    return r
  }
  set leftWidth(value) {
    this.setLeftWidth(value)
  }
  @action
  setLeftWidth(leftWidth: number) {
    if (leftWidth < this.minItemWidth) {
      leftWidth = this.minItemWidth
    } else if (this.maxItemWidth > 0 && leftWidth > this.maxItemWidth) {
      leftWidth = this.maxItemWidth
    }
    if (this._offset === undefined) {
      this._leftWidth = leftWidth
    } else {
      this.setOffset(leftWidth / this.width)
    }
  }

  @action
  setOffset(offset: number) {
    super.setOffset(offset)
    if (this._offset !== undefined) {
      this._leftWidth = undefined
    }
  }

  @computed
  get leftConfig() {
    return this.firstConfig
  }
  set leftConfig(value) {
    this.setLeftConfig(value)
  }
  @action
  setLeftConfig(config: any) {
    this.setFirstConfig(config)
  }

  @computed
  get right() {
    return this.second
  }
  set right(value: IComponent) {
    this.setRight(value)
  }
  @action
  setRight(right: IComponent) {
    this.setSecond(right)
  }

  @computed
  get rightWidth() {
    return this.width - this.leftWidth - this.splitterWidth
  }
  set rightWidth(value) {
    this.setRightWidth(value)
  }
  @action
  setRightWidth(rightWidth: number) {
    if (rightWidth < this.minItemWidth) {
      rightWidth = this.minItemWidth
    } else if (rightWidth > this.maxItemWidth) {
      rightWidth = this.maxItemWidth
    }
    this.setLeftWidth(this.width - rightWidth - this.splitterWidth)
  }

  @computed
  get rightConfig() {
    return this.secondConfig
  }
  set rightConfig(value) {
    this.setRightConfig(value)
  }
  @action
  setRightConfig(config: any) {
    this.setSecondConfig(config)
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
    }
  }
  set config(value) {
    this.setConfig(value)
  }
  @action
  setConfig(config: IHSplitConfig) {
    this.setLeftConfig(config ? config.left : undefined)
    this.setRightConfig(config ? config.right : undefined)
    this.setOffset(config ? config.offset : undefined)
    this.setLeftWidth(config ? config.leftWidth : undefined)
    this.setMinItemWidth(config ? config.minItemWidth : undefined)
  }

  @computed
  get columnCount() {
    const left = this.left
    const right = this.right
    const leftCount = left && left.type === ComponentTypes.hsplit ? (left as IHSplit).columnCount : 1
    const rightCount = right && right.type === ComponentTypes.hsplit ? (right as IHSplit).columnCount : 1
    return leftCount + rightCount
  }

  private _setPaneViewports = () => {
    if (this.left) {
      this.left.setViewport(this.x, this.y, this.leftWidth, this.height)
    }
    if (this.right) {
      this.right.setViewport(this.x + this.leftWidth + this.splitterWidth, this.y, this.rightWidth, this.height)
    }
  }

  @action
  close() {
    super.close()
    if (this._setViewportDisposer) {
      this._setViewportDisposer()
    }
  }
}

class VSplit extends Split implements IVSplit {
  @observable private _topHeight: number
  @observable private _minItemHeight: number
  @observable private _splitterHeight: number

  private _setViewportDisposer: IReactionDisposer

  constructor() {
    super()
    this._setViewportDisposer = autorun(this._setPaneViewports)
  }

  get type() {
    return ComponentTypes.vsplit
  }

  @computed
  get minItemHeight() {
    return this._minItemHeight !== undefined ? this._minItemHeight : Defaults.minItemHeight
  }
  set minItemHeight(value) {
    this.setMinItemHeight(value)
  }
  @action
  setMinItemHeight(minItemHeight: number) {
    if (minItemHeight >= 0) {
      this._minItemHeight = minItemHeight
    }
  }

  @computed
  get maxItemHeight() {
    return this.height - this.minItemHeight - this.splitterHeight
  }

  @computed
  get splitterHeight() {
    return this._splitterHeight !== undefined ? this._splitterHeight : Defaults.splitterHeight
  }
  set splitterHeight(value) {
    this.setSplitterHeight(value)
  }
  @action
  setSplitterHeight(splitterHeight: number) {
    if (splitterHeight > 0) {
      this._splitterHeight = splitterHeight
    }
  }

  @computed
  get topHeight() {
    if (this._offset === undefined) {
      if (this._topHeight !== undefined) {
        return this._topHeight
      }
    }
    let r = Math.floor(this.height * this.offset)
    if (r < this.minItemHeight) {
      r = this.minItemHeight
    }
    return r
  }
  set topHeight(value) {
    this.setTopHeight(value)
  }
  @action
  setTopHeight(topHeight: number) {
    if (topHeight < this.minItemHeight) {
      topHeight = this.minItemHeight
    } else if (this.maxItemHeight > 0 && topHeight > this.maxItemHeight) {
      topHeight = this.maxItemHeight
    }
    if (this._offset === undefined) {
      this._topHeight = topHeight
    } else {
      this.setOffset(topHeight / this.height)
    }
  }

  @action
  setOffset(offset: number) {
    super.setOffset(offset)
    if (this._offset !== undefined) {
      this._topHeight = undefined
    }
  }

  @computed
  get top() {
    return this.first
  }
  set top(value: IComponent) {
    this.setTop(value)
  }

  @action
  setTop(top: IComponent) {
    this.setFirst(top)
  }

  @computed
  get topConfig() {
    return this.firstConfig
  }

  @action
  setTopConfig(config: any) {
    return this.setFirstConfig(config)
  }

  @computed
  get bottom() {
    return this.second
  }
  set bottom(value: IComponent) {
    this.setBottom(value)
  }
  @action
  setBottom(bottom: IComponent) {
    this.setSecond(bottom)
  }

  @computed
  get bottomConfig() {
    return this.secondConfig
  }
  set bottomConfig(value) {
    this.setBottomConfig(value)
  }
  @action
  setBottomConfig(config: any) {
    return this.setSecondConfig(config)
  }

  @computed
  get bottomHeight() {
    return this.height - this.topHeight - this.splitterHeight
  }
  set bottomHeight(value) {
    this.setBottomHeight(value)
  }
  @action
  setBottomHeight(bottomHeight: number) {
    if (bottomHeight >= this.minItemHeight && bottomHeight <= this.maxItemHeight) {
      this.setTopHeight(this.height - bottomHeight - this.splitterHeight)
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
    }
  }
  set config(value) {
    this.setConfig(value)
  }
  @action
  setConfig(config: IVSplitConfig) {
    this.setTopConfig(config ? config.top : undefined), this.setBottomConfig(config ? config.bottom : undefined)
    this.setOffset(config ? config.offset : undefined)
    this.setTopHeight(config ? config.topHeight : undefined)
    this.setMinItemHeight(config ? config.minItemHeight : undefined)
  }

  @computed
  get rowCount() {
    const top = this.top
    const bottom = this.bottom
    const topCount = top && top.type === ComponentTypes.vsplit ? (top as IVSplit).rowCount : 1
    const bottomCount = bottom && bottom.type === ComponentTypes.vsplit ? (bottom as IVSplit).rowCount : 1
    return topCount + bottomCount
  }

  private _setPaneViewports = () => {
    if (this.top) {
      this.top.setViewport(this.x, this.y, this.width, this.topHeight)
    }
    if (this.bottom) {
      this.bottom.setViewport(this.x, this.y + this.topHeight + this.splitterHeight, this.width, this.bottomHeight)
    }
  }

  @action
  close() {
    super.close()
    if (this._setViewportDisposer) {
      this._setViewportDisposer()
    }
  }
}

export { Split, HSplit, VSplit }
