
import { IListingReview } from "coglite/types"
import { UserInfo } from "coglite/modules/user"

import { ActivityItem, Link, Rating, TooltipHost } from "@uifabric/components"
import * as React from "react"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"
import { split, isWhitespace } from "coglite/shared/util"

interface IListingReviewStyles {
  root?: IStyle
  text?: IStyle
}

const defaultStyles = (theme: ITheme): IListingReviewStyles => {
  return {
    root: {
      marginBottom: 12
    },
    text: {
      paddingTop: 4,
      paddingBottom: 4
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingReviewStyles | undefined): IListingReviewStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)
interface IListingReviewClassNames {
  root?: string
  text?: string
}

const getClassNames = memoizeFunction((styles: IListingReviewStyles, className: string) => {
  return mergeStyleSets({
    root: ["listing-review", className, styles.root],
    text: ["listing-review-text", styles.text]
  })
})

interface IListingReviewProps {
  review: IListingReview
  className?: string
  styles?: IListingReviewStyles
}

const getReviewName = (activity: IListingReview): string => {
  return activity.author ? activity.author.display_name : ""
}

const getReviewInitials = (activity: IListingReview): string => {
  if (activity.author && activity.author.display_name) {
    const items = split(activity.author.display_name, isWhitespace)
    const letters = items.map((e) => {
      return e.charAt(0).toUpperCase()
    })
    return letters.join("")
  }
  return ""
}

class ListingReviewUser extends React.Component<IListingReviewProps, any> {
  private _onRenderContent = () => {
    return <UserInfo userProfile={this.props.review.author} />
  }
  private _onClickUser = () => {}
  render() {
    return (
      <TooltipHost tooltipProps={{ onRenderContent: this._onRenderContent }} calloutProps={{ gapSpace: 0 }}>
        <Link onClick={this._onClickUser}>{getReviewName(this.props.review)}</Link>
      </TooltipHost>
    )
  }
}

class ListingReview extends React.Component<IListingReviewProps, any> {
  render() {
    const classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    const review = this.props.review
    return (
      <ActivityItem
        className={classNames.root}
        activityDescription={[
          <strong key="user">
            <ListingReviewUser {...this.props} />
          </strong>,
          <Rating key="rating" rating={review.rate} readOnly={true} />,
          <div key="text" className={classNames.text}>
            {review.text}
          </div>
        ]}
        activityPersonas={[
          {
            text: getReviewName(review),
            imageInitials: getReviewInitials(review)
          }
        ]}
        timeStamp={review.edited_date || review.created_date}
      />
    )
  }
}

export { IListingReviewClassNames }
export { IListingReviewStyles }
export { IListingReviewProps, ListingReview }
