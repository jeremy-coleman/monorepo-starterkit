import * as React from "react"
import { IGrid } from "../types"
import { Slider } from "@uifabric/components"
import { observer } from "mobx-react"

interface IGridCellSizeSliderProps {
  grid: IGrid
  min?: number
  max?: number
}

@observer
class GridCellSizeSlider extends React.Component<IGridCellSizeSliderProps, any> {
  private _onChange = (value: number) => {
    this.props.grid.setCellSize(value)
  }
  render() {
    return (
      <Slider
        ariaLabel={`Grid Cell Size ${this.props.grid.cellSize}`}
        min={this.props.min || 10}
        max={this.props.max || 160}
        value={this.props.grid.cellSize}
        onChange={this._onChange}
      />
    )
  }
}

export { IGridCellSizeSliderProps, GridCellSizeSlider }
