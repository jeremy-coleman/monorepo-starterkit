
import { IConsumerFunc, IPredicateFunc, IRequest, IRouter, ISupplierFunc } from "coglite/types"
import { action, computed, observable } from "mobx"
import { IComponent, IComponentFactory, IDashboard } from "../types"
import { SequenceId } from "coglite/shared/models/SequenceId"


const ComponentIdSequence = new SequenceId("db-comp-")

const NotConfiguredComponentFactory: IComponentFactory = (type: string) => {
  throw { code: "ILLEGAL_STATE", message: "A component factory has not been configured" }
}

abstract class Component implements IComponent {
  private _id: string
  @observable.ref parent: IComponent
  @observable.ref protected _componentFactory: IComponentFactory
  @observable.ref protected _addApp: IRequest | ISupplierFunc<IRequest>
  @observable.ref protected _router: IRouter
  @observable protected _closeDisabled: boolean
  @observable protected _needsOverflow: boolean
  @observable private _x: number = 0
  @observable private _y: number = 0
  @observable private _width: number = 0
  @observable private _height: number = 0
  type: string

  get id() {
    if (!this._id) {
      this._id = ComponentIdSequence.next()
    }
    return this._id
  }

  get isWindowManager() {
    return false
  }

  @computed
  get isOverflow() {
    return false
  }

  @action
  resetViewport() {
    this._x = 0
    this._y = 0
    this._width = 0
    this._height = 0
  }

  @computed
  get root() {
    return this.parent ? this.parent.root : this
  }

  @computed
  get x() {
    return this._x
  }

  @computed
  get rx() {
    return this.x - (this.parent ? this.parent.x : 0)
  }

  @computed
  get y() {
    return this._y
  }

  @computed
  get ry() {
    return this.y - (this.parent ? this.parent.y : 0)
  }

  @computed
  get width() {
    return this._width
  }

  @computed
  get height() {
    return this._height
  }

  @action
  resize(width: number, height: number) {
    if ((width >= 0 && width !== this._width) || (height >= 0 && height !== this._height)) {
      this._width = width
      this._height = height
    }
  }

  @action
  position(x: number, y: number) {
    this._x = x
    this._y = y
  }

  @action
  setViewport(x: number, y: number, width: number, height: number) {
    this.position(x, y)
    this.resize(width, height)
  }

  @computed
  get addApp() {
    if (this._addApp !== undefined) {
      return this._addApp
    }
    const p = this.parent
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected")
      return undefined
    }
    return p ? p.addApp : undefined
  }

  set addApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this.setAddApp(addApp)
  }

  @computed
  get componentFactory(): IComponentFactory {
    if (this._componentFactory !== undefined) {
      return this._componentFactory
    }
    if (this.parent === this) {
      console.warn("-- Ancestor Resolution Cycle Detected")
      return undefined
    }
    return this.parent ? this.parent.componentFactory : NotConfiguredComponentFactory
  }
  set componentFactory(value) {
    this.setComponentFactory(value)
  }
  @action
  setComponentFactory(componentFactory: IComponentFactory) {
    this._componentFactory = componentFactory
  }

  @computed
  get closeDisabled(): boolean {
    if (this._closeDisabled !== undefined) {
      return this._closeDisabled
    }
    const p = this.parent
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected")
      return undefined
    }
    return p ? p.closeDisabled : false
  }
  set closeDisabled(value) {
    this.setCloseDisabled(value)
  }
  @action
  setCloseDisabled(closeDisabled: boolean) {
    this._closeDisabled = closeDisabled
  }

  @action
  setAddApp(addApp: IRequest | ISupplierFunc<IRequest>) {
    this._addApp = addApp
  }

  @computed
  get router() {
    if (this._router !== undefined) {
      return this._router
    }
    const p = this.parent
    if (p === this) {
      console.warn("-- Ancestor Resolution Cycle Detected")
      return undefined
    }
    return p ? p.router : undefined
  }
  set router(value) {
    this.setRouter(value)
  }

  @action
  setRouter(router: IRouter) {
    this._router = router
  }

  @computed
  get dashboard(): IDashboard {
    const p = this.parent
    if (p === this) {
      console.warn("-- Dashboard Resolution Cycle Detected")
      return undefined
    }
    return p ? p.dashboard : undefined
  }

  remove(comp: IComponent): void {
    // does nothing by default
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this)
      this.parent = undefined
    }
  }

  replace(newItem: IComponent, oldItem: IComponent): void {
    // does nothing by default
  }

  get config() {
    // default impl
    return undefined
  }
  set config(value) {
    this.setConfig(value)
  }
  @action
  setConfig(config: any): void {
    // does nothing
  }

  protected _visitChildren(callback: IConsumerFunc<IComponent>): void {
    // does nothing by default
  }

  visit(callback: IConsumerFunc<IComponent>): void {
    callback(this)
  }

  protected _findFirstChild(predicate: IPredicateFunc<IComponent>): IComponent {
    return undefined
  }

  findFirst(predicate: IPredicateFunc<IComponent>): IComponent {
    if (predicate(this)) {
      return this
    }
    return this._findFirstChild(predicate)
  }

  protected _findAllChildren(predicate: IPredicateFunc<IComponent>): IComponent[] {
    return []
  }

  findAll(predicate: IPredicateFunc<IComponent>): IComponent[] {
    let r = []
    if (predicate(this)) {
      r.push(this)
    }
    const tr = this._findAllChildren(predicate)
    if (tr && tr.length > 0) {
      r = r.concat(tr)
    }
    return r
  }

  @action
  close() {
    // does nothing by default
  }

  toJSON() {
    return this.config
  }
}

export { Component }
