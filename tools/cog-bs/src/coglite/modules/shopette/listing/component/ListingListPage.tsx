import { IListing } from "coglite/types"

import { observer } from "mobx-react"
import { SearchBox } from "@uifabric/components"
import * as React from "react"

import { IListingListContainerProps, ListingListContainer } from "./ListingList"
import { ListingTile } from "./ListingTile"
import { ListingViewConfig } from "./ListingViewConfig"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingListPageStyles {
  root?: IStyle
  input?: IStyle
  results?: IStyle
}

const defaultStyles = (theme: ITheme): IListingListPageStyles => {
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
  (theme?: ITheme, customStyles?: IListingListPageStyles | undefined): IListingListPageStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingListPageClassNames {
  root?: string
  input?: string
  results?: string
}

const getClassNames = memoizeFunction((styles: IListingListPageStyles, className: string) => {
  return mergeStyleSets({
    root: ["listing-list-page", className, styles.root],
    input: ["listing-list-page-input", styles.input],
    results: ["listing-list-page-results", styles.results]
  })
})

interface IListingListPageProps extends IListingListContainerProps {
  styles?: IListingListPageStyles
  className?: string
  onLaunch?: (listing: IListing) => void
}

@observer
class ListingListSearchInput extends React.Component<IListingListPageProps, any> {
  private _onSearchChange = (newValue: any) => {
    this.props.listings.setSearchText(newValue)
  }
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return (
      <div className={classNames.input}>
        <SearchBox
          value={this.props.listings.searchText}
          placeholder={`Search ${ListingViewConfig.labelPlural}`}
          onChange={this._onSearchChange}
        />
      </div>
    )
  }
}

class ListingListPage extends React.Component<IListingListPageProps, any> {
  private _onRenderItem = (listing, idx, props) => {
    return <ListingTile key={listing.id} listing={listing} onClick={props.onSelectItem} onLaunch={this.props.onLaunch} />
  }
  render() {
    const classNames = getClassNames(getStyles(undefined, this.props.styles), this.props.className)
    return (
      <div className={classNames.root}>
        <ListingListSearchInput {...this.props} />
        <div className={classNames.results}>
          <ListingListContainer {...this.props} onRenderListing={this._onRenderItem} />
        </div>
      </div>
    )
  }
}

export { IListingListPageClassNames }
export { IListingListPageStyles }
export { IListingListPageProps, ListingListPage }
