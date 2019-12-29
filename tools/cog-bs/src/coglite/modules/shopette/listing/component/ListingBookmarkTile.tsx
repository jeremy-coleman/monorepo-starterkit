import { IListingBookmark } from "coglite/types"

import { Icon, Image } from "@uifabric/components"
import * as React from "react"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets, css } from "@uifabric/styleguide"
import { ITheme, FontWeights, getTheme } from "@uifabric/styleguide"

interface IListingBookmarkTileStyles {
  root?: IStyle
  header?: IStyle
  headerActions?: IStyle
  icon?: IStyle
  title?: IStyle
  banner?: IStyle
  removeAction?: IStyle
}

const defaultStyles = (theme: ITheme): IListingBookmarkTileStyles => {
  return {
    root: {
      position: "relative",
      width: 220,
      minWidth: 220,
      height: 165,
      minHeight: 165,
      marginLeft: 16,
      marginTop: 16,
      marginBottom: 16,
      backgroundColor: theme.palette.white,
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
      transition: "box-shadow 0.5s",
      border: `1px solid ${theme.palette.themeDark}`,
      cursor: "pointer",
      selectors: {
        ":hover": {
          border: `1px solid ${theme.palette.orange}`,
          boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)",
          selectors: {
            $header: {
              backgroundColor: theme.palette.orange
            }
          }
        },
        ":focus": {
          border: `1px solid ${theme.palette.orange}`,
          boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)",
          selectors: {
            $header: {
              backgroundColor: theme.palette.orange
            }
          }
        }
      }
    },
    header: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      height: 28,
      overflow: "hidden",
      backgroundColor: theme.palette.themeDark,
      color: theme.palette.white,
      display: "flex",
      alignItems: "center"
    },
    headerActions: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      height: 28,
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end"
    },
    icon: {
      marginLeft: 6,
      marginRight: 6,
      width: 16,
      height: 16,
      zIndex: 2,
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      selectors: {
        "&.is-icon": {
          backgroundColor: theme.palette.neutralLight,
          color: theme.palette.orange,
          fontSize: "12px"
        }
      }
    },
    title: {
      marginTop: 0,
      marginBottom: 0,
      zIndex: 2,
      fontWeight: FontWeights.regular,
      fontSize: "12px"
    },
    banner: {
      position: "absolute",
      left: 0,
      top: 28,
      width: 220,
      height: 137,
      zIndex: 2,
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      selectors: {
        "&.is-icon": {
          backgroundColor: theme.palette.neutralLight,
          color: theme.palette.orange
        },
        ".banner-icon": {
          fontSize: "28px"
        }
      }
    },
    removeAction: {
      color: theme.palette.white,
      height: 16,
      width: 16,
      marginLeft: 4,
      marginRight: 4,
      lineHeight: 16,
      zIndex: 2,
      background: "transparent",
      border: "none",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "10px",
      selectors: {
        ":hover": {
          backgroundColor: theme.palette.redDark,
          color: theme.palette.white
        }
      }
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingBookmarkTileStyles | undefined): IListingBookmarkTileStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingBookmarkTileClassNames {
  root?: string
  header?: string
  headerActions?: string
  banner?: string
  title?: string
  icon?: string
  removeAction?: string
}

const getClassNames = memoizeFunction((styles: IListingBookmarkTileStyles, className: string, clickable: boolean) => {
  return mergeStyleSets({
    root: ["listing-bookmark-tile", className, styles.root],
    header: ["listing-bookmark-tile-header", styles.header],
    headerActions: ["listing-bookmark-tile-header-actions", styles.headerActions],
    banner: ["listing-bookmark-banner", styles.banner],
    title: ["listing-bookmark-tile-title", styles.title],
    icon: ["listing-bookmark-title-icon", styles.icon],
    removeAction: ["listing-bookmark-title-remove-action", styles.removeAction]
  })
})


interface IListingBookmarkTileProps {
  bookmark: IListingBookmark
  onLaunch?: (listing: IListingBookmark) => void
  onRemove?: (listing: IListingBookmark) => void
  className?: string
  styles?: IListingBookmarkTileStyles
}

class ListingBookmarkTile extends React.Component<IListingBookmarkTileProps, any> {
  private _classNames: IListingBookmarkTileClassNames
  private _onClick = () => {
    this.props.onLaunch(this.props.bookmark)
  }
  private _onClickRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    this.props.onRemove(this.props.bookmark)
  }
  private _renderIcon(): React.ReactNode {
    const { bookmark } = this.props
    const listingSmallIcon = bookmark.listing.small_icon
    let image
    let isIcon = false
    if (listingSmallIcon && listingSmallIcon.url) {
      image = <Image width={16} height={16} src={listingSmallIcon.url} alt={bookmark.listing.title} />
    } else {
      isIcon = true
      image = <Icon iconName="Puzzle" className="thumnail-icon" title={bookmark.listing.title} />
    }
    return <div className={css(this._classNames.icon, { "is-icon": isIcon })}>{image}</div>
  }
  private _renderTitle(): React.ReactNode {
    return <h5 className={this._classNames.title}>{this.props.bookmark.listing.title}</h5>
  }
  private _renderRemoveAction(): React.ReactNode {
    if (this.props.onRemove) {
      return (
        <button
          className={this._classNames.removeAction}
          onClick={this._onClickRemove}
          title={`Remove Bookmark: ${this.props.bookmark.listing.title}`}
        >
          <Icon iconName="ChromeClose" />
        </button>
      )
    }
    return null
  }
  private _renderHeaderActions(): React.ReactNode {
    return <div className={this._classNames.headerActions}>{this._renderRemoveAction()}</div>
  }
  private _renderHeader(): React.ReactNode {
    return (
      <div className={this._classNames.header}>
        {this._renderIcon()}
        {this._renderTitle()}
        {this._renderHeaderActions()}
      </div>
    )
  }
  private _renderBanner(): React.ReactNode {
    const listingBannerIcon = this.props.bookmark.listing.banner_icon
    let banner
    let bannerIsIcon = false
    if (listingBannerIcon && listingBannerIcon.url) {
      banner = <Image width={220} height={137} src={listingBannerIcon.url} alt={this.props.bookmark.listing.title} />
    } else {
      bannerIsIcon = true
      banner = <Icon iconName="Puzzle" className="banner-icon" title={this.props.bookmark.listing.title} />
    }
    return <div className={css(this._classNames.banner, { "is-icon": bannerIsIcon })}>{banner}</div>
  }
  render() {
    this._classNames = getClassNames(getStyles(null, this.props.styles), this.props.className, this.props.onLaunch ? true : false)
    return (
      <div
        className={this._classNames.root}
        role={this.props.onLaunch ? "button" : undefined}
        onClick={this.props.onLaunch ? this._onClick : undefined}
        title={this.props.bookmark.listing.title}
      >
        {this._renderHeader()}
        {this._renderBanner()}
      </div>
    )
  }
}

export { IListingBookmarkTileClassNames }
export { IListingBookmarkTileStyles }
export { IListingBookmarkTileProps, ListingBookmarkTile }
