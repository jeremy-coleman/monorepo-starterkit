import { IListing } from "coglite/types"

import { IconButton } from "@uifabric/components"
import { Persona, PersonaSize } from "@uifabric/components"
import * as React from "react"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingIconTileStyles {
  root?: IStyle
  top?: IStyle
  actions?: IStyle
  content?: IStyle
  title?: IStyle
}

const defaultStyles = (theme: ITheme): IListingIconTileStyles => {
  return {
    root: {
      justifyContent: "center",
      padding: 0,
      background: "transparent",
      outline: "none",
      borderRadius: 4,
      cursor: "pointer",
      width: 130,
      maxWidth: 130,
      minWidth: 130,
      backgroundColor: theme.palette.white,
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
      transition: "box-shadow 0.5s",
      border: `1px solid ${theme.palette.neutralQuaternary}`,
      selectors: {
        "&:hover": {
          boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)",
          selectors: {
            $top: {
              backgroundColor: theme.palette.neutralQuaternaryAlt
            }
          }
        }
      }
    },
    top: {
      position: "relative",
      height: 80,
      minHeight: 80,
      maxHeight: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.palette.neutralLight
    },
    actions: {
      position: "absolute",
      top: 0,
      right: 0,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end"
    },
    content: {
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    title: {
      fontSize: "12px",
      width: 120,
      textOverflow: "ellipsis",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      textAlign: "center"
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme: ITheme, customStyles?: IListingIconTileStyles): IListingIconTileStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingIconTileClassNames {
  root?: string
  top?: string
  actions?: string
  content?: string
  title?: string
}

const getClassNames = memoizeFunction(
  (styles: IListingIconTileStyles, className?: string): IListingIconTileClassNames => {
    return mergeStyleSets({
      root: ["listing-icon-tile", styles.root, className],
      top: ["listing-icon-tile-top", styles.top],
      actions: ["listing-icon-title-actions", styles.actions],
      content: ["listing-icon-tile-content", styles.content],
      title: ["listing-icon-tile-title", styles.title]
    })
  }
)

export { IListingIconTileClassNames }
export { IListingIconTileStyles }

enum ListingIconSize {
  small = 16,
  large = 32
}

interface IListingIconTileProps {
  listing: IListing
  onClick?: (listing: IListing, e: React.MouseEvent<HTMLElement>) => void
  onClickInfo?: (listing: IListing, e: React.MouseEvent<HTMLButtonElement>) => void
  iconSize?: ListingIconSize
  styles?: IListingIconTileStyles
  className?: string
}

class ListingIconTileIcon extends React.Component<IListingIconTileProps, any> {
  render() {
    const { listing, iconSize } = this.props
    let iconUrl: string
    let iconImageSize: ListingIconSize = iconSize || ListingIconSize.large
    if (iconImageSize === ListingIconSize.small) {
      iconUrl = listing.small_icon ? listing.small_icon.url : undefined
    } else {
      iconUrl = listing.large_icon ? listing.large_icon.url : undefined
    }
    const personaSize = iconImageSize === ListingIconSize.small ? PersonaSize.size16 : undefined
    return <Persona size={personaSize} hidePersonaDetails imageUrl={iconUrl} text={listing.title} />
  }
}

class ListingInfoButton extends React.Component<IListingIconTileProps, any> {
  private _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    this.props.onClickInfo(this.props.listing, e)
  }
  render() {
    if (this.props.onClickInfo) {
      return (
        <IconButton
          title={`Open details for ${this.props.listing.title}`}
          iconProps={{ iconName: "Info" }}
          styles={{
            root: {
              color: getTheme().palette.blue
            }
          }}
          onClick={this._onClick}
        />
      )
    }
    return null
  }
}

class ListingIconTile extends React.Component<IListingIconTileProps, any> {
  private _classNames: IListingIconTileClassNames
  private _onClick = (e: React.MouseEvent<HTMLElement>) => {
    this.props.onClick(this.props.listing, e)
  }
  private _onRenderActions = () => {
    return (
      <div className={this._classNames.actions}>
        <ListingInfoButton {...this.props} />
      </div>
    )
  }
  private _onRenderTop = () => {
    return (
      <div className={this._classNames.top}>
        <ListingIconTileIcon {...this.props} />
        {this._onRenderActions()}
      </div>
    )
  }
  private _onRenderContent = () => {
    return (
      <div className={this._classNames.content}>
        <div className={this._classNames.title}>{this.props.listing.title}</div>
      </div>
    )
  }
  render() {
    const { listing, styles, className, onClick } = this.props
    this._classNames = getClassNames(getStyles(null, styles), className)
    return (
      <div
        role="button"
        title={onClick ? `Launch ${listing.title}` : listing.title}
        className={this._classNames.root}
        onClick={onClick ? this._onClick : undefined}
      >
        {this._onRenderTop()}
        {this._onRenderContent()}
      </div>
    )
  }
}

export { IListingIconTileProps, ListingIconTile, ListingIconTileIcon, ListingIconSize }
