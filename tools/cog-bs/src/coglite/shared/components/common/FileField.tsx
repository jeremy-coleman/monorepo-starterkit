import { IconButton, Label } from "@uifabric/components"
import { mergeStyleSets } from "@uifabric/styleguide"
import { getId } from "@uifabric/styleguide"
import { theme } from "coglite/shared/theme/defaultTheme"
import * as React from "react"

const FileFieldStylesheet = mergeStyleSets({
  root: ["field-field", {}],
  wrapper: ["field-field-wrapper", {}],
  selector: [
    "field-field-selector",
    {
      position: "relative",
      border: `1px solid ${theme.palette.neutralTertiary}`,
      minHeight: 32,
      width: "100%",
      selectors: {
        "&:focus": {
          border: `1px solid ${theme.palette.themePrimary}`
        },
        "&:hover": {
          border: `1px solid ${theme.palette.neutralSecondary}`
        }
      }
    }
  ],
  selectorAction: [
    "field-field-selection-action",
    {
      background: theme.palette.white,
      outline: "none",
      textAlign: "left",
      padding: "4px 12px",
      border: "none",
      minHeight: 32,
      width: "100%",
      zIndex: 1
    }
  ],
  clearAction: [
    "field-field-clear-action",
    {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 2
    }
  ]
})

type IFileFieldStyles = typeof FileFieldStylesheet

export interface IFileFieldProps {
  files?: File[]
  label?: string
  onChange?: (files: File[]) => void
  onRenderFiles?: (files: File[]) => React.ReactNode
  onRenderSelect?: () => React.ReactNode
  defaultSelectText?: string
  accept?: string
  multiple?: boolean
  className?: string
  styles?: IFileFieldStyles
  disabled?: boolean
  onClear?: () => void
}

interface IFilesProps {
  files: File[]
}

class FileNameList extends React.Component<IFilesProps, any> {
  render() {
    if (this.props.files && this.props.files.length > 0) {
      const items = this.props.files.map((file, idx) => {
        return (
          <div key={idx} className="file-name">
            {file.name}
          </div>
        )
      })
      return <div className="file-name-list">{items}</div>
    }
    return null
  }
}

const defaultFilesRenderer = (files: File[]) => {
  return <FileNameList files={files} />
}

export interface IFileFieldState {
  files?: File[]
}

export class FileField extends React.Component<IFileFieldProps, IFileFieldState> {
  private _ref: HTMLInputElement
  private _id: string
  constructor(props: IFileFieldProps) {
    super(props)
    this.state = { files: this.props.files }
    this._id = getId("image-field")
  }
  UNSAFE_componentWillReceiveProps(nextProps: IFileFieldProps) {
    this.setState({ files: nextProps.files || [] })
  }
  private _onInputChange = (e) => {
    const files: File[] = []
    const fileList = this._ref.files
    const fl = fileList.length
    for (let i = 0; i < fl; i++) {
      files.push(fileList.item(i))
    }
    if (this.props.onChange) {
      this.props.onChange(files)
    }
    this.setState({ files: files })
  }
  private _onFileInputRef = (ref: HTMLInputElement) => {
    this._ref = ref
  }
  private _onFieldGroupClick = () => {
    if (this._ref) {
      this._ref.click()
    }
  }
  private _onClickClear = () => {
    this.setState({ files: null })
    if (this.props.onClear) {
      this.props.onClear()
    }
  }
  render() {
    let selectContent
    let clearAction
    const files = this.state.files
    if (this.props.onClear || (files && files.length > 0)) {
      clearAction = (
        <IconButton
          className={FileFieldStylesheet.clearAction}
          iconProps={{ iconName: "Clear" }}
          onClick={this._onClickClear}
          disabled={this.props.disabled}
        />
      )
    }
    if (this.state.files && this.state.files.length > 0) {
      const r = this.props.onRenderFiles || defaultFilesRenderer
      selectContent = r(this.state.files)
    } else {
      selectContent = this.props.onRenderSelect
        ? this.props.onRenderSelect()
        : this.props.defaultSelectText || `Select ${this.props.multiple ? "Files..." : "a File..."}`
    }
    return (
      <div className={FileFieldStylesheet.root}>
        <input
          id={this._id}
          type="file"
          accept={this.props.accept}
          onChange={this._onInputChange}
          ref={this._onFileInputRef}
          value=""
          multiple={this.props.multiple}
          hidden={true}
          style={{ display: "none" }}
          disabled={this.props.disabled}
        />
        <div className={FileFieldStylesheet.wrapper}>
          {this.props.label && <Label htmlFor={this._id}>{this.props.label}</Label>}
          <div className={FileFieldStylesheet.selector}>
            <button
              type="button"
              className={FileFieldStylesheet.selectorAction}
              onClick={this._onFieldGroupClick}
              disabled={this.props.disabled}
            >
              {selectContent}
            </button>
            {clearAction}
          </div>
        </div>
      </div>
    )
  }
}
