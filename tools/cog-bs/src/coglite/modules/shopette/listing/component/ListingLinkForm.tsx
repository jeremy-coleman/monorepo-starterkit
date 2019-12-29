
import { getKeyErrorMessage } from "coglite/shared/components"
import { IListingLinkModel, IListingModel } from "coglite/types"
import { observer } from "mobx-react"
import { DefaultButton, IconButton, TextField } from "@uifabric/components"
import * as React from "react"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingLinkFormStyles {
  root?: IStyle
  editor?: IStyle
  editors?: IStyle
  nameField?: IStyle
  urlField?: IStyle
  removeAction?: IStyle
  actions?: IStyle
}

const defaultStyles = (theme: ITheme): IListingLinkFormStyles => {
  return {
    root: {},
    editor: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center"
    },
    editors: {
      marginBottom: 8,
      selectors: {
        "$editor+$editor": {
          marginTop: 8
        }
      }
    },
    nameField: {
      marginRight: 8,
      width: "30%"
    },
    urlField: {
      marginLeft: 8,
      width: "50%"
    },
    removeAction: {
      marginLeft: 8
    },
    actions: {}
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme: ITheme, customStyles?: IListingLinkFormStyles): IListingLinkFormStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingLinkFormClassNames {
  root?: string
  editor?: string
  editors?: string
  nameField?: string
  urlField?: string
  removeAction?: string
  actions?: string
}

const getClassNames = memoizeFunction((styles: IListingLinkFormStyles, className?: string) => {
  return mergeStyleSets({
    root: ["listing-link-form", styles.root, className],
    editor: ["listing-link-form-editor", styles.editor],
    editors: ["listing-link-form-editors", styles.editors],
    nameField: ["listing-link-form-name-field", styles.nameField],
    urlField: ["listing-link-form-url-field", styles.urlField],
    removeAction: ["listing-link-form-remove-action", styles.removeAction],
    actions: ["app-listing-link-form-actions", styles.actions]
  })
})


interface IListingLinkEditorProps {
  listingLink: IListingLinkModel
  className?: string
  styles?: IListingLinkFormStyles
  classNames?: IListingLinkFormClassNames
}

@observer
class ListingLinkEditor extends React.Component<IListingLinkEditorProps, any> {
  private _onNameChanged = (value: string) => {
    this.props.listingLink.setName(value)
  }
  private _onUrlChanged = (value: string) => {
    this.props.listingLink.setUrl(value)
  }
  private _onClickRemove = () => {
    this.props.listingLink.removeFromListing()
  }
  render() {
    const classNames = this.props.classNames || getClassNames(getStyles(null, this.props.styles), this.props.className)
    const inputDisabled = this.props.listingLink.listing.saveSync.syncing
    const validationErrors = this.props.listingLink.validationErrors
    return (
      <div className={classNames.editor}>
        <div className={classNames.nameField}>
          <TextField
            onChanged={this._onNameChanged}
            value={this.props.listingLink.name || ""}
            disabled={inputDisabled}
            required
            errorMessage={getKeyErrorMessage("name", validationErrors)}
            placeholder="Name"
          />
        </div>
        <div className={classNames.urlField}>
          <TextField
            onChanged={this._onUrlChanged}
            value={this.props.listingLink.url || ""}
            disabled={inputDisabled}
            required
            errorMessage={getKeyErrorMessage("url", validationErrors)}
            placeholder="URL"
          />
        </div>
        <div className={classNames.removeAction}>
          <IconButton iconProps={{ iconName: "Delete" }} onClick={this._onClickRemove} title="Remove Document" />
        </div>
      </div>
    )
  }
}

interface IListingLinkFormProps {
  listing: IListingModel
  className?: string
  styles?: IListingLinkFormStyles
  classNames?: IListingLinkFormClassNames
}

@observer
class ListingLinkForm extends React.Component<IListingLinkFormProps, any> {
  private _onClickAdd = () => {
    this.props.listing.addLink()
  }
  render() {
    const classNames = this.props.classNames || getClassNames(getStyles(null, this.props.styles), this.props.className)
    const docs = this.props.listing.doc_urls
    let content
    if (docs && docs.length > 0) {
      const editors = docs.map((doc, idx) => {
        return <ListingLinkEditor key={idx} listingLink={doc} />
      })
      content = <div className={classNames.editors}>{editors}</div>
    }
    return (
      <div className={classNames.root}>
        {content}
        <div className={classNames.actions}>
          <DefaultButton onClick={this._onClickAdd} iconProps={{ iconName: "Add" }}>
            Add Document
          </DefaultButton>
        </div>
      </div>
    )
  }
}

export { IListingLinkFormClassNames }
export { IListingLinkFormStyles }
export { IListingLinkEditorProps, IListingLinkFormProps, ListingLinkEditor, ListingLinkForm }

