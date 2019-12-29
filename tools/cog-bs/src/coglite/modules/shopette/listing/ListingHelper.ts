import { IListing, IUserProfile } from "coglite/types"
import { UserAdminContext } from "coglite/modules/user"

import { UserListingAccessContext } from "coglite/modules/user"

/**
 * Note: this is all temporary - how listings are handled on the view side would actually depend on the
 * listing type.
 */

const isExternalUrl = (launchUrl: string): boolean => {
  return launchUrl && launchUrl.indexOf("://") >= 0
}

const isExternalListing = (listing: IListing): boolean => {
  return listing ? isExternalUrl(listing.launch_url) : false
}

const isScriptUrl = (launchUrl: string): boolean => {
  return launchUrl && launchUrl.endsWith(".js")
}

const isScriptListing = (listing: IListing): boolean => {
  return listing ? isScriptUrl(listing.launch_url) : false
}

const isOwner = (listing: IListing, userProfile: IUserProfile) =>
  listing && listing.owners && listing.owners.some((o) => o.id === userProfile.id)

const canUserAccess = (listing: IListing, userProfile: IUserProfile) =>
  UserAdminContext.value(userProfile) || UserListingAccessContext.value(listing, userProfile)

export { isExternalUrl, isExternalListing, isScriptUrl, isScriptListing, canUserAccess, isOwner }
