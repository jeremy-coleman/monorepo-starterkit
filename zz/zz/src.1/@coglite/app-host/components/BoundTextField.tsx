import { observer } from "mobx-react-lite"
import { ITextFieldProps, TextField } from "office-ui-fabric-react"
import * as React from "react"
import { createOnChangeHandler, getBoundValue, getErrorMessage, IBoundProps } from "./BoundHelper"
import { IError } from "./ErrorUtils"

type IBoundTextFieldPropsWithError = {
  errors?: IError[]
}

export type IBoundTextFieldProps = ITextFieldProps &
  IBoundProps<any, string> &
  IBoundTextFieldPropsWithError

export const BoundTextField = observer((props: IBoundTextFieldProps) => {
  const _onChange = createOnChangeHandler(props)
  const value = getBoundValue(props)
  return (
    <TextField
      {...props}
      onChange={_onChange}
      value={value || ""}
      errorMessage={getErrorMessage(props, props.errors)}
    />
  )
})
