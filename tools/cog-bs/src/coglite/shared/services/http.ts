import axios from "libs/axios"
import { IStorageService } from "coglite/types"

export const handleAxiosError = (error) => {
  if (error.response && error.response.status === 504) {
    throw {
      message: "Request Timed Out",
      description: "The server is currently not responding. If the problem persists, please contact help with a description of the problem."
    }
  }
  throw error
}

export const removeMeta = (value: any, metaPrefix = "_"): any => {
  if (value) {
    const metaKeys = Object.keys(value).filter((key) => key.startsWith(metaPrefix))
    metaKeys.forEach((metaKey) => {
      delete value[metaKey]
    })
  }
  return value
}

export abstract class AbstractRestService {
  _config: {
    baseUrl: string
  }

  get config() {
    return this._config
  }

  set config(value) {
    this._config = value
  }
}

export interface IUrlConfig {
  baseUrl: string
}

export const RestIwcApiConfig: IUrlConfig = {
  baseUrl: "/coglite/api/iwc"
}

export const RestDataServiceConfig: IUrlConfig = {
  baseUrl: "/dataservices"
}

export const NoResultErrorCode = "0101"

export abstract class AbstractRestDataService extends AbstractRestService {
  get config() {
    return this._config || RestDataServiceConfig
  }

  protected assertObject(data: any): any {
    if (data && typeof data !== "object") {
      throw new Error(`UNEXPECTED_RESPONSE_TYPE: Expected response to be an object, but got ${typeof data}. Data - ${data}`)
    }
    return data
  }

  protected handleError(errors: any): any {
    if (errors.code !== NoResultErrorCode) {
      throw errors
    }
    return []
  }
}

const ContentType = "application/json"

export const RestCogCloudApiConfig = {
  baseUrl: "/coglite/userdata"
}

//IWCDataResource
interface CloudUserDataResource {
  username?: string
  key?: string
  entity?: string
  content_type?: string
}

export class RestCogCloudUserStorageService extends AbstractRestService implements IStorageService {
  get config() {
    return this._config || RestCogCloudApiConfig
  }

  getItem(key: string): Promise<any> {
    return axios
      .get(`${this.config.baseUrl}/self/data/${encodeURIComponent(key)}/`)
      .then((value) => {
        const resource = value.data as CloudUserDataResource
        return JSON.parse(resource.entity)
      })
      .catch((error) => {
        if (error.response && error.response.status !== 404) {
          throw error
        }
      })
  }

  setItem(key: string, item: any): Promise<any> {
    if (!item) {
      return this.removeItem(key)
    }
    const resource: CloudUserDataResource = {
      entity: JSON.stringify(item),
      content_type: ContentType
    }
    return axios.put(`${this.config.baseUrl}/self/data/${encodeURIComponent(key)}/`, resource)
  }
  removeItem(key: string): Promise<any> {
    return axios.delete(`${this.config.baseUrl}/self/data/${encodeURIComponent(key)}/`)
  }
}
