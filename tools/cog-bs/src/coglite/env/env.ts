import { Context, LoggingStorageService, StorageServiceContext, TransientStorageService } from "coglite/shared/services"
import { IListing, IStorageService } from "coglite/types"
import { AppRouter } from "../AppRouter"
import { DashboardListModel } from "coglite/modules/dashboard"
import { ComponentFactory } from "coglite/modules/dashboard"
import {
  ShopettePathsContext,
  ListingViewConfig,
  MockListingService,
  nextListingId,
  ListingApprovalStatus,
  nextListingBookmarkid,
  ListingServiceContext,
  ImageServiceContext,
  MockImageService,
  CategoryServiceContext,
  MockCategoryService
} from "coglite/modules/shopette"

import {
  UserAdminContext,
  isMemberOfGroup,
  MockUserService,
  UserServiceContext,
  UserDataServiceContext,
  MockUserDataService,
} from 'coglite/modules/user'

//----------------storage setup -----------------------//
export const DashboardStorageServiceContext = new Context<IStorageService>()

const storageKey = "coglite-desktop-dashboard-list"

export const DashboardListStore = new DashboardListModel()
DashboardListStore.componentFactory = ComponentFactory
DashboardListStore.setRouter(AppRouter)

DashboardListStore.loader = () => {
  return DashboardStorageServiceContext.value.getItem(storageKey)
}
DashboardListStore.saver = (data) => {
  return DashboardStorageServiceContext.value.setItem(storageKey, data)
}

DashboardListStore.addApp = {
  title: "My Apps",
  path: ShopettePathsContext.value.userListings()
}

//--------------some view branding -----------------//

ListingViewConfig.label = "App"
ListingViewConfig.labelPlural = "Apps"
ListingViewConfig.storeLabel = "Coglite App Store"

enum UserGroup {
  ADMIN = "APPS_MALL_STEWARD",
  MARKET_RISK = "Market Risk User"
}

export const bootstrapEnv = (injector?) => {
  console.log("-- Applying Mock Configuration")

  const storageService = new LoggingStorageService({
    prefix: "mock",
    target: new TransientStorageService()
  })

  // common config
  StorageServiceContext.value = storageService

  // bored config
  DashboardStorageServiceContext.value = storageService

  // ozone config
  // admin context
  UserAdminContext.value = (userProfile) => {
    return isMemberOfGroup(userProfile, UserGroup.ADMIN)
  }

  const userService = new MockUserService()
  userService.userProfile = {
    id: 1,
    display_name: "Mock User",
    bio: "Mock User Bio",
    user: {
      username: "mock",
      email: "mock@coglite.com",
      groups: [
        {name: "USER"},
        {name: "APPS_MALL_STEWARD"},
        {name: "Retail Taxonomy"},
        {name: "Healthcare Group"},
        {name: "Market Risk User"}
      ]
    }
  }

  UserServiceContext.value = userService
  UserDataServiceContext.value = new MockUserDataService()

  const listingService = new MockListingService()
  const listings: IListing[] = [
    {
      id: "samples.home",
      unique_name: "samples.home",
      title: "Samples",
      description: "Samples",
      description_short: "Samples",
      launch_url: window.location + "samples", //"http://localhost:1234",
      //launch_url: "/mesh/sample/embedded",
      security_marking: "USER",
      approval_status: ListingApprovalStatus.APPROVED,
      is_enabled: true,
      iframe_compatible: true
    },
    {
      id: "mesh.embedded",
      unique_name: "mesh.embedded",
      title: "Mesh Embedded",
      description: "Mesh Embedded",
      description_short: "Mesh Embedded",
      launch_url: "http://localhost:1234",
      //launch_url: "/mesh/sample/embedded",
      security_marking: "USER",
      approval_status: ListingApprovalStatus.APPROVED,
      is_enabled: true,
      iframe_compatible: true
    },
    {
      id: "wikipedia.stats.pdf",
      unique_name: "wikipdf",
      title: "Wiki - PDF",
      description: "Probability Density Function Wiki",
      description_short: "PDF",
      launch_url: "https://en.wikipedia.org/wiki/Probability_density_function",
      security_marking: "USER",
      approval_status: ListingApprovalStatus.APPROVED,
      is_enabled: true,
      iframe_compatible: true
    }
  ]
  const bookmarks = listings.map((l) => {
    return {
      id: nextListingBookmarkid(),
      listing: l
    }
  })
  listingService.listings = listings
  listingService.bookmarks = bookmarks
  ListingServiceContext.value = listingService
  ImageServiceContext.value = new MockImageService()
  CategoryServiceContext.value = new MockCategoryService()
}

export default bootstrapEnv
