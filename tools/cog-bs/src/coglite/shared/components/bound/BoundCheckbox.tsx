
import { observer } from "mobx-react";
import { Checkbox, ICheckboxProps } from "@uifabric/components";
import * as React from "react";
import {IBoundProps, getBoundValue, setBoundValue } from "./BoundHelper";


export interface IBoundCheckboxProps extends ICheckboxProps, IBoundProps<any, boolean> {}

@observer
export class BoundCheckbox extends React.Component<IBoundCheckboxProps, any> {
  private _onChanged = (e: any, checked: boolean) => {
    setBoundValue(this.props, checked);
    if (this.props.onChange) {
      this.props.onChange(e, checked);
    }
  };
  render() {
    const value = getBoundValue(this.props);
    return <Checkbox {...this.props} checked={value} onChange={this._onChanged} />;
  }
}
