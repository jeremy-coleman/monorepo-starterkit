import {
  ListingApprovalStatusEnum,
  ListingService,
  ListingServiceContext,
  ListingViewConfig
} from "@coglite/shopette"

//import entitySearchImage from "./assets/entitysearch.png"
let entitySearchImage

ListingViewConfig.label = "App"
ListingViewConfig.labelPlural = "Apps"
ListingViewConfig.storeLabel = "Coglite App Store"

export const bootstrapEnv = () => {
  console.log("-- Applying Env Configuration")

  const listingService = new ListingService()
  const listings = [
    {
      id: "samples.home",
      unique_name: "samples.home",
      title: "Samples",
      description: "Samples",
      description_short: "Samples",
      launch_url: "/samples",
      security_marking: "USER",
      approval_status: "APPROVED", //ListingApprovalStatusEnum.APPROVED,
      is_enabled: true,
      iframe_compatible: true
    },
    {
      id: "arrow.table.v1",
      unique_name: "arrow.table",
      title: "Spreadsheet",
      description: "Apache Arrow spreadsheet",
      description_short: "Spreadsheet",
      launch_url: "/apps/arrowtable", //"/datatable/arrow",
      security_marking: "USER",
      approval_status: "APPROVED", //ListingApprovalStatusEnum.APPROVED,
      is_enabled: true,
      iframe_compatible: true,
      small_icon: {
        url: entitySearchImage
      },
      large_icon: {
        url: entitySearchImage
      },
      banner_icon: {
        url: entitySearchImage
      }
    },
    {
      id: "nextapps.tester.v1",
      unique_name: "nextapps.tester.v1",
      title: "NextJS Tester",
      description: "Tester Embedded",
      description_short: "Tester Embedded",
      //launch_url: `${window.location}/tester`,
      launch_url: "http://localhost:3000/tester",
      security_marking: "USER",
      approval_status: "APPROVED", //ListingApprovalStatusEnum.APPROVED,
      is_enabled: true,
      iframe_compatible: true
    },
    {
      id: "wiki.stats.pdf",
      unique_name: "wiki.stats.pdf",
      title: "Wiki-PDF",
      description: "Probability Density Function Wiki",
      description_short: "PDF",
      launch_url: "https://en.wikipedia.org/wiki/Probability_density_function",
      security_marking: "USER",
      approval_status: ListingApprovalStatusEnum.APPROVED,
      is_enabled: true,
      iframe_compatible: true
    },
    {
      id: "chat.v1",
      unique_name: "chat",
      title: "chat",
      description: "chat",
      description_short: "chat",
      launch_url: "/chat",
      security_marking: "USER",
      approval_status: ListingApprovalStatusEnum.APPROVED,
      is_enabled: true,
      iframe_compatible: true
      //small_icon: {url: solrImage},
      //large_icon: {url: solrImage},
      //banner_icon: {url: solrImage}
    }
  ]

  const bookmarks = listings.map((l) => {
    return {
      id: l.id,
      listing: l
    }
  })

  //@ts-ignore
  listingService.listings = listings
  //@ts-ignore
  listingService.bookmarks = bookmarks
  ListingServiceContext.value = listingService
}

export default bootstrapEnv
