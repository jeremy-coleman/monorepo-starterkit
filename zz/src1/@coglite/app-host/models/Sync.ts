import { observable, action, computed, autorun, makeObservable } from "mobx";

export type ISync<I = any> = {
  id?: I
  type?: any
  startDate: Date
  endDate: Date
  error: any
  syncing: boolean
  hasSynced: boolean
}

interface ISyncOptions<I = any> {
  id?: I
  type?: any
}

export type IMutableSync<I = any> = {
  syncStart(opts?: ISyncOptions<I>): void
  syncEnd(): void
  syncError(error: any): void
  clear(): void
} & ISync<I>

class Sync<I = any> implements IMutableSync<I> {
  id: I;
  type: any;
  startDate: Date;
  endDate: Date;
  error: any;
  syncing: boolean;
  hasSynced: boolean = false;

  constructor() {
    makeObservable(this, {
      id: observable,
      type: observable,
      startDate: observable,
      endDate: observable,
      error: observable.ref,
      syncing: observable,
      hasSynced: observable,
      syncStart: action,
      syncEnd: action,
      syncError: action,
      clear: action
    });
  }

  syncStart(opts?: ISyncOptions): void {
    this.type = opts ? opts.type : undefined
    this.id = opts ? opts.id : undefined
    this.startDate = new Date()
    this.endDate = undefined
    this.error = undefined
    this.syncing = true
  }
  syncEnd(): void {
    this.hasSynced = true
    this.endDate = new Date()
    if (!this.startDate) {
      this.startDate = this.endDate
    }
    this.syncing = false
  }
  syncError(error: any): void {
    this.hasSynced = true
    this.error = error
    this.syncEnd()
  }
  clear() {
    this.type = undefined
    this.id = undefined
    this.startDate = undefined
    this.endDate = undefined
    this.error = undefined
    this.syncing = false
    this.hasSynced = false
  }
}

class CompositeSync<I = any> implements IMutableSync<I> {
  private _syncs: IMutableSync<I>[] = []
  constructor(...syncs: IMutableSync<I>[]) {
    makeObservable(this, {
      syncing: computed,
      hasSynced: computed,
      id: computed,
      type: computed,
      startDate: computed,
      endDate: computed,
      error: computed,
      addSync: action,
      syncStart: action,
      syncEnd: action,
      syncError: action,
      clear: action
    });

    syncs.forEach((sync) => {
      this.addSync(sync)
    })
  }
  get syncing() {
    return this._syncs.some((s) => s.syncing)
  }
  get hasSynced() {
    return this._syncs.every((s) => s.hasSynced)
  }
  get id() {
    return this._syncs.length > 0 ? this._syncs[0].id : undefined
  }
  get type() {
    return this._syncs.length > 0 ? this._syncs[0].type : undefined
  }
  get startDate() {
    return this._syncs.length > 0 ? this._syncs[0].startDate : undefined
  }
  get endDate() {
    return this._syncs.length > 0 ? this._syncs[0].startDate : undefined
  }

  get error() {
    const errors = []
    this._syncs.forEach((s) => {
      if (s.error) {
        errors.push(s.error)
      }
    })
    if (errors.length > 0) {
      return {
        message: errors.map((e) => (typeof e === "string" ? e : e.message)),
        errors: errors
      }
    }
    else return false
  }

  addSync(sync: IMutableSync) {
    if (sync) {
      this._syncs.push(sync)
    }
  }
  syncStart(opts?: ISyncOptions) {
    this._syncs.forEach((s) => s.syncStart(opts))
  }
  syncEnd() {
    this._syncs.forEach((s) => s.syncEnd())
  }
  syncError(error: any): void {
    this._syncs.forEach((s) => s.syncError(error))
  }
  clear() {
    this._syncs.forEach((s) => s.clear())
  }
}

const toPromise = (sync: ISync): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!sync.syncing && sync.hasSynced) {
      if (sync.error) {
        reject(sync.error)
      } else {
        resolve()
      }
    } else {
      const disposer = autorun(() => {
        if (!sync.syncing && sync.hasSynced) {
          disposer()
          if (sync.error) {
            reject(sync.error)
          } else {
            resolve()
          }
        }
      })
    }
  })
}

export { Sync, CompositeSync, toPromise }
