import { SyncComponent } from "coglite/shared/components"
import { IListing, IListingListModel, IUserProfile } from "coglite/types"

import { MessageBar, MessageBarType } from "@uifabric/components"
import * as React from "react"

import { ListingApprovalStatus } from "../constants"
import { canUserAccess } from "../ListingHelper"
import { ListingIconTile } from "./ListingIconTile"
import { ListingViewConfig } from "./ListingViewConfig"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IUserListingsStyles {
  root?: IStyle
  list?: IStyle
  listCell?: IStyle
}

const UserListingCSS = (theme: ITheme): IUserListingsStyles => {
  return {
    root: {},
    list: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center"
    },
    listCell: {
      margin: 8
    }
  }
}

const getStyles = memoizeFunction(
  (theme: ITheme, customStyles?: IUserListingsStyles): IUserListingsStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(UserListingCSS(theme), customStyles)
  }
)

interface IUserListingsClassNames {
  root?: string
  list?: string
  listCell?: string
}

const getClassNames = memoizeFunction(
  (styles: IUserListingsStyles, className: string): IUserListingsClassNames => {
    return mergeStyleSets({
      root: ["user-listings", styles.root, className],
      list: ["user-listings-list", styles.list],
      listCell: ["user-listings-list-cell", styles.listCell]
    })
  }
)

interface IUserListingsProps {
  listingList: IListingListModel
  userProfile: IUserProfile
  onRenderCell?: (listing: IListing, index?: number, props?: IUserListingsProps) => React.ReactNode
  onClickInfo?: (listing: IListing, e: React.MouseEvent<HTMLButtonElement>) => void
  onLaunchApp?: (listing: IListing) => void
  styles?: IUserListingsStyles
  className?: string
}

class UserListings extends React.Component<IUserListingsProps, any> {
  private _classNames: IUserListingsClassNames
  private _onRenderCell = (listing: IListing, index: number) => {
    const content = this.props.onRenderCell ? (
      this.props.onRenderCell(listing, index, this.props)
    ) : (
      <ListingIconTile listing={listing} onClick={this.props.onLaunchApp} onClickInfo={this.props.onClickInfo} />
    )
    return (
      <div key={listing.id} className={this._classNames.listCell}>
        {content}
      </div>
    )
  }
  render() {
    this._classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    let content

    const listings = this.props.listingList.itemsView.filter((l) => {
      return l
    })

    //causing too many problems - this shit shouldn't be in client code anyway
    const listings1 = this.props.listingList.itemsView.filter((l) => {
      return l.is_enabled && l.approval_status === ListingApprovalStatus.APPROVED && canUserAccess(l, this.props.userProfile)
    })

    if (listings.length > 0) {
      content = <div className={this._classNames.list}>{listings.map(this._onRenderCell)}</div>
    } else {
      content = (
        <MessageBar messageBarType={MessageBarType.warning}>You don't have access to any {ListingViewConfig.labelPlural}</MessageBar>
      )
    }
    return <div className={this._classNames.root}>{content}</div>
  }
}

class UserListingsContainer extends React.Component<IUserListingsProps, any> {
  componentWillMount() {
    this.props.listingList.load()
  }
  private _onRenderDone = () => {
    return <UserListings {...this.props} />
  }
  render() {
    return <SyncComponent sync={this.props.listingList.sync} onRenderDone={this._onRenderDone} />
  }
}

export { IUserListingsClassNames }
export { IUserListingsStyles }
export { IUserListingsProps, UserListingsContainer, UserListings }
