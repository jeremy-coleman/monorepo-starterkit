import { SyncComponent } from "coglite/shared/components"
import { IListing, IListingListModel } from "coglite/types"

import * as React from "react"

import { ListingTile } from "./ListingTile"
import { ListingViewConfig } from "./ListingViewConfig"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyles } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingListStyles {
  root?: IStyle
  compactRoot?: IStyle
  wrappingRoot?: IStyle
}

const defaultStyles = (theme: ITheme): IListingListStyles => {
  return {
    root: {},
    compactRoot: {
      display: "flex",
      alignItems: "center"
    },
    wrappingRoot: {
      flexWrap: "wrap"
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingListStyles | undefined): IListingListStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingListClassNames {
  root?: string
}

const getClassNames = memoizeFunction((styles: IListingListStyles, className: string, compact: boolean, wrapping: boolean) => {
  return {
    root: mergeStyles("listing-list", className, styles.root, compact && styles.compactRoot, wrapping && styles.wrappingRoot)
  }
})

export { IListingListClassNames }
export { IListingListStyles }

interface IListingListProps {
  listings: IListing[]
  compact?: boolean
  wrapping?: boolean
  onRenderListing?: (listing: IListing, index?: number, props?: IListingListProps) => React.ReactNode
  onSelectItem?: (item: IListing) => void
  className?: string
  styles?: IListingListStyles
  onRenderEmpty?: () => React.ReactNode
}

const defaultListingRenderer = (listing: IListing, index: number, props: IListingListProps) => {
  return <ListingTile key={listing.id} listing={listing} onClick={props.onSelectItem} />
}

class ListingList extends React.Component<IListingListProps, any> {
  private _onRenderListing = (listing: IListing, index: number) => {
    const r = this.props.onRenderListing || defaultListingRenderer
    return r(listing, index, this.props)
  }
  render() {
    if (this.props.listings && this.props.listings.length > 0) {
      const classNames = getClassNames(
        getStyles(undefined, this.props.styles),
        this.props.className,
        this.props.compact,
        this.props.wrapping
      )
      const items = this.props.listings.map(this._onRenderListing)
      return <div className={classNames.root}>{items}</div>
    }
    return this.props.onRenderEmpty ? this.props.onRenderEmpty() : null
  }
}

interface IListingListContainerProps {
  listings: IListingListModel
  compact?: boolean
  wrapping?: boolean
  onRenderListing?: (listing: IListing, index?: number, props?: IListingListProps) => React.ReactNode
  onSelectItem?: (item: IListing) => void
}

class ListingListContainer extends React.Component<IListingListContainerProps, any> {
  componentWillMount() {
    this.props.listings.load()
  }
  private _onRenderDone = () => {
    return (
      <ListingList
        listings={this.props.listings.itemsView}
        onSelectItem={this.props.onSelectItem}
        onRenderListing={this.props.onRenderListing}
        compact={this.props.compact}
        wrapping={this.props.wrapping}
      />
    )
  }
  render() {
    return (
      <SyncComponent
        sync={this.props.listings.sync}
        onRenderDone={this._onRenderDone}
        syncLabel={`Loading ${ListingViewConfig.labelPlural}...`}
      />
    )
  }
}

export { IListingListProps, IListingListContainerProps, ListingListContainer, ListingList }
