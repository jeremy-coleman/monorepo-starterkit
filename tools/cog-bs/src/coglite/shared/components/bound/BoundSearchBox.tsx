import { IBoundProps } from "coglite/types";
import { observer } from "mobx-react";
import { ISearchBoxProps, SearchBox } from "@uifabric/components";
import * as React from "react";
import { getBoundValue, setBoundValue } from "./BoundHelper";


export interface IBoundSearchBoxProps extends ISearchBoxProps, IBoundProps<any, string> {}

@observer
export class BoundSearchBox extends React.Component<IBoundSearchBoxProps, any> {
  private _onChange = (value: string) => {
    setBoundValue(this.props, value);
    if (this.props.onChanged) {
      this.props.onChanged(value);
    }
  };
  render() {
    const value = getBoundValue(this.props);
    return <SearchBox {...this.props} onChange={this._onChange} value={value || ""} />;
  }
}
