import { ISync, ISyncSupplier } from "./io"
import { IOption } from "./keyed"

export interface IList<T = any, P = any> {
  parent?: P
  items: T[]
}

export interface IListModel<T = any, P = any> extends IList<T, P>, ISyncSupplier<T[]> {
  parent?: P
  items: T[]
  total: number
  itemsView: T[]
  setParent(parent: P): void
  addItem(item: T, atIndex?: number): void
  addItems(items: T[], atIndex?: number): void
  setItems(items: T[]): void
  clear(): void
}

export interface IListResult<T> {
  items: T[]
  total?: number
}

export interface IOptionListModel extends IListModel<IOption> {
  getOption(key: string, defaultValue?: IOption): IOption
  itemsSorted: IOption[]
}

export interface IHistoryEntry<T> {
  timestamp: string
  value: T
  [key: string]: any
}

export interface IHistoryModel<T> extends IListModel<IHistoryEntry<T>> {
  saveSync: ISync
  save(): Promise<any>
  load(): Promise<any>
  addEntry(value: T): Promise<any>
}

export interface ISelectionModel<T> {
  selectedItems: T[]
  selectionCount: number
  setSelectedItems(selectedItems: T[])
  toggleItem(item: T, selected?: boolean): void
  clearSelection()
}

export interface ISelectableListModel<T = any> extends IListModel<T> {
  selection: ISelectionModel<T>
  selectedIndexes: number[]
}

export interface ISortHandler<T> {
  (items: T[], props: ISortProps): T[]
}
export interface ISortProps {
  field: string
  descending: boolean
}

export interface ISortableListModel<T> extends IListModel<T> {
  sort: ISortModel
}

export interface ISortModel extends ISortProps {
  setField(field: string): void
  setDescending(descending: boolean): void
  setSort(field: string, descending?: boolean): void
  toggleSort(field: string): void
  clear(): void
}

export interface IDateFilter {
  filterText: string
  filterFromDate: Date
  filterToDate: Date
}
