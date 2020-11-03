import { action, computed, observable } from "mobx"
import { Sync, toPromise } from "./Sync"

//merged from option list
interface StringKeyField {
  [field: string]: any
}
interface NumericKeyField {
  [field: number]: any
}
type KeyedField = StringKeyField | NumericKeyField

interface KeyedData {
  field?: KeyedField
  key?: string
  keyAliases?: string[]
  text?: string
  data?: any
}

export type IOption = {
  [field: string]: any
  key: string
  keyAliases?: string[]
  text: string
  data?: any
}

export type IOptionListModel = ListModel
export type IListModel = ListModel

export class ListModel<ItemType = any, ParentType = any> {
  @observable _parent: ParentType
  @observable sync = new Sync()
  @observable _total: number
  @observable items: ItemType[] = []
  loader: () => Promise<any>
  @observable visible = true

  constructor(items?: ItemType[], parent?: ParentType) {
    this.setItems(items)
    this._parent = parent
  }

  setLoader(loader: () => Promise<any>) {
    this.loader = loader
  }

  @computed
  get parent() {
    return this._parent
  }
  set parent(value) {
    this.setParent(value)
  }
  @action
  setParent(parent: ParentType) {
    this._parent = parent
  }

  @computed
  get total(): number {
    return this._total !== undefined ? this._total : this.items ? this.items.length : 0
  }
  set total(value) {
    this.setTotal(value)
  }
  @action
  setTotal(total: number) {
    this._total = total
  }

  @action
  setItems(items: ItemType[]): void {
    this.items = []
    if (items) {
      items.forEach((item) => this.items.push(item))
    }
  }

  @action
  setValue(value) {
    this.setItems(value)
  }

  @action
  clearItems(): void {
    this.setItems([])
  }

  @action
  clearValue() {
    this.clearItems()
  }

  @action
  protected _addItemInternal(item: ItemType, atIndex?: number) {
    if (atIndex !== undefined && (atIndex >= 0 || atIndex < this.items.length - 1)) {
      this.items.splice(atIndex, 0, item)
    } else {
      this.items.push(item)
    }
  }

  @action
  addItem(item: ItemType, atIndex?: number): void {
    if (atIndex >= 0 || atIndex < this.items.length - 1) {
      this.items.splice(atIndex, 0, item)
    } else {
      this.items.push(item)
    }
  }

  @action
  addItems(items: ItemType[], atIndex?: number): void {
    if (items) {
      items.forEach((item, idx) => {
        this.addItem(item, atIndex >= 0 ? atIndex + idx : undefined)
      })
    }
  }

  @computed
  get itemsView() {
    return this.items.slice(0)
  }

  @computed
  get value() {
    return this.itemsView
  }

  @action
  clear() {
    this.setItems([])
    this.sync.clear()
  }

  @action
  protected _loadDone(r: any) {
    // by default it assumes the result from load is an array
    this.setItems(r as ItemType[])
  }

  @action
  protected _onLoadDone = (r) => {
    this._loadDone(r)
    this.sync.syncEnd()
  }

  @action
  protected _loadError(error: any) {
    this.clearItems()
    this.sync.syncError(error)
  }

  @action
  protected _onLoadError = (error: any) => {
    return this._loadError(error)
  }

  protected _loadImpl(): Promise<any> {
    if (this.loader) {
      return this.loader()
    }
    return Promise.reject({ code: "NOT_IMPLEMENTED", message: "_loadImpl() not implemented" })
  }

  @action
  refresh(): Promise<void> {
    if (this.sync.syncing) {
      return toPromise(this.sync)
    }
    this.sync.syncStart()
    return this._loadImpl()
      .then(this._onLoadDone)
      .catch(this._onLoadError)
  }

  @action
  load(): Promise<void> {
    if (this.sync.syncing) {
      return toPromise(this.sync)
    }
    if (!this.sync.hasSynced || this.sync.error) {
      return this.refresh()
    }
    return Promise.resolve()
  }

  @action
  setVisible(visible: boolean) {
    this.visible = visible
  }

  getOption(key: string, defaultOption?: Partial<ItemType>) {
    const option = this.items.find((o) => {
      //@ts-ignore
      return o.key === key
    })
    return option || defaultOption
  }

  @computed
  get itemsSorted() {
    return this.itemsView.sort()
    //return sort(this.itemsView, { field: "text", descending: false })
  }
}
