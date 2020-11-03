import { observer } from "mobx-react-lite"
import { Checkbox, ICheckboxProps } from "@fluentui/react"
import * as React from "react"
import { createOnChangeHandler, getBoundValue, IBoundProps } from "./BoundHelper"

export interface IBoundCheckboxProps extends ICheckboxProps, IBoundProps<any, boolean> {}

export const BoundCheckbox = observer((props: IBoundCheckboxProps) => {
  const _onChanged = createOnChangeHandler(props)
  const value = getBoundValue(props)
  return <Checkbox {...props} checked={value} onChange={_onChanged} />
})
