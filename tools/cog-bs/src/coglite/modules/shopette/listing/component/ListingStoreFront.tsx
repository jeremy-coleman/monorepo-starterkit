import { SyncComponent } from "coglite/shared/components"
import { IListing, IListingStoreFront, ISyncSupplier } from "coglite/types"

import { observer } from "mobx-react"
import { MessageBar, MessageBarType } from "@uifabric/components"
import * as React from "react"

import { ListingList } from "./ListingList"
import { ListingTile } from "./ListingTile"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, FontWeights, getTheme } from "@uifabric/styleguide"

interface IListingStoreFrontStyles {
  root?: IStyle
  header?: IStyle
  searchInputContainer?: IStyle
  actions?: IStyle
  body?: IStyle
  section?: IStyle
  sectionHeader?: IStyle
  sectionTitle?: IStyle
  sectionBody?: IStyle
}

const defaultStyles = (theme: ITheme): IListingStoreFrontStyles => {
  return {
    root: {},
    header: {
      paddingTop: 8,
      paddingBottom: 0,
      paddingLeft: 16,
      paddingRight: 16
    },
    searchInputContainer: {
      selectors: {
        ".ms-SearchBox": {
          backgroundColor: theme.palette.white
        }
      }
    },
    body: {},
    section: {
      marginTop: 16
    },
    sectionHeader: {
      marginLeft: 16
    },
    sectionTitle: Object.assign({}, theme.fonts.large, {
      fontWeight: FontWeights.semibold
    }),
    sectionBody: {}
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction((theme?: ITheme, customStyles?: IListingStoreFrontStyles | undefined) => {
  if (!theme) {
    theme = getTheme()
  }
  return concatStyleSets(Defaults.styles(theme), customStyles)
})

interface IListingStoreFrontClassNames {
  root?: string
  header?: string
  searchInputContainer?: string
  body?: string
  section?: string
  sectionHeader?: string
  sectionTitle?: string
  sectionBody?: string
}

const getClassNames = memoizeFunction((styles: IListingStoreFrontStyles, className?: string) => {
  return mergeStyleSets({
    root: ["listing-store-front", className, styles.root],
    header: ["listing-store-front-header", styles.header],
    searchInputContainer: ["listing-store-front-search-input-container", styles.searchInputContainer],
    body: ["listing-store-front-body", styles.body],
    section: ["listing-store-front-section", styles.section],
    sectionHeader: ["listing-store-front-section-header", styles.sectionHeader],
    sectionTitle: ["listing-store-front-section-title", styles.sectionTitle],
    sectionBody: ["listing-store-front-section-body", styles.sectionBody]
  })
})

interface IListingStoreFrontProps {
  storeFront: ISyncSupplier<IListingStoreFront>
  onSelectItem?: (listing: IListing) => void
  onOpen?: (listing: IListing) => void
  onAdd?: () => void
  onShowAllListings?: () => void
  className?: string
  styles?: IListingStoreFrontStyles
  adminGroup?: string
}

interface IListingStoreFrontSectionProps {
  title: any
}

@observer
class ListingStoreFrontSection extends React.Component<IListingStoreFrontSectionProps, any> {
  render() {
    const classNames = getClassNames(getStyles(undefined))
    return (
      <div className={classNames.section}>
        <div className={classNames.sectionHeader}>
          <div className={classNames.sectionTitle}>{this.props.title}</div>
        </div>
        <div className={classNames.sectionBody}>{this.props.children}</div>
      </div>
    )
  }
}

interface IListingStoreFrontListSectionProps extends IListingStoreFrontProps, IListingStoreFrontSectionProps {
  listKey: string
}

class ListingStoreFrontListSection extends React.Component<IListingStoreFrontListSectionProps, any> {
  private _onRenderItem = (listing, idx, props) => {
    return <ListingTile key={listing.id} listing={listing} onClick={props.onSelectItem} onLaunch={this.props.onOpen} />
  }
  private _onRenderDone = () => {
    const list = this.props.storeFront.value ? this.props.storeFront.value[this.props.listKey] : undefined
    if (list && list.length > 0) {
      return <ListingList compact wrapping listings={list} onSelectItem={this.props.onSelectItem} onRenderListing={this._onRenderItem} />
    }
    return <MessageBar messageBarType={MessageBarType.info}>No {this.props.title} Listings available</MessageBar>
  }
  render() {
    return (
      <ListingStoreFrontSection title={this.props.title}>
        <SyncComponent
          sync={this.props.storeFront.sync}
          onRenderDone={this._onRenderDone}
          syncLabel={`Loading ${this.props.title} Listings...`}
        />
      </ListingStoreFrontSection>
    )
  }
}

class ListingStoreFrontFeaturedSection extends React.Component<IListingStoreFrontProps, any> {
  render() {
    return <ListingStoreFrontListSection {...this.props} listKey="featured" title="Featured" />
  }
}

class ListingStoreFrontMostPopularSection extends React.Component<IListingStoreFrontProps, any> {
  render() {
    return <ListingStoreFrontListSection {...this.props} listKey="most_popular" title="Most Popular" />
  }
}

class ListingStoreFrontRecommendedSection extends React.Component<IListingStoreFrontProps, any> {
  render() {
    return <ListingStoreFrontListSection {...this.props} listKey="recommended" title="Recommended" />
  }
}

class ListingStoreFrontRecentSection extends React.Component<IListingStoreFrontProps, any> {
  render() {
    return <ListingStoreFrontListSection {...this.props} listKey="recent" title="Recent" />
  }
}

class ListingStoreFront extends React.Component<IListingStoreFrontProps, any> {
  render() {
    const styles = getStyles(undefined, this.props.styles)
    const classNames = getClassNames(styles)
    return (
      <div className={classNames.root}>
        <ListingStoreFrontFeaturedSection {...this.props} />
        <ListingStoreFrontMostPopularSection {...this.props} />
        <ListingStoreFrontRecommendedSection {...this.props} />
        <ListingStoreFrontRecentSection {...this.props} />
      </div>
    )
  }
}

class ListingStoreFrontContainer extends React.Component<IListingStoreFrontProps, any> {
  componentWillMount() {
    this.props.storeFront.load()
  }
  private _onRenderDone = () => {
    return <ListingStoreFront {...this.props} />
  }
  render() {
    return <SyncComponent sync={this.props.storeFront.sync} onRenderDone={this._onRenderDone} />
  }
}

export { IListingStoreFrontClassNames }
export { IListingStoreFrontStyles }
export { IListingStoreFrontProps, ListingStoreFrontContainer, ListingStoreFront }
