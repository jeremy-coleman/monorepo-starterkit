import { observer } from "mobx-react"
import { Slider } from "@uifabric/components"
import * as React from "react"
import { IGrid } from "../types"

interface IGridSettingsProps {
  grid: IGrid
}

interface IGridCellSliderProps extends IGridSettingsProps {
  min?: number
  max?: number
  label?: string
}

@observer
class GridCellMarginSlider extends React.Component<IGridCellSliderProps, any> {
  private _onChange = (value: number) => this.props.grid.setCellMargin(value)

  render() {
    return (
      <Slider
        label={this.props.label}
        ariaLabel={`Grid Cell Margin ${this.props.grid.cellMargin}`}
        min={this.props.min || 0}
        max={this.props.max || 16}
        value={this.props.grid.cellMargin}
        onChange={this._onChange}
      />
    )
  }
}

@observer
class GridCellSizeSlider extends React.Component<IGridCellSliderProps, any> {
  private _onChange = (value: number) => this.props.grid.setCellSize(value)

  render() {
    return (
      <Slider
        label={this.props.label}
        ariaLabel={`Grid Cell Size ${this.props.grid.cellSize}`}
        min={this.props.min || 10}
        max={this.props.max || 160}
        value={this.props.grid.cellSize}
        onChange={this._onChange}
      />
    )
  }
}

@observer
class GridSettings extends React.Component<IGridSettingsProps, any> {
  render() {
    return (
      <div>
        <h2>Grid Settings</h2>
        <div style={{ padding: 8 }}>
          <GridCellMarginSlider grid={this.props.grid} label="Cell Margin" />
        </div>
        <div style={{ padding: 8 }}>
          <GridCellSizeSlider grid={this.props.grid} label="Cell Size" />
        </div>
      </div>
    )
  }
}

export { IGridCellSliderProps, GridCellMarginSlider, GridCellSizeSlider, GridSettings }
