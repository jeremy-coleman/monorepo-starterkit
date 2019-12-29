
import { IAppHost, IAppProps, IListing, IListingBookmark, IMutableSync, IUserProfile } from "coglite/types"
import { UserAccountHostView, UserAdminContext } from "coglite/modules/user"
import { IContextualMenuItem } from "@uifabric/components"
import { MessageBar, MessageBarType } from "@uifabric/components"
import * as React from "react"

import { ShopettePathsContext } from "../../PathsContext"
import { launch } from "../ListingLaunch"
import { ListingBookmarkListStore } from "../stores"
import { ListingBookmarksContainer } from "./ListingBookmarks"
import { ListingLaunchDialog } from "./ListingLaunchDialog"
import { ListingViewConfig } from "./ListingViewConfig"
import { Sync } from "coglite/shared/models/Sync"
import { AppLink } from "coglite/modules/host/views"

class ListingBookmarksApp extends React.Component<IAppProps, any> {
  get host(): IAppHost {
    return this.props.match.host
  }
  get userProfile(): IUserProfile {
    return this.props.match.userProfile
  }
  get launchSync(): IMutableSync<IListing> {
    return this.host.getState("listingLaunchSync", () => {
      return new Sync()
    })
  }
  private _onLaunchBookmark = (bookmark: IListingBookmark) => {
    this.launchSync.syncStart({ id: bookmark.listing })
    launch({
      host: this.host,
      userProfile: this.userProfile,
      listingId: bookmark.listing.id
    })
      .then((app) => {
        this.launchSync.syncEnd()
      })
      .catch((err) => {
        this.launchSync.syncError(err)
      })
  }
  componentWillMount() {
    this.host.setTitle("Bookmarks")
  }
  private _onLoadStore = () => {
    this.host.load({ path: ShopettePathsContext.value.store() })
  }
  private _onLoadAllListings = () => {
    this.host.load({ path: ShopettePathsContext.value.listings() })
  }
  private _onRenderNoBookmarks = () => {
    return (
      <div style={{ padding: 8 }}>
        <MessageBar messageBarType={MessageBarType.info}>
          You haven't bookmarked anything.{" "}
          <AppLink host={this.host} request={{ path: ShopettePathsContext.value.store() }} onClick={this._onLoadStore}>
            Take a look in the {ListingViewConfig.storeLabel}
          </AppLink>
          .
        </MessageBar>
      </div>
    )
  }
  render() {
    const farItems = [
      {
        key: "store",
        name: `${ListingViewConfig.storeLabel}`,
        iconProps: {
          iconName: "Shop"
        },
        onClick: this._onLoadStore
      }
    ]
    if (UserAdminContext.value(this.userProfile)) {
      farItems.push({
        key: "listings",
        name: `All ${ListingViewConfig.labelPlural}`,
        iconProps: {
          iconName: "ViewList"
        },
        onClick: this._onLoadAllListings
      })
    }

    return (
      <UserAccountHostView host={this.host} userProfile={this.userProfile} commandBarProps={{ items: [], farItems: farItems }}>
        <ListingLaunchDialog sync={this.launchSync} />
        <ListingBookmarksContainer
          bookmarkList={ListingBookmarkListStore}
          onLaunch={this._onLaunchBookmark}
          onRenderNoBookmarks={this._onRenderNoBookmarks}
        />
      </UserAccountHostView>
    )
  }
}

export { ListingBookmarksApp, ListingBookmarksApp as default }
