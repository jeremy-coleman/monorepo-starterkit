import { IListing } from "coglite/types"

import * as React from "react"

import { ListingBookmarkListStore } from "../stores"
import { ListingApprovalStatusIcon } from "./ListingApprovalStatus"
import { ListingBannerIcon } from "./ListingBannerIcon"
import { ListingBookmarkButton } from "./ListingBookmarkButton"
import { ListingLaunchAction } from "./ListingLaunchAction"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, FontWeights, getTheme } from "@uifabric/styleguide"

interface IListingTileStyles {
  root?: IStyle
  compactRoot?: IStyle
  clickableRoot?: IStyle
  top?: IStyle
  banner?: IStyle
  content?: IStyle
  actions?: IStyle
  title?: IStyle
  shortDescription?: IStyle
  status?: IStyle
}

const defaultStyles = (theme: ITheme): IListingTileStyles => {
  return {
    root: {
      position: "relative",
      width: 220,
      minWidth: 220,
      maxWidth: 220,
      marginLeft: 16,
      marginTop: 16,
      marginBottom: 16,
      backgroundColor: theme.palette.white,
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
      transition: "box-shadow 0.5s",
      border: `1px solid ${theme.palette.neutralQuaternary}`,
      borderRadius: 4,
      selectors: {
        "&:hover": {
          boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)",
          selectors: {
            $top: {
              backgroundColor: theme.palette.neutralQuaternaryAlt
            }
          }
        },
        "&:focus": {
          boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)"
        }
      }
    },
    clickableRoot: {
      cursor: "pointer"
    },
    top: {
      position: "relative",
      height: 150,
      minHeight: 150,
      transition: "background 0.25s",
      overflow: "hidden",
      backgroundColor: theme.palette.neutralLight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    banner: {},
    content: {
      position: "relative",
      height: 100,
      minHeight: 100,
      color: theme.palette.neutralPrimary,
      fontSize: "14px"
    },
    actions: {
      position: "absolute",
      bottom: 0,
      right: 0,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end"
    },
    title: {
      fontWeight: FontWeights.semibold,
      fontSize: "14px",
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 8,
      paddingRight: 8,
      marginTop: 0,
      marginBottom: 0
    },
    shortDescription: {
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
    },
    status: {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 28,
      display: "flex",
      alignItems: "center",
      paddingLeft: 8
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingTileStyles | undefined): IListingTileStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingTileClassNames {
  root?: string
  top?: string
  banner?: string
  content?: string
  actions?: string
  title?: string
  shortDescription?: string
  status?: string
}

const getClassNames = memoizeFunction((styles: IListingTileStyles, className: string, clickable: boolean) => {
  return mergeStyleSets({
    root: ["listing-tile", className, styles.root, clickable && styles.clickableRoot],
    top: ["listing-tile-top", styles.top],
    banner: ["listing-tile-banner", styles.banner],
    content: ["listing-tile-content", styles.content],
    actions: ["listing-tile-actions", styles.actions],
    title: ["listing-tile-title", styles.title],
    shortDescription: ["listing-tile-short-description", styles.shortDescription],
    status: ["listing-title-status", styles.status]
  })
})

interface IListingTileProps {
  listing: IListing
  onClick?: (listing: IListing) => void
  className?: string
  styles?: IListingTileStyles
  onLaunch?: (listing: IListing) => void
  hideStatus?: boolean
}

class ListingTile extends React.Component<IListingTileProps, any> {
  private _classNames: IListingTileClassNames
  private _onClick = () => {
    this.props.onClick(this.props.listing)
  }
  private _renderBanner(): React.ReactNode {
    return (
      <div className={this._classNames.banner}>
        <ListingBannerIcon listing={this.props.listing} />
      </div>
    )
  }
  private _renderTop(): React.ReactNode {
    return (
      <div className={this._classNames.top}>
        {this._renderStatus()}
        {this._renderActions()}
        {this._renderBanner()}
      </div>
    )
  }
  private _renderTitle(): React.ReactNode {
    return <h3 className={this._classNames.title}>{this.props.listing.title}</h3>
  }
  private _renderShortDescription(): React.ReactNode {
    return <h5 className={this._classNames.shortDescription}>{this.props.listing.description_short}</h5>
  }
  private _renderActions(): React.ReactNode {
    return (
      <div className={this._classNames.actions}>
        <ListingBookmarkButton bookmarkList={ListingBookmarkListStore} listing={this.props.listing} />
        <ListingLaunchAction {...this.props} />
      </div>
    )
  }
  private _renderStatus(): React.ReactNode {
    if (!this.props.hideStatus) {
      return (
        <div className={this._classNames.status}>
          <ListingApprovalStatusIcon listing={this.props.listing} />
        </div>
      )
    }
    return null
  }
  private _renderContent(): React.ReactNode {
    return (
      <div className={this._classNames.content}>
        {this._renderTitle()}
        {this._renderShortDescription()}
      </div>
    )
  }
  render() {
    this._classNames = getClassNames(getStyles(null, this.props.styles), this.props.className, this.props.onClick ? true : false)
    return (
      <div
        className={this._classNames.root}
        role={this.props.onClick ? "button" : undefined}
        onClick={this.props.onClick ? this._onClick : undefined}
        title={this.props.listing.title ? `Open ${this.props.listing.title} Details` : "Open Details"}
      >
        {this._renderTop()}
        {this._renderContent()}
      </div>
    )
  }
}

export { IListingTileClassNames }
export { IListingTileStyles }
export { IListingTileProps, ListingTile }
