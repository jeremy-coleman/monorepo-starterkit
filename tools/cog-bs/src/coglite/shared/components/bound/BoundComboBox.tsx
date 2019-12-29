import {  IOption, IOptionListModel } from "coglite/types";
import { observer } from "mobx-react";
import * as React from "react";
import { IBoundProps, getBoundValue, setBoundValue } from "./BoundHelper";

import { ComboBox, IComboBoxProps } from "../common/ComboBox";


export interface IBoundComboBoxProps extends IComboBoxProps, IBoundProps<any, string> {
  optionList?: IOptionListModel;
  sortOptions?: boolean;
}

@observer
export class BoundComboBox extends React.Component<IBoundComboBoxProps, any> {
  private _onChanged = (value: string, option?: IOption) => {
    setBoundValue(this.props, option ? option.key : value);
    if (this.props.onChanged) {
      this.props.onChanged(value, option);
    }
  };
  render() {
    let options = this.props.options;
    if (!options) {
      if (this.props.optionList) {
        options = this.props.sortOptions ? this.props.optionList.itemsSorted : this.props.optionList.itemsView;
      }
    }
    if (!options) {
      options = [];
    }
    const value = getBoundValue(this.props);
    return <ComboBox {...this.props} options={options} onChanged={this._onChanged} value={value || ""} />;
  }
}
