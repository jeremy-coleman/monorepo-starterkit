import { SyncComponent } from "coglite/shared/components"
import { IListing, IListingSearchModel } from "coglite/types"

import { observer } from "mobx-react"
import { MessageBar, MessageBarType } from "@uifabric/components"
import { SearchBox } from "@uifabric/components"
import * as React from "react"
import { ListingList } from "./ListingList"
import { ListingTile } from "./ListingTile"
import { ListingViewConfig } from "./ListingViewConfig"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingSearchStyles {
  root?: IStyle
  input?: IStyle
  results?: IStyle
}

const defaultStyles = (theme: ITheme): IListingSearchStyles => {
  return {
    root: {},
    input: {
      paddingTop: 8,
      paddingBottom: 0,
      paddingLeft: 16,
      paddingRight: 16
    },
    results: {}
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme: ITheme, customStyles?: IListingSearchStyles): IListingSearchStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingSearchClassNames {
  root?: string
  input?: string
  results?: string
}

const getClassNames = memoizeFunction(
  (styles: IListingSearchStyles, className?: string): IListingSearchClassNames => {
    return mergeStyleSets({
      root: ["listing-search", className, styles.root],
      input: ["listing-search-input", styles.input],
      results: ["listing-search-results", styles.results]
    })
  }
)

interface IListingSearchProps {
  search: IListingSearchModel
  styles?: IListingSearchStyles
  className?: string
  onLaunch?: (listing: IListing) => void
  onSelectItem?: (listing: IListing) => void
  hideStatus?: boolean
}

@observer
class ListingSearchInput extends React.Component<IListingSearchProps, any> {
  private _onSearchChange = (newValue: any) => {
    this.props.search.setSearch(newValue)
  }
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return (
      <div className={classNames.input}>
        <SearchBox
          value={this.props.search.search}
          placeholder={`Search ${ListingViewConfig.storeLabel}`}
          onChange={this._onSearchChange}
        />
      </div>
    )
  }
}

@observer
class ListingSearchResults extends React.Component<IListingSearchProps, any> {
  private _onRenderItem = (listing, idx, props) => {
    return (
      <ListingTile
        key={listing.id}
        listing={listing}
        onClick={props.onSelectItem}
        onLaunch={this.props.onLaunch}
        hideStatus={this.props.hideStatus}
      />
    )
  }
  private _onRenderDone = () => {
    if (this.props.search.itemsView && this.props.search.itemsView.length > 0) {
      return (
        <ListingList
          listings={this.props.search.itemsView}
          compact
          wrapping
          onSelectItem={this.props.onSelectItem}
          onRenderListing={this._onRenderItem}
        />
      )
    }
    return <MessageBar messageBarType={MessageBarType.info}>No matching {ListingViewConfig.labelPlural} found</MessageBar>
  }
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return (
      <div className={classNames.results}>
        <SyncComponent
          sync={this.props.search.sync}
          onRenderDone={this._onRenderDone}
          syncLabel={
            this.props.search.search ? `Searching ${ListingViewConfig.labelPlural}...` : `Loading ${ListingViewConfig.labelPlural}...`
          }
        />
      </div>
    )
  }
}

class ListingSearch extends React.Component<IListingSearchProps, any> {
  componentWillMount() {
    this.props.search.load()
  }
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return (
      <div className={classNames.root}>
        <ListingSearchInput {...this.props} />
        <ListingSearchResults {...this.props} />
      </div>
    )
  }
}

export { IListingSearchClassNames }
export { IListingSearchStyles }
export { ListingSearch, IListingSearchProps }
