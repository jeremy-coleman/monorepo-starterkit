
import { observer } from "mobx-react";
import { ITextFieldProps, TextField } from "@uifabric/components";
import * as React from "react";
import { getBoundValue, getErrorMessage, setBoundValue ,IBoundProps, IError} from "./BoundHelper";


export interface IBoundTextFieldProps extends ITextFieldProps, IBoundProps<any, string> {
  errors?: IError[];
}

@observer
export class BoundTextField extends React.Component<IBoundTextFieldProps, any> {
  private _onChange = (e, value: string) => {
    setBoundValue(this.props, value);
    if (this.props.onChange) {
      this.props.onChange(e, value);
    }
  };
  render() {
    const value = getBoundValue(this.props);
    return (
      <TextField
        {...this.props}
        onChange={this._onChange}
        value={value || ""}
        errorMessage={getErrorMessage(this.props, this.props.errors)}
      />
    );
  }
}
