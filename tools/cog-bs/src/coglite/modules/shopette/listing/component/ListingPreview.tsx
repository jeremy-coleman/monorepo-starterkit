import { IListing } from "coglite/types"

import { observer } from "mobx-react"
import { Icon } from "@uifabric/components"
import { Image } from "@uifabric/components"
import * as React from "react"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingPreviewProps {
  listing: IListing
  styles?: IListingPreviewStyles
  className?: string
}

@observer
class ListingPreview extends React.Component<IListingPreviewProps, any> {
  private _classNames: IListingPreviewClassNames
  private _renderFallback() {
    return (
      <div className={this._classNames.fallback}>
        <Icon className={this._classNames.fallbackIcon} iconName="Puzzle" />
      </div>
    )
  }
  render() {
    this._classNames = getClassNames(getStyles(undefined, this.props.styles), this.props.className)
    let fallback
    let image
    if (this.props.listing.banner_icon && this.props.listing.banner_icon.url) {
      image = <Image src={this.props.listing.banner_icon.url} alt={this.props.listing.title} width={220} height={137} />
    } else {
      image = this._renderFallback()
    }
    return <div className={this._classNames.root}>{image}</div>
  }
}

interface IListingPreviewStyles {
  root?: IStyle
  fallback?: IStyle
  fallbackIcon?: IStyle
}

const defaultStyles = (theme: ITheme): IListingPreviewStyles => {
  return {
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 228,
      height: 145
    },
    fallback: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 220,
      height: 137,
      backgroundColor: theme.palette.neutralLight,
      color: theme.palette.themePrimary
    },
    fallbackIcon: {
      fontSize: "28px"
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingPreviewStyles | undefined): IListingPreviewStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingPreviewClassNames {
  root?: string
  fallback?: string
  fallbackIcon?: string
}

const getClassNames = memoizeFunction((styles: IListingPreviewStyles, className: string) => {
  return mergeStyleSets({
    root: ["listing-preview", className, styles.root],
    fallback: ["listing-preview-fallback", styles.fallback],
    fallbackIcon: ["listing-preview-fallback-icon", styles.fallbackIcon]
  })
})

export { IListingPreviewClassNames }
export { IListingPreviewStyles }

export { IListingPreviewProps, ListingPreview }
