import { IListingReviewModel } from "coglite/types"

import { observer } from "mobx-react"
import { DefaultButton, PrimaryButton } from "@uifabric/components"
import { Rating } from "@uifabric/components"
import { TextField } from "@uifabric/components"
import * as React from "react"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingReviewFormStyles {
  root?: IStyle
  editor?: IStyle
  actions?: IStyle
}

const defaultStyles = (theme: ITheme): IListingReviewFormStyles => {
  return {
    root: {
      boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.4)"
    },
    editor: {
      selectors: {
        ".rating": {
          padding: "4px 8px"
        },
        ".review": {
          padding: "4px 8px"
        }
      }
    },
    actions: {
      padding: "4px 8px",
      selectors: {
        ".ms-Button+.ms-Button": {
          marginLeft: 8
        }
      }
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingReviewFormStyles | undefined): IListingReviewFormStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingReviewFormClassNames {
  root?: string
  items?: string
}

const getClassNames = memoizeFunction((styles: IListingReviewFormStyles, className: string) => {
  return mergeStyleSets({
    root: ["listing-review-form", className, styles.root],
    editor: ["listing-review-form-editor", styles.editor],
    actions: ["listing-review-form-actions", styles.actions]
  })
})

interface IListingReviewFormProps {
  review: IListingReviewModel
  className?: string
  styles?: IListingReviewFormStyles
  onAfterSave?: (review: IListingReviewModel) => void
  onCancel?: () => void
}

@observer
class ListingReviewEditor extends React.Component<IListingReviewFormProps, any> {
  private _onRatingChanged = (rating: number) => {
    this.props.review.setRate(rating)
  }
  private _onCommentsChanged = (text: string) => {
    this.props.review.setText(text)
  }
  render() {
    return (
      <div className={this.props.className}>
        <div className="rating">
          <Rating
            min={1}
            max={5}
            onChanged={this._onRatingChanged}
            rating={this.props.review.rate || null}
            disabled={this.props.review.sync.syncing}
          />
        </div>
        <div className="review">
          <TextField
            placeholder="Tell us what you think"
            multiline={true}
            resizable={false}
            onChanged={this._onCommentsChanged}
            disabled={this.props.review.sync.syncing}
          />
        </div>
      </div>
    )
  }
}

@observer
class ListingReviewActions extends React.Component<IListingReviewFormProps, any> {
  private _onClickCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel()
    }
  }
  private _onClickSave = () => {
    this.props.review.save().then(() => {
      if (!this.props.review.sync.error && this.props.onAfterSave) {
        this.props.onAfterSave(this.props.review)
      }
    })
  }
  render() {
    const savedDisabled = this.props.review.sync.syncing || this.props.review.rate === null || this.props.review.rate === undefined
    return (
      <div className={this.props.className}>
        <DefaultButton className="listing-review-action" onClick={this._onClickCancel} disabled={this.props.review.sync.syncing}>
          Cancel
        </DefaultButton>
        <PrimaryButton
          className="listing-review-action"
          iconProps={{ iconName: "Save" }}
          onClick={this._onClickSave}
          disabled={savedDisabled}
        >
          Save
        </PrimaryButton>
      </div>
    )
  }
}

class ListingReviewForm extends React.Component<IListingReviewFormProps, any> {
  render() {
    const classNames = getClassNames(getStyles(undefined, this.props.styles), this.props.className)
    return (
      <div className={classNames.root}>
        <ListingReviewEditor {...this.props} className={classNames.editor} />
        <ListingReviewActions {...this.props} className={classNames.actions} />
      </div>
    )
  }
}

export { IListingReviewFormClassNames }
export { IListingReviewFormStyles }
export { IListingReviewFormProps, ListingReviewEditor, ListingReviewForm }
