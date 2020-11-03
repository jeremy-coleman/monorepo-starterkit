import { observer } from "mobx-react-lite"
import { mergeStyleSets, MessageBar, MessageBarType } from "office-ui-fabric-react"
import * as React from "react"
import { IError } from "./ErrorUtils"

const ValidationErrorsStylesheet = mergeStyleSets({
  root: ["validation-errors", {}],
  error: ["validation-errors-error", {}],
  errorLabel: [
    "validation-errors-error-label",
    {
      fontWeight: 600
    }
  ]
})

export type IValidationErrorsProps = {
  errors?: IError[]
  className?: string
}

export const ValidationErrors = observer((props: IValidationErrorsProps) => {
  var _renderError = (error: IError, idx: number) => {
    return (
      <MessageBar
        key={idx}
        className={ValidationErrorsStylesheet.error}
        messageBarType={MessageBarType.error}
      >
        {error.keyTitle ? (
          <label className={ValidationErrorsStylesheet.errorLabel}>{error.keyTitle}: </label>
        ) : (
          undefined
        )}
        {error.message}
      </MessageBar>
    )
  }

  if (props.errors && props.errors.length > 0) {
    const errors = props.errors.map(_renderError)
    return <div className={ValidationErrorsStylesheet.root}>{errors}</div>
  }
  return null
})
