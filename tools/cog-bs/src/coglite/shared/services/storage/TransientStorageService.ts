import { IStorageService } from "coglite/types"

export class TransientStorageService implements IStorageService {
  items: { [key: string]: any } = {}
  getItem(key: string): Promise<any> {
    return Promise.resolve(this.items[key])
  }
  setItem(key: string, item: any): Promise<any> {
    this.items[key] = item
    return Promise.resolve()
  }
  removeItem(key: string) {
    delete this.items[key]
    return Promise.resolve()
  }
}
