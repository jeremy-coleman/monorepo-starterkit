import { css } from "@fluentui/react"
import { observer } from "mobx-react";
import * as React from "react";
import { IGrid } from './models';
import { GridStylesheet } from "./styles";


type IGridProps = {
  grid: IGrid
  className?: string
  moveTimeout?: number
}

const getRowIndex = (grid: IGrid, vy: number): number => {
  if (vy < 0) {
    return 0
  }
  const y = vy - grid.y
  return Math.floor(y / (grid.cellSize + grid.cellMargin))
}

const getColIndex = (grid: IGrid, vx: number): number => {
  if (vx < 0) {
    return 0
  }
  const x = vx - grid.x
  return Math.floor(x / (grid.cellSize + grid.cellMargin))
}

const GridCells = observer((props: IGridProps) => {
  var _renderCell = (row: number, column: number): React.ReactNode => {
    return (
      <div
        key={column}
        className={GridStylesheet.cell}
        role="gridcell"
        style={{
          minWidth: props.grid.cellSize,
          width: props.grid.cellSize,
          minHeight: props.grid.cellSize,
          height: props.grid.cellSize,
          marginLeft: props.grid.cellMargin
        }}
      />
    )
  }

  var _renderRow = (row: number): React.ReactNode => {
    const cells = []
    for (let i = 0; i < props.grid.columns; i++) {
      cells.push(_renderCell(row, i))
    }
    return (
      <div role="row" className={GridStylesheet.row} key={row} style={{ marginTop: props.grid.cellMargin }}>
        {cells}
      </div>
    )
  }

  const rows = []
  for (let r = 0; r < props.grid.rows; r++) {
    rows.push(_renderRow(r))
  }
  return <div className={GridStylesheet.gridCells}>{rows}</div>
})

const GridDragOverlay = observer((props: IGridProps) => {
  const defaultMoveTimeout = 200
  var ref = React.useRef<HTMLDivElement>()
  var moveTimeout = props.moveTimeout >= 0 ? props.moveTimeout : defaultMoveTimeout

  var _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const { grid } = props
    e.stopPropagation()
    e.preventDefault()
    try {
      e.dataTransfer.dropEffect = "move"
    } catch (ex) {}
    const drag = grid.drag
    const rootBounds = ref.current && ref.current.getBoundingClientRect()
    let vx = e.clientX - rootBounds.left
    let vy = e.clientY - rootBounds.top
    const dx = drag.dragState.offsetX || 0
    const dy = drag.dragState.offsetY || 0
    vx -= dx
    vy -= dy
    const colIndex = getColIndex(grid, vx)
    const rowIndex = getRowIndex(grid, vy)
    // delayed move to deal with row index changing
    // TODO: move this to a utility
    const current = new Date().getTime()
    const init = drag.dragState.init
    if (!init) {
      drag.setDragState({
        init: current,
        colIndex: colIndex,
        rowIndex: rowIndex
      })
    } else {
      if (current - init > moveTimeout) {
        if (colIndex === drag.dragState.colIndex && rowIndex === drag.dragState.rowIndex) {
          grid.moveTo(colIndex, rowIndex)
        } else {
          drag.setDragState({
            init: current,
            colIndex: colIndex,
            rowIndex: rowIndex
          })
        }
      }
    }
  }
  var _onDrop = (e: React.DragEvent<HTMLElement>) => {
    const { grid } = props
    const drag = grid.drag
    e.stopPropagation()
    e.preventDefault()
    const rootBounds = ref.current && ref.current.getBoundingClientRect()
    let vx = e.clientX - rootBounds.left
    let vy = e.clientY - rootBounds.top
    const dx = drag.dragState.offsetX || 0
    const dy = drag.dragState.offsetY || 0
    vx -= dx
    vy -= dy
    const colIndex = getColIndex(grid, vx)
    const rowIndex = getRowIndex(grid, vy)
    grid.moveTo(colIndex, rowIndex)
  }

  const { grid } = props
  if (grid.drag) {
    return <div className={css(GridStylesheet.overlay, "drag")} onDragOver={_onDragOver} onDrop={_onDrop} ref={ref} />
  }
  return null
})

const GridResizeOverlay = observer((props: IGridProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const { grid } = props
    const rootBounds = ref.current && ref.current.getBoundingClientRect()
    let vx = e.clientX - rootBounds.left
    let vy = e.clientY - rootBounds.top
    const colIndex = getColIndex(grid, vx)
    const rowIndex = getRowIndex(grid, vy)
    props.grid.resizeTo(colIndex, rowIndex)
  }
  var _onDrop = (e: React.MouseEvent<HTMLElement>) => {
    props.grid.resizeEnd()
  }

  if (props.grid.resizing) {
    return (
      <div
        className={css(GridStylesheet.overlay, "resize", props.grid.resizeType)}
        onDragOver={_onDragOver}
        onDrop={_onDrop}
        ref={ref}
      />
    )
  }
  return null
})

const GridView = observer((props: IGridProps) => {
  const { grid } = props
  return (
    <div
      className={GridStylesheet.root}
      role="grid"
      style={{
        position: "relative",
        width: grid.maximized ? 0 : grid.gridWidth,
        height: grid.maximized ? 0 : grid.gridHeight,
        overflow: grid.maximized ? "hidden" : undefined
      }}
    >
      <GridCells {...props} />
      <GridDragOverlay {...props} />
      <GridResizeOverlay {...props} />
    </div>
  )
})

export { GridView };

