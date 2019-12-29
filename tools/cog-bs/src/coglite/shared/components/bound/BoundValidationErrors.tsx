import { IBoundProps, IError } from "coglite/types";
import { observer } from "mobx-react";
import * as React from "react";
import { IValidationErrorsProps, ValidationErrors } from "../common/ValidationErrors";
import { getBoundValue } from "./BoundHelper";

export interface IBoundValidationErrorsProps extends IValidationErrorsProps, IBoundProps<any, IError[]> {}

@observer
export class BoundValidationErrors extends React.Component<IBoundValidationErrorsProps, any> {
  render() {
    const value = getBoundValue(this.props);
    return <ValidationErrors {...this.props} errors={value} />;
  }
}
