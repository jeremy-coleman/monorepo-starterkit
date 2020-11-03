import {
  AppFrame,
  BoundCheckbox,
  BoundTextField,
  getKeyErrorMessage,
  IAppHostProps,
  IError,
  ImageField,
  IMutableSync,
  ISync,
  ISyncSupplier,
  ListModel,
  Sync,
  SyncComponent,
  SyncOverlay,
  SyncSpinner,
  SyncSupplier,
  ValidationErrors,
  IAppHost,
  IHostAppViewProps,
  HostAppView,
  AppFrame as ScriptFrame,
  //ScriptFrame,
  syncRefreshItem,
  UserInfo,
  IUser,
  createUserProfileMenu,
  isBlank,
  isNotBlank,
  wordsToCamelCase
} from "@coglite/app-host"

import { action, computed, observable, IReactionDisposer, autorun } from "mobx"
import { observer } from "mobx-react-lite"
import {
  ActivityItem,
  CommandBarButton,
  DefaultButton,
  DefaultPalette,
  Dialog,
  DialogFooter,
  DialogType,
  Dropdown,
  FontSizes,
  FontWeights,
  getTheme,
  IButtonProps,
  ICheckboxStyles,
  Icon,
  IconButton,
  IContextualMenuItem,
  IDropdownOption,
  IIconProps,
  ITheme,
  Link,
  mergeStyleSets,
  MessageBar,
  MessageBarType,
  Persona,
  PersonaSize,
  Pivot,
  PivotItem,
  PrimaryButton,
  Rating,
  SearchBox,
  Spinner,
  SpinnerSize,
  TextField,
  Toggle,
  TooltipHost
} from "office-ui-fabric-react"
import * as React from "react"
import { ComponentType, FC as FunctionalComponent, memo } from "react"
import { useMount } from "@coglite/react-hooks"
import { IRequest, Router, resolveReact, exactPath } from "@coglite/router"

type IPredicateFunc<T = any, S = T[]> = {
  (value: T, index?: number, source?: S): boolean
}

enum ListingActivityAction {
  CREATED = "CREATED",
  MODIFIED = "MODIFIED",
  SUBMITTED = "SUBMITTED",
  APPROVED_ORG = "APPROVED_ORG",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
  DELETED = "DELETED",
  REVIEW_EDITED = "REVIEW_EDITED",
  REVIEW_DELETED = "REVIEW_DELETED"
}

enum ListingApprovalStatusEnum {
  IN_PROGRESS = "IN_PROGRESS",
  PENDING = "PENDING",
  APPROVED_ORG = "APPROVED_ORG",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DELETED = "DELETED",
  PENDING_DELETION = "PENDING_DELETION"
}

const ListingViewConfig = {
  label: "App",
  labelPlural: "Apps",
  storeLabel: "Store",
  bookmarksEnabled: false
}

const ListingServiceContext = {
  value: undefined as any
}

const ListingDefaults = {
  requirements: "None",
  what_is_new: "Nothing",
  searchDelay: 5000
}

type IListing = Partial<ListingModel>
type IListingModel = ListingModel
type IListingActivityListModel = ListingActivityListModel
type IListingBookmarkListModel = ListingBookmarkListModel
type IListingLinkModel = ListingLinkModel
type IListingListModel = ListingListModel
type IListingModelSupplier = ListingModelSupplier
type IListingReviewListModel = ListingReviewListModel
type IListingReviewModel = ListingReviewModel
type IListingSearchModel = ListingSearchModel
type IUserProfile = IUser["profile"]

type WithUserCredentialsProps = {
  host: IAppHost
  userProfile: IUser["profile"]
  isAdmin?: boolean
  match: IRequest
}

type IListingActivity = {
  action?: IListingActivityAction
  activity_date?: string
  description?: string
  author?: IUserProfile
  listing?: IListing
  change_details?: IListingChange[]
}

type IListingActivityAction =
  | "CREATED"
  | "MODIFIED"
  | "SUBMITTED"
  | "APPROVED_ORG"
  | "APPROVED"
  | "REJECTED"
  | "ENABLED"
  | "DISABLED"
  | "DELETED"
  | "REVIEW_EDITED"
  | "REVIEW_DELETED"
  | "IN_PROGRESS"
  | "PENDING"
  | "PENDING_DELETION"

interface IPackageSource {
  contentType?: string
  name?: string
  size?: number
}

interface IPackage {
  info?: any
  base_url?: string
  resource_path?: string
}

interface IListingUploadResult {
  source?: IPackageSource
  package?: IPackage
  listing_props?: IListing
  listing?: IListing
}

interface IListingType {
  title?: string
  description?: string
}

interface IListingStoreFront {
  featured?: IListing[]
  most_popular?: IListing[]
  recent?: IListing[]
  recommended?: IListing[]
}

interface IListingSearchRequest {
  search?: string
  category?: string[]
  offset?: number
  limit?: number
}

interface IListingReview {
  id?: number | string
  author?: IUserProfile
  listing?: number
  rate?: number
  text?: string
  edited_date?: string
  created_date?: string
  review_parent?: number
  review_response?: IListingReview[]
}

interface IListingListOrgCounts {
  [key: string]: number
}

interface IListingListCounts {
  total?: number
  enabled?: number
  organizations?: IListingListOrgCounts
  [key: string]: any
}

type IListingLink = {
  name?: string
  url?: string
}

interface IListingFeedback {
  id: number
  feedback: number
}

type IListingBookmark = {
  id?: number
  folder?: string
  position?: number
  listing?: IListing
}

interface IListingChange {
  id?: number
  field_name?: string
  old_value?: string
  new_value?: string
}

interface ICategory {
  id?: number
  title?: string
  description?: string
}

interface IScreenShot {
  order?: number
  small_image?: IImage
  large_image?: IImage
  description?: string
}

interface IListingByIdRequest {
  listingId: string | number
}

interface IListingRequest {
  listingId: string | number
}

interface IListingListRequest extends IListingSearchRequest {
  ordering?: string
}

interface IListingListResponse {
  listings?: IListing[]
  counts?: IListingListCounts
}

interface IListingReviewListRequest extends IListingRequest {
  offset?: number
  limit?: number
  ordering?: string
}

interface IListingReviewRequest extends IListingRequest {
  reviewId: number
}

interface IListingFeedbackListRequest extends IListingRequest {
  offset?: number
  limit?: number
}

interface IListingUploadRequest {
  listingId?: number
  file: File
}

export type IListingService = {
  getListing(request: IListingRequest): Promise<IListing>
  saveListing(request: IListing): Promise<IListing>
  deleteListing(request: IListing): Promise<any>
  getListings(request?: IListingListRequest): Promise<IListingListResponse>
  searchListings(request?: IListingSearchRequest): Promise<IListing[]>
  getBookmarkedListings(): Promise<IListingBookmark[]>
  addBookmark(request: IListingBookmark): Promise<IListingBookmark>
  removeBookmark(request: IListingBookmark): Promise<IListingBookmark>
  getStoreFront(): Promise<IListingStoreFront>
  getListingReviews(request: IListingReviewListRequest): Promise<IListingReview[]>
  getListingReview(request: IListingReviewRequest): Promise<IListingReview>
  deleteListingReview(request: IListingReviewRequest): Promise<any>
  saveListingReview(review: IListingReview): Promise<IListingReview>
  getListingFeedback(request: IListingFeedbackListRequest): Promise<IListingFeedback[]>
  getListingActivity(request: IListingRequest): Promise<IListingActivity[]>
  getListingTypes(): Promise<IListingType[]>
  upload(request: IListingUploadRequest): Promise<IListingUploadResult>
}

interface IGetImagesRequest {
  offset?: number
  limit?: number
}

interface IImageService {
  getImageUrl(request: IImage): string
  getImages(request: IGetImagesRequest): Promise<IImage[]>
  saveImage(request: IImage): Promise<IImage>
  deleteImage(request: IImage): Promise<any>
}

interface IImage {
  id?: number
  url?: string
  security_marking?: string
  image_type?: string
  [key: string]: any
}

interface ICategoryGetRequest {
  categoryId: number | string
}

interface ICategoryListRequest {
  offset?: number
  limit?: number
  title?: string
}

interface ICategoryService {
  getCategory(request: ICategoryGetRequest): Promise<ICategory>
  getCategories(request?: ICategoryListRequest): Promise<ICategory[]>
  saveCategory(category: ICategory): Promise<ICategory>
  deleteCategory(category: ICategory): Promise<any>
}

const state = { listingId: 1, listingBookmarkId: 1 }

const nextListingId = (): number => {
  const r = state.listingId
  state.listingId++
  return r
}

const nextListingBookmarkid = (): number => {
  const r = state.listingBookmarkId
  state.listingBookmarkId++
  return r
}

const listingNotFound = (listingId: string | number): Promise<any> => {
  return Promise.reject({
    code: "NOT_FOUND",
    message: `Unable to find listing by id: ${listingId}`
  })
}

type ListingServiceCtor = {
  listings?: IListing[]
  remotePaths?: any[]
}

class ListingService {
  //imlement rest/gql paths etc here and map them into the listing array
  _remotePaths = []
  //listing route/json config goes here
  _listings: IListing[] = []

  constructor({ listings, remotePaths }: ListingServiceCtor = {}) {
    this._listings = listings || []
    this._remotePaths = remotePaths || []
  }

  set listings(listings: IListing[]) {
    this._listings = listings || []
  }

  _bookmarks: IListingBookmark[] = []

  get bookmarks() {
    return this.listings.map((l) => {
      return {
        id: nextListingBookmarkid(),
        listing: l
      }
    })
  }

  set bookmarks(bookmarks: IListingBookmark[]) {
    this._bookmarks = bookmarks || []
  }
  getListing(request: IListingRequest): Promise<IListing> {
    const r = this._listings.find((l) => String(l.id) === String(request.listingId))
    return r ? Promise.resolve(Object.assign({}, r)) : listingNotFound(request.listingId)
  }
  saveListing(request: IListing): Promise<IListing> {
    console.log("-- Save Listing: " + JSON.stringify(request))
    if (request.id) {
      const idx = this._listings.findIndex((l) => l.id === request.id)
      if (idx >= 0) {
        this._listings[idx] = Object.assign({}, this._listings[idx], request)
        return Promise.resolve(Object.assign({}, this._listings[idx]))
      }
      return listingNotFound(request.id)
    }
    const newListing = Object.assign({}, request, {
      id: nextListingId(),
      unique_name: request.title
    })
    this._listings.push(newListing)
    return Promise.resolve(Object.assign({}, newListing))
  }
  deleteListing(request: IListing): Promise<any> {
    if (request.id) {
      const idx = this._listings.findIndex((l) => l.id === request.id)
      if (idx >= 0) {
        this._listings.splice(idx, 1)
        return Promise.resolve()
      }
      return listingNotFound(request.id)
    }
    return Promise.reject({
      code: "INVALID_ARGUMENT",
      key: "id",
      message: "Listing id not provided"
    })
  }
  getListings(request?: IListingListRequest): Promise<IListingListResponse> {
    return Promise.resolve({
      listings: this._listings.map((listing) => Object.assign({}, listing)),
      counts: {
        total: this._listings.length,
        enabled: this._listings.filter((l) => l.is_enabled).length
      }
    })
  }
  searchListings(request?: IListingSearchRequest): Promise<IListing[]> {
    return Promise.resolve([].concat(this._listings))
  }

  getBookmarkedListings(): Promise<IListingBookmark[]> {
    const bookmarks = this._bookmarks.map((b) => {
      return {
        id: b.id,
        listing: Object.assign(
          {},
          this._listings.find((l) => l.id === b.listing.id)
        )
      }
    })
    return Promise.resolve(bookmarks)
  }

  addBookmark(request: IListingBookmark): Promise<IListingBookmark> {
    const listing = this._listings.find((l) => request.listing && request.listing.id === l.id)
    if (listing) {
      const r: IListingBookmark = {
        id: nextListingBookmarkid(),
        listing: Object.assign({}, listing)
      }
      this._bookmarks.push(r)
      return Promise.resolve(Object.assign({}, r))
    }
    return listingNotFound(request.listing ? request.listing.id : undefined)
  }

  removeBookmark(request: IListingBookmark): Promise<IListingBookmark> {
    const idx = this._bookmarks.findIndex(
      (b) => request.listing && request.listing.id === b.listing.id
    )
    if (idx >= 0) {
      const r = this._bookmarks[idx]
      this._bookmarks.splice(idx, 1)
      return Promise.resolve(Object.assign({}, r))
    }
    return Promise.reject({ code: "NOT_FOUND", message: "Bookmark not found" })
  }

  getStoreFront(): Promise<IListingStoreFront> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const r = this._listings.map((l) => Object.assign({}, l))
        resolve({
          featured: r,
          most_popular: r,
          recent: r,
          recommended: r
        })
      }, 1000)
    })
  }

  getListingReviews(request: IListingReviewListRequest): Promise<IListingReview[]> {
    return Promise.resolve(null)
  }

  getListingReview(request: IListingReviewRequest): Promise<IListingReview> {
    return Promise.resolve(null)
  }

  deleteListingReview(request: IListingReviewRequest): Promise<any> {
    return Promise.resolve(null)
  }

  saveListingReview(review: IListingReview): Promise<IListingReview> {
    return Promise.resolve(null)
  }

  getListingFeedback(request: IListingFeedbackListRequest): Promise<IListingFeedback[]> {
    return Promise.resolve(null)
  }

  getListingActivity(request: IListingRequest): Promise<IListingActivity[]> {
    const r = this._listings.find((l) => String(l.id) === String(request.listingId))
    let activities: IListingActivity[] = []

    //CHANGE THIS TO GITHUB COMMIT INTERFACE?
    if (r) {
      activities.push({
        action: ListingActivityAction.CREATED,
        activity_date: "2016-03-01T14:32:22.666Z",
        description: "",
        author: {
          id: 1,
          display_name: "Mock User",
          bio: "Mock User Bio",
          user: {
            username: "mock",
            email: "mock@coglite.test",
            groups: [{ name: "user" }, { name: "developer" }, { name: "admin" }]
          }
        },
        listing: r,
        change_details: [
          {
            field_name: "listing_type",
            old_value: "",
            new_value: "Widget"
          },
          {
            field_name: "categories",
            old_value: "['Security Analyst Applications']",
            new_value: "[]"
          },
          {
            field_name: "doc_urls",
            old_value: "[]",
            new_value: "[('Help', 'http://www.google.com')]"
          }
        ]
      })
    }
    return Promise.resolve(activities)
  }
  getListingTypes() {
    return Promise.resolve([
      {
        name: "Web Application",
        description: "Web Application"
      },
      {
        name: "Widget",
        description: "Widget"
      }
    ])
  }
  upload(request) {
    //const dt = new Date()
    return Promise.reject({ message: "UPLOAD NOT IMPLEMENTED" })
  }
}

/* -------------------------------------------------------------------------- */
/*                                    image                                   */
/* -------------------------------------------------------------------------- */

class MockImageService implements IImageService {
  _images: IImage[] = []

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

/* -------------------------------------------------------------------------- */
/*                                  category                                  */
/* -------------------------------------------------------------------------- */

let idCounter = 0
const nextId = () => {
  return idCounter++
}

class MockCategoryService implements ICategoryService {
  _categories: ICategory[] = []
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

class CategoryListModel extends ListModel<ICategory> {
  _service: ICategoryService
  get service() {
    return this._service || new MockCategoryService() //CategoryServiceContext.value
  }
  set service(value) {
    this._service = value
  }

  protected _loadImpl() {
    return this.service.getCategories()
  }
}

class ListingRelatedListModel<T> extends ListModel<T> {
  _listingService: IListingService

  @observable _listing: IListingModel

  constructor(listing: IListingModel) {
    super()
    this._listing = listing
  }

  get listingService() {
    return this._listingService || ListingServiceContext.value
  }
  set listingService(value: IListingService) {
    this._listingService = value
  }

  @computed
  get listing() {
    return this._listing
  }
}

const getActivity = (listing: IListingModel): IListingActivityListModel => {
  return listing.getState("activity", () => {
    return new ListingActivityListModel(listing)
  })
}

class ListingActivityListModel extends ListingRelatedListModel<IListingActivity>
  implements IListingActivityListModel {
  constructor(listing: IListingModel) {
    super(listing)
  }

  protected _loadImpl() {
    return this.listingService.getListingActivity({
      listingId: this.listing.id
    })
  }
}

class ListingBookmarkListModel extends ListModel<IListingBookmark>
  implements IListingBookmarkListModel {
  protected _loadImpl() {
    return ListingServiceContext.value.getBookmarkedListings()
  }

  _findMatchingIndex(listing: IListing) {
    if (listing && this.value) {
      return this.value.findIndex((item) => {
        return item.listing ? item.listing.id === listing.id : false
      })
    }
    return -1
  }

  _findMatching(listing: IListing) {
    if (listing && this.value) {
      return this.value.find((item) => {
        return item.listing ? item.listing.id === listing.id : false
      })
    }
  }

  @action
  addBookmark(listing: IListing): void {
    if (listing) {
      const existing = this._findMatching(listing)
      if (!existing) {
        const bookmark: IListingBookmark = {
          listing: listing
        }
        this.items.push(bookmark)
        ListingServiceContext.value.addBookmark({ listing: { id: listing.id } }).then((b) => {
          bookmark.id = b.id
        })
      }
    }
  }

  @action
  removeBookmark(listing: IListing): void {
    if (listing) {
      const idx = this._findMatchingIndex(listing)
      if (idx >= 0) {
        const e = this.items[idx]
        this.items.splice(idx, 1)
        if (e.id) {
          ListingServiceContext.value.removeBookmark(e)
        }
      }
    }
  }

  isBookmarked(listing: IListing): boolean {
    return this.items && listing
      ? this.items.some((b) => b.listing && b.listing.id === listing.id)
      : false
  }
}

class ListingLinkModel implements IListingLinkModel {
  @observable _listing: IListingModel
  @observable validationErrors: IError[] = []
  @observable name: string
  @observable url: string

  constructor(listing: IListingModel, data?: IListingLink) {
    this._listing = listing
    if (data) {
      this.setData(data)
    }
  }

  @computed
  get valid() {
    return this.validationErrors.length === 0
  }

  @computed
  get listing() {
    return this._listing
  }

  @action
  validate() {
    this.validationErrors = []
    if (isBlank(this.name)) {
      this.validationErrors.push({
        key: "name",
        keyTitle: "Name",
        message: "Name is required"
      })
    }
    if (isBlank(this.url)) {
      this.validationErrors.push({
        key: "url",
        keyTitle: "URL",
        message: "URL is required"
      })
    }
  }

  @action
  setName(name: string) {
    this.name = name
  }

  @action
  setUrl(url: string) {
    this.url = url
  }

  @action
  removeFromListing(): void {
    this.listing.removeLink(this)
  }

  @computed
  get data() {
    return { name: this.name, url: this.url }
  }
  set data(value) {
    this.setData(value)
  }

  @action
  setData(data: IListingLink) {
    this.setName(data ? data.name : undefined)
    this.setUrl(data ? data.url : undefined)
  }
}

class ListingReviewModel {
  @observable sync = new Sync()
  @observable listingRef: IListingModel
  @observable id: number
  @observable author: IUserProfile
  @observable rate: number = null
  @observable text: string
  @observable edited_date: string
  @observable created_date: string

  constructor(listingRef: IListingModel) {
    this.setListingRef(listingRef)
  }

  @action
  setListingRef(listingRef: IListingModel) {
    this.listingRef = listingRef
  }

  @action
  setRate(rate: number) {
    this.rate = rate
  }

  @action
  setText(text: string) {
    this.text = text
  }

  @computed
  get data(): IListingReview {
    return {
      id: this.id,
      rate: this.rate,
      text: this.text,
      //@ts-ignore
      listing: this.listingRef ? this.listingRef.id : undefined
    }
  }
  set data(value) {
    this.setData(value)
  }

  @action
  setData(data: IListingReview) {
    //@ts-ignore
    this.id = data ? data.id : undefined
    this.author = data ? data.author : undefined
    this.rate = data ? data.rate : undefined
    this.text = data ? data.text : undefined
    this.edited_date = data ? data.edited_date : undefined
    this.created_date = data ? data.created_date : undefined
  }

  _onSaveDone = (data: IListingReview) => {
    this.setData(data)
    this.sync.syncEnd()
  }

  _onSaveError = (error: any) => {
    this.sync.syncError(error)
  }

  @action
  save(): Promise<any> {
    this.sync.syncStart()
    return ListingServiceContext.value
      .saveListingReview(this.data)
      .then(this._onSaveDone)
      .catch(this._onSaveError)
  }
}

class ListingListModel extends ListModel<IListing> implements IListingListModel {
  _listingService: IListingService
  @observable searchText: string
  @observable _counts: IListingListCounts
  _searchDelay: number = 500
  _searchTimeout: any

  get listingService() {
    return this._listingService || ListingServiceContext.value
  }
  set listingService(value: IListingService) {
    this._listingService = value
  }

  @action
  setSearchText(searchText: string) {
    if (searchText !== this.searchText) {
      this.searchText = searchText
      if (this._searchTimeout) {
        clearTimeout(this._searchTimeout)
      }

      this.sync.syncStart()
      this._searchTimeout = setTimeout(this._searchImpl, this._searchDelay)
    }
  }

  @computed
  get counts() {
    return Object.assign({}, this._counts)
  }

  @action
  _refreshDone = (res: IListingListResponse) => {
    delete this._searchTimeout
    this._counts = res.counts
    this.setItems(res.listings)
    this.sync.syncEnd()
  }

  @action
  _refreshError = (error: any) => {
    this.clearItems()
    this.sync.syncError(error)
  }

  @action
  _searchImpl = () => {
    const search = this.searchText
    let request: IListingListRequest
    if (isNotBlank(search)) {
      request = {
        search: search
      }
    }
    return this.listingService
      .getListings(request)
      .then((results) => {
        if (search === this.searchText) {
          this._refreshDone(results)
        }
      })
      .catch((error) => {
        if (search === this.searchText) {
          this._refreshError(error)
        }
      })
  }

  @action
  refresh() {
    this.sync.syncStart()
    return this._searchImpl()
  }
}

class ListingModel {
  @observable
  _state = {}

  @computed
  get state() {
    return this._state
  }
  set state(value: any) {
    this.setState(value)
  }

  @action
  setState(state: any) {
    this._state = Object.assign({}, this._state, state)
  }

  @action
  getState<T = any>(key: string, factory?: () => T, shouldUpdate?: IPredicateFunc<T>) {
    let r = this._state[key]
    if ((r === undefined || r === null || (shouldUpdate && shouldUpdate(r))) && factory) {
      r = factory()
      this._state[key] = r
    }
    return r
  }

  _imageService = new MockImageService()
  get imageService() {
    return this._imageService
  }
  setImageService(v) {
    this._imageService = v
  }

  _lastData: IListing
  @observable validationErrors: IError[] = []
  @observable loadSync = new Sync()
  @observable saveSync = new Sync()
  @observable uploadSync = new Sync()
  _lastLoadedId: number
  @observable _id: any
  @observable _title: string
  @observable _unique_name: string
  @observable _description: string
  @observable _description_short: string
  @observable _is_enabled: boolean = true
  @observable _is_featured: boolean = false
  @observable _is_private: boolean = false
  @observable _launch_url: string
  @observable _security_marking: string
  @observable owners: IUserProfile[] = []
  @observable _version_name: string
  @observable _approval_status: ListingApprovalStatusEnum
  @observable _small_icon: IImage
  @observable _large_icon: IImage
  @observable _banner_icon: IImage
  @observable _large_banner_icon: IImage
  @observable _requirements: string
  @observable _what_is_new: string
  @observable screenshots: IScreenShot[] = []
  @observable _is_bookmarked: boolean
  @observable _is_deleted: boolean
  @observable _avg_rate: number
  @observable _total_votes: number
  @observable _total_rate5: number
  @observable _total_rate4: number
  @observable _total_rate3: number
  @observable _total_rate2: number
  @observable _total_rate1: number
  @observable _total_reviews: number
  @observable _total_review_responses: number
  @observable _feedback_score: number
  @observable doc_urls: ListingLinkModel[] = []
  @observable categories: ICategory[] = []
  @observable _listing_type: IListingType
  @observable _iframe_compatible: boolean = true
  _listingService: IListingService

  constructor(data?: IListing) {
    if (data) {
      this.setData(data)
    }
  }

  @computed get avg_rate() {
    return this._avg_rate
  }
  @computed get total_votes() {
    return this._total_votes
  }
  @computed get total_rate5() {
    return this._total_rate5
  }
  @computed get total_rate4() {
    return this._total_rate4
  }
  @computed get total_rate3() {
    return this._total_rate3
  }
  @computed get total_rate2() {
    return this._total_rate2
  }
  @computed get total_rate1() {
    return this._total_rate1
  }

  @computed
  get is_deleted() {
    return this._is_deleted
  }

  get listingService() {
    return this._listingService || ListingServiceContext.value
  }
  set listingService(value: IListingService) {
    this._listingService = value
  }

  @computed
  get valid() {
    return this.validationErrors.length === 0 && this.doc_urls.every((doc) => doc.valid)
  }

  @computed
  get data() {
    return {
      id: this._id,
      title: this._title,
      unique_name: this.unique_name,
      description: this._description,
      description_short: this._description_short,
      is_enabled: this._is_enabled,
      is_featured: this._is_featured,
      is_private: this._is_private,
      launch_url: this._launch_url,
      security_marking: this._security_marking,
      owners: this.owners ? this.owners.slice(0) : [],
      version_name: this._version_name,
      approval_status: this._approval_status,
      small_icon: this._small_icon || null,
      large_icon: this._large_icon || null,
      banner_icon: this._banner_icon || null,
      large_banner_icon: this._large_banner_icon || null,
      requirements: this._requirements,
      what_is_new: this._what_is_new,
      screenshots: this.screenshots ? this.screenshots.slice(0) : [],
      is_bookmarked: this._is_bookmarked,
      is_deleted: this._is_deleted,
      iframe_compatible: this._iframe_compatible,
      avg_rate: this._avg_rate,
      total_votes: this._total_votes,
      total_rate5: this._total_rate5,
      total_rate4: this._total_rate4,
      total_rate3: this._total_rate3,
      total_rate2: this._total_rate2,
      total_rate1: this._total_rate1,
      total_reviews: this._total_reviews,
      total_review_responses: this._total_review_responses,
      feedback_score: this._feedback_score,
      doc_urls: this.doc_urls.map((i) => i.data),
      categories: this.categories.slice(0),
      listing_type: this.listing_type
    }
  }
  set data(value) {
    this.setData(value)
  }

  @action
  setData(data) {
    this._lastData = data
    this._id = data ? data.id : undefined
    this._title = data ? data.title : undefined
    this._unique_name = data ? data.unique_name : undefined
    this._description = data ? data.description : undefined
    this._description_short = data ? data.description_short : undefined
    this._is_enabled = data ? data.is_enabled : true
    this._is_featured = data ? data.is_featured : false
    this._is_private = data ? data.is_ : false
    this._launch_url = data ? data.launch_url : undefined
    this._security_marking = data ? data.security_marking : undefined
    this.owners = data && data.owners ? data.owners.slice(0) : []
    this._version_name = data ? data.version_name : undefined
    //@ts-ignore
    this._approval_status = data ? data.approval_status : undefined
    this._small_icon = data ? data.small_icon : undefined
    this._large_icon = data ? data.large_icon : undefined
    this._banner_icon = data ? data.banner_icon : undefined
    this._large_banner_icon = data ? data.large_banner_icon : undefined
    this._requirements = data ? data.requirements : undefined
    this._what_is_new = data ? data.what_is_new : undefined
    ;(this.screenshots = data && data.screenshots ? data.screenshots.slice(0) : []),
      (this._is_bookmarked = data ? data.is_bookmarked : undefined)
    this._is_deleted = data ? data.is_deleted : undefined
    this._iframe_compatible =
      data && data.iframe_compatible !== undefined ? data.iframe_compatible : true
    this._avg_rate = data ? data.avg_rate : undefined
    this._total_votes = data ? data.total_votes : undefined
    this._total_rate5 = data ? data.total_rate5 : undefined
    this._total_rate4 = data ? data.total_rate4 : undefined
    this._total_rate3 = data ? data.total_rate3 : undefined
    this._total_rate2 = data ? data.total_rate2 : undefined
    this._total_rate1 = data ? data.total_rate1 : undefined
    this._total_reviews = data ? data.total_reviews : undefined
    this._total_review_responses = data ? data.total_review_responses : undefined
    this._feedback_score = data ? data.feedback_score : undefined
    this.doc_urls =
      data && data.doc_urls ? data.doc_urls.map((i) => new ListingLinkModel(this, i)) : []
    this.setCategories(data ? data.categories : [])
    this.setListingType(data ? data.listing_type : undefined)
  }

  @action
  reset() {
    this.setData(this._lastData)
  }

  @computed
  get id() {
    return this._id
  }
  set id(value) {
    this.setId(value)
  }
  @action
  setId(id: number) {
    this._id = id
  }

  @computed
  get title() {
    return this._title
  }
  set title(value) {
    this.setTitle(value)
  }
  @action
  setTitle(title: string): void {
    this._title = title
  }

  @computed
  get unique_name() {
    return this._unique_name || wordsToCamelCase(this.title)
  }
  set unique_name(value) {
    this.setUniqueName(value)
  }
  @action
  setUniqueName(uniqueName: string): void {
    this._unique_name = uniqueName
  }

  @computed
  get description() {
    return this._description
  }
  set description(value) {
    this.setDescription(value)
  }
  @action
  setDescription(description: string): void {
    this._description = description
  }

  @computed
  get description_short() {
    return this._description_short
  }
  set description_short(value) {
    this.setShortDescription(value)
  }
  @action
  setShortDescription(shortDescription: string): void {
    this._description_short = shortDescription
  }

  @computed
  get is_enabled() {
    return this._is_enabled
  }
  set is_enabled(value) {
    this.setEnabled(value)
  }
  @action
  setEnabled(enabled: boolean): void {
    this._is_enabled = enabled !== undefined ? enabled : true
  }

  @computed
  get is_featured() {
    return this._is_featured
  }
  set is_featured(value) {
    this.setFeatured(value)
  }
  @action
  setFeatured(featured: boolean): void {
    this._is_featured = featured !== undefined ? featured : false
  }

  @computed
  get is_private() {
    return this._is_private
  }
  set is_private(value) {
    this.setPrivate(value)
  }
  @action
  setPrivate(prv: boolean): void {
    this._is_private = prv !== undefined ? prv : false
  }

  @computed
  get launch_url() {
    return this._launch_url
  }
  set launch_url(value) {
    this.setLaunchUrl(value)
  }
  @action
  setLaunchUrl(launchUrl: string): void {
    this._launch_url = launchUrl
  }

  @computed
  get security_marking() {
    return this._security_marking
  }
  set security_marking(value) {
    this.setSecurityMarking(value)
  }
  @action
  setSecurityMarking(securityMarking: string): void {
    this._security_marking = securityMarking
  }

  @computed
  get version_name() {
    return this._version_name
  }
  set version_name(value) {
    this.setVersionName(value)
  }
  @action
  setVersionName(version: string) {
    this._version_name = version
  }

  @computed
  get approval_status() {
    return this._approval_status || ListingApprovalStatusEnum.IN_PROGRESS
  }
  set approval_status(value) {
    this.setApprovalStatus(value)
  }
  @action
  setApprovalStatus(approvalStatus: ListingApprovalStatusEnum) {
    this._approval_status = approvalStatus
  }

  @computed
  get small_icon() {
    return this._small_icon
  }
  set small_icon(value) {
    this.setSmallIcon(value)
  }
  @action
  setSmallIcon(smallIcon: IImage) {
    this._small_icon = smallIcon
  }

  @computed
  get large_icon() {
    return this._large_icon
  }
  set large_icon(value) {
    this.setLargeIcon(value)
  }
  @action
  setLargeIcon(largeIcon: IImage) {
    this._large_icon = largeIcon
  }

  @computed
  get banner_icon() {
    return this._banner_icon
  }
  set banner_icon(value) {
    this.setBannerIcon(value)
  }
  @action
  setBannerIcon(bannerIcon: IImage) {
    this._banner_icon = bannerIcon
  }

  @computed
  get large_banner_icon() {
    return this._large_banner_icon
  }
  set large_banner_icon(value) {
    this.setLargeBannerIcon(value)
  }
  @action
  setLargeBannerIcon(largeBannerIcon: IImage) {
    this._large_banner_icon = largeBannerIcon
  }

  @action
  setCategories(categories: ICategory[]) {
    this.categories = []
    if (categories) {
      categories.forEach((c) => this.categories.push(c))
    }
  }

  @action
  addCategory(category: ICategory): void {
    if (category) {
      this.categories.push(category)
    }
  }

  @action
  removeCategory(category: ICategory): void {
    if (category) {
      const idx = this.categories.findIndex(
        (c) => c.id === category.id || c.title === category.title
      )
      if (idx >= 0) {
        this.categories.splice(idx, 1)
      }
    }
  }

  @computed
  get listing_type() {
    return this._listing_type
  }
  set listing_type(value) {
    this.setListingType(value)
  }
  @action
  setListingType(listingType: IListingType) {
    this._listing_type = listingType
  }

  @action
  _onSaveDone = (data: IListing) => {
    this.setData(data)
    this.saveSync.syncEnd()
  }

  @action
  _onSyncError = (error) => {
    this.saveSync.syncError(error)
  }

  _saveImage(image: IImage, imageType: string): Promise<IImage> {
    const imageForSave = Object.assign(
      { image_type: imageType, security_marking: "UNCLASSIFIED" },
      image
    )
    return this.imageService.saveImage(imageForSave).then((saved) => {
      const r = Object.assign({}, saved, imageForSave, {
        url: this.imageService.getImageUrl({ id: saved.id })
      })
      delete r.file
      return r
    })
  }

  @action
  _saveSmallIcon(): Promise<any> {
    return this.small_icon && this.small_icon.file
      ? this._saveImage(this.small_icon, "small_icon").then((image) => {
          this.setSmallIcon(image)
        })
      : Promise.resolve()
  }

  @action
  _saveLargeIcon(): Promise<any> {
    return this.large_icon && this.large_icon.file
      ? this._saveImage(this.large_icon, "large_icon").then((image) => {
          this.setLargeIcon(image)
        })
      : Promise.resolve()
  }

  @action
  _saveBannerIcon(): Promise<any> {
    return this.banner_icon && this.banner_icon.file
      ? this._saveImage(this.banner_icon, "banner_icon").then((image) => {
          this.setBannerIcon(image)
        })
      : Promise.resolve()
  }

  @action
  _saveLargeBannerIcon(): Promise<any> {
    return this.large_banner_icon && this.large_banner_icon.file
      ? this._saveImage(this.large_banner_icon, "large_banner_icon").then((image) => {
          this.setLargeBannerIcon(image)
        })
      : Promise.resolve()
  }

  @action
  _saveImages() {
    return Promise.all([
      this._saveSmallIcon(),
      this._saveLargeIcon(),
      this._saveBannerIcon(),
      this._saveLargeBannerIcon()
    ]).catch((error) => {
      return Promise.reject({
        message: `Unable to save images - ${error.message}`,
        cause: error
      })
    })
  }

  @action
  approve() {
    return this._saveInternal("approve", ListingApprovalStatusEnum.APPROVED)
  }

  @action
  reject() {
    return this._saveInternal("reject", ListingApprovalStatusEnum.REJECTED)
  }

  @computed
  get canSubmit() {
    if (
      this.approval_status === ListingApprovalStatusEnum.IN_PROGRESS ||
      this.approval_status === ListingApprovalStatusEnum.REJECTED
    ) {
      const validationErrors: IError[] = []
      this._validateDetails(ListingApprovalStatusEnum.PENDING, validationErrors)
      return validationErrors.length === 0
    }
    return false
  }

  @action
  submitForApproval() {
    return this._saveInternal("submit", ListingApprovalStatusEnum.PENDING)
  }

  _onDeleteDone = () => {
    return this.listingService.getListing({ listingId: this.id }).then(this._onSaveDone)
  }

  @action
  delete() {
    this.saveSync.syncStart({ type: "delete" })
    return this.listingService
      .deleteListing({ id: this.id })
      .then(this._onDeleteDone)
      .catch(this._onSyncError)
  }

  _validateDetails(approvalStatus: ListingApprovalStatusEnum, validationErrors: IError[]) {
    // NOTE that validation errors have to be moved to a core object with codes to access
    // a title is always required
    if (isBlank(this.title)) {
      validationErrors.push({
        key: "title",
        keyTitle: "Title",
        message: "Title is required"
      })
    }

    // any other state after in progress requires a short description, description and launch url
    if (approvalStatus !== ListingApprovalStatusEnum.IN_PROGRESS) {
      if (isBlank(this.launch_url)) {
        validationErrors.push({
          key: "launch_url",
          keyTitle: "Launch URL",
          message: "Launch URL is required"
        })
      }
      if (isBlank(this.description_short)) {
        validationErrors.push({
          key: "description_short",
          keyTitle: "Short Description",
          message: "Short Description is required"
        })
      }
      if (isBlank(this.description)) {
        validationErrors.push({
          key: "description",
          keyTitle: "Description",
          message: "Description is required"
        })
      }
    }
  }

  @action
  validate(approvalStatus: ListingApprovalStatusEnum) {
    this.validationErrors = []
    this._validateDetails(approvalStatus, this.validationErrors)
    // validate each doc url
    if (this.doc_urls) {
      this.doc_urls.forEach((doc) => doc.validate())
    }
  }

  @action
  _saveDetails(updated?: IListing) {
    this.saveSync.syncStart({ type: "save" })
    const request: IListing = Object.assign({}, this.data, updated)
    return this.listingService
      .saveListing(request)
      .then(this._onSaveDone)
      .catch((err) => {
        this._onSyncError(err)
        return Promise.reject(err)
      })
  }

  @action
  _saveInternal(type: string, approvalStatus: ListingApprovalStatusEnum) {
    this.validate(approvalStatus)
    if (!this.valid) {
      return Promise.reject({
        code: "VALIDATION_ERROR",
        errors: this.validationErrors.slice(0)
      })
    }
    //@ts-ignore
    this.saveSync.syncStart({ type: type })
    return this._saveImages()
      .then(() => {
        //@ts-ignore
        const request: IListing = Object.assign({}, this.data, {
          approval_status: approvalStatus
        })
        return this.listingService.saveListing(request)
      })
      .then(this._onSaveDone)
      .catch((err) => {
        this._onSyncError(err)
        return Promise.reject(err)
      })
  }

  @action
  save() {
    return this._saveInternal("save", this.approval_status)
  }

  @action
  addLink() {
    this.doc_urls.push(new ListingLinkModel(this))
  }

  @action
  removeLink(doc): void {
    const idx = this.doc_urls.indexOf(doc)
    if (idx >= 0) {
      this.doc_urls.splice(idx, 1)
    }
  }

  @action
  enable(): Promise<any> {
    return this.savedEnabled(true)
  }

  @action
  disable(): Promise<any> {
    return this.savedEnabled(false)
  }

  @action
  savedEnabled(enabled: boolean): Promise<any> {
    return this._saveDetails({ is_enabled: enabled })
  }

  @action
  saveFeatured(featured: boolean): Promise<any> {
    return this._saveDetails({ is_featured: featured })
  }

  @action
  saveIframeCompatible(iframeCompatible: boolean): Promise<any> {
    return this._saveDetails({ iframe_compatible: iframeCompatible })
  }

  @computed
  get iframe_compatible() {
    return this._iframe_compatible
  }
  set iframe_compatible(value) {
    this.setIframeCompatible(value)
  }
  @action
  setIframeCompatible(iframeCompatible: boolean) {
    this._iframe_compatible = iframeCompatible !== undefined ? iframeCompatible : true
  }

  @computed
  get requirements() {
    return this._requirements || ListingDefaults.requirements
  }
  set requirements(value) {
    this.setRequirements(value)
  }
  @action
  setRequirements(requirements: string) {
    this._requirements = requirements
  }

  @computed
  get what_is_new() {
    return this._what_is_new || ListingDefaults.what_is_new
  }
  set what_is_new(value) {
    this.setWhatIsNew(value)
  }
  @action
  setWhatIsNew(whatIsNew: string) {
    this._what_is_new = whatIsNew
  }

  _onUploadDone = (result: IListingUploadResult) => {
    this.setData(result.listing)
    this.saveSync.syncEnd()
  }

  _onUploadError = (error: any) => {
    this.saveSync.syncError(error)
  }

  @action
  upload(file: File): Promise<any> {
    this.validationErrors = []
    this.saveSync.syncStart({ type: "upload" })
    return this.listingService
      .upload({ listingId: this.id, file: file })
      .then(this._onUploadDone)
      .catch(this._onUploadError)
  }

  _onLoadDone = (listing: IListing) => {
    this.setData(listing)
    this.loadSync.syncEnd()
  }

  _onLoadError = (error: any) => {
    this.loadSync.syncError(error)
  }

  @action
  refresh() {
    this.loadSync.syncStart()
    const id = this._id
    return this.listingService
      .getListing({ listingId: id })
      .then((l) => {
        if (id === this._id) {
          this._onLoadDone(l)
        }
      })
      .catch((err) => {
        if (id === this._id) {
          this._onLoadError(err)
        }
      })
  }

  @action
  load(): Promise<any> {
    if (this._id !== this._lastLoadedId) {
      this._lastLoadedId = this._id
      return this.refresh()
    }
  }
}

class ListingModelSupplier extends SyncSupplier<IListingModel> implements IListingModelSupplier {
  _listingId: string | number
  constructor(listingId: string | number) {
    super()
    this._listingId = listingId
  }
  get listingId(): string | number {
    return this._listingId
  }

  _loadImpl() {
    return ListingServiceContext.value.getListing({ listingId: this._listingId }).then((data) => {
      return new ListingModel(data)
    })
  }
}

const getReviews = (listing: IListingModel): IListingReviewListModel => {
  return listing.getState("reviews", () => {
    return new ListingReviewListModel(listing)
  })
}

class ListingReviewListModel extends ListingRelatedListModel<IListingReview>
  implements IListingReviewListModel {
  @observable _newReview: ListingReviewModel

  constructor(listing: IListingModel) {
    super(listing)
  }

  protected _loadImpl() {
    return this.listingService.getListingReviews({
      listingId: this.listing.id
    })
  }

  @computed
  get newReview() {
    return this._newReview
  }

  @action
  add(): void {
    this._newReview = new ListingReviewModel(this.listing)
  }

  @action
  cancelEdit(): void {
    this._newReview = undefined
  }
}

class ListingSearchModel extends ListModel<IListing> implements IListingSearchModel {
  @observable _search: string
  @observable category: string[] = []
  _service: IListingService
  _searchDelay: number
  _searchTimeout: any

  get searchDelay(): number {
    return this._searchDelay !== undefined ? this._searchDelay : ListingDefaults.searchDelay
  }
  set searchDelay(value) {
    if (value > 0) {
      this._searchDelay = value
    }
  }

  get service() {
    return this._service || ListingServiceContext.value
  }
  set service(value) {
    this._service = value
  }

  @computed
  get search() {
    return this._search
  }
  set search(value) {
    this.setSearch(value)
  }

  @action
  protected _searchImpl = () => {
    this.refresh()
  }

  @action
  setSearch(search: string) {
    this.setRequest({ search: search })
  }

  @action
  setCategory(category: string[]) {
    this.setRequest({ category: category })
  }

  _hasCategoryChanged(newCategory: string[]): boolean {
    if (newCategory === this.category) {
      return false
    }

    if (!newCategory) {
      newCategory = []
    }
    return this.category.some((c) => newCategory.indexOf(c) < 0)
  }

  @action
  setRequest(params: IListingSearchRequest): void {
    let search = params && params.search !== undefined ? params.search : this._search
    const category = params && params.category !== undefined ? params.category : this.category
    const categoryChanged = this._hasCategoryChanged(category)
    if (search !== this._search || categoryChanged) {
      this._search = search
      if (categoryChanged) {
        this.category = []
        if (category) {
          category.forEach((c) => this.category.push(c))
        }
      }
      if (this._searchTimeout) {
        clearTimeout(this._searchTimeout)
      }
      this.sync.syncStart()
      this._searchTimeout = setTimeout(this._searchImpl, this.searchDelay)
    }
  }

  _hasRequestChanged(params: IListingSearchRequest): boolean {
    if (params.search !== this._search) {
      return true
    }
    return this._hasCategoryChanged(params.category)
  }

  @action
  refresh(): Promise<void> {
    const request: IListingSearchRequest = {
      search: this._search,
      category: this.category.slice(0)
    }
    this.sync.syncStart()
    return this.service
      .searchListings(request)
      .then((results) => {
        if (!this._hasRequestChanged(request)) {
          this._onLoadDone(results)
        }
      })
      .catch((error) => {
        if (!this._hasRequestChanged(request)) {
          this._onLoadError(error)
        }
      })
  }
}

class ListingTypeListModel extends ListModel<IListingType> {
  _service: IListingService
  get service() {
    return this._service || ListingServiceContext.value
  }
  set service(value) {
    this._service = value
  }

  protected _loadImpl() {
    return this.service.getListingTypes()
  }
}

const ListingTypeListStore = new ListingTypeListModel()
const ListingListStore = new ListingListModel()
const ListingDeleteStore = new SyncSupplier<IListingModel>()
const ListingBookmarkListStore = new ListingBookmarkListModel()
const CategoryListStore = new CategoryListModel()

// start jsx components

const ListingIconTileStylesheet = mergeStyleSets({
  root: {
    justifyContent: "center",
    padding: 0,
    background: "transparent",
    outline: "none",
    borderRadius: 4,
    cursor: "pointer",
    width: 130,
    maxWidth: 130,
    minWidth: 130,
    backgroundColor: DefaultPalette.white,
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
    transition: "box-shadow 0.5s",
    border: `1px solid ${DefaultPalette.neutralQuaternary}`,
    selectors: {
      "&:hover": {
        boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)",
        selectors: {
          $top: {
            backgroundColor: DefaultPalette.neutralQuaternaryAlt
          }
        }
      }
    }
  },
  top: {
    position: "relative",
    height: 80,
    minHeight: 80,
    maxHeight: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DefaultPalette.neutralLight
  },
  actions: {
    position: "absolute",
    top: 0,
    right: 0,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  content: {
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: FontSizes.small,
    width: 120,
    textOverflow: "ellipsis",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    textAlign: "center"
  }
})

export enum ListingIconSize {
  small = 16,
  large = 32
}

export interface IListingIconTileProps {
  listing: IListing
  onClick?: (listing: IListing, e: MouseEvent) => void
  onClickInfo?: (listing: IListing, e: MouseEvent) => void
  iconSize?: ListingIconSize
}

export const ListingIconTileIcon = (props: IListingIconTileProps) => {
  const { listing, iconSize } = props
  let iconUrl: string
  let iconImageSize: ListingIconSize = iconSize || ListingIconSize.large
  if (iconImageSize === ListingIconSize.small) {
    iconUrl = listing.small_icon ? listing.small_icon.url : undefined
  } else {
    iconUrl = listing.large_icon ? listing.large_icon.url : undefined
  }
  const personaSize = iconImageSize === ListingIconSize.small ? PersonaSize.size16 : undefined
  return <Persona size={personaSize} hidePersonaDetails imageUrl={iconUrl} text={listing.title} />
}

const ListingInfoButton = (props: IListingIconTileProps) => {
  const _onClick = (e) => {
    e.stopPropagation()
    props.onClickInfo(props.listing, e)
  }

  if (props.onClickInfo) {
    return (
      <IconButton
        title={`Open details for ${props.listing.title}`}
        iconProps={{ iconName: "Info" }}
        styles={{
          root: {
            color: getTheme().palette.blue
          }
        }}
        onClick={_onClick}
      />
    )
  }
  return null
}

export const ListingIconTile = memo((props: IListingIconTileProps) => {
  const { listing, onClick } = props

  const _onClick = (e) => {
    props.onClick(props.listing, e)
  }

  const _onRenderActions = () => {
    return (
      <div className={ListingIconTileStylesheet.actions}>
        <ListingInfoButton {...props} />
      </div>
    )
  }

  const _onRenderTop = () => {
    return (
      <div className={ListingIconTileStylesheet.top}>
        <ListingIconTileIcon {...props} />
        {_onRenderActions()}
      </div>
    )
  }

  const _onRenderContent = () => {
    return (
      <div className={ListingIconTileStylesheet.content}>
        <div className={ListingIconTileStylesheet.title}>{props.listing.title}</div>
      </div>
    )
  }
  return (
    <div
      role="button"
      title={onClick ? `Launch ${listing.title}` : listing.title}
      className={ListingIconTileStylesheet.root}
      onClick={onClick ? _onClick : undefined}
    >
      {_onRenderTop()}
      {_onRenderContent()}
    </div>
  )
})

const ListingStylesheet = mergeStyleSets({
  root: [
    "listing",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden"
    }
  ],
  metadata: [
    "listing-metadata",
    {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: 240,
      paddingTop: 8,
      paddingLeft: 12,
      paddingBottom: 8,
      overflow: "auto"
    }
  ],
  metadataSection: [
    "listing-metadata-section",
    {
      marginTop: 8
    }
  ],
  metadataSectionTitle: [
    "listing-metadata-section-title",
    {
      margin: 0,
      paddingBottom: 4,
      fontSize: FontSizes.small,
      fontWeight: FontWeights.semibold
    }
  ],
  metadataSectionContent: [
    "listing-metadata-section-title-content",
    {
      fontWeight: FontWeights.light,
      fontSize: FontSizes.small
    }
  ],
  detailContent: [
    "listing-detail-content",
    {
      position: "absolute",
      left: 260,
      top: 0,
      bottom: 0,
      right: 0,
      paddingTop: 8,
      paddingRight: 12,
      overflow: "auto"
    }
  ],
  detailTabs: ["listing-detail-tabs", {}],
  title: [
    "listing-title",
    {
      paddingLeft: 8,
      fontSize: FontSizes.xLarge,
      fontWeight: FontWeights.semibold
    }
  ],
  overview: [
    "listing-overview",
    {
      paddingTop: 8
    }
  ],
  shortDescription: [
    "listing-short-description",
    {
      padding: 8,
      fontSize: FontSizes.mediumPlus,
      fontWeight: FontWeights.semibold
    }
  ],
  actions: [
    "listing-actions",
    {
      display: "flex",
      alignItems: "center",
      marginTop: 8,
      selectors: {
        ".ms-Button+.ms-Button": {
          marginLeft: 8
        }
      }
    }
  ],
  description: [
    "listing-description",
    {
      padding: 8,
      whiteSpace: "pre-wrap",
      fontSize: FontSizes.medium,
      fontWeight: FontWeights.semilight
    }
  ],
  banner: [
    "listing-banner",
    {
      width: 220,
      height: 137,
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralLight
    }
  ],
  rating: [
    "listing-rating",
    {
      marginTop: 8,
      display: "flex"
    }
  ],
  ratingStars: [
    "listing-rating-stars",
    {
      color: DefaultPalette.yellow
    }
  ],
  reviewCount: [
    "listing-review-count",
    {
      paddingLeft: 8
    }
  ]
})

interface IListingProps {
  listing: IListingModel
  adminGroup?: string
  bookmarkList?: IListingBookmarkListModel
  onEdit?: (listing: IListingModel) => void
  onLaunch?: (listing: IListing) => void
  onDelete?: (listing: IListingModel) => void
  onSelectCategory?: (category: ICategory) => void
  className?: string
}

interface IListingCategoryProps extends IListingProps {
  category: ICategory
  onClickCategory?: (category: ICategory) => void
}

const ListingCategory = (props: IListingCategoryProps) => {
  const _onClick = (e) => {
    e.preventDefault()
    if (props.onClickCategory) {
      props.onClickCategory(props.category)
    }
  }

  return (
    <div>
      <Link onClick={_onClick}>{props.category.title}</Link>
    </div>
  )
}

const ListingCategoryList = (props: IListingProps) => {
  const categories = props.listing.categories
  if (categories && categories.length > 0) {
    const categoryViews = categories.map((c) => {
      return (
        <ListingCategory
          key={c.title}
          {...props}
          category={c}
          onClickCategory={props.onSelectCategory}
        />
      )
    })
    return <>{categoryViews}</>
  }
  return null
}

const ListingCategories = observer((props: IListingProps) => {
  if (props.listing.categories && props.listing.categories.length > 0) {
    return (
      <ListingMetadataSection {...props} title="Categories">
        <ListingCategoryList {...props} />
      </ListingMetadataSection>
    )
  }
  return null
})

const ListingType = observer((props: IListingProps) => {
  if (props.listing.listing_type && props.listing.listing_type.title) {
    return (
      <ListingMetadataSection {...props} title="Type">
        {props.listing.listing_type.title}
      </ListingMetadataSection>
    )
  }
  return null
})

interface IListingMetadataSectionProps extends IListingProps {
  title?: any
}

const ListingMetadataSection: FunctionalComponent<IListingMetadataSectionProps> = (props) => {
  const { title } = props
  return (
    <div className={ListingStylesheet.metadataSection}>
      {title && <h5 className={ListingStylesheet.metadataSectionTitle}>{title}</h5>}
      {React.Children.count(props.children) > 0 && (
        <div className={ListingStylesheet.metadataSectionContent}>{props.children}</div>
      )}
    </div>
  )
}

const ListingBanner = observer((props: IListingProps) => {
  const { listing } = props
  return (
    <div className={ListingStylesheet.banner}>
      <ListingBannerIcon listing={listing} />
    </div>
  )
})

const ListingRating = observer((props: IListingProps) => {
  const { listing } = props
  let content
  let reviewCount
  if (listing.avg_rate !== undefined && listing.avg_rate > 0) {
    content = (
      <Rating
        className={ListingStylesheet.ratingStars}
        min={1}
        max={5}
        rating={listing.avg_rate}
        readOnly={true}
        ariaLabelFormat="Rated {0} out of {1}"
      />
    )
    reviewCount = (
      <div className={ListingStylesheet.reviewCount}>
        (
        {listing.total_rate1 +
          listing.total_rate2 +
          listing.total_rate3 +
          listing.total_rate4 +
          listing.total_rate5}
        )
      </div>
    )
  } else {
    content = (
      <Rating
        title="No Reviews Available"
        min={1}
        max={5}
        rating={5}
        readOnly={true}
        disabled={true}
        ariaLabelFormat="No reviews available"
      />
    )
  }
  return (
    <div className={ListingStylesheet.rating}>
      {content}
      {reviewCount}
    </div>
  )
})

const ListingActions = (props: IListingProps) => {
  return (
    <div className={ListingStylesheet.actions}>
      <ListingBookmarkButton bookmarkList={ListingBookmarkListStore} listing={props.listing} />
      <ListingLaunchAction onLaunch={props.onLaunch} listing={props.listing} />
    </div>
  )
}

const ListingVersion = observer((props: IListingProps) => {
  if (props.listing.version_name) {
    return (
      <ListingMetadataSection {...props} title="Version">
        {props.listing.version_name}
      </ListingMetadataSection>
    )
  }
  return null
})

const ListingApprovalStatus = observer((props: IListingProps) => {
  if (props.listing.approval_status) {
    return (
      <ListingMetadataSection {...props} title="Approval Status">
        <ListingApprovalStatusComponent listing={props.listing} />
      </ListingMetadataSection>
    )
  }
  return null
})

interface IListingToggleProps extends IListingProps {
  disabled?: boolean
}

const ListingEnabledToggle = observer((props: IListingToggleProps) => {
  const _onChanged = (checked: boolean) => {
    props.listing.savedEnabled(checked)
  }
  return (
    <Toggle
      checked={props.listing.is_enabled}
      title={props.listing.is_enabled ? "Yes" : "No"}
      onChanged={_onChanged}
      disabled={props.disabled}
    />
  )
})

const ListingEnabled = (props: IListingProps) => {
  return (
    <ListingMetadataSection {...props} title="Enabled">
      <ListingEnabledToggle {...props} />
    </ListingMetadataSection>
  )
}

const ListingFeaturedToggle = observer((props: IListingToggleProps) => {
  const _onChanged = (checked: boolean) => {
    props.listing.saveFeatured(checked)
  }
  return (
    <Toggle
      checked={props.listing.is_featured}
      title={props.listing.is_featured ? "Yes" : "No"}
      onChanged={_onChanged}
      disabled={props.disabled}
    />
  )
})

const ListingFeatured = observer((props: IListingProps) => {
  return (
    <ListingMetadataSection {...props} title="Featured">
      <ListingFeaturedToggle {...props} />
    </ListingMetadataSection>
  )
})

const ListingIframeCompatibleToggle = observer((props: IListingToggleProps) => {
  const _onChanged = (checked: boolean) => {
    props.listing.saveIframeCompatible(checked)
  }
  return (
    <Toggle
      checked={props.listing.iframe_compatible}
      title={props.listing.iframe_compatible ? "Yes" : "No"}
      onChanged={_onChanged}
      disabled={props.disabled}
    />
  )
})

const ListingIframe = observer((props: IListingProps) => {
  return (
    <ListingMetadataSection {...props} title="Iframe Compatible">
      <ListingIframeCompatibleToggle {...props} />
    </ListingMetadataSection>
  )
})

const ListingSecurity = observer((props: IListingProps) => {
  if (props.listing.security_marking) {
    return (
      <ListingMetadataSection {...props} title="Security">
        {props.listing.security_marking}
      </ListingMetadataSection>
    )
  }
  return null
})

const ListingMetadata = memo((props: IListingProps) => {
  return (
    <div className={ListingStylesheet.metadata}>
      <ListingBanner {...props} />
      <ListingActions {...props} />
      <ListingRating {...props} />
      <ListingVersion {...props} />
      <ListingApprovalStatus {...props} />
      <ListingType {...props} />
      <ListingEnabled {...props} />
      <ListingFeatured {...props} />
      <ListingIframe {...props} />
      <ListingCategories {...props} />
      <ListingSecurity {...props} />
    </div>
  )
})

const ListingTitle = observer((props: IListingProps) => {
  return <div className={ListingStylesheet.title}>{props.listing.title}</div>
})

const ListingShortDescription = observer((props: IListingProps) => {
  return <div className={ListingStylesheet.shortDescription}>{props.listing.description_short}</div>
})

const ListingDescription = observer((props: IListingProps) => {
  return <div className={ListingStylesheet.description}>{props.listing.description}</div>
})

const ListingOverview = (props: IListingProps) => {
  return (
    <div className={ListingStylesheet.overview}>
      <ListingShortDescription {...props} />
      <ListingDescription {...props} />
    </div>
  )
}

const ListingDetailTabs = observer((props: IListingProps) => {
  const overviewVisible =
    isNotBlank(props.listing.description_short) || isNotBlank(props.listing.description)
  const pivotItems = []
  if (overviewVisible) {
    pivotItems.push(
      <PivotItem key="overview" linkText="Overview">
        <ListingOverview {...props} />
      </PivotItem>
    )
  }
  pivotItems.push(
    <PivotItem key="reviews" linkText="Reviews">
      <ListingReviewListContainer reviewList={getReviews(props.listing)} />
    </PivotItem>
  )
  pivotItems.push(
    <PivotItem key="activity" linkText="Activity">
      <ListingActivityListContainer activityList={getActivity(props.listing)} />
    </PivotItem>
  )
  pivotItems.push(
    <PivotItem key="docs" linkText="Documents">
      <ListingLinks {...props} />
    </PivotItem>
  )
  return (
    <div className={ListingStylesheet.detailTabs}>
      <Pivot>{pivotItems}</Pivot>
    </div>
  )
})

const ListingDetails = (props: IListingProps) => {
  return (
    <div className={ListingStylesheet.detailContent}>
      <ListingSyncError {...props} sync={props.listing.saveSync} />
      <ListingTitle {...props} />
      <ListingDetailTabs {...props} />
    </div>
  )
}

const Listing = (props: IListingProps) => {
  return (
    <div className={ListingStylesheet.root}>
      <SyncOverlay sync={props.listing.saveSync} syncLabel="Please wait..." />
      <ListingMetadata {...props} />
      <ListingDetails {...props} />
    </div>
  )
}

interface IListingContainerProps extends IListingProps {
  onRenderListing?: (props: IListingProps) => JSX.Element
}

const ListingContainer = (props: IListingContainerProps) => {
  useMount(() => {
    props.listing.load()
  })

  const _onRenderListing = () => {
    if (props.onRenderListing) {
      return props.onRenderListing(props)
    }
    return <Listing {...props} />
  }
  return <SyncComponent sync={props.listing.loadSync} onRenderDone={_onRenderListing} />
}

interface IListingDeleteProps {
  listingSupplier: ISyncSupplier<IListingModel>
}

const ListingDeleteDialog = observer((props: IListingDeleteProps) => {
  const _onDismissed = () => {
    props.listingSupplier.clearValue()
  }
  const _onClickCancel = () => {
    props.listingSupplier.clearValue()
  }
  const _onClickConfirm = () => {
    props.listingSupplier.value.delete()
    props.listingSupplier.clearValue()
  }

  const listing = props.listingSupplier.value
  const content = listing ? (
    <div>
      Are you sure you want to delete <strong>{listing.title}</strong>
    </div>
  ) : (
    undefined
  )
  return (
    <Dialog
      hidden={listing ? false : true}
      title={`Delete ${ListingViewConfig.label}`}
      onDismissed={_onDismissed}
    >
      {content}
      <DialogFooter>
        <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
        <PrimaryButton onClick={_onClickConfirm}>OK</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
})

interface IListingCommandBarButtonProps {
  listing: IListingModel
  onClick?: (props: IListingCommandBarButtonProps) => void
  iconProps?: IIconProps
  buttonProps?: IButtonProps
}

const ListingCommandBarButton: FunctionalComponent<IListingCommandBarButtonProps> = observer(
  (props) => {
    const _onClick = () => {
      props.onClick(props)
    }
    const { listing } = props
    if (
      props.onClick &&
      !listing.loadSync.syncing &&
      !listing.loadSync.error &&
      props.listing.approval_status !== ListingApprovalStatusEnum.DELETED
    ) {
      return (
        <CommandBarButton
          {...props.buttonProps}
          iconProps={props.iconProps}
          onClick={_onClick}
          disabled={listing.saveSync.syncing}
        >
          {props.children}
        </CommandBarButton>
      )
    }
    return null
  }
)

const listingMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string,
  ButtonType: ComponentType<IListingCommandBarButtonProps> = ListingCommandBarButton
): IContextualMenuItem => {
  return {
    key: key,
    onRender(item) {
      return <ButtonType key={item.key} {...props} />
    }
  }
}

const ListingApproveButton = observer((props: IListingCommandBarButtonProps) => {
  const { listing } = props
  if (listing.approval_status === ListingApprovalStatusEnum.PENDING) {
    return (
      <ListingCommandBarButton {...props} iconProps={{ iconName: "Accept" }}>
        Approve
      </ListingCommandBarButton>
    )
  }
  return null
})

const listingApproveMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string = "listingApprove"
): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingApproveButton)
}

const ListingRejectButton = observer((props: IListingCommandBarButtonProps) => {
  const { listing } = props
  if (listing.approval_status === ListingApprovalStatusEnum.PENDING) {
    return (
      <ListingCommandBarButton {...props} iconProps={{ iconName: "Cancel" }}>
        Reject
      </ListingCommandBarButton>
    )
  }
  return null
})

const listingRejectMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string = "listingReject"
): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingRejectButton)
}

const ListingEditButton = (props: IListingCommandBarButtonProps) => {
  return (
    <ListingCommandBarButton {...props} iconProps={{ iconName: "Edit" }}>
      Edit
    </ListingCommandBarButton>
  )
}

const listingEditMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string = "listingEdit"
): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingEditButton)
}

const ListingWorkflowSubmitButton = observer((props: IListingCommandBarButtonProps) => {
  if (props.listing.canSubmit) {
    return (
      <ListingCommandBarButton {...props} iconProps={{ iconName: "Workflow" }}>
        Submit for Approval
      </ListingCommandBarButton>
    )
  }
  return null
})

const listingWorkflowSubmitMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string = "listingWorkflowSubmit"
): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingWorkflowSubmitButton)
}

const ListingDeleteButton = (props: IListingCommandBarButtonProps) => {
  return (
    <ListingCommandBarButton {...props} iconProps={{ iconName: "Delete" }}>
      Delete
    </ListingCommandBarButton>
  )
}

const listingDeleteMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string = "listingDelete"
): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingDeleteButton)
}

const ListingSaveButton = (props: IListingCommandBarButtonProps) => {
  return (
    <ListingCommandBarButton {...props} iconProps={{ iconName: "Save" }}>
      Save
    </ListingCommandBarButton>
  )
}

const listingSaveMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string = "listingSave"
): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingSaveButton)
}

const ListingEditCancelButton = (props: IListingCommandBarButtonProps) => {
  return (
    <ListingCommandBarButton {...props} iconProps={{ iconName: "Cancel" }}>
      Cancel
    </ListingCommandBarButton>
  )
}

const listingEditCancelMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string = "listingEditCancel"
): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingEditCancelButton)
}

const ListingActivityListStylesheet = mergeStyleSets({
  root: ["listing-activity-list", {}],
  activities: [
    "listing-activity-list-activities",
    {
      padding: 8
    }
  ],
  activity: [
    "listing-activity-list-activity",
    {
      marginBottom: 12
    }
  ]
})

interface IListingActivityListProps {
  activityList: IListingActivityListModel
  className?: string
}

interface IListingActivityProps {
  activity: IListingActivity
  className?: string
}

const getActivityName = (activity: IListingActivity): string => {
  return activity.author ? activity.author.display_name : ""
}

const getActivityInitials = (activity: IListingActivity | IListingReview): string => {
  if (activity.author && activity.author.display_name) {
    //const items = split(activity.author.display_name, isWhitespace)
    const items = activity.author.display_name.split(" ")
    const letters = items.map((e) => {
      return e.charAt(0).toUpperCase()
    })
    return letters.join("")
  }
  return ""
}

const ListingActivityUser = (props: IListingActivityProps) => {
  const _onRenderContent = () => {
    return <UserInfo userProfile={props.activity.author} />
  }
  const _onClickUser = () => {}

  return (
    <TooltipHost
      tooltipProps={{ onRenderContent: _onRenderContent }}
      calloutProps={{ gapSpace: 0 }}
    >
      <Link onClick={_onClickUser}>{getActivityName(props.activity)}</Link>
    </TooltipHost>
  )
}

const ListingActivity = (props: IListingActivityProps) => {
  const { activity } = props
  return (
    <ActivityItem
      className={props.className}
      activityDescription={
        <div>
          <strong>{activity.action}</strong> by <ListingActivityUser {...props} />
        </div>
      }
      activityPersonas={[
        {
          text: getActivityName(activity),
          imageInitials: getActivityInitials(activity)
        }
      ]}
      timeStamp={activity.activity_date}
    />
  )
}

interface IListingActivityChangeProps extends IListingActivityProps {
  change: IListingChange
}

const ListingActivityChange = (props: IListingActivityChangeProps) => {
  const { change } = props
  return (
    <div>
      <strong>{change.field_name}</strong> changed from <strong>{change.old_value}</strong> to{" "}
      <strong>{change.new_value}</strong>
    </div>
  )
}

const ListingActivityChanges = (props: IListingActivityProps) => {
  if (props.activity.change_details && props.activity.change_details.length > 0) {
    const changes = props.activity.change_details.map((change, idx) => {
      return <ListingActivityChange key={idx} activity={props.activity} change={change} />
    })
    return <div>{changes}</div>
  }
  return null
}

const ListingModifiedActivity = (props: IListingActivityProps) => {
  const { activity } = props
  const activityDescription = []
  activityDescription.push(
    <div key="user">
      <strong>{activity.action}</strong> by <ListingActivityUser {...props} />
    </div>
  )
  if (activity.change_details && activity.change_details.length > 0) {
    activityDescription.push(<ListingActivityChanges key="changes" {...props} />)
  }

  return (
    <ActivityItem
      className={props.className}
      activityDescription={activityDescription}
      activityPersonas={[
        {
          text: activity.author.display_name,
          imageInitials: getActivityInitials(activity)
        }
      ]}
      timeStamp={activity.activity_date}
    />
  )
}

const ListingActivityListItems = observer((props: IListingActivityListProps) => {
  const _onRenderActivity = (item: IListingActivity, idx: number) => {
    if (item.action === ListingActivityAction.MODIFIED) {
      return (
        <ListingModifiedActivity
          className={ListingActivityListStylesheet.activity}
          key={idx}
          activity={item}
        />
      )
    }
    return (
      <ListingActivity
        className={ListingActivityListStylesheet.activity}
        key={idx}
        activity={item}
      />
    )
  }
  let content
  const activityViews = props.activityList.itemsView.map(_onRenderActivity)
  if (activityViews.length > 0) {
    content = activityViews
  } else {
    content = <MessageBar messageBarType={MessageBarType.info}>No Activities available</MessageBar>
  }
  return <div className={ListingActivityListStylesheet.activities}>{content}</div>
})

const ListingActivityListContainer = (props: IListingActivityListProps) => {
  useMount(() => {
    props.activityList.load()
  })
  const _onRenderDone = () => {
    return <ListingActivityListItems {...props} />
  }
  return (
    <SyncComponent
      sync={props.activityList.sync}
      onRenderDone={_onRenderDone}
      syncLabel="Loading Activity..."
    />
  )
}

interface IListingAppFrameProps extends IAppHostProps {
  listing: IListing
}

const ListingAppFrame = (props: IListingAppFrameProps) => {
  return <AppFrame host={props.host} src={props.listing.launch_url} />
}

interface IListingApprovalStatusProps {
  listing: IListing
}

const ListingApprovalStatusIcon = observer((props: IListingApprovalStatusProps) => {
  const theme = getTheme()
  const { listing } = props
  if (listing.approval_status === ListingApprovalStatusEnum.IN_PROGRESS) {
    return (
      <Icon
        iconName="ProgressRingDots"
        ariaLabel="In Progress"
        title="In Progress"
        styles={{ root: { color: DefaultPalette.blue } }}
      />
    )
  } else if (listing.approval_status === ListingApprovalStatusEnum.DELETED) {
    return (
      <Icon
        iconName="Delete"
        ariaLabel="Deleted"
        title="Deleted"
        styles={{ root: { color: theme.semanticColors.errorText } }}
      />
    )
  } else if (listing.approval_status === ListingApprovalStatusEnum.REJECTED) {
    return (
      <Icon
        iconName="Blocked"
        ariaLabel="Rejected"
        title="Rejected"
        styles={{ root: { color: theme.semanticColors.errorText } }}
      />
    )
  } else if (listing.approval_status === ListingApprovalStatusEnum.PENDING) {
    return (
      <Icon
        iconName="BuildQueue"
        ariaLabel="Pending"
        title="Pending"
        styles={{ root: { color: DefaultPalette.blue } }}
      />
    )
  } else if (listing.approval_status === ListingApprovalStatusEnum.APPROVED) {
    return (
      <Icon
        iconName="BoxCheckmarkSolid"
        ariaLabel="Approved"
        title="Approved"
        styles={{ root: { color: DefaultPalette.green } }}
      />
    )
  }
  return null
})

const getApprovalStatusText = (props) => {
  const { listing } = props as IListingApprovalStatusProps
  if (listing.approval_status === ListingApprovalStatusEnum.IN_PROGRESS) {
    return "In Progress"
  } else if (listing.approval_status === ListingApprovalStatusEnum.DELETED) {
    return "Deleted"
  } else if (listing.approval_status === ListingApprovalStatusEnum.REJECTED) {
    return "Rejected"
  } else if (listing.approval_status === ListingApprovalStatusEnum.PENDING) {
    return "Pending"
  } else if (listing.approval_status === ListingApprovalStatusEnum.APPROVED) {
    return "Approved"
  }
}

const ListingApprovalStatusComponent = (props: IListingApprovalStatusProps) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <ListingApprovalStatusIcon {...props} />
      <div style={{ marginLeft: 4 }}>{getApprovalStatusText(props)}</div>
    </div>
  )
}

interface IListingBannerIconProps {
  listing: IListing
}

const ListingBannerIcon = (props: IListingBannerIconProps) => {
  return (
    <Persona
      hidePersonaDetails
      text={props.listing.title}
      imageUrl={props.listing.banner_icon ? props.listing.banner_icon.url : undefined}
      size={PersonaSize.extraLarge}
    />
  )
}

interface IListingBookmarkButtonProps {
  listing: IListing
  bookmarkList: IListingBookmarkListModel
}

const ListingBookmarkButton = observer((props: IListingBookmarkButtonProps) => {
  useMount(() => {
    props.bookmarkList.load()
  })
  const _onClick = (e) => {
    e.stopPropagation()
    const { listing, bookmarkList } = props
    if (bookmarkList.isBookmarked(listing)) {
      bookmarkList.removeBookmark(listing)
    } else {
      bookmarkList.addBookmark(listing)
    }
  }

  const _onRenderSyncIcon = () => {
    return <Spinner size={SpinnerSize.small} />
  }

  if (ListingViewConfig.bookmarksEnabled) {
    const { listing, bookmarkList } = props
    const sync = bookmarkList.sync
    const syncing = sync.syncing && (sync.type !== "update" || sync.id === String(listing.id))
    const isBookmarked = bookmarkList.isBookmarked(listing)
    const title = syncing
      ? "Please wait..."
      : isBookmarked
      ? "Bookmarked - Click to Remove"
      : "Click to Set Bookmark"

    const ownProps: IButtonProps = {
      onClick: _onClick,
      title: title,
      primary: true,
      checked: isBookmarked ? true : false,
      iconProps: { iconName: isBookmarked ? "SingleBookmarkSolid" : "SingleBookmark" },
      disabled: syncing,
      ariaDescription: title,
      onRenderIcon: syncing ? _onRenderSyncIcon : undefined
    }

    return <IconButton {...ownProps} />
  }
  return null
})

const ListingFormStylesheet = mergeStyleSets({
  root: [
    "listing-form",
    {
      position: "relative",
      padding: 10
    }
  ],
  editor: ["listing-form-editor", {}],
  section: ["listing-form-section", {}],
  sectionTitle: [
    "listing-form-section-title",
    {
      fontSize: FontSizes.icon,
      margin: 0,
      paddingTop: 16,
      paddingBottom: 16
    }
  ],
  sectionBody: ["listing-form-section-body", {}],
  actions: [
    "listing-form-actions",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      selectors: {
        ".action+.action": {
          marginLeft: 8
        }
      }
    }
  ]
})

type IListingFormProps = {
  listing: IListingModel
  onCancel?: () => void
  onSave?: (listing: IListingModel) => void
  onSubmitForApproval?: (listing: IListingModel) => void
  className?: string
  onAfterUpload?: (props: IListingUploadProps) => void
}

type IListingFormSectionProps = {
  title: string
  className?: string
  titleClassName?: string
  bodyClassName?: string
}

type IListingFormContainerProps = {
  listing: IListingModel
  onSave?: (listing: IListingModel) => void
  onSubmitForApproval?: (listing: IListingModel) => void
  onCancel?: () => void
}

const ListingFormSection: React.FC<IListingFormSectionProps> = observer((props) => {
  return (
    <div className={props.className}>
      <h5 className={props.titleClassName}>{props.title}</h5>
      <div className={props.bodyClassName}>{props.children}</div>
    </div>
  )
})

const ListingImagesEditor = observer((props: IListingFormProps) => {
  var _onSmallIconChanged = (smallIcon: IImage) => {
    props.listing.setSmallIcon(smallIcon)
  }
  var _onLargeIconChanged = (largeIcon: IImage) => {
    props.listing.setLargeIcon(largeIcon)
  }
  var _onBannerIconChanged = (bannerIcon: IImage) => {
    props.listing.setBannerIcon(bannerIcon)
  }
  var _onLargeBannerIconChanged = (largeBannerIcon: IImage) => {
    props.listing.setLargeBannerIcon(largeBannerIcon)
  }
  const inputDisabled = props.listing.saveSync.syncing
  return (
    <div>
      <ImageField
        disabled={inputDisabled}
        onChange={_onSmallIconChanged}
        image={props.listing.small_icon}
        defaultSelectText="Select Small Icon..."
        label="Small Icon"
        width={16}
        height={16}
      />
      <ImageField
        disabled={inputDisabled}
        onChange={_onLargeIconChanged}
        image={props.listing.large_icon}
        defaultSelectText="Select Large Icon..."
        label="Large Icon"
        width={32}
        height={32}
      />
      <ImageField
        disabled={inputDisabled}
        onChange={_onBannerIconChanged}
        image={props.listing.banner_icon}
        defaultSelectText="Select Banner Icon..."
        label="Banner Icon"
        width={220}
        height={137}
      />
      <ImageField
        disabled={inputDisabled}
        onChange={_onLargeBannerIconChanged}
        image={props.listing.large_banner_icon}
        defaultSelectText="Select Large Banner Icon..."
        label="Large Banner Icon"
        width={1200}
        height={900}
      />
    </div>
  )
})

const ListingTypeSelector = observer((props: IListingFormProps) => {
  React.useEffect(() => {
    ListingTypeListStore.load()
  })

  var _onChange = (option: IDropdownOption, index: number) => {
    props.listing.setListingType(option.data)
  }

  const options: IDropdownOption[] = []
  if (ListingTypeListStore.sync.syncing) {
    options.push({
      key: "loading",
      text: "Loading Listing Types..."
    })
  } else {
    ListingTypeListStore.itemsView.forEach((t) => {
      options.push({
        key: String(t.title),
        text: t.title,
        data: t
      })
    })
  }
  const selectedKey = props.listing.listing_type ? props.listing.listing_type.title : undefined
  return (
    <Dropdown
      label="Listing Type"
      options={options}
      onChanged={_onChange}
      selectedKey={selectedKey}
      disabled={ListingTypeListStore.sync.syncing || props.listing.saveSync.syncing}
    />
  )
})

const ListingEditor = observer((props: IListingFormProps) => {
  const { listing } = props
  const inputDisabled = props.listing.saveSync.syncing
  const cbStyles: ICheckboxStyles = {
    root: {
      marginTop: 8
    }
  }
  const validationErrors = listing.validationErrors
  const approvalStatus = listing.approval_status
  return (
    <div className={ListingFormStylesheet.editor}>
      <BoundTextField
        label="Title"
        disabled={inputDisabled}
        required
        binding={{ target: listing, key: "title" }}
        errors={validationErrors}
      />
      <BoundTextField
        label="Unique Name"
        disabled={inputDisabled}
        required
        binding={{ target: listing, key: "unique_name" }}
        errors={validationErrors}
      />
      <BoundTextField
        label="Short Description"
        disabled={inputDisabled}
        required={approvalStatus !== ListingApprovalStatusEnum.IN_PROGRESS}
        binding={{ target: listing, key: "description_short" }}
        errors={validationErrors}
      />
      <BoundTextField
        label="Description"
        disabled={inputDisabled}
        multiline={true}
        rows={6}
        resizable={false}
        required={approvalStatus !== ListingApprovalStatusEnum.IN_PROGRESS}
        binding={{ target: listing, key: "description" }}
        errors={validationErrors}
      />
      <ListingTypeSelector {...props} />
      <BoundTextField
        label="Launch URL"
        disabled={inputDisabled}
        required={approvalStatus !== ListingApprovalStatusEnum.IN_PROGRESS}
        binding={{ target: listing, key: "launch_url" }}
        errors={validationErrors}
      />
      <BoundTextField
        label="Version"
        binding={{ target: listing, key: "version_name" }}
        disabled={inputDisabled}
        errors={validationErrors}
      />
      <BoundTextField
        label="Security"
        binding={{ target: listing, key: "security_marking" }}
        disabled={inputDisabled}
        errors={validationErrors}
      />
      <ListingCategorySelector {...props} />
      <ListingFormSection
        title="Images"
        className={ListingFormStylesheet.section}
        titleClassName={ListingFormStylesheet.sectionTitle}
        bodyClassName={ListingFormStylesheet.sectionBody}
      >
        <ListingImagesEditor {...props} />
      </ListingFormSection>
      <ListingFormSection
        title="Documents"
        className={ListingFormStylesheet.section}
        titleClassName={ListingFormStylesheet.sectionTitle}
        bodyClassName={ListingFormStylesheet.sectionBody}
      >
        <ListingLinkForm listing={listing} />
      </ListingFormSection>
      <ListingFormSection
        title="Settings"
        className={ListingFormStylesheet.section}
        titleClassName={ListingFormStylesheet.sectionTitle}
        bodyClassName={ListingFormStylesheet.sectionBody}
      >
        <BoundCheckbox
          binding={{ target: listing, key: "is_featured" }}
          label="Featured"
          disabled={inputDisabled}
          styles={cbStyles}
        />
        <BoundCheckbox
          binding={{ target: listing, key: "is_enabled" }}
          label="Enabled"
          disabled={inputDisabled}
          styles={cbStyles}
        />
        <BoundCheckbox
          binding={{ target: listing, key: "is_var" }}
          label="var"
          disabled={inputDisabled}
          styles={cbStyles}
        />
        <BoundCheckbox
          binding={{ target: listing, key: "iframe_compatible" }}
          label="Iframe Compatible"
          disabled={inputDisabled}
          styles={cbStyles}
        />
      </ListingFormSection>
    </div>
  )
})

const ListingSaveAction = observer((props: IListingFormProps) => {
  var _onClick = () => {
    props.onSave(props.listing)
  }
  var _onRenderSyncIcon = () => {
    return <Spinner size={SpinnerSize.small} />
  }

  const syncing = props.listing.saveSync.syncing
  const syncSave = props.listing.saveSync.type === "save"
  return (
    <PrimaryButton
      className="action save-action"
      onClick={_onClick}
      iconProps={syncing && syncSave ? undefined : { iconName: "Save" }}
      onRenderIcon={syncing && syncSave ? _onRenderSyncIcon : undefined}
      disabled={syncing}
    >
      {syncing && syncSave ? "Saving..." : "Save"}
    </PrimaryButton>
  )
})

const ListingSubmitAction = observer((props: IListingFormProps) => {
  var _onClick = () => {
    props.onSubmitForApproval(props.listing)
  }
  var _onRenderSyncIcon = () => {
    return <Spinner size={SpinnerSize.small} />
  }

  const { listing } = props
  if (listing.canSubmit) {
    const syncing = listing.saveSync.syncing
    const syncSubmit = listing.saveSync.type === "submit"
    return (
      <PrimaryButton
        className="action submit-action"
        onClick={_onClick}
        iconProps={syncing && syncSubmit ? undefined : { iconName: "WorkFlow" }}
        onRenderIcon={syncing && syncSubmit ? _onRenderSyncIcon : undefined}
        disabled={syncing}
        title="Submit for Approval"
      >
        {syncing && syncSubmit ? "Submitting for Approval..." : "Submit for Approval"}
      </PrimaryButton>
    )
  }
  return null
})

const ListingCancelAction = observer((props: IListingFormProps) => {
  var _onClick = () => {
    props.listing.reset()
    if (props.onCancel) {
      props.onCancel()
    }
  }

  return (
    <DefaultButton
      className="action cancel-action"
      onClick={_onClick}
      disabled={props.listing.saveSync.syncing}
    >
      Cancel
    </DefaultButton>
  )
})

const ListingForm = observer((props: IListingFormProps) => {
  return (
    <div className={ListingFormStylesheet.root}>
      <ValidationErrors errors={props.listing.validationErrors} />
      <ListingSyncError {...props} sync={props.listing.saveSync} />
      <SyncOverlay sync={props.listing.saveSync} syncLabel="Saving..." />
      <ListingUpload listing={props.listing} onAfterUpload={props.onAfterUpload} />
      <div style={{ marginTop: 8 }}>
        <ListingEditor {...props} />
      </div>
      <div className={ListingFormStylesheet.actions}>
        {props.onCancel ? <ListingCancelAction {...props} /> : undefined}
        {props.onSave ? <ListingSaveAction {...props} /> : undefined}
        {props.onSubmitForApproval ? <ListingSubmitAction {...props} /> : undefined}
      </div>
    </div>
  )
})

const ListingFormContainer = observer((props: IListingFormContainerProps) => {
  React.useEffect(() => {
    props.listing.load()
  })
  var _onRenderDone = () => {
    return (
      <ListingForm
        listing={props.listing}
        onCancel={props.onCancel}
        onSave={props.onSave}
        onSubmitForApproval={props.onSubmitForApproval}
      />
    )
  }
  return <SyncComponent sync={props.listing.loadSync} onRenderDone={_onRenderDone} />
})

interface IListingLaunchActionProps {
  listing: IListing
  onLaunch?: (listing: IListing) => void
}

const ListingLaunchAction = observer((props: IListingLaunchActionProps) => {
  const _onClick = (e) => {
    e.stopPropagation()
    props.onLaunch(props.listing)
  }

  if (props.onLaunch) {
    return (
      <IconButton
        onClick={_onClick}
        title={props.listing.title ? `Launch ${props.listing.title}` : "Launch"}
        iconProps={{ iconName: "OpenInNewWindow" }}
      />
    )
  }
  return null
})

interface IListingLaunchDialogProps {
  sync: IMutableSync<IListing>
}

const ListingLaunchDialog = observer((props: IListingLaunchDialogProps) => {
  const _onRenderError = (error: any, idx: number) => {
    return <div key={idx}>{error.message || error}</div>
  }
  const _onRenderErrors = () => {
    const error = props.sync.error
    let content
    if (error.errors) {
      content = error.errors.map(_onRenderError)
    } else {
      content = error.message
    }
    return <MessageBar messageBarType={MessageBarType.blocked}>{content}</MessageBar>
  }
  const _onDismiss = () => {
    props.sync.clear()
  }

  const { sync } = props
  const open = sync.syncing || sync.error ? true : false
  let title
  let content
  if (open) {
    const listing = sync.id
    title = listing.title
    content = sync.syncing ? (
      <SyncSpinner sync={sync} syncLabel={`Launching ${title}`} />
    ) : (
      _onRenderErrors()
    )
  }
  return (
    <Dialog
      hidden={!open}
      title={title}
      onDismiss={_onDismiss}
      dialogContentProps={{ type: DialogType.normal }}
    >
      {content}
      {sync.error && (
        <DialogFooter>
          <DefaultButton onClick={_onDismiss}>OK</DefaultButton>
        </DialogFooter>
      )}
    </Dialog>
  )
})

const ListingLinkFormStylesheet = mergeStyleSets({
  root: ["listing-link-form", {}],
  editor: [
    "listing-link-form-editor",
    {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center"
    }
  ],
  editors: [
    "listing-link-form-editors",
    {
      marginBottom: 8,
      selectors: {
        "$editor+$editor": {
          marginTop: 8
        }
      }
    }
  ],
  nameField: [
    "listing-link-form-name-field",
    {
      marginRight: 8,
      width: "30%"
    }
  ],
  urlField: [
    "listing-link-form-url-field",
    {
      marginLeft: 8,
      width: "50%"
    }
  ],
  removeAction: [
    "listing-link-form-remove-action",
    {
      marginLeft: 8
    }
  ],
  actions: ["listing-link-form-actions", {}]
})

interface IListingLinkEditorProps {
  listingLink: IListingLinkModel
  className?: string
}

const ListingLinkEditor = observer((props: IListingLinkEditorProps) => {
  const _onNameChanged = (e, value: string) => {
    props.listingLink.setName(value)
  }
  const _onUrlChanged = (e, value: string) => {
    props.listingLink.setUrl(value)
  }
  const _onClickRemove = () => {
    props.listingLink.removeFromListing()
  }
  const inputDisabled = props.listingLink.listing.saveSync.syncing
  const validationErrors = props.listingLink.validationErrors
  return (
    <div className={ListingLinkFormStylesheet.editor}>
      <div className={ListingLinkFormStylesheet.nameField}>
        <TextField
          //@ts-ignore
          onChange={_onNameChanged}
          value={props.listingLink.name || ""}
          disabled={inputDisabled}
          required
          errorMessage={getKeyErrorMessage("name", validationErrors)}
          placeholder="Name"
        />
      </div>
      <div className={ListingLinkFormStylesheet.urlField}>
        <TextField
          //@ts-ignore
          onChange={_onUrlChanged}
          value={props.listingLink.url || ""}
          disabled={inputDisabled}
          required
          errorMessage={getKeyErrorMessage("url", validationErrors)}
          placeholder="URL"
        />
      </div>
      <div className={ListingLinkFormStylesheet.removeAction}>
        <IconButton
          iconProps={{ iconName: "Delete" }}
          onClick={_onClickRemove}
          title="Remove Document"
        />
      </div>
    </div>
  )
})

interface IListingLinkFormProps {
  listing: IListingModel
  className?: string
}

const ListingLinkForm = observer((props: IListingLinkFormProps) => {
  const _onClickAdd = () => {
    props.listing.addLink()
  }

  const docs = props.listing.doc_urls
  let content

  if (docs && docs.length > 0) {
    const editors = docs.map((doc, idx) => {
      return <ListingLinkEditor key={idx} listingLink={doc} />
    })
    content = <div className={ListingLinkFormStylesheet.editors}>{editors}</div>
  }

  return (
    <div className={ListingLinkFormStylesheet.root}>
      {content}
      <div className={ListingLinkFormStylesheet.actions}>
        <DefaultButton onClick={_onClickAdd} iconProps={{ iconName: "Add" }}>
          Add Document
        </DefaultButton>
      </div>
    </div>
  )
})

interface IListingLinksProps {
  listing: IListingModel
}

const ListingLinks = observer((props: IListingLinksProps) => {
  const links = props.listing.doc_urls
  let content
  if (links && links.length > 0) {
    content = links.map((link) => {
      return (
        <div key={link.name + link.url}>
          <Link href={link.url} target={link.name}>
            {link.name}
          </Link>
        </div>
      )
    })
  } else {
    content = <MessageBar messageBarType={MessageBarType.info}>No Documents available</MessageBar>
  }
  return <div style={{ padding: 8 }}>{content}</div>
})

const createListingListStyles = (props) =>
  mergeStyleSets({
    root: [
      "listing-list",
      props.className,
      props.compact && {
        display: "flex",
        alignItems: "center"
      },
      props.wrapping && {
        flexWrap: "wrap"
      }
    ]
  })

interface IListingListProps {
  listings: IListing[]
  compact?: boolean
  wrapping?: boolean
  onRenderListing?: (listing: IListing, index?: number, props?: IListingListProps) => any
  onSelectItem?: (item: IListing) => void
  className?: string
  onRenderEmpty?: () => any
}

const defaultListingRenderer = (listing: IListing, index: number, props: IListingListProps) => {
  return <ListingTile key={listing.id} listing={listing} onClick={props.onSelectItem} />
}

const ListingList: FunctionalComponent<IListingListProps> = (props: IListingListProps) => {
  const _onRenderListing = (listing: IListing, index: number) => {
    const r = props.onRenderListing || defaultListingRenderer
    return r(listing, index, props)
  }

  if (props.listings && props.listings.length > 0) {
    const classNames = createListingListStyles(props)
    const items = props.listings.map(_onRenderListing)
    return <div className={classNames.root}>{items}</div>
  }
  return props.onRenderEmpty ? props.onRenderEmpty() : null
}

interface IListingListContainerProps {
  listings: IListingListModel
  compact?: boolean
  wrapping?: boolean
  onRenderListing?: (listing: IListing, index?: number, props?: IListingListProps) => JSX.Element
  onSelectItem?: (item: IListing) => void
}

const ListingListContainer = (props: IListingListContainerProps) => {
  React.useEffect(() => {
    props.listings.load()
  })
  var _onRenderDone = () => {
    return (
      <ListingList
        listings={props.listings.itemsView}
        onSelectItem={props.onSelectItem}
        onRenderListing={props.onRenderListing}
        compact={props.compact}
        wrapping={props.wrapping}
      />
    )
  }

  return (
    <SyncComponent
      sync={props.listings.sync}
      onRenderDone={_onRenderDone}
      syncLabel={`Loading ${ListingViewConfig.labelPlural}...`}
    />
  )
}

const ListingListPageStyles = mergeStyleSets({
  root: ["listing-list-page", {}],
  input: [
    "listing-list-page-input",
    {
      paddingTop: 8,
      paddingBottom: 0,
      paddingLeft: 16,
      paddingRight: 16
    }
  ],
  results: ["listing-list-page-results", {}]
})

interface IListingListPageProps extends IListingListContainerProps {
  className?: string
  onLaunch?: (listing: IListing) => void
}

const ListingListSearchInput = observer((props: IListingListPageProps) => {
  var _onSearchChange = (newValue: any) => {
    props.listings.setSearchText(newValue)
  }

  return (
    <div className={ListingListPageStyles.input}>
      <SearchBox
        value={props.listings.searchText}
        placeholder={`Search ${ListingViewConfig.labelPlural}`}
        onChange={_onSearchChange}
      />
    </div>
  )
})

const ListingListPage = observer((props: IListingListPageProps) => {
  const _onRenderItem = (listing, idx, props) => {
    return (
      <ListingTile
        key={listing.id}
        listing={listing}
        onClick={props.onSelectItem}
        onLaunch={props.onLaunch}
      />
    )
  }

  return (
    <div className={ListingListPageStyles.root}>
      <ListingListSearchInput {...props} />
      <div className={ListingListPageStyles.results}>
        <ListingListContainer {...props} onRenderListing={_onRenderItem} />
      </div>
    </div>
  )
})

const ListingReviewStyles = mergeStyleSets({
  root: [
    "listing-review",
    {
      marginBottom: 12
    }
  ],
  text: [
    "listing-review-text",
    {
      paddingTop: 4,
      paddingBottom: 4
    }
  ]
})

interface IListingReviewProps {
  review: IListingReview
  className?: string
}

const getReviewName = (activity: IListingReview): string => {
  return activity.author ? activity.author.display_name : ""
}

// const getReviewInitials = (activity: IListingReview): string => {
//   if (activity.author && activity.author.display_name) {
//     const items = split(activity.author.display_name, isWhitespace)
//     const letters = items.map((e) => {
//       return e.charAt(0).toUpperCase()
//     })
//     return letters.join("")
//   }
//   return ""
// }

const ListingReviewUser = (props: IListingReviewProps) => {
  var _onRenderContent = () => {
    return <UserInfo userProfile={props.review.author} />
  }
  var _onClickUser = () => {}

  return (
    <TooltipHost
      tooltipProps={{ onRenderContent: _onRenderContent }}
      calloutProps={{ gapSpace: 0 }}
    >
      <Link onClick={_onClickUser}>{getReviewName(props.review)}</Link>
    </TooltipHost>
  )
}

const ListingReview = (props: IListingReviewProps) => {
  const review = props.review
  return (
    <ActivityItem
      className={ListingReviewStyles.root}
      activityDescription={[
        <strong key="user">
          <ListingReviewUser {...props} />
        </strong>,
        <Rating key="rating" rating={review.rate} readOnly={true} />,
        <div key="text" className={ListingReviewStyles.text}>
          {review.text}
        </div>
      ]}
      activityPersonas={[
        {
          text: getReviewName(review),
          imageInitials: getActivityInitials(review)
        }
      ]}
      timeStamp={review.edited_date || review.created_date}
    />
  )
}

const ListingReviewFormStyles = mergeStyleSets({
  root: {
    boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.4)"
  },
  editor: {
    selectors: {
      ".rating": {
        padding: "4px 8px"
      },
      ".review": {
        padding: "4px 8px"
      }
    }
  },
  actions: {
    padding: "4px 8px",
    selectors: {
      ".ms-Button+.ms-Button": {
        marginLeft: 8
      }
    }
  }
})

interface IListingReviewFormProps {
  review: IListingReviewModel
  className?: string
  onAfterSave?: (review: IListingReviewModel) => void
  onCancel?: () => void
}

const ListingReviewEditor = observer((props: IListingReviewFormProps) => {
  const _onRatingChanged = (rating: number) => {
    props.review.setRate(rating)
  }
  const _onCommentsChanged = (e, text: string) => {
    props.review.setText(text)
  }
  return (
    <div className={props.className}>
      <div className="rating">
        <Rating
          min={1}
          max={5}
          onChanged={_onRatingChanged}
          rating={props.review.rate || null}
          disabled={props.review.sync.syncing}
        />
      </div>
      <div className="review">
        <TextField
          placeholder="Tell us what you think"
          multiline={true}
          resizable={false}
          //@ts-ignore
          onChange={_onCommentsChanged}
          disabled={props.review.sync.syncing}
        />
      </div>
    </div>
  )
})

const ListingReviewActions = observer((props: IListingReviewFormProps) => {
  const _onClickCancel = () => {
    if (props.onCancel) {
      props.onCancel()
    }
  }
  const _onClickSave = () => {
    props.review.save().then(() => {
      if (!props.review.sync.error && props.onAfterSave) {
        props.onAfterSave(props.review)
      }
    })
  }
  const savedDisabled =
    props.review.sync.syncing || props.review.rate === null || props.review.rate === undefined
  return (
    <div className={props.className}>
      <DefaultButton
        className="listing-review-action"
        onClick={_onClickCancel}
        disabled={props.review.sync.syncing}
      >
        Cancel
      </DefaultButton>
      <PrimaryButton
        className="listing-review-action"
        iconProps={{ iconName: "Save" }}
        onClick={_onClickSave}
        disabled={savedDisabled}
      >
        Save
      </PrimaryButton>
    </div>
  )
})

const ListingReviewForm = memo((props: IListingReviewFormProps) => {
  return (
    <div className={ListingReviewFormStyles.root}>
      <ListingReviewEditor {...props} className={ListingReviewFormStyles.editor} />
      <ListingReviewActions {...props} className={ListingReviewFormStyles.actions} />
    </div>
  )
})

const ListingReviewListStyles = mergeStyleSets({
  root: {},
  items: {
    padding: 8
  },
  addContainer: {
    margin: "16px 8px"
  }
})

interface IListingReviewListProps {
  reviewList: IListingReviewListModel
  className?: string
}

const ListingReviewListItems = observer((props: IListingReviewListProps) => {
  const { reviewList } = props
  let content
  if (reviewList.itemsView.length > 0) {
    content = reviewList.itemsView.map((item) => {
      return <ListingReview key={item.id} review={item} />
    })
  } else {
    content = <MessageBar messageBarType={MessageBarType.info}>No Reviews available</MessageBar>
  }
  return <div className={props.className}>{content}</div>
})

const ListingReviewAdd = observer((props: IListingReviewListProps) => {
  const _onCancel = () => {
    props.reviewList.cancelEdit()
  }
  const _onAfterSave = () => {
    props.reviewList.refresh()
  }
  const _onClickAdd = () => {
    props.reviewList.add()
  }
  let content
  if (props.reviewList.newReview) {
    content = (
      <ListingReviewForm
        review={props.reviewList.newReview}
        onCancel={_onCancel}
        onAfterSave={_onAfterSave}
      />
    )
  } else {
    content = (
      <DefaultButton onClick={_onClickAdd} iconProps={{ iconName: "Add" }}>
        Add Review
      </DefaultButton>
    )
  }

  return <div className={props.className}>{content}</div>
})

const ListingReviewAddContainer = (props: IListingReviewListProps) => {
  return <ListingReviewAdd {...props} />
}

const ListingReviewList = memo((props: IListingReviewListProps) => {
  return (
    <div className={ListingReviewListStyles.root}>
      <ListingReviewAddContainer {...props} className={ListingReviewListStyles.addContainer} />
      <ListingReviewListItems {...props} className={ListingReviewListStyles.items} />
    </div>
  )
})

const ListingReviewListContainer = memo((props: IListingReviewListProps) => {
  useMount(() => {
    props.reviewList.load()
  })
  const _onRenderDone = () => {
    return <ListingReviewList {...props} />
  }
  return (
    <SyncComponent
      sync={props.reviewList.sync}
      onRenderDone={_onRenderDone}
      syncLabel="Loading Reviews..."
    />
  )
})

const ListingCategorySelector = observer((props: IListingFormProps) => {
  React.useEffect(() => {
    CategoryListStore.load()
  })

  var _onChange = (option: IDropdownOption, index: number) => {
    if (option.selected) {
      props.listing.addCategory(option.data)
    } else {
      props.listing.removeCategory(option.data)
    }
  }

  const options: IDropdownOption[] = []
  if (CategoryListStore.sync.syncing) {
    options.push({
      key: "loading",
      text: "Loading Categories..."
    })
  } else {
    CategoryListStore.itemsView.forEach((c) => {
      options.push({
        key: String(c.title),
        text: c.title,
        data: c
      })
    })
  }
  const selectedKeys = props.listing.categories.map((c) => String(c.title))
  return (
    <Dropdown
      label="Categories"
      options={options}
      onChanged={_onChange}
      selectedKeys={selectedKeys}
      multiSelect
      disabled={CategoryListStore.sync.syncing || props.listing.saveSync.syncing}
    />
  )
})

type IListingSyncError = {
  sync: ISync<any>
  messagePrefix?: string
}

const ListingSyncError = observer((props: IListingSyncError) => {
  const { sync, messagePrefix } = props
  if (sync.error) {
    let message
    let detail
    if (sync.error.errors) {
      message = "Some values are invalid"
      detail = <pre>{JSON.stringify(sync.error.errors, null, "\t")}</pre>
    } else if (sync.error.response) {
      if (sync.error.response.data) {
        if (sync.error.response.data.message) {
          message = sync.error.response.data.message
          detail = sync.error.response.data.detail
        } else {
          detail = <pre>{JSON.stringify(sync.error.response.data, null, "\t")}</pre>
        }
      }
    } else if (sync.error.message) {
      message = sync.error.message
      detail = sync.error.detail
    } else {
      detail = <pre>{JSON.stringify(sync.error, null, "\t")}</pre>
    }

    return (
      <MessageBar messageBarType={MessageBarType.error} styles={{ root: { marginBottom: 8 } }}>
        {message && (
          <div>
            {messagePrefix || "An error has occurred"} - {message}
          </div>
        )}
        <div>{detail}</div>
      </MessageBar>
    )
  }
  return null
})

const ListingTileStylesheet = mergeStyleSets({
  root: [
    "listing-tile",
    {
      position: "relative",
      width: 220,
      minWidth: 220,
      maxWidth: 220,
      marginLeft: 16,
      marginTop: 16,
      marginBottom: 16,
      backgroundColor: DefaultPalette.white,
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
      transition: "box-shadow 0.5s",
      border: `1px solid ${DefaultPalette.neutralQuaternary}`,
      borderRadius: 4,
      selectors: {
        "&:hover": {
          boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)",
          selectors: {
            $top: {
              backgroundColor: DefaultPalette.neutralQuaternaryAlt
            }
          }
        },
        "&:focus": {
          boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)"
        }
      }
    }
  ],
  clickableRoot: [
    {
      cursor: "pointer"
    }
  ],
  top: [
    "listing-tile-top",
    {
      position: "relative",
      height: 150,
      minHeight: 150,
      transition: "background 0.25s",
      overflow: "hidden",
      backgroundColor: DefaultPalette.neutralLight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  ],
  banner: ["listing-tile-banner", {}],
  content: [
    "listing-tile-content",
    {
      position: "relative",
      height: 100,
      minHeight: 100,
      color: DefaultPalette.neutralPrimary,
      fontSize: FontSizes.medium
    }
  ],
  actions: [
    "listing-tile-actions",
    {
      position: "absolute",
      bottom: 0,
      right: 0,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end"
    }
  ],
  title: [
    "listing-tile-title",
    {
      fontWeight: FontWeights.semibold,
      fontSize: FontSizes.medium,
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 8,
      paddingRight: 8,
      marginTop: 0,
      marginBottom: 0
    }
  ],
  shortDescription: [
    "listing-tile-short-description",
    {
      fontWeight: FontWeights.semilight,
      overflow: "hidden",
      textOverflow: "clip",
      maxHeight: 60,
      paddingTop: 0,
      paddingRight: 8,
      paddingBottom: 2,
      paddingLeft: 8,
      marginTop: 0,
      marginBottom: 0
    }
  ],
  status: [
    "listing-title-status",
    {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 28,
      display: "flex",
      alignItems: "center",
      paddingLeft: 8
    }
  ]
})

interface IListingTileProps {
  listing: IListing
  onClick?: (listing: IListing) => void
  className?: string
  onLaunch?: (listing: IListing) => void
  hideStatus?: boolean
}

const ListingTile = (props: IListingTileProps) => {
  var _onClick = () => {
    props.onClick(props.listing)
  }
  var _renderBanner = () => {
    return (
      <div className={ListingTileStylesheet.banner}>
        <ListingBannerIcon listing={props.listing} />
      </div>
    )
  }
  var _renderTop = () => {
    return (
      <div className={ListingTileStylesheet.top}>
        {_renderStatus()}
        {_renderActions()}
        {_renderBanner()}
      </div>
    )
  }
  var _renderTitle = () => {
    return <h3 className={ListingTileStylesheet.title}>{props.listing.title}</h3>
  }
  var _renderShortDescription = () => {
    return (
      <h5 className={ListingTileStylesheet.shortDescription}>{props.listing.description_short}</h5>
    )
  }
  var _renderActions = () => {
    return (
      <div className={ListingTileStylesheet.actions}>
        <ListingBookmarkButton bookmarkList={ListingBookmarkListStore} listing={props.listing} />
        <ListingLaunchAction {...props} />
      </div>
    )
  }
  var _renderStatus = () => {
    if (!props.hideStatus) {
      return (
        <div className={ListingTileStylesheet.status}>
          <ListingApprovalStatusIcon listing={props.listing} />
        </div>
      )
    }
    return null
  }
  var _renderContent = () => {
    return (
      <div className={ListingTileStylesheet.content}>
        {_renderTitle()}
        {_renderShortDescription()}
      </div>
    )
  }

  return (
    <div
      className={ListingTileStylesheet.root}
      style={props.onClick && { cursor: "pointer" }}
      role={props.onClick ? "button" : undefined}
      onClick={props.onClick ? _onClick : undefined}
      title={props.listing.title ? `Open ${props.listing.title} Details` : "Open Details"}
    >
      {_renderTop()}
      {_renderContent()}
    </div>
  )
}

interface IListingUploadProps {
  listing: IListingModel
  className?: string
  theme?: ITheme
  onAfterUpload?: (props: IListingUploadProps) => void
}

const ListingUploadStylesheet = mergeStyleSets({
  root: [
    "package-upload-input",
    {
      position: "relative",
      height: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: DefaultPalette.neutralLight,
      borderRadius: 4,
      selectors: {
        "&.package-drag-over": {
          selectors: {
            $content: {
              backgroundColor: DefaultPalette.themeLight
            }
          }
        }
      }
    }
    //props.className
  ],
  content: [
    "package-upload-input-content",
    {
      position: "absolute",
      top: 8,
      right: 8,
      bottom: 8,
      left: 8,
      border: `1px dashed ${DefaultPalette.neutralTertiary}`,
      borderRadius: 4,
      backgroundColor: DefaultPalette.white,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      whiteSpace: "pre-wrap"
    }
  ]
})

const ListingUpload = observer((props: IListingUploadProps) => {
  var fileInputRef = React.useRef<HTMLInputElement>()

  var _upload = (file: File) => {
    const up = props.listing.upload(file)
    if (props.onAfterUpload) {
      up.then(() => {
        props.onAfterUpload(props)
      })
    }
  }
  var _onInputChange = (e) => {
    const fileList = fileInputRef.current.files
    if (fileList.length > 0) {
      // upload the file via the model
      _upload(fileList.item(0))
    }
  }

  var _onDragOver = (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  var _onDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files.item(0)
      _upload(file)
    }
  }

  var _onClickSelectPackage = (e) => {
    e.preventDefault()
    try {
      fileInputRef.current.click()
    } catch (e) {}
  }
  const { listing } = props

  return (
    <div className={ListingUploadStylesheet.root} onDragOver={_onDragOver} onDrop={_onDrop}>
      <input
        type="file"
        accept=".zip, .tar.gz, .tgz"
        onChange={_onInputChange}
        ref={fileInputRef}
        value=""
        hidden={true}
        style={{ display: "none" }}
        disabled={listing.saveSync.syncing}
      />
      {listing.saveSync.syncing && (
        <div className={ListingUploadStylesheet.content}>
          <Spinner size={SpinnerSize.small} />{" "}
          {listing.saveSync.type === "upload" ? " Uploading Package..." : " Saving Listing..."}
        </div>
      )}
      {!listing.saveSync.syncing && (
        <div className={ListingUploadStylesheet.content}>
          <Icon iconName="CloudUpload" /> Drop a package here or{" "}
          <Link onClick={_onClickSelectPackage}>select a package</Link>
        </div>
      )}
    </div>
  )
})

const UserListingsStylesheet = mergeStyleSets({
  root: ["user-listings", {}],
  list: [
    "user-listings-list",
    {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  ],
  listCell: [
    "user-listings-list-cell",
    {
      margin: 8
    }
  ]
})

type IUserListingsProps = {
  listingList: IListingListModel
  userProfile: IUserProfile
  onRenderCell?: (listing: IListing, index?: number, props?: IUserListingsProps) => JSX.Element
  onClickInfo?: (listing: IListing, e: MouseEvent) => void
  onLaunchApp?: (listing: IListing) => void
  className?: string
}

const UserListings = (props: IUserListingsProps) => {
  var _onRenderCell = (listing: IListing, index: number) => {
    return (
      <div key={listing.id} className={UserListingsStylesheet.listCell}>
        {(props.onRenderCell && props.onRenderCell(listing, index, props)) || (
          <ListingIconTile
            listing={listing}
            onClick={props.onLaunchApp}
            onClickInfo={props.onClickInfo}
          />
        )}
      </div>
    )
  }

  const listings = props.listingList.itemsView.filter((l) => {
    return l
  })

  const renderListing = () => {
    if (listings.length > 0) {
      return <div className={UserListingsStylesheet.list}>{listings.map(_onRenderCell)}</div>
    } else {
      return (
        <MessageBar messageBarType={MessageBarType.warning}>
          You don't have access to any {ListingViewConfig.labelPlural}
        </MessageBar>
      )
    }
  }

  return <div className={UserListingsStylesheet.root}>{renderListing()}</div>
}

const UserListingsContainer = (props: IUserListingsProps) => {
  React.useEffect(() => {
    props.listingList.load()
  })
  var _onRenderDone = () => {
    return <UserListings {...props} />
  }

  return <SyncComponent sync={props.listingList.sync} onRenderDone={_onRenderDone} />
}

// app support
type IUserAccountHostViewProps = {
  userProfile?: IUser["profile"]
  styles?: any
} & IHostAppViewProps

const UserAccountHostView: FunctionalComponent<IUserAccountHostViewProps> = observer((props) => {
  const farItems = []
  if (props.host.root && props.userProfile) {
    farItems.push(createUserProfileMenu(props.userProfile))
  }

  const commandBarProps = Object.assign({}, props.commandBarProps)
  commandBarProps.farItems = commandBarProps.farItems
    ? commandBarProps.farItems.concat(farItems)
    : farItems
  return (
    <HostAppView {...props} commandBarProps={commandBarProps}>
      {props.children}
    </HostAppView>
  )
})

type IListingScriptFrameProps = {
  listing: IListing
  defaultRequest?: IRequest
  userProfile?: IUser["profile"]
} & IAppHostProps

const ListingScriptFrame = memo((props: IListingScriptFrameProps) => {
  var _launchApp = (request) => {
    return props.host.open({
      path: ShopetteRouter.find.listingLaunch(props.listing.id),
      transient: request.transient,
      makeActive: request.makeActive,
      params: {
        defaultRequest: request
      }
    })
  }

  return (
    <ScriptFrame
      host={props.host}
      src={props.listing.launch_url}
      //launcher={_launchApp}
      //defaultRequest={props.defaultRequest}
      //userProfile={props.userProfile}
    />
  )
})

//apps

const ListingAddApp = observer((props: WithUserCredentialsProps) => {
  const __listing = React.useRef(new ListingModel())
  const _listing = __listing.current
  const host = props.match.host
  const userProfile = props.match.userProfile

  const _onAfterSave = (listing: IListingModel) => {
    host.load({ path: ShopetteRouter.find.listingDetails(listing.id) })
  }
  const _onSave = (listing: IListingModel) => {
    listing
      .save()
      .then(() => {
        _onAfterSave(listing)
      })
      .catch(() => {
        // we don't do anything here - the error should be reported on the model
      })
  }

  const _onSaveImmediate = () => {
    _onSave(_listing)
  }

  const _onCancel = () => {
    host.back()
  }

  const _onAfterUpload = (props) => {
    const { listing } = props
    // if the listing now has an id, then we'll head to the edit page for it
    if (!listing.saveSync.error && listing.id) {
      host.load({
        path: ShopetteRouter.find.listingEdit(listing.id),
        replace: true
      })
    }
  }

  useMount(() => {
    host.title = `Add ${ListingViewConfig.label}`
  })

  const items = []
  items.push(
    {
      key: "cancel",
      name: "Cancel",
      iconProps: {
        iconName: "Cancel"
      },
      onClick: _onCancel
    },
    {
      key: "save",
      name: "Save",
      iconProps: {
        iconName: "Save"
      },
      disabled: _listing.saveSync.syncing,
      onClick: _onSaveImmediate
    }
  )
  return (
    <UserAccountHostView host={host} userProfile={userProfile} commandBarProps={{ items: items }}>
      <ListingForm
        listing={_listing as any}
        onSave={_onSave}
        onCancel={_onCancel}
        onAfterUpload={_onAfterUpload}
      />
    </UserAccountHostView>
  )
})

const ListingApp = observer((props: WithUserCredentialsProps) => {
  const host = props.match.host
  const userProfile = props.match.userProfile
  const isAdmin = true
  const isOwner = true //return isOwner(listing, userProfile);

  var _titleSetDisposer: IReactionDisposer
  const _listing = React.useRef(new ListingModel())
  const listing = _listing.current

  const launchSync = host.getState("appLaunchSync", () => {
    return new Sync<IListing>()
  })

  const _onEdit = () => {
    host.load({ path: ShopetteRouter.find.listingEdit(listing.id) })
  }

  const _onDelete = () => {
    ListingDeleteStore.setValue(listing)
  }

  const _onLaunchApp = (listing: IListing) => {
    launchSync.syncStart({ id: listing })
    launch({
      host: host,
      userProfile: userProfile,
      listingId: listing.id,
      noReplace: true
    })
      .then((app) => {
        launchSync.syncEnd()
      })
      .catch((err) => {
        launchSync.syncError(err)
      })
  }
  const _onSubmit = () => {
    listing.submitForApproval()
  }
  const _onApprove = () => {
    listing.approve()
  }
  const _onReject = () => {
    listing.reject()
  }
  const _onRefresh = () => {
    listing.refresh()
  }

  const _onSelectCategory = (category) => {
    console.log("-- On Select Category: " + JSON.stringify(category))
  }

  const _setupListing = (props: WithUserCredentialsProps) => {
    const listingId = props.match.params.listingId
    listing.id = listingId
  }
  const _setTitleFromListing = () => {
    host.title = listing.title
  }

  useMount(() => {
    _setupListing(props)
    listing.load()
    _titleSetDisposer = autorun(() => {
      const loadSync = listing.loadSync
      if (loadSync.syncing) {
        host.title = "Loading..."
      } else if (loadSync.error) {
        host.title = "Error"
      } else {
        _setTitleFromListing()
      }
    })
  })

  React.useEffect(() => {
    _setupListing(props)
    return () => {
      if (_titleSetDisposer) {
        _titleSetDisposer()
        _titleSetDisposer = null
        //delete _titleSetDisposer
      }
    }
  })

  const items = []
  if (isAdmin || isOwner) {
    items.push(
      listingEditMenuItem({ listing: listing, onClick: _onEdit }),
      listingWorkflowSubmitMenuItem({
        listing: listing,
        onClick: _onSubmit
      })
    )
    if (isAdmin) {
      items.push(
        listingApproveMenuItem({
          listing: listing,
          onClick: _onApprove
        }),
        listingRejectMenuItem({
          listing: listing,
          onClick: _onReject
        }),
        listingDeleteMenuItem({
          listing: listing,
          onClick: _onDelete
        })
      )
    }
  }
  const farItems = [
    syncRefreshItem({
      sync: listing.loadSync,
      onClick: _onRefresh
    })
  ]
  return (
    <UserAccountHostView
      host={host}
      userProfile={userProfile}
      commandBarProps={{ items: items, farItems: farItems }}
    >
      <ListingLaunchDialog sync={launchSync as any} />
      <ListingDeleteDialog listingSupplier={ListingDeleteStore} />
      <ListingContainer
        listing={listing}
        onEdit={_onEdit}
        onDelete={_onDelete}
        onLaunch={_onLaunchApp}
        onSelectCategory={_onSelectCategory}
      />
    </UserAccountHostView>
  )
})

const ListingEditApp = observer((props: WithUserCredentialsProps) => {
  const host = props.match.host
  const userProfile = props.match.userProfile
  const isAdmin = true
  const isOwner = true //isOwner(listing, userProfile)
  var _titleSetDisposer: IReactionDisposer

  const _listing = React.useRef(new ListingModel())
  const listing = _listing.current

  const _setupListing = (props: WithUserCredentialsProps) => {
    const listingId = props.match.params.listingId
    listing.id = listingId
  }

  const _setTitleFromListing = () => {
    host.title = listing.title
  }

  useMount(() => {
    _setupListing(props)
    listing.load()
    _titleSetDisposer = autorun(() => {
      const loadSync = listing.loadSync

      if (loadSync.syncing) {
        host.title = "Loading..."
      } else if (loadSync.error) {
        host.title = "Error"
      } else {
        _setTitleFromListing()
      }
    })
  })

  React.useEffect(() => {
    _setupListing(props)
    return () => {
      if (_titleSetDisposer) {
        _titleSetDisposer()
        //delete _titleSetDisposer
      }
    }
  })

  const _onBack = () => {
    if (host.canGoBack) {
      host.back()
    } else {
      host.load({
        path: ShopetteRouter.find.listingDetails(listing.id)
      })
    }
  }
  const _onSaveDone = () => {
    if (!listing.saveSync.error) {
      _onBack()
    }
  }
  const _onSave = () => {
    listing.save().then(_onSaveDone)
  }
  const _onSubmitToWorkflowDone = () => {
    if (!listing.saveSync.error) {
      _onBack()
    }
  }
  const _onSubmitToWorkflow = () => {
    listing.submitForApproval().then(_onSubmitToWorkflowDone)
  }

  const items = []
  items.push(
    listingEditCancelMenuItem({
      listing: listing as any,
      onClick: _onBack
    }),
    listingSaveMenuItem({
      listing: listing as any,
      onClick: _onSave
    }),
    listingWorkflowSubmitMenuItem({
      listing: listing as any,
      onClick: _onSubmitToWorkflow
    })
  )
  const backFallback = {
    key: "backFallback",
    title: `Back to ${ListingViewConfig.label} Details`,
    iconProps: {
      iconName: "Back"
    },
    onClick: _onBack
  }
  return (
    <UserAccountHostView
      host={host}
      userProfile={userProfile}
      commandBarProps={{ items: items }}
      backFallback={backFallback}
    >
      <ListingFormContainer
        listing={listing as any}
        onSave={_onSave}
        onSubmitForApproval={_onSubmitToWorkflow}
        onCancel={_onBack}
      />
    </UserAccountHostView>
  )
})

const ListingListApp = observer((props: WithUserCredentialsProps) => {
  const host = props.match.host
  const userProfile = props.match.userProfile
  const searchText = props.match.params.search
  const category = props.match.params.category

  const launchSync = host.getState("appLaunchSync", () => {
    return new Sync<IListing>()
  })

  const listingSearch = host.getState("listingSearch", () => {
    return new ListingSearchModel()
  })

  const listings = host.getState("allListings", () => {
    return new ListingListModel()
  })

  const _onSelectItem = (listing: IListing) => {
    host.load({ path: ShopetteRouter.find.listingDetails(listing.id) })
  }

  const _onLaunchApp = (listing: IListing) => {
    launchSync.syncStart({ id: listing })
    launch({
      host: host,
      userProfile: userProfile,
      listingId: listing.id,
      noReplace: true
    })
      .then((app) => {
        launchSync.syncEnd()
      })
      .catch((err) => {
        launchSync.syncError(err)
      })
  }

  const _onAdd = () => {
    host.load({ path: ShopetteRouter.find.listingAdd() })
  }

  const _onOpenAllListings = () => {
    host.load({ path: ShopetteRouter.find.listings() })
  }

  const _onRefresh = () => {
    listingSearch.refresh()
  }

  useMount(() => {
    host.title = `${ListingViewConfig.storeLabel}`
    if (searchText || category) {
      listingSearch.setRequest({
        search: searchText,
        category: category
      })
    }
  })

  useMount(() => {
    host.title = `All ${ListingViewConfig.labelPlural}`
    // deliberately refresh here
    listings.load()
  })

  const items = [
    {
      key: "add",
      name: `Add ${ListingViewConfig.label}`,
      title: `Add a new ${ListingViewConfig.label}`,
      iconProps: {
        iconName: "Add"
      },
      onClick: _onAdd
    }
  ]
  const farItems = [
    {
      key: "listings",
      name: `All ${ListingViewConfig.labelPlural}`,
      iconProps: {
        iconName: "ViewList"
      },
      onClick: _onOpenAllListings
    },
    syncRefreshItem({
      sync: listings.sync,
      onClick: _onRefresh
    })
  ]

  return (
    <UserAccountHostView
      host={host}
      userProfile={userProfile}
      commandBarProps={{ items: items, farItems: farItems }}
    >
      <ListingLaunchDialog sync={launchSync as any} />
      <ListingListPage
        compact
        wrapping
        listings={listings}
        onSelectItem={_onSelectItem}
        onLaunch={_onLaunchApp}
      />
    </UserAccountHostView>
  )
})

const UserListingsApp = observer((props: WithUserCredentialsProps) => {
  const host = props.match.host
  const userProfile = props.match.userProfile
  const appViewStyles = {} as any
  const iconName = "Backlog"
  const listingList = ListingListStore

  const launchSync = host.getState("appLaunchSync", () => {
    return new Sync<IListing>()
  })

  useMount(() => {
    host.setTitle(`My ${ListingViewConfig.labelPlural}`)
    host.icon.name = iconName
  })

  // const _onLoadStore = () => {
  //   host.load({ path: ShopetteRouter.find.store() })
  // }
  const _onLoadAllListings = () => {
    host.load({ path: ShopetteRouter.find.listings() })
  }

  const _onLaunchApp = (listing: IListing) => {
    launchSync.syncStart({ id: listing })
    launch({
      host: host,
      userProfile: userProfile,
      listingId: listing.id
    })
      .then((app) => {
        launchSync.syncEnd()
      })
      .catch((err) => {
        launchSync.syncError(err)
      })
  }
  const _onRefreshList = () => {
    listingList.refresh()
  }
  const _onClickInfo = (listing: IListing) => {
    host.load({ path: ShopetteRouter.find.listingDetails(listing.id) })
  }

  const farItems = [
    {
      key: "listings",
      name: `All ${ListingViewConfig.labelPlural}`,
      iconProps: {
        iconName: "ViewList"
      },
      onClick: _onLoadAllListings
    },
    syncRefreshItem({
      sync: listingList.sync,
      onClick: _onRefreshList,
      title: `Refresh ${ListingViewConfig.labelPlural}`
    })
  ]

  return (
    <UserAccountHostView
      host={host}
      userProfile={userProfile}
      commandBarProps={{ items: [], farItems: farItems }}
      styles={appViewStyles}
    >
      <ListingLaunchDialog sync={launchSync as any} />
      <UserListingsContainer
        userProfile={userProfile}
        listingList={listingList as any}
        onLaunchApp={_onLaunchApp}
        onClickInfo={_onClickInfo}
      />
    </UserAccountHostView>
  )
})

/* -------------------------------------------------------------------------- */
/*                               listing launch                               */
/* -------------------------------------------------------------------------- */

interface ILaunchOptions {
  listingId: string | number
  userProfile: IUser["profile"]
  host: IAppHost
  noReplace?: boolean
  openNew?: boolean
}

const isExternalUrl = (launchUrl: string): boolean => {
  return launchUrl && launchUrl.indexOf("://") >= 0
}

const isExternalListing = (listing: IListing): boolean => {
  return listing ? isExternalUrl(listing.launch_url) : false
}

const isScriptListing = (listing: IListing): boolean => {
  return listing ? listing.launch_url && listing.launch_url.endsWith(".js") : false
}

// const isOwner = (listing: IListing, userProfile: IUser["profile"]) =>
//   listing && listing.owners && listing.owners.some((o) => o.id === userProfile.id)

const canUserAccess = (listing: IListing, userProfile: IUser["profile"]) => true

const validateLaunch = (
  listing: IListing,
  userProfile: IUser["profile"],
  errors: IError[],
  service: IListingService = ListingServiceContext.value
) => {
  if (!listing.is_enabled) {
    errors.push({
      code: "DISABLED",
      message: `${listing.title} is disabled`
    })
  }
  if (listing.is_deleted) {
    errors.push({
      code: "DELETED",
      message: `${listing.title} has been deleted`
    })
  }
  if (listing.approval_status !== ListingApprovalStatusEnum.APPROVED) {
    errors.push({
      code: "NOT_APPROVED",
      message: `${listing.title} has not been approved for use`
    })
  }

  if (!listing.launch_url) {
    errors.push({
      code: "NO_URL",
      message: `A URL is not configured for ${listing.title}`
    })
  }

  if (!canUserAccess(listing, userProfile)) {
    errors.push({
      code: "FORBIDDEN",
      message: `You don't have access to ${listing.title}`
    })
  }
}

const getValidatedLaunchListing = (
  opts: ILaunchOptions,
  service: IListingService = ListingServiceContext.value
): Promise<IListing> => {
  const { host, listingId, userProfile } = opts
  const validated: IListing = host.state.launchValidatedListing
  if (validated && String(validated.id) === String(listingId)) {
    // clear the validated listing state
    host.setState({ launchValidatedListing: null })
    return Promise.resolve(validated)
  }
  return service.getListing({ listingId: listingId }).then((app) => {
    const errors: IError[] = []
    validateLaunch(app, userProfile, errors)
    if (errors.length > 0) {
      return Promise.reject({ app: app, errors: errors })
    }
    return Promise.resolve(app)
  })
}

const launch = (
  opts: ILaunchOptions,
  service: IListingService = ListingServiceContext.value
): Promise<any> => {
  const { host, noReplace, openNew } = opts
  return getValidatedLaunchListing(opts, service).then((app) => {
    if (isExternalListing(app) && !app.iframe_compatible) {
      openAppWindow(app)
    } else {
      host.setState({
        launchValidatedListing: app
      })
      if (openNew) {
        return host.open({
          path: ShopetteRouter.find.listingLaunch(app.id)
        })
      }
      return host.load({
        path: ShopetteRouter.find.listingLaunch(app.id),
        replace: !host.root && !noReplace
      })
    }
  })
}

const openAppWindow = (app: IListing) => window.open(app.launch_url)

const launchHandler = (request: IRequest) => {
  const host = request.host as IAppHost
  const userProfile = request.userProfile as IUser["profile"]
  const listingId = request.params.listingId
  if (!listingId) {
    throw {
      code: "INVALID_PARAMETER",
      key: "listingId",
      message: "A listing id must be specified"
    }
  }
  return getValidatedLaunchListing({
    host: host,
    userProfile: userProfile,
    listingId: listingId
  })
    .then((app) => {
      host.title = app.title
      host.icon.text = app.title
      host.icon.url = app.small_icon && app.small_icon.url ? app.small_icon.url : undefined

      if (isScriptListing(app)) {
        return (
          <HostAppView host={host}>
            <ListingScriptFrame
              listing={app}
              host={host}
              defaultRequest={request.params.defaultRequest}
              userProfile={request.userProfile}
            />
          </HostAppView>
        )
      }

      if (isExternalListing(app)) {
        if (app.iframe_compatible) {
          return (
            <HostAppView host={host}>
              <AppFrame host={host} src={app.launch_url} />
              <ListingAppFrame listing={app as any} host={host} />
            </HostAppView>
          )
        }
        openAppWindow(app)
        return (
          <HostAppView host={host} hideBackNavigation>
            <MessageBar messageBarType={MessageBarType.info}>
              <strong>{app.title}</strong> has been opened in a new Browser Window, as it does not
              support IFrames.
            </MessageBar>
          </HostAppView>
        )
      }

      return host.load({ path: app.launch_url, replace: true, noUpdate: true })
    })
    .catch((err) => {
      console.log("-- Launch Error: " + JSON.stringify(err))
      const app = err.app
      if (app) {
        host.title = `Error launching ${app.title}`
        host.icon.text = app.title
        host.icon.url = app.small_icon && app.small_icon.url ? app.small_icon.url : undefined
      } else {
        host.title === "Error launching"
      }
      const errors = err.errors ? err.errors : [err.message]
      return (
        <HostAppView host={host}>
          <MessageBar messageBarType={MessageBarType.blocked}>
            {errors.map((e, idx) => (
              <div key={idx}>{e.message}</div>
            ))}
          </MessageBar>
        </HostAppView>
      )
    })
}

const createPaths = (basePath: string = "") => {
  return {
    listings() {
      return `${basePath}/listings`
    },
    listingAdd() {
      return `${basePath}/listings/add`
    },
    listingDetails(listingId: string | number) {
      return `${basePath}/listings/${encodeURIComponent(String(listingId))}`
    },
    listingLaunch(listingId: string | number): string {
      return `${basePath}/listings/${encodeURIComponent(String(listingId))}/launch`
    },
    listingEdit(listingId: string | number): string {
      return `${basePath}/listings/${encodeURIComponent(String(listingId))}/edit`
    },
    userListings() {
      return `${basePath}/listings/user`
    }
  }
}

const createShopetteRouter = (basePath: string) => {
  const r = new Router()

  r.use(`${basePath}/listings`, resolveReact(ListingListApp))
  r.use(`${basePath}/listings/user`, resolveReact(UserListingsApp))
  r.use(`${basePath}/listings/add`, resolveReact(ListingAddApp))
  r.use(`${basePath}/listings/:listingId`, resolveReact(ListingApp))
  r.use(`${basePath}/listings/:listingId/launch`, exactPath(launchHandler))
  r.use(`${basePath}/listings/:listingId/edit`, resolveReact(ListingEditApp))

  /** encodes the uri to perform a uri path lookup with the router */
  let find = createPaths(basePath)

  return Object.assign(r, { find: find })
}

const ShopetteRouter = createShopetteRouter("/appstore")

export {
  ListingService,
  ListingApprovalStatusEnum,
  ListingServiceContext,
  ListingViewConfig,
  ShopetteRouter
}
