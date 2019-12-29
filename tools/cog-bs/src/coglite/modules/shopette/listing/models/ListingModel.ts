
import {
  ICategory,
  IError,
  IImage,
  IListing,
  IListingModel,
  IListingService,
  IListingType,
  IListingUploadResult,
  IScreenShot,
  IUserProfile
} from "coglite/types"
import { action, computed, observable } from "mobx"

import { ListingApprovalStatus } from "../constants"
import { ImageServiceContext, ListingServiceContext } from "../services"
import { ListingLinkModel } from "./ListingLinkModel"
import { StateManager } from "coglite/shared/models/StateManager"
import { Sync, ISyncStartOptions } from "coglite/shared/models/Sync"
import { wordsToCamelCase, isBlank } from "coglite/shared/util"

const Defaults = {
  requirements: "None",
  what_is_new: "Nothing"
}

class ListingModel extends StateManager implements IListingModel {
  private _lastData: IListing
  @observable validationErrors: IError[] = []
  @observable loadSync = new Sync()
  @observable saveSync = new Sync()
  @observable uploadSync = new Sync()
  private _lastLoadedId: number
  @observable private _id: number
  @observable private _title: string
  @observable private _unique_name: string
  @observable private _description: string
  @observable private _description_short: string
  @observable private _is_enabled: boolean = true
  @observable private _is_featured: boolean = false
  @observable private _is_private: boolean = false
  @observable private _launch_url: string
  @observable private _security_marking: string
  @observable owners: IUserProfile[] = []
  @observable private _version_name: string
  @observable private _approval_status: ListingApprovalStatus
  @observable private _small_icon: IImage
  @observable private _large_icon: IImage
  @observable private _banner_icon: IImage
  @observable private _large_banner_icon: IImage
  @observable private _requirements: string
  @observable private _what_is_new: string
  @observable screenshots: IScreenShot[] = []
  @observable private _is_bookmarked: boolean
  @observable private _is_deleted: boolean
  @observable private _avg_rate: number
  @observable private _total_votes: number
  @observable private _total_rate5: number
  @observable private _total_rate4: number
  @observable private _total_rate3: number
  @observable private _total_rate2: number
  @observable private _total_rate1: number
  @observable private _total_reviews: number
  @observable private _total_review_responses: number
  @observable private _feedback_score: number
  @observable doc_urls: ListingLinkModel[] = []
  @observable categories: ICategory[] = []
  @observable private _listing_type: IListingType
  @observable private _iframe_compatible: boolean = true
  private _listingService: IListingService

  constructor(data?: IListing) {
    super()
    if (data) {
      this.setData(data)
    }
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
  setData(data: IListing) {
    this._lastData = data
     //@ts-ignore
    this._id = data ? data.id : undefined
    this._title = data ? data.title : undefined
    this._unique_name = data ? data.unique_name : undefined
    this._description = data ? data.description : undefined
    this._description_short = data ? data.description_short : undefined
    this._is_enabled = data ? data.is_enabled : true
    this._is_featured = data ? data.is_featured : false
    this._is_private = data ? data.is_private : false
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
    this._iframe_compatible = data && data.iframe_compatible !== undefined ? data.iframe_compatible : true
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
    this.doc_urls = data && data.doc_urls ? data.doc_urls.map((i) => new ListingLinkModel(this, i)) : []
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
    return this._approval_status || ListingApprovalStatus.IN_PROGRESS
  }
  set approval_status(value) {
    this.setApprovalStatus(value)
  }
  @action
  setApprovalStatus(approvalStatus: ListingApprovalStatus) {
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
      const idx = this.categories.findIndex((c) => c.id === category.id || c.title === category.title)
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
  private _onSaveDone = (data: IListing) => {
    this.setData(data)
    this.saveSync.syncEnd()
  }

  @action
  private _onSyncError = (error) => {
    this.saveSync.syncError(error)
  }

  private _saveImage(image: IImage, imageType: string): Promise<IImage> {
    const imageForSave = Object.assign({ image_type: imageType, security_marking: "UNCLASSIFIED" }, image)
    return ImageServiceContext.value.saveImage(imageForSave).then((saved) => {
      const r = Object.assign({}, saved, imageForSave, {
        url: ImageServiceContext.value.getImageUrl({ id: saved.id })
      })
      delete r.file
      return r
    })
  }

  @action
  private _saveSmallIcon(): Promise<any> {
    return this.small_icon && this.small_icon.file
      ? this._saveImage(this.small_icon, "small_icon").then((image) => {
          this.setSmallIcon(image)
        })
      : Promise.resolve()
  }

  @action
  private _saveLargeIcon(): Promise<any> {
    return this.large_icon && this.large_icon.file
      ? this._saveImage(this.large_icon, "large_icon").then((image) => {
          this.setLargeIcon(image)
        })
      : Promise.resolve()
  }

  @action
  private _saveBannerIcon(): Promise<any> {
    return this.banner_icon && this.banner_icon.file
      ? this._saveImage(this.banner_icon, "banner_icon").then((image) => {
          this.setBannerIcon(image)
        })
      : Promise.resolve()
  }

  @action
  private _saveLargeBannerIcon(): Promise<any> {
    return this.large_banner_icon && this.large_banner_icon.file
      ? this._saveImage(this.large_banner_icon, "large_banner_icon").then((image) => {
          this.setLargeBannerIcon(image)
        })
      : Promise.resolve()
  }

  @action
  private _saveImages() {
    return Promise.all([this._saveSmallIcon(), this._saveLargeIcon(), this._saveBannerIcon(), this._saveLargeBannerIcon()]).catch(
      (error) => {
        return Promise.reject({
          message: `Unable to save images - ${error.message}`,
          cause: error
        })
      }
    )
  }

  @action
  approve() {
    return this._saveInternal("approve", ListingApprovalStatus.APPROVED)
  }

  @action
  reject() {
    return this._saveInternal("reject", ListingApprovalStatus.REJECTED)
  }

  @computed
  get canSubmit() {
    if (this.approval_status === ListingApprovalStatus.IN_PROGRESS || this.approval_status === ListingApprovalStatus.REJECTED) {
      const validationErrors: IError[] = []
      this._validateDetails(ListingApprovalStatus.PENDING, validationErrors)
      return validationErrors.length === 0
    }
    return false
  }

  @action
  submitForApproval() {
    return this._saveInternal("submit", ListingApprovalStatus.PENDING)
  }

  private _onDeleteDone = () => {
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

  private _validateDetails(approvalStatus: ListingApprovalStatus, validationErrors: IError[]) {
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
    if (approvalStatus !== ListingApprovalStatus.IN_PROGRESS) {
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
  validate(approvalStatus: ListingApprovalStatus) {
    this.validationErrors = []
    this._validateDetails(approvalStatus, this.validationErrors)
    // validate each doc url
    if (this.doc_urls) {
      this.doc_urls.forEach((doc) => doc.validate())
    }
  }

  @action
  private _saveDetails(updated?: IListing) {
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
  private _saveInternal(type: ISyncStartOptions["type"], approvalStatus: ListingApprovalStatus) {
    this.validate(approvalStatus)
    if (!this.valid) {
      return Promise.reject({
        code: "VALIDATION_ERROR",
        errors: this.validationErrors.slice(0)
      })
    }
    this.saveSync.syncStart({ type: type })
    return this._saveImages()
      .then(() => {
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
    return this._requirements || Defaults.requirements
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
    return this._what_is_new || Defaults.what_is_new
  }
  set what_is_new(value) {
    this.setWhatIsNew(value)
  }
  @action
  setWhatIsNew(whatIsNew: string) {
    this._what_is_new = whatIsNew
  }

  private _onUploadDone = (result: IListingUploadResult) => {
    this.setData(result.listing)
    this.saveSync.syncEnd()
  }

  private _onUploadError = (error: any) => {
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

  private _onLoadDone = (listing: IListing) => {
    this.setData(listing)
    this.loadSync.syncEnd()
  }

  private _onLoadError = (error: any) => {
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

export { ListingModel as default, ListingModel }
