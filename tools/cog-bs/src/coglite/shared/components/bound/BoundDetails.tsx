
import { observer } from "mobx-react";
import * as React from "react";
import { IBoundProps, getBoundValue, setBoundValue } from "./BoundHelper";
import { Details, IDetailsProps } from "../common/Details";


export interface IBoundDetailsProps extends IDetailsProps, IBoundProps<any, boolean> {}

@observer
export class BoundDetails extends React.Component<IBoundDetailsProps, any> {
  private _onOpenChange = (open: boolean) => {
    setBoundValue(this.props, open);
    if (this.props.onOpenChange) {
      this.props.onOpenChange(open);
    }
  };
  render() {
    const value = getBoundValue(this.props);
    return <Details {...this.props} onOpenChange={this._onOpenChange} open={value} />;
  }
}
