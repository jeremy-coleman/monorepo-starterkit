import * as React from "react"
import { IGrid } from "../types"
import { Slider } from "@uifabric/components"
import { observer } from "mobx-react"

interface IGridCellMarginSliderProps {
  grid: IGrid
  min?: number
  max?: number
}

@observer
class GridCellMarginSlider extends React.Component<IGridCellMarginSliderProps, any> {
  private _onChange = (value: number) => {
    this.props.grid.setCellMargin(value)
  }
  render() {
    return (
      <Slider
        ariaLabel={`Grid Cell Margin ${this.props.grid.cellMargin}`}
        min={this.props.min || 0}
        max={this.props.max || 16}
        value={this.props.grid.cellMargin}
        onChange={this._onChange}
      />
    )
  }
}

export { IGridCellMarginSliderProps, GridCellMarginSlider }
