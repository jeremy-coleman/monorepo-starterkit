import { IStorageService } from "coglite/types"

export class InMemoryDataStore implements IStorageService {
  protected _data = new Map<string, any>()

  async setItem<T>(key: string, value: T): Promise<void> {
    this._data.set(key, value)
    return Promise.resolve()
  }

  async getItem<T>(key: string): Promise<T> {
    return Promise.resolve(this._data.get(key))
  }

  async removeItem(key: string): Promise<void> {
    this._data.delete(key)
    return Promise.resolve()
  }

  async clear(): Promise<void> {
    this._data.clear()
    return Promise.resolve()
  }

  get size() {
    return this._data.size
  }
}
