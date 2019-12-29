
import { IBasicAuthCredentials, ICategory, ICategoryGetRequest, ICategoryListRequest, ICategoryService } from "coglite/types"
import axios from "libs/axios"
import { SequenceId } from "coglite/shared/models/SequenceId"
import { Context } from "coglite/shared/services"

const mockIdSequence = new SequenceId()

const nextId = () => parseInt(mockIdSequence.next())

const Defaults = {
  baseUrl: "/api",
  auth: undefined
}

class RestCategoryService implements ICategoryService {
  private _baseUrl: string
  private _auth: IBasicAuthCredentials
  get baseUrl() {
    return this._baseUrl || Defaults.baseUrl
  }
  set baseUrl(value: string) {
    this._baseUrl = value
  }
  get auth() {
    return this._auth || Defaults.auth
  }
  set auth(value: IBasicAuthCredentials) {
    this._auth = value
  }
  getCategory(request: ICategoryGetRequest): Promise<ICategory> {
    return axios
      .get(`${this.baseUrl}/category/${request.categoryId}/`, {
        auth: this.auth
      })
      .then((response) => {
        return response.data as ICategory
      })
  }
  getCategories(request: ICategoryListRequest): Promise<ICategory[]> {
    return axios.get(`${this.baseUrl}/category/`, { params: request, auth: this.auth }).then((response) => {
      return response.data as ICategory[]
    })
  }
  saveCategory(category: ICategory): Promise<ICategory> {
    if (category.id !== undefined) {
      return axios.put(`${this.baseUrl}/category/${category.id}/`, { auth: this.auth }).then((response) => {
        return response.data as ICategory
      })
    }
    return axios.post(`${this.baseUrl}/category/`, { auth: this.auth }).then((response) => {
      return response.data as ICategory
    })
  }
  deleteCategory(category: ICategory): Promise<any> {
    return axios.delete(`${this.baseUrl}/category/${category.id}/`, {
      auth: this.auth
    })
  }
}

class MockCategoryService implements ICategoryService {
  private _categories: ICategory[] = []
  get categories() {
    return [].concat(this._categories)
  }
  set categories(value) {
    this._categories = value || []
  }
  constructor() {
    this._categories.push({
      id: nextId(),
      title: "Sport",
      description: "Sport"
    })
    this._categories.push({
      id: nextId(),
      title: "Food",
      description: "Food"
    })
    this._categories.push({
      id: nextId(),
      title: "Movies",
      description: "Movies"
    })
  }
  getCategory(request: ICategoryGetRequest): Promise<ICategory> {
    const f = this._categories.find((c) => String(c.id) === String(request.categoryId))
    if (f) {
      return Promise.resolve(f)
    }
    return Promise.reject({ code: "NOT_FOUND", message: "Category not found" })
  }
  getCategories(request?: ICategoryListRequest): Promise<ICategory[]> {
    return Promise.resolve(this.categories)
  }
  saveCategory(category: ICategory): Promise<ICategory> {
    if (category.id) {
      const idx = this._categories.findIndex((c) => c.id === category.id)
      if (idx >= 0) {
        const u = Object.assign({}, this._categories[idx], category)
        this._categories[idx] = u
        return Promise.resolve(Object.assign({}, u))
      }
      return Promise.reject({
        code: "NOT_FOUND",
        message: "Category not found"
      })
    }
    const u = Object.assign({}, category, { id: nextId() })
    this._categories.push(u)
    return Promise.resolve(Object.assign({}, u))
  }
  deleteCategory(category: ICategory): Promise<any> {
    const idx = this._categories.findIndex((c) => c.id === category.id)
    if (idx >= 0) {
      this._categories.splice(idx, 1)
      return Promise.resolve()
    }
    return Promise.reject({ code: "NOT_FOUND" })
  }
}

const CategoryServiceContext = new Context<ICategoryService>()

export { CategoryServiceContext }
export { MockCategoryService }
export { RestCategoryService }
