import { SyncComponent, SyncOverlay } from "coglite/shared/components"
import { ICategory, IListing, IListingBookmarkListModel, IListingModel, ISyncSupplier, IUserProfile } from "coglite/types"
import { UserAdminContainer, UserAdminContext, UserAuthContainer } from "coglite/modules/user"
import { observer } from "mobx-react"
import { DefaultButton, Dialog, DialogFooter, Link, Pivot, PivotItem, PrimaryButton, Rating, Toggle } from "@uifabric/components"
import * as React from "react"
import { canUserAccess } from "../ListingHelper"
import { getActivity } from "../models/ListingActivityHelper"
import { getReviews } from "../models/ListingReviewHelper"
import { ListingBookmarkListStore } from "../stores"
import { ListingActivityListContainer } from "./ListingActivityList"
import { ListingApprovalStatusComponent } from "./ListingApprovalStatus"
import { ListingBannerIcon } from "./ListingBannerIcon"
import { ListingBookmarkButton } from "./ListingBookmarkButton"
import { ListingLaunchAction } from "./ListingLaunchAction"
import { ListingLinks } from "./ListingLinks"
import { ListingReviewListContainer } from "./ListingReviewList"
import { ListingSyncError } from "./ListingSyncError"
import { ListingViewConfig } from "./ListingViewConfig"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, FontWeights, getTheme } from "@uifabric/styleguide"
import { isNotBlank } from "coglite/shared/util"

interface IListingStyles {
  root?: IStyle
  appDetails?: IStyle
  content?: IStyle
  metadata?: IStyle
  metadataSection?: IStyle
  metadataSectionTitle?: IStyle
  metadataSectionContent?: IStyle
  title?: IStyle
  overview?: IStyle
  shortDescription?: IStyle
  detailContent?: IStyle
  detailTabs?: IStyle
  description?: IStyle
  actions?: IStyle
  banner?: IStyle
  rating?: IStyle
  ratingStars?: IStyle
  reviewCount?: IStyle
}

interface IListingClassNames {
  root?: string
  metadata?: string
  metadataSection?: string
  metadataSectionTitle?: string
  metadataSectionContent?: string
  actions?: string
  summary?: string
  title?: string
  overview?: string
  shortDescription?: string
  detailContent?: string
  detailTabs?: string
  description?: string
  banner?: string
  rating?: string
  ratingStars?: string
  reviewCount?: string
}

const defaultStyles = (theme: ITheme): IListingStyles => {
  return {
    root: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden"
    },
    metadata: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: 240,
      paddingTop: 8,
      paddingLeft: 12,
      paddingBottom: 8,
      overflow: "auto"
    },
    metadataSection: {
      marginTop: 8
    },
    metadataSectionTitle: {
      margin: 0,
      paddingBottom: 4,
      fontSize: "12px",
      fontWeight: FontWeights.semibold
    },
    metadataSectionContent: {
      fontWeight: FontWeights.light,
      fontSize: "12px"
    },
    detailContent: {
      position: "absolute",
      left: 260,
      top: 0,
      bottom: 0,
      right: 0,
      paddingTop: 8,
      paddingRight: 12,
      overflow: "auto"
    },
    detailTabs: {},
    title: {
      paddingLeft: 8,
      fontSize: "21px",
      fontWeight: FontWeights.semibold
    },
    overview: {
      paddingTop: 8
    },
    shortDescription: {
      padding: 8,
      fontSize: "15px",
      fontWeight: FontWeights.semibold
    },
    actions: {
      display: "flex",
      alignItems: "center",
      marginTop: 8,
      selectors: {
        ".ms-Button+.ms-Button": {
          marginLeft: 8
        }
      }
    },
    description: {
      padding: 8,
      whiteSpace: "pre-wrap",
      fontSize: "14px",
      fontWeight: FontWeights.semilight
    },
    banner: {
      width: 220,
      height: 137,
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.palette.neutralLight
    },
    rating: {
      marginTop: 8,
      display: "flex"
    },
    ratingStars: {
      color: theme.palette.yellow
    },
    reviewCount: {
      paddingLeft: 8
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction((theme?: ITheme, customStyles?: IListingStyles | undefined) => {
  if (!theme) {
    theme = getTheme()
  }
  return concatStyleSets(Defaults.styles(theme), customStyles)
})

const getClassNames = memoizeFunction((styles: IListingStyles, className?: string) => {
  return mergeStyleSets({
    root: ["listing", className, styles.root],
    metadata: ["listing-metadata", styles.metadata],
    metadataSection: ["listing-metadata-section", styles.metadataSection],
    metadataSectionTitle: ["listing-metadata-section-title", styles.metadataSectionTitle],
    metadataSectionContent: ["listing-metadata-section-title", styles.metadataSectionContent],
    detailContent: ["listing-detail-content", styles.detailContent],
    detailTabs: ["listing-detail-tabs", styles.detailTabs],
    overview: ["listing-overview", styles.overview],
    title: ["listing-title", styles.title],
    shortDescription: ["listing-short-description", styles.shortDescription],
    actions: ["listing-actions", styles.actions],
    description: ["listing-description", styles.description],
    banner: ["listing-banner", styles.banner],
    rating: ["listing-rating", styles.rating],
    ratingStars: ["listing-rating-stars", styles.ratingStars],
    reviewCount: ["listing-review-count", styles.reviewCount]
  })
})

const ListingCSS = {
  getClassNames,
  getStyles,
  defaultStyles,
  Defaults
}


interface IListingProps {
  listing: IListingModel
  adminGroup?: string
  bookmarkList?: IListingBookmarkListModel
  onEdit?: (listing: IListingModel) => void
  onLaunch?: (listing: IListing) => void
  onDelete?: (listing: IListingModel) => void
  onSelectCategory?: (category: ICategory) => void
  styles?: IListingStyles
  className?: string
}

class ListingReviews extends React.Component<IListingProps, any> {
  render() {
    return <ListingReviewListContainer reviewList={getReviews(this.props.listing)} />
  }
}

class ListingActivity extends React.Component<IListingProps, any> {
  render() {
    return <ListingActivityListContainer activityList={getActivity(this.props.listing)} />
  }
}

interface IListingCategoryProps extends IListingProps {
  category: ICategory
  onClickCategory?: (category: ICategory) => void
}

class ListingCategory extends React.Component<IListingCategoryProps, any> {
  private _onClick = (e) => {
    e.preventDefault()
    if (this.props.onClickCategory) {
      this.props.onClickCategory(this.props.category)
    }
  }
  render() {
    return (
      <div>
        <Link onClick={this._onClick}>{this.props.category.title}</Link>
      </div>
    )
  }
}

class ListingCategoryList extends React.Component<IListingProps, any> {
  render() {
    const categories = this.props.listing.categories
    if (categories && categories.length > 0) {
      const categoryViews = categories.map((c) => {
        return <ListingCategory key={c.title} {...this.props} category={c} onClickCategory={this.props.onSelectCategory} />
      })
      return categoryViews
    }
    return null
  }
}

@observer
class ListingCategories extends React.Component<IListingProps, any> {
  render() {
    if (this.props.listing.categories && this.props.listing.categories.length > 0) {
      return (
        <ListingMetadataSection {...this.props} title="Categories">
          <ListingCategoryList {...this.props} />
        </ListingMetadataSection>
      )
    }
    return null
  }
}

@observer
class ListingType extends React.Component<IListingProps, any> {
  render() {
    if (this.props.listing.listing_type && this.props.listing.listing_type.title) {
      return (
        <ListingMetadataSection {...this.props} title="Type">
          {this.props.listing.listing_type.title}
        </ListingMetadataSection>
      )
    }
    return null
  }
}

interface IListingMetadataSectionProps extends IListingProps {
  title?: any
}

class ListingMetadataSection extends React.Component<IListingMetadataSectionProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    const { title } = this.props
    return (
      <div className={classNames.metadataSection}>
        {title && <h5 className={classNames.metadataSectionTitle}>{title}</h5>}
        {React.Children.count(this.props.children) > 0 && <div className={classNames.metadataSectionContent}>{this.props.children}</div>}
      </div>
    )
  }
}

@observer
class ListingBanner extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    const { listing } = this.props
    return (
      <div className={classNames.banner}>
        <ListingBannerIcon listing={listing} />
      </div>
    )
  }
}

@observer
class ListingRating extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    const { listing } = this.props
    let content
    let reviewCount
    if (listing.avg_rate !== undefined && listing.avg_rate > 0) {
      content = (
        <Rating
          className={classNames.ratingStars}
          min={1}
          max={5}
          rating={listing.avg_rate}
          readOnly={true}
          ariaLabelFormat="Rated {0} out of {1}"
        />
      )
      reviewCount = (
        <div className={classNames.reviewCount}>
          ({listing.total_rate1 + listing.total_rate2 + listing.total_rate3 + listing.total_rate4 + listing.total_rate5})
        </div>
      )
    } else {
      content = (
        <Rating
          title="No Reviews Available"
          min={1}
          max={5}
          rating={5}
          readOnly={true}
          disabled={true}
          ariaLabelFormat="No reviews available"
        />
      )
    }
    return (
      <div className={classNames.rating}>
        {content}
        {reviewCount}
      </div>
    )
  }
}

class ListingActions extends React.Component<IListingProps, any> {
  private _canUserAccess = (userProfile: IUserProfile) => {
    return UserAdminContext.value(userProfile) || canUserAccess(this.props.listing, userProfile)
  }
  private _onRenderAuth = () => {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return (
      <div className={classNames.actions}>
        <ListingBookmarkButton bookmarkList={ListingBookmarkListStore} listing={this.props.listing} />
        <ListingLaunchAction onLaunch={this.props.onLaunch} listing={this.props.listing} />
      </div>
    )
  }
  render() {
    return <UserAuthContainer isAuthorised={this._canUserAccess} onRenderUser={this._onRenderAuth} />
  }
}

@observer
class ListingVersion extends React.Component<IListingProps, any> {
  render() {
    if (this.props.listing.version_name) {
      return (
        <ListingMetadataSection {...this.props} title="Version">
          {this.props.listing.version_name}
        </ListingMetadataSection>
      )
    }
    return null
  }
}

@observer
class ListingApprovalStatus extends React.Component<IListingProps, any> {
  render() {
    if (this.props.listing.approval_status) {
      return (
        <ListingMetadataSection {...this.props} title="Approval Status">
          <ListingApprovalStatusComponent listing={this.props.listing} />
        </ListingMetadataSection>
      )
    }
    return null
  }
}

interface IListingToggleProps extends IListingProps {
  disabled?: boolean
}

@observer
class ListingEnabledToggle extends React.Component<IListingToggleProps, any> {
  private _onChanged = (checked: boolean) => {
    this.props.listing.savedEnabled(checked)
  }
  render() {
    return (
      <Toggle
        checked={this.props.listing.is_enabled}
        title={this.props.listing.is_enabled ? "Yes" : "No"}
        onChanged={this._onChanged}
        disabled={this.props.disabled}
      />
    )
  }
}

class ListingEnabled extends React.Component<IListingProps, any> {
  private _onRenderNonAdmin = () => {
    return <ListingEnabledToggle {...this.props} disabled />
  }
  private _onRenderAdmin = () => {
    return <ListingEnabledToggle {...this.props} />
  }
  render() {
    return (
      <ListingMetadataSection {...this.props} title="Enabled">
        <UserAdminContainer onRenderUser={this._onRenderAdmin} onRenderNonAdmin={this._onRenderNonAdmin} />
      </ListingMetadataSection>
    )
  }
}

@observer
class ListingFeaturedToggle extends React.Component<IListingToggleProps, any> {
  private _onChanged = (checked: boolean) => {
    this.props.listing.saveFeatured(checked)
  }
  render() {
    return (
      <Toggle
        checked={this.props.listing.is_featured}
        title={this.props.listing.is_featured ? "Yes" : "No"}
        onChanged={this._onChanged}
        disabled={this.props.disabled}
      />
    )
  }
}

@observer
class ListingFeatured extends React.Component<IListingProps, any> {
  private _onRenderNonAdmin = () => {
    return <ListingFeaturedToggle {...this.props} disabled />
  }
  private _onRenderAdmin = () => {
    return <ListingFeaturedToggle {...this.props} />
  }
  render() {
    return (
      <ListingMetadataSection {...this.props} title="Featured">
        <UserAdminContainer onRenderUser={this._onRenderAdmin} onRenderNonAdmin={this._onRenderNonAdmin} />
      </ListingMetadataSection>
    )
  }
}

@observer
class ListingIframeCompatibleToggle extends React.Component<IListingToggleProps, any> {
  private _onChanged = (checked: boolean) => {
    this.props.listing.saveIframeCompatible(checked)
  }
  render() {
    return (
      <Toggle
        checked={this.props.listing.iframe_compatible}
        title={this.props.listing.iframe_compatible ? "Yes" : "No"}
        onChanged={this._onChanged}
        disabled={this.props.disabled}
      />
    )
  }
}

@observer
class ListingIframe extends React.Component<IListingProps, any> {
  private _onRenderNonAdmin = () => {
    return <ListingIframeCompatibleToggle {...this.props} disabled />
  }
  private _onRenderAdmin = () => {
    return <ListingIframeCompatibleToggle {...this.props} />
  }
  render() {
    return (
      <ListingMetadataSection {...this.props} title="Iframe Compatible">
        <UserAdminContainer onRenderUser={this._onRenderAdmin} onRenderNonAdmin={this._onRenderNonAdmin} />
      </ListingMetadataSection>
    )
  }
}

@observer
class ListingSecurity extends React.Component<IListingProps, any> {
  render() {
    if (this.props.listing.security_marking) {
      return (
        <ListingMetadataSection {...this.props} title="Security">
          {this.props.listing.security_marking}
        </ListingMetadataSection>
      )
    }
    return false
  }
}

class ListingMetadata extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return (
      <div className={classNames.metadata}>
        <ListingBanner {...this.props} />
        <ListingActions {...this.props} />
        <ListingRating {...this.props} />
        <ListingVersion {...this.props} />
        <UserAdminContainer>
          <ListingApprovalStatus {...this.props} />
        </UserAdminContainer>
        <ListingType {...this.props} />
        <ListingEnabled {...this.props} />
        <ListingFeatured {...this.props} />
        <ListingIframe {...this.props} />
        <ListingCategories {...this.props} />
        <ListingSecurity {...this.props} />
      </div>
    )
  }
}

@observer
class ListingTitle extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return <div className={classNames.title}>{this.props.listing.title}</div>
  }
}

@observer
class ListingShortDescription extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return <div className={classNames.shortDescription}>{this.props.listing.description_short}</div>
  }
}

@observer
class ListingDescription extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return <div className={classNames.description}>{this.props.listing.description}</div>
  }
}

class ListingOverview extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return (
      <div className={classNames.overview}>
        <ListingShortDescription {...this.props} />
        <ListingDescription {...this.props} />
      </div>
    )
  }
}

class ListingDetailTabs extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    const overviewVisible = isNotBlank(this.props.listing.description_short) || isNotBlank(this.props.listing.description)
    const pivotItems = []
    if (overviewVisible) {
      pivotItems.push(
        <PivotItem key="overview" linkText="Overview">
          <ListingOverview {...this.props} />
        </PivotItem>
      )
    }
    pivotItems.push(
      <PivotItem key="reviews" linkText="Reviews">
        <ListingReviews {...this.props} />
      </PivotItem>
    )
    pivotItems.push(
      <PivotItem key="activity" linkText="Activity">
        <ListingActivity {...this.props} />
      </PivotItem>
    )
    pivotItems.push(
      <PivotItem key="docs" linkText="Documents">
        <ListingLinks {...this.props} />
      </PivotItem>
    )
    return (
      <div className={classNames.detailTabs}>
        <Pivot>{pivotItems}</Pivot>
      </div>
    )
  }
}

class ListingDetails extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    return (
      <div className={classNames.detailContent}>
        <ListingSyncError {...this.props} sync={this.props.listing.saveSync} />
        <ListingTitle {...this.props} />
        <ListingDetailTabs {...this.props} />
      </div>
    )
  }
}

class Listing extends React.Component<IListingProps, any> {
  render() {
    const classNames = getClassNames(getStyles(undefined, this.props.styles), this.props.className)
    return (
      <div className={classNames.root}>
        <SyncOverlay sync={this.props.listing.saveSync} syncLabel="Please wait..." />
        <ListingMetadata {...this.props} />
        <ListingDetails {...this.props} />
      </div>
    )
  }
}

class ListingTitleContainer extends React.Component<IListingProps, any> {
  private _onRenderDone = () => {
    return this.props.listing.title
  }
  private _onRenderSync = () => {
    return `Loading...`
  }
  render() {
    return <SyncComponent sync={this.props.listing.loadSync} onRenderSync={this._onRenderSync} onRenderDone={this._onRenderDone} />
  }
}

interface IListingContainerProps extends IListingProps {
  onRenderListing?: (props: IListingProps) => React.ReactNode
}

class ListingContainer extends React.Component<IListingContainerProps, any> {
  componentWillMount() {
    this.props.listing.load()
  }
  private _onRenderListing = () => {
    if (this.props.onRenderListing) {
      return this.props.onRenderListing(this.props)
    }
    return <Listing {...this.props} />
  }
  render() {
    return <SyncComponent sync={this.props.listing.loadSync} onRenderDone={this._onRenderListing} />
  }
}

interface IListingDeleteProps {
  listingSupplier: ISyncSupplier<IListingModel>
}

@observer
class ListingDeleteDialog extends React.Component<IListingDeleteProps, any> {
  private _onDismissed = () => {
    this.props.listingSupplier.clearValue()
  }
  private _onClickCancel = () => {
    this.props.listingSupplier.clearValue()
  }
  private _onClickConfirm = () => {
    this.props.listingSupplier.value.delete()
    this.props.listingSupplier.clearValue()
  }
  render() {
    const listing = this.props.listingSupplier.value
    const content = listing ? (
      <div>
        Are you sure you want to delete <strong>{listing.title}</strong>
      </div>
    ) : (
      undefined
    )
    return (
      <Dialog hidden={listing ? false : true} title={`Delete ${ListingViewConfig.label}`} onDismissed={this._onDismissed}>
        {content}
        <DialogFooter>
          <DefaultButton onClick={this._onClickCancel}>Cancel</DefaultButton>
          <PrimaryButton onClick={this._onClickConfirm}>OK</PrimaryButton>
        </DialogFooter>
      </Dialog>
    )
  }
}


export { IListingStyles, IListingClassNames }
export { IListingProps, Listing, ListingContainer, ListingTitleContainer, IListingDeleteProps, ListingDeleteDialog }