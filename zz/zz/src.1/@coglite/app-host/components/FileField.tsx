import { useId } from "@coglite/react-hooks"
import { getTheme, IconButton, Label, mergeStyleSets } from "office-ui-fabric-react"
import * as React from "react"

const theme = getTheme()

const FieldFieldStylesheet = mergeStyleSets({
  root: ["file-field", {}],
  wrapper: ["file-field-wrapper", {}],
  selector: [
    "file-field-selector",
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
    "file-field-selector-action",
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

type IFileFieldProps = {
  files?: File[]
  label?: string
  onChange?: (files: File[]) => void
  onRenderFiles?: (files: File[]) => React.ReactNode
  onRenderSelect?: () => React.ReactNode
  defaultSelectText?: string
  accept?: string
  multiple?: boolean
  className?: string
  disabled?: boolean
  onClear?: () => void
}

interface IFilesProps {
  files: File[]
}

const FileNameList = (props: IFilesProps) => {
  if (props.files && props.files.length > 0) {
    const items = props.files.map((file, idx) => {
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

const defaultFilesRenderer = (files: File[]) => {
  return <FileNameList files={files} />
}

export interface IFileFieldState {
  files?: File[]
}

export const FileField = (props: IFileFieldProps) => {
  var _ref: HTMLInputElement
  var _id = useId("file-field")
  const [state, setState] = React.useState({ files: props.files })

  React.useEffect(() => {
    setState({ files: props.files || [] })
  }, [props.files])

  var _onInputChange = (e) => {
    const files: File[] = []
    const fileList = _ref.files
    const fl = fileList.length
    for (let i = 0; i < fl; i++) {
      files.push(fileList.item(i))
    }
    if (props.onChange) {
      props.onChange(files)
    }
    setState({ files: files })
  }
  var _onFileInputRef = (ref: HTMLInputElement) => {
    _ref = ref
  }

  var _onFieldGroupClick = () => {
    if (_ref) {
      _ref.click()
    }
  }

  var _onClickClear = () => {
    setState({ files: null })
    if (props.onClear) {
      props.onClear()
    }
  }

  let selectContent
  let clearAction
  const files = state.files
  if (props.onClear || (files && files.length > 0)) {
    clearAction = (
      <IconButton
        className={FieldFieldStylesheet.clearAction}
        iconProps={{ iconName: "Clear" }}
        onClick={_onClickClear}
        disabled={props.disabled}
      />
    )
  }
  if (state.files && state.files.length > 0) {
    const r = props.onRenderFiles || defaultFilesRenderer
    selectContent = r(state.files)
  } else {
    selectContent = props.onRenderSelect
      ? props.onRenderSelect()
      : props.defaultSelectText || `Select ${props.multiple ? "Files..." : "a File..."}`
  }
  return (
    <div className={FieldFieldStylesheet.root}>
      <input
        id={_id}
        type="file"
        accept={props.accept}
        onChange={_onInputChange}
        ref={_onFileInputRef}
        value=""
        multiple={props.multiple}
        hidden={true}
        style={{ display: "none" }}
        disabled={props.disabled}
      />
      <div className={FieldFieldStylesheet.wrapper}>
        {props.label && <Label htmlFor={_id}>{props.label}</Label>}
        <div className={FieldFieldStylesheet.selector}>
          <button
            type="button"
            className={FieldFieldStylesheet.selectorAction}
            onClick={_onFieldGroupClick}
            disabled={props.disabled}
          >
            {selectContent}
          </button>
          {clearAction}
        </div>
      </div>
    </div>
  )
}
