import { ConsoleLoggingService } from "../logging"
import { IStorageService, ILoggingService } from "coglite/types"

export interface ILoggingStorageServiceOptions {
  target: IStorageService
  prefix: string
  logger?: ILoggingService
}

export class LoggingStorageService implements IStorageService {
  private _target: IStorageService
  private _prefix: string
  private _logger: ILoggingService

  constructor(opts: ILoggingStorageServiceOptions) {
    this._target = opts.target
    this._prefix = opts.prefix
    this._logger = opts.logger || ConsoleLoggingService
  }
  getItem(key: string): Promise<any> {
    return this._target
      .getItem(key)
      .then((item) => {
        this._logger.info(`-- ${this._prefix}: Got Item for ${key}: ${JSON.stringify(item)}`)
        return item
      })
      .catch((error) => {
        this._logger.warn(`-- ${this._prefix}: Error getting item for key ${key}: ${error}`)
      })
  }
  setItem(key: string, item: any): Promise<any> {
    this._logger.info(`-- ${this._prefix}: Setting Item for ${key}: ${JSON.stringify(item)}`)
    return this._target.setItem(key, item).catch((error) => {
      this._logger.warn(`-- ${this._prefix}: Error setting item for key ${key}: ${error}`)
      return Promise.reject(error)
    })
  }
  removeItem(key: string): Promise<any> {
    this._logger.info(`-- ${this._prefix}: Removing Item for ${key}`)
    return this._target.removeItem(key).catch((error) => {
      this._logger.warn(`-- ${this._prefix}: Error removing item for key ${key}: ${error}`)
      return Promise.reject(error)
    })
  }
}
