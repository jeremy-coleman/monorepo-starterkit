
import { ICategory, ICategoryService } from "coglite/types"

import { CategoryServiceContext } from "../services"
import { ListModel } from "coglite/shared/models/ListModel"

class CategoryListModel extends ListModel<ICategory> {
  private _service: ICategoryService
  get service() {
    return this._service || CategoryServiceContext.value
  }
  set service(value) {
    this._service = value
  }

  protected _loadImpl() {
    return this.service.getCategories()
  }
}

export { CategoryListModel }
