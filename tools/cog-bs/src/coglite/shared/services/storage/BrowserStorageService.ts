import { IStorageService } from "coglite/types"

export class BrowserStorageService implements IStorageService {
  private _storage: Storage
  private _storageManager: StorageManager

  constructor(storage: Storage) {
    this._storage = storage
    this._storageManager = new StorageManager()
  }

  getItem(key: string): Promise<any> {
    try {
      const itemSpec = this._storage.getItem(key)
      let r
      if (itemSpec) {
        r = JSON.parse(itemSpec)
      }
      return Promise.resolve(r)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  setItem(key: string, item: any): Promise<any> {
    try {
      this._storage.setItem(key, JSON.stringify(item))
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
  removeItem(key: string): Promise<any> {
    try {
      this._storage.removeItem(key)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async clear(): Promise<void> {
    this._storage.clear()
    return Promise.resolve()
  }

  async size() {
    this._storageManager.estimate()
  }
}

export class LocalStorageService extends BrowserStorageService {
  constructor() {
    super(window.localStorage)
  }
}

export class SessionStorageService extends BrowserStorageService {
  constructor() {
    super(window.sessionStorage)
  }
}
