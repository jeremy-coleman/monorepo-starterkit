import { IListingModel } from "coglite/types"

import { observer } from "mobx-react"
import { Icon } from "@uifabric/components"
import { Link } from "@uifabric/components"
import { Spinner, SpinnerSize } from "@uifabric/components"
import * as React from "react"
import { IStyleFunctionOrObject, IStyle, classNamesFunction } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"
import { styled } from "@uifabric/styleguide"

export interface IListingUploadProps {
  listing: IListingModel
  className?: string
  styles?: IStyleFunctionOrObject<IListingUploadStyleProps, IListingUploadStyles>
  theme?: ITheme
  onAfterUpload?: (props: IListingUploadProps) => void
}

export interface IListingUploadStyleProps {
  className?: string
  theme?: ITheme
}

export interface IListingUploadStyles {
  root?: IStyle
  content?: IStyle
}

export const getStyles = (props: IListingUploadStyleProps): IListingUploadStyles => {
  let { className, theme } = props
  if (!theme) {
    theme = getTheme()
  }
  return {
    root: [
      "package-upload-input",
      {
        position: "relative",
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.neutralLight,
        borderRadius: 4,
        selectors: {
          "&.package-drag-over": {
            selectors: {
              $content: {
                backgroundColor: theme.palette.themeLight
              }
            }
          }
        }
      },
      className
    ],
    content: [
      "package-upload-input-content",
      {
        position: "absolute",
        top: 8,
        right: 8,
        bottom: 8,
        left: 8,
        border: `1px dashed ${theme.palette.neutralTertiary}`,
        borderRadius: 4,
        backgroundColor: theme.palette.white,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        whiteSpace: "pre-wrap"
      }
    ]
  }
}

const getClassNames = classNamesFunction<IListingUploadStyleProps, IListingUploadStyles>()

@observer
class ListingUploadBase extends React.Component<IListingUploadProps, any> {
  private _fileInputRef: HTMLInputElement
  private _upload(file: File) {
    const up = this.props.listing.upload(file)
    if (this.props.onAfterUpload) {
      up.then(() => {
        this.props.onAfterUpload(this.props)
      })
    }
  }
  private _onInputChange = (e) => {
    const fileList = this._fileInputRef.files
    if (fileList.length > 0) {
      // upload the file via the model
      this._upload(fileList.item(0))
    }
  }
  private _onFileInputRef = (ref: HTMLInputElement) => {
    this._fileInputRef = ref
  }
  private _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
  }
  private _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files.item(0)
      this._upload(file)
    }
  }
  private _onClickSelectPackage = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    try {
      this._fileInputRef.click()
    } catch (e) {}
  }
  render() {
    const { listing, styles, className, theme } = this.props
    const classNames = getClassNames(styles, {
      className: className,
      theme: theme
    })
    return (
      <div className={classNames.root} onDragOver={this._onDragOver} onDrop={this._onDrop}>
        <input
          type="file"
          accept=".zip, .tar.gz, .tgz"
          onChange={this._onInputChange}
          ref={this._onFileInputRef}
          value=""
          hidden={true}
          style={{ display: "none" }}
          disabled={listing.saveSync.syncing}
        />
        {listing.saveSync.syncing && (
          <div className={classNames.content}>
            <Spinner size={SpinnerSize.small} /> {listing.saveSync.type === "upload" ? " Uploading Package..." : " Saving Listing..."}
          </div>
        )}
        {!listing.saveSync.syncing && (
          <div className={classNames.content}>
            <Icon iconName="CloudUpload" /> Drop a package here or <Link onClick={this._onClickSelectPackage}>select a package</Link>
          </div>
        )}
      </div>
    )
  }
}

export const ListingUpload: React.StatelessComponent<IListingUploadProps> = styled<
  IListingUploadProps,
  IListingUploadStyleProps,
  IListingUploadStyles
>(ListingUploadBase, getStyles, undefined, {
  scope: "ListingUpload"
})
