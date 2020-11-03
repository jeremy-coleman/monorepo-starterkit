import { action, computed, observable, makeObservable } from "mobx";
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
  _parent: ParentType;
  sync = new Sync();
  _total: number;
  items: ItemType[] = [];
  loader: () => Promise<any>
  visible = true;

  constructor(items?: ItemType[], parent?: ParentType) {
    makeObservable<ListModel, "_addItemInternal" | "_loadDone" | "_onLoadDone" | "_loadError" | "_onLoadError">(this, {
      _parent: observable,
      sync: observable,
      _total: observable,
      items: observable,
      visible: observable,
      parent: computed,
      setParent: action,
      total: computed,
      setTotal: action,
      setItems: action,
      setValue: action,
      clearItems: action,
      clearValue: action,
      _addItemInternal: action,
      addItem: action,
      addItems: action,
      itemsView: computed,
      value: computed,
      clear: action,
      _loadDone: action,
      _onLoadDone: action,
      _loadError: action,
      _onLoadError: action,
      refresh: action,
      load: action,
      setVisible: action,
      itemsSorted: computed
    });

    this.setItems(items)
    this._parent = parent
  }

  setLoader(loader: () => Promise<any>) {
    this.loader = loader
  }

  get parent() {
    return this._parent
  }
  set parent(value) {
    this.setParent(value)
  }
  setParent(parent: ParentType) {
    this._parent = parent
  }

  get total(): number {
    return this._total !== undefined ? this._total : this.items ? this.items.length : 0
  }
  set total(value) {
    this.setTotal(value)
  }
  setTotal(total: number) {
    this._total = total
  }

  setItems(items: ItemType[]): void {
    this.items = []
    if (items) {
      items.forEach((item) => this.items.push(item))
    }
  }

  setValue(value) {
    this.setItems(value)
  }

  clearItems(): void {
    this.setItems([])
  }

  clearValue() {
    this.clearItems()
  }

  protected _addItemInternal(item: ItemType, atIndex?: number) {
    if (atIndex !== undefined && (atIndex >= 0 || atIndex < this.items.length - 1)) {
      this.items.splice(atIndex, 0, item)
    } else {
      this.items.push(item)
    }
  }

  addItem(item: ItemType, atIndex?: number): void {
    if (atIndex >= 0 || atIndex < this.items.length - 1) {
      this.items.splice(atIndex, 0, item)
    } else {
      this.items.push(item)
    }
  }

  addItems(items: ItemType[], atIndex?: number): void {
    if (items) {
      items.forEach((item, idx) => {
        this.addItem(item, atIndex >= 0 ? atIndex + idx : undefined)
      })
    }
  }

  get itemsView() {
    return this.items.slice(0)
  }

  get value() {
    return this.itemsView
  }

  clear() {
    this.setItems([])
    this.sync.clear()
  }

  protected _loadDone(r: any) {
    // by default it assumes the result from load is an array
    this.setItems(r as ItemType[])
  }

  protected _onLoadDone = (r) => {
    this._loadDone(r)
    this.sync.syncEnd()
  };

  protected _loadError(error: any) {
    this.clearItems()
    this.sync.syncError(error)
  }

  protected _onLoadError = (error: any) => {
    return this._loadError(error)
  };

  protected _loadImpl(): Promise<any> {
    if (this.loader) {
      return this.loader()
    }
    return Promise.reject({ code: "NOT_IMPLEMENTED", message: "_loadImpl() not implemented" })
  }

  refresh(): Promise<void> {
    if (this.sync.syncing) {
      return toPromise(this.sync)
    }
    this.sync.syncStart()
    return this._loadImpl()
      .then(this._onLoadDone)
      .catch(this._onLoadError)
  }

  load(): Promise<void> {
    if (this.sync.syncing) {
      return toPromise(this.sync)
    }
    if (!this.sync.hasSynced || this.sync.error) {
      return this.refresh()
    }
    return Promise.resolve()
  }

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

  get itemsSorted() {
    return this.itemsView.sort()
    //return sort(this.itemsView, { field: "text", descending: false })
  }
}
