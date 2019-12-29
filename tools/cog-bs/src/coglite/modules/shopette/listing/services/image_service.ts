
import { IBasicAuthCredentials, IGetImagesRequest, IImage, IImageService } from "coglite/types"
import axios from "libs/axios"
import { extname } from "coglite/shared/util"
import { Context } from "coglite/shared/services"

const ImageServiceContext = new Context<IImageService>()

const Defaults = {
  baseUrl: "/api",
  auth: undefined
}

class RestImageService implements IImageService {
  private _baseUrl
  private _authConfig: IBasicAuthCredentials
  get baseUrl() {
    return this._baseUrl || Defaults.baseUrl
  }
  set baseUrl(value: string) {
    this._baseUrl = value
  }
  // NOTE: this would probably only ever be for server side usage
  get auth() {
    return this._authConfig || Defaults.auth
  }
  set auth(value: IBasicAuthCredentials) {
    this._authConfig = value
  }
  getImageUrl(request: IImage): string {
    return `${this.baseUrl}/image/${request.id}/`
  }
  getImages(request: IGetImagesRequest): Promise<IImage[]> {
    return axios.get(`${this.baseUrl}/image/`, { params: request, auth: this.auth }).then((value) => {
      return value.data as IImage[]
    })
  }
  saveImage(request: IImage): Promise<IImage> {
    const imageFormData = new FormData()
    imageFormData.append("image", request.file)
    if (request.security_marking) {
      imageFormData.append("security_marking", request.security_marking)
    }
    if (request.image_type) {
      imageFormData.append("image_type", request.image_type)
    }
    imageFormData.append("file_extension", extname(request.file.name, true).toLowerCase())
    const imagePromise = request.id
      ? axios.patch(`${this.baseUrl}/image/${request.id}/`, imageFormData, {
          auth: this.auth
        })
      : axios.post(`${this.baseUrl}/image/`, imageFormData, {
          auth: this.auth
        })
    return imagePromise.then((value) => {
      return value.data as IImage
    })
  }
  deleteImage(request: IImage): Promise<any> {
    return axios.delete(`${this.baseUrl}/image/${request.id}/`, {
      auth: this.auth
    })
  }
}

class MockImageService implements IImageService {
  private _images: IImage[] = []

  getImageUrl(request: IImage): string {
    return `/mock/image/${request.id}/`
  }

  getImages(request: IGetImagesRequest): Promise<IImage[]> {
    return Promise.resolve(this._images.map((img) => Object.assign({}, img)))
  }

  saveImage(request: IImage): Promise<IImage> {
    const idx = this._images.findIndex((img) => img.id === request.id)
    let savedImage
    if (idx >= 0) {
      savedImage = Object.assign({}, this._images[idx], request)
      this._images[idx] = savedImage
    } else {
      savedImage = Object.assign({}, request)
      this._images.push(savedImage)
    }
    return Object.assign({}, savedImage)
  }
  deleteImage(request: IImage): Promise<any> {
    const idx = this._images.findIndex((img) => img.id === request.id)
    if (idx >= 0) {
      this._images.splice(idx, 1)
    }
    return Promise.resolve()
  }
}

export { ImageServiceContext }
export { MockImageService, RestImageService }
