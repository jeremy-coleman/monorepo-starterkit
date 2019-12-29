import { Context } from "coglite/shared/services"
import {
  IBasicAuthCredentials,
  IListing,
  IListingActivity,
  IListingBookmark,
  IListingFeedback,
  IListingFeedbackListRequest,
  IListingListCounts,
  IListingListRequest,
  IListingListResponse,
  IListingRequest,
  IListingReview,
  IListingReviewListRequest,
  IListingReviewRequest,
  IListingSearchRequest,
  IListingService,
  IListingStoreFront,
  IListingType,
  IListingUploadRequest,
  IListingUploadResult
} from "coglite/types"

import { MockUserProfile } from "coglite/modules/user"

import axios from "libs/axios"

import { ListingActivityAction, ListingApprovalStatus } from "../constants"

const handleError = (error: any) => {
  if (error.response && error.response.status === 400) {
    return Promise.reject({
      message: error.message,
      status: error.response.status,
      code: "BAD_REQUEST",
      errors: error.response.data
    })
  }
  return Promise.reject(error)
}

const Defaults = {
  baseUrl: "/api",
  auth: undefined
}

class RestListingService implements IListingService {
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
  getListing(request: IListingRequest) {
    return axios.get<IListing>(`${this.baseUrl}/listing/${request.listingId}/`, { auth: this.auth }).then((ar) => {
      return ar.data as IListing
    })
  }
  getListings(request?: IListingListRequest) {
    return axios.get<IListingListResponse>(`${this.baseUrl}/listing/`, { params: request, auth: this.auth }).then((value) => {
      const r = value.data as any[]
      if (r && r.length > 0) {
        // the last record is the count
        const counts: IListingListCounts = r[r.length - 1]
        const listings: IListing[] = r.slice(0, r.length - 1)
        return { listings: listings, counts: counts }
      }
      return { listings: [], counts: { total: 0 } }
    })
  }
  searchListings(request?: IListingSearchRequest) {
    const params = Object.assign({}, request)
    if (!params.search) {
      delete params.search
    }
    if (!params.category || params.category.length === 0) {
      delete params.category
    }
    return axios
      .get<IListing[]>(`${this.baseUrl}/listings/search/`, {
        params: params,
        auth: this.auth
      })
      .then((ar) => {
        return ar.data
      })
  }
  saveListing(request: IListing) {
    const p = request.id
      ? axios.put<IListing>(`${this.baseUrl}/listing/${request.id}/`, request, {
          auth: this.auth
        })
      : axios.post<IListing>(`${this.baseUrl}/listing/`, request, { auth: this.auth })
    return p
      .then((ar) => {
        return ar.data
      })
      .catch(handleError)
  }
  deleteListing(request: IListing) {
    return axios
      .delete(`${this.baseUrl}/listing/${request.id}/`, { auth: this.auth })
      .then((ar) => {
        return ar.data
      })
      .catch(handleError)
  }
  getBookmarkedListings() {
    return axios.get<IListingBookmark[]>(`${this.baseUrl}/self/library/`, { auth: this.auth }).then((ar) => {
      return ar.data as IListingBookmark[]
    })
  }
  addBookmark(request: IListingBookmark) {
    return axios.post<IListingBookmark>(`${this.baseUrl}/self/library/`, request, { auth: this.auth }).then((ar) => {
      return ar.data as IListingBookmark
    })
  }
  removeBookmark(request: IListingBookmark) {
    return axios
      .delete(`${this.baseUrl}/self/library/${request.id}/`, {
        auth: this.auth
      })
      .then(() => {
        return request
      })
  }
  getStoreFront() {
    return axios.get<IListingStoreFront>(`${this.baseUrl}/storefront/`, { auth: this.auth }).then((ar) => {
      return ar.data as IListingStoreFront
    })
  }

  getListingReviews(request: IListingReviewListRequest): Promise<IListingReview[]> {
    let params
    if (request.limit !== undefined || request.offset !== undefined || request.ordering !== undefined) {
      params = Object.assign({}, request)
      delete params.listingId
    }
    return axios
      .get<IListingReview[]>(`${this.baseUrl}/listing/${request.listingId}/review/`, {
        params: params,
        auth: this.auth
      })
      .then((ar) => {
        return ar.data as IListingReview[]
      })
  }
  getListingReview(request: IListingReviewRequest) {
    return axios
      .get<IListingReview>(`${this.baseUrl}/listing/${request.listingId}/review/${request.reviewId}/`, { auth: this.auth })
      .then((ar) => {
        return ar.data
      })
  }
  deleteListingReview(request: IListingReviewRequest) {
    return axios.delete(`${this.baseUrl}/listing/${request.listingId}/review/${request.reviewId}/`, { auth: this.auth })
  }
  saveListingReview(request: IListingReview) {
    const p = request.id
      ? axios.put<IListingReview>(`${this.baseUrl}/listing/${request.listing}/review/${request.id}/`, request, { auth: this.auth })
      : axios.post<IListingReview>(`${this.baseUrl}/listing/${request.listing}/review/`, request, { auth: this.auth })
    return p
      .then((ar) => {
        return ar.data
      })
      .catch(handleError)
  }

  getListingFeedback(request: IListingFeedbackListRequest): Promise<IListingFeedback[]> {
    let params
    if (request.limit !== undefined || request.offset !== undefined) {
      params = Object.assign({}, request)
      delete params.listingId
    }
    return axios
      .get(`${this.baseUrl}/listing/${request.listingId}/feedback/`, {
        params: params,
        auth: this.auth
      })
      .then((ar) => {
        return ar.data as IListingFeedback[]
      })
  }
  getListingActivity(request: IListingRequest): Promise<IListingActivity[]> {
    return axios
      .get(`${this.baseUrl}/listing/${request.listingId}/activity/`, {
        auth: this.auth
      })
      .then((ar) => {
        return ar.data as IListingActivity[]
      })
  }
  getListingTypes(): Promise<IListingType[]> {
    return axios.get(`${this.baseUrl}/listingtype/`, { auth: this.auth }).then((ar) => {
      return ar.data as IListingType[]
    })
  }
  upload(request: IListingUploadRequest): Promise<IListingUploadResult> {
    const packageFormData = new FormData()
    if (request.listingId) {
      packageFormData.append("listing_id", String(request.listingId))
    }
    packageFormData.append("file", request.file)
    return axios
      .post(`${this.baseUrl}/listings/packages/`, packageFormData, {
        auth: this.auth
      })
      .then((ar) => {
        return ar.data as IListingUploadResult
      })
  }
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

class MockListingService implements IListingService {
  private _listings: IListing[] = [
    {
      id: nextListingId(),
      unique_name: "kurtvonnegut",
      title: "Kurt Vonnegut",
      description: "Kurt Vonnegut",
      description_short: "Kurt Vonnegut",
      launch_url: "https://en.wikipedia.org/wiki/Kurt_Vonnegut",
      security_marking: "user",
      approval_status: ListingApprovalStatus.APPROVED,
      is_enabled: true
    },
    {
      id: nextListingId(),
      unique_name: "johnsteinbeck",
      title: "John Steinbeck",
      description: "John Steinbeck",
      description_short: "John Steinbeck",
      launch_url: "https://en.wikipedia.org/wiki/John_Steinbeck",
      security_marking: "user",
      approval_status: ListingApprovalStatus.APPROVED,
      is_enabled: true
    },
    {
      id: nextListingId(),
      unique_name: "aldoushuxley",
      title: "Aldous Huxley",
      description: "Aldous Huxley",
      description_short: "Aldous Huxley",
      launch_url: "https://en.wikipedia.org/wiki/Aldous_Huxley",
      security_marking: "user",
      approval_status: ListingApprovalStatus.APPROVED,
      is_enabled: true
    },
    {
      id: nextListingId(),
      unique_name: "georgeorwell",
      title: "George Orwell",
      description: "George Orwell",
      description_short: "George Orwell",
      launch_url: "https://en.wikipedia.org/wiki/George_Orwell",
      security_marking: "user",
      approval_status: ListingApprovalStatus.APPROVED,
      is_enabled: true
    },
    {
      id: nextListingId(),
      unique_name: "mcdonalds",
      title: "McDonald's",
      description: "McDonald's",
      description_short: "McDonald's",
      launch_url: "https://en.wikipedia.org/wiki/McDonald%27s",
      security_marking: "user",
      approval_status: ListingApprovalStatus.IN_PROGRESS,
      is_enabled: true
    },
    {
      id: nextListingId(),
      unique_name: "chocolate",
      title: "Chocolate",
      description: "Chocolate",
      description_short: "Chocolate",
      launch_url: "https://en.wikipedia.org/wiki/Chocolate",
      security_marking: "user",
      approval_status: ListingApprovalStatus.PENDING,
      is_enabled: true
    }
  ]
  private _bookmarks: IListingBookmark[] = []
  set listings(listings: IListing[]) {
    this._listings = listings || []
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
        listing: Object.assign({}, this._listings.find((l) => l.id === b.listing.id))
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
    const idx = this._bookmarks.findIndex((b) => request.listing && request.listing.id === b.listing.id)
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
    if (r) {
      activities.push(
        {
          action: ListingActivityAction.CREATED,
          activity_date: "2016-03-01T14:32:22.666Z",
          description: "",
          author: MockUserProfile,
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
        },
        {
          action: ListingActivityAction.MODIFIED,
          activity_date: "2017-01-01T14:32:22.666Z",
          description: "",
          author: MockUserProfile,
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
        },
        {
          action: ListingActivityAction.MODIFIED,
          activity_date: "2017-01-03T14:32:22.666Z",
          description: "",
          author: MockUserProfile,
          listing: r,
          change_details: [
            {
              field_name: "launch_url",
              old_value: "http://oldurl/entity/search",
              new_value: "/entity/search"
            }
          ]
        }
      )
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
    // hmm - I can't do this sensibly
    const dt = new Date()
    return Promise.reject({
      message: "This is hard to mock"
    })
  }
}

const ListingServiceContext = new Context<IListingService>()

export { ListingServiceContext }
export { MockListingService, nextListingId, nextListingBookmarkid }
export { RestListingService }
