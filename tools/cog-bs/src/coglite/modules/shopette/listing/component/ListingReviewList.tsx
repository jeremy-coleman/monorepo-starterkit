import { SyncComponent } from "coglite/shared/components"
import { IListingReviewListModel } from "coglite/types"
import { UserContainer } from "coglite/modules/user"

import { observer } from "mobx-react"
import { DefaultButton } from "@uifabric/components"
import { MessageBar, MessageBarType } from "@uifabric/components"
import * as React from "react"

import { canUserAccess } from "../ListingHelper"
import { ListingReview } from "./ListingReview"
import { ListingReviewForm } from "./ListingReviewForm"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingReviewListStyles {
  root?: IStyle
  items?: IStyle
  addContainer?: IStyle
}

const defaultStyles = (theme: ITheme): IListingReviewListStyles => {
  return {
    root: {},
    items: {
      padding: 8
    },
    addContainer: {
      margin: "16px 8px"
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingReviewListStyles | undefined): IListingReviewListStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)
interface IListingReviewListClassNames {
  root?: string
  items?: string
}

const getClassNames = memoizeFunction((styles: IListingReviewListStyles, className: string) => {
  return mergeStyleSets({
    root: ["listing-review-list", className, styles.root],
    items: ["listing-review-list-items", styles.items],
    addContainer: ["listing-review-list-add-container", styles.addContainer]
  })
})

interface IListingReviewListProps {
  reviewList: IListingReviewListModel
  className?: string
  styles?: IListingReviewListStyles
}

@observer
class ListingReviewListItems extends React.Component<IListingReviewListProps, any> {
  render() {
    const { reviewList } = this.props
    let content
    if (reviewList.itemsView.length > 0) {
      content = reviewList.itemsView.map((item) => {
        return <ListingReview key={item.id} review={item} />
      })
    } else {
      content = <MessageBar messageBarType={MessageBarType.info}>No Reviews available</MessageBar>
    }
    return <div className={this.props.className}>{content}</div>
  }
}

@observer
class ListingReviewAdd extends React.Component<IListingReviewListProps, any> {
  private _onCancel = () => {
    this.props.reviewList.cancelEdit()
  }
  private _onAfterSave = () => {
    this.props.reviewList.refresh()
  }
  private _onClickAdd = () => {
    this.props.reviewList.add()
  }
  render() {
    let content
    if (this.props.reviewList.newReview) {
      content = <ListingReviewForm review={this.props.reviewList.newReview} onCancel={this._onCancel} onAfterSave={this._onAfterSave} />
    } else {
      content = (
        <DefaultButton onClick={this._onClickAdd} iconProps={{ iconName: "Add" }}>
          Add Review
        </DefaultButton>
      )
    }

    return <div className={this.props.className}>{content}</div>
  }
}

class ListingReviewAddContainer extends React.Component<IListingReviewListProps, any> {
  private _onRenderUser = (userProfile) => {
    const listing = this.props.reviewList.listing
    const existing = this.props.reviewList.items.find((item) => {
      return item.author && item.author.id === userProfile.id
    })
    if (!existing && canUserAccess(listing, userProfile)) {
      return <ListingReviewAdd {...this.props} />
    }
    return null
  }
  render() {
    return <UserContainer onRenderUser={this._onRenderUser} />
  }
}

@observer
class ListingReviewSummary extends React.Component<IListingReviewListProps, any> {
  render() {
    const listing = this.props.reviewList.listing
    if (listing && listing.total_reviews > 0) {
      const totals = [listing.total_rate1, listing.total_rate2, listing.total_rate3, listing.total_rate4, listing.total_rate5]
      const max = totals.reduce((prev, current) => {
        return current > prev ? current : prev
      })
      return (
        <div style={{ margin: 8, width: 300 }}>
          <div>
            <div
              className="total_rate_5"
              title={`${listing.total_rate5} rated 5`}
              style={{
                width: `${(listing.total_rate5 / max || 0.01) * 100}%`,
                height: 12,
                backgroundColor: "#107c10"
              }}
            />
            <div
              className="total_rate_4"
              title={`${listing.total_rate4} rated 4`}
              style={{
                width: `${(listing.total_rate4 / max || 0.01) * 100}%`,
                height: 12,
                backgroundColor: "#bad80a"
              }}
            />
            <div
              className="total_rate_3"
              title={`${listing.total_rate3} rated 3`}
              style={{
                width: `${(listing.total_rate3 / max || 0.01) * 100}%`,
                height: 12,
                backgroundColor: "#ffb900"
              }}
            />
            <div
              className="total_rate_2"
              title={`${listing.total_rate2} rated 2`}
              style={{
                width: `${(listing.total_rate2 / max || 0.01) * 100}%`,
                height: 12,
                backgroundColor: "#ea4300"
              }}
            />
            <div
              className="total_rate_1"
              title={`${listing.total_rate1} rated 1`}
              style={{
                width: `${(listing.total_rate1 / max || 0.01) * 100}%`,
                height: 12,
                backgroundColor: "#a80000"
              }}
            />
          </div>
        </div>
      )
    }
    return null
  }
}

class ListingReviewList extends React.Component<IListingReviewListProps, any> {
  render() {
    const classNames = getClassNames(getStyles(undefined, this.props.styles), this.props.className)
    return (
      <div className={classNames.root}>
        <ListingReviewAddContainer {...this.props} className={classNames.addContainer} />
        <ListingReviewListItems {...this.props} className={classNames.items} />
      </div>
    )
  }
}

class ListingReviewListContainer extends React.Component<IListingReviewListProps, any> {
  private _onRenderDone = () => {
    return <ListingReviewList {...this.props} />
  }
  componentWillMount() {
    this.props.reviewList.load()
  }
  render() {
    return <SyncComponent sync={this.props.reviewList.sync} onRenderDone={this._onRenderDone} syncLabel="Loading Reviews..." />
  }
}

export { IListingReviewListClassNames }
export { IListingReviewListStyles }
export { IListingReviewListProps, ListingReviewListContainer, ListingReviewList }
