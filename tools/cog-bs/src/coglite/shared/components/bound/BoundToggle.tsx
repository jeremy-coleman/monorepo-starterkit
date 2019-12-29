
import { observer } from "mobx-react";
import { IToggleProps, Toggle } from "@uifabric/components";
import * as React from "react";
import { getBoundValue, setBoundValue, IBoundProps } from "./BoundHelper";



export interface IBoundToggleProps extends IToggleProps, IBoundProps<any, boolean> {}

@observer
export class BoundToggle extends React.Component<IBoundToggleProps, any> {
  private _onChange = (e, checked: boolean) => {
    setBoundValue(this.props, checked);
    if (this.props.onChange) {
      this.props.onChanged(checked);
    }
  };
  render() {
    const value = getBoundValue(this.props);
    return <Toggle {...this.props} checked={value} onChange={this._onChange} />;
  }
}
