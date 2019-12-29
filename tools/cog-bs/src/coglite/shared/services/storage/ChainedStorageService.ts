import { IStorageService } from "coglite/types"

export class ChainedStorageService implements IStorageService {
  private _chain: IStorageService[] = []
  constructor(services?: IStorageService[]) {
    if (services) {
      services.forEach((s) => this.addService(s))
    }
  }
  addService(service: IStorageService) {
    this._chain.push(service)
  }
  private _getItemInternal(key: string, index: number): Promise<any> {
    if (index >= this._chain.length) {
      return Promise.resolve()
    }
    return this._chain[index].getItem(key).then((item) => {
      if (item) {
        if (index > 0) {
          // propagate item to higher on the chain
          let c = index - 1
          const cp = []
          while (c >= 0) {
            cp.push(this._chain[c].setItem(key, item))
            c--
          }
          return Promise.all(cp).then(() => {
            return item
          })
        }
        return Promise.resolve(item)
      }
      return this._getItemInternal(key, index + 1)
    })
  }
  getItem(key: string): Promise<any> {
    return this._getItemInternal(key, 0)
  }
  setItem(key: string, item: any): Promise<any> {
    const cp = this._chain.map((s) => {
      return s.setItem(key, item)
    })
    return Promise.all(cp)
  }
  removeItem(key: string): Promise<any> {
    const cp = this._chain.map((s) => {
      return s.removeItem(key)
    })
    return Promise.all(cp)
  }
}
