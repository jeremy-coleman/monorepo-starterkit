import { IStateManager } from "./app"
import { ISync, ISyncSupplier } from "./io"
import { IListModel } from "./list"
import { IUserProfile } from "./user"
import { IError } from "./ui"

export type IListingApprovalStatus = "IN_PROGRESS" | "PENDING" | "APPROVED_ORG" | "APPROVED" | "REJECTED" | "DELETED" | "PENDING_DELETION"

export type IListingActivityAction =
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

export interface ITag {
  id?: number
  name?: string
}

export interface IListingUserAccess {
  (listing: IListing, userProfile: IUserProfile): boolean
}

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

export interface IListingUploadResult {
  source?: IPackageSource
  package?: IPackage
  listing_props?: IListing
  listing?: IListing
}

export interface IListingType {
  title?: string
  description?: string
}

export interface IListingStoreFront {
  featured?: IListing[]
  most_popular?: IListing[]
  recent?: IListing[]
  recommended?: IListing[]
}

export interface IListingSearchRequest {
  search?: string
  category?: string[]
  offset?: number
  limit?: number
}

export interface IListingSearchModel extends IListModel<IListing>, IListingSearchRequest {
  sync: ISync
  setSearch(search: string): void
  setCategory(category: string[]): void
  setRequest(params: IListingSearchRequest): void
}

export interface IListingReviewModel extends IListingReview {
  sync: ISync
  setText(text: string): void
  setRate(rate: number): void
  save(): Promise<any>
}

export interface IListingReviewListModel extends IListingRelatedListModel<IListingReview> {
  newReview: IListingReviewModel
  add(): void
  cancelEdit(): void
}

export interface IListingReview {
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

export interface IListingRelatedListModel<T> extends IListModel<T> {
  listing: IListingModel
}

export interface IListingModelSupplier extends ISyncSupplier<IListingModel> {
  listingId: string | number
}

export interface IListingListModel extends IListModel<IListing> {
  searchText: string
  setSearchText(searchText: string): void
  counts: IListingListCounts
}

export interface IListingListOrgCounts {
  [key: string]: number
}

export interface IListingListCounts {
  total?: number
  enabled?: number
  organizations?: IListingListOrgCounts
  [key: string]: any
}

export interface IListingLinkModel extends IListingLink {
  validationErrors: IError[]
  listing: IListingModel
  data: IListingLink
  valid: boolean
  setName(name: string): void
  setUrl(url: string): void
  validate(): void
  removeFromListing(): void
  setData(data: IListingLink): void
}

export interface IListingLink {
  name?: string
  url?: string
}

export interface IListingFeedback {
  id: number
  feedback: number
}

export interface IListingBookmarkModel extends IListingBookmark {
  bookmarks: IListingBookmarkListModel
  launchSync: ISync
  data: IListingBookmark
  setData(data: IListingBookmark): void
  launch(): Promise<any>
  remove(): void
}

export interface IListingBookmarkListModel extends IListModel<IListingBookmark> {
  isBookmarked(listing: IListing): boolean
  addBookmark(listing: IListing): void
  removeBookmark(listing: IListing): void
}

export interface IListingBookmark {
  id?: number
  folder?: string
  position?: number
  listing?: IListing
}

export interface IListingActivityListModel extends IListingRelatedListModel<IListingActivity> {}

export interface IListingChange {
  id?: number
  field_name?: string
  old_value?: string
  new_value?: string
}

export interface IListingActivity {
  action?: IListingActivityAction
  activity_date?: string
  description?: string
  author?: IUserProfile
  listing?: IListing
  change_details?: IListingChange[]
}

export interface ICategory {
  id?: number
  title?: string
  description?: string
}

export interface IListing {
  id?: number | string
  unique_name?: string
  title?: string
  description?: string
  description_short?: string
  is_enabled?: boolean
  is_featured?: boolean
  is_private?: boolean
  launch_url?: string
  security_marking?: string
  owners?: IUserProfile[]
  categories?: ICategory[]
  listing_type?: IListingType
  tags?: ITag[]
  version_name?: string
  small_icon?: IImage
  large_icon?: IImage
  banner_icon?: IImage
  large_banner_icon?: IImage
  approval_status?: IListingApprovalStatus
  requirements?: string
  what_is_new?: string
  screenshots?: IScreenShot[]
  is_bookmarked?: boolean
  is_deleted?: boolean
  avg_rate?: number
  total_votes?: number
  total_rate5?: number
  total_rate4?: number
  total_rate3?: number
  total_rate2?: number
  total_rate1?: number
  total_reviews?: number
  total_review_responses?: number
  feedback_score?: number
  doc_urls?: IListingLink[]
  iframe_compatible?: boolean
}

export interface IScreenShot {
  order?: number
  small_image?: IImage
  large_image?: IImage
  description?: string
}

export interface IListingByIdRequest {
  listingId: string | number
}

export interface IListingRequest extends IListingByIdRequest {}

export interface IListingListRequest extends IListingSearchRequest {
  ordering?: string
}

export interface IListingListResponse {
  listings?: IListing[]
  counts?: IListingListCounts
}

export interface IListingReviewListRequest extends IListingByIdRequest {
  offset?: number
  limit?: number
  ordering?: string
}

export interface IListingReviewRequest extends IListingByIdRequest {
  reviewId: number
}

export interface IListingFeedbackListRequest extends IListingByIdRequest {
  offset?: number
  limit?: number
}

export interface IListingUploadRequest {
  listingId?: number
  file: File
}

export interface IListingService {
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

export interface IGetImagesRequest {
  offset?: number
  limit?: number
}

export interface IImageService {
  getImageUrl(request: IImage): string
  getImages(request: IGetImagesRequest): Promise<IImage[]>
  saveImage(request: IImage): Promise<IImage>
  deleteImage(request: IImage): Promise<any>
}

export interface IImage {
  id?: number
  url?: string
  security_marking?: string
  image_type?: string
  [key: string]: any
}

export interface ICategoryGetRequest {
  categoryId: number | string
}

export interface ICategoryListRequest {
  offset?: number
  limit?: number
  title?: string
}

export interface ICategoryService {
  getCategory(request: ICategoryGetRequest): Promise<ICategory>
  getCategories(request?: ICategoryListRequest): Promise<ICategory[]>
  saveCategory(category: ICategory): Promise<ICategory>
  deleteCategory(category: ICategory): Promise<any>
}

export interface IListingModel extends IListing, IStateManager {
  validationErrors: IError[]
  valid: boolean
  loadSync: ISync
  saveSync: ISync
  state: any
  doc_urls: IListingLinkModel[]
  data: IListing
  canSubmit: boolean
  setUniqueName(uniqueName: string): void
  setTitle(title: string): void
  setDescription(description: string): void
  setShortDescription(shortDescription: string): void
  setEnabled(enabled: boolean): void
  setFeatured(featured: boolean): void
  setPrivate(prv: boolean): void
  setLaunchUrl(url: string): void
  setSecurityMarking(securityMarking: string): void
  setVersionName(version: string): void
  setApprovalStatus(status: IListingApprovalStatus): void
  setSmallIcon(smallIcon: IImage): void
  setLargeIcon(largeIcon: IImage): void
  setBannerIcon(bannerIcon: IImage): void
  setLargeBannerIcon(largeBannerIcon: IImage): void
  setCategories(categories: ICategory[]): void
  addCategory(category: ICategory): void
  removeCategory(category: ICategory): void
  setListingType(listingType: IListingType): void
  submitForApproval(): Promise<any>
  approve(): Promise<any>
  reject(): Promise<any>
  save(): Promise<any>
  delete(): Promise<any>
  reset(): void
  addLink(): void
  removeLink(link: IListingLinkModel): void
  enable(): Promise<any>
  disable(): Promise<any>
  savedEnabled(enabled: boolean): Promise<any>
  saveFeatured(featured: boolean): Promise<any>
  saveIframeCompatible(iframeCompatible: boolean): Promise<any>
  setIframeCompatible(iframeCompatible: boolean): void
  setData(data: IListing): void
  upload(file: File): Promise<any>
  refresh(): Promise<any>
  load(): Promise<any>
}
