import {
  AppHostContainer,
  BoundTextField,
  HostAppIcon,
  HostAppView,
  IAppHost, IHostAppViewProps,
  ISupplier, ListModel,
  SyncComponent
} from "@coglite/app-host"
import { IRouter } from "@coglite/router"
import {
  Checkbox,
  CommandBar,
  ContextualMenuItemType,
  css,
  DefaultButton,
  DefaultPalette,
  Dialog,
  DialogFooter,
  Dropdown,
  FontSizes,
  FontWeights,
  Icon,
  IContextualMenuItem,
  IContextualMenuProps,
  IDropdownOption,
  KeyCodes,
  mergeStyleSets,
  Panel,
  PanelType,
  PrimaryButton,
  Slider
} from "@fluentui/react"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { EffectCallback, FC, useEffect } from "react"
import { when } from "when-switch"






/* -------------------------------------------------------------------------- */
/*                                    views                                   */
/* -------------------------------------------------------------------------- */

const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, [])
}

const useMount = (fn: () => void) => {
  useEffectOnce(() => {
    fn()
  })
}




const DashboardStylesheet = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: "transparent",
    overflow: "hidden",
    selectors: {
      "&.hidden": {
        top: -1,
        left: -1,
        width: 0,
        height: 0,
        overflow: "hidden"
      }
    }
  },
  content: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    background: "transparent",
    selectors: {
      "&.requires-overflow": {
        overflow: "auto"
      }
    }
  },
  overlay: {
    backgroundColor: DefaultPalette.white,
    opacity: 0.1,
    selectors: {
      "&.hsplit": {
        cursor: "ew-resize"
      },
      "&.vsplit": {
        cursor: "ns-resize"
      }
    }
  }
})

type IDashboardProps = {
  dashboard: Dashboard
  className?: string
  hidden?: boolean
  host?: IAppHost
}

const DashboardBlockOverlay: React.FC<{ dashboard: Dashboard; className: string }> = observer(
  ({ dashboard, className }) => {
    return (
      <>
        {dashboard.blockSource && (
          <div
            className={css(className, dashboard.blockSource.type)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 2
            }}
          />
        )}
      </>
    )
  }
)

export const DashboardPortals = observer((props: IDashboardProps) => {
  return (
    <>
      {props.dashboard.windows.map((w) => {
        return <WindowView key={`window-layer-${w.id}`} {...props} window={w} />
      })}
    </>
  )
})

export const DashboardView = observer((props: IDashboardProps) => {
  let _ref: HTMLDivElement
  const _onRef = (ref: HTMLDivElement) => {
    _ref = ref
  }
  const _resizeToViewport = () => {
    if (_ref) {
      const bounds = _ref.getBoundingClientRect()
      props.dashboard.resize(bounds.width, bounds.height)
    }
  }

  const _onHostResize = () => {
    _resizeToViewport()
  }

  const _addHostListener = (host: IAppHost) => {
    if (host) {
      host.addEventListener("resize", _onHostResize)
    }
  }

  const _removeHostListener = (host: IAppHost) => {
    if (host) {
      host.removeEventListener("resize", _onHostResize)
    }
  }

  React.useEffect(() => {
    _addHostListener(props.host)
    _resizeToViewport()
    return () => _removeHostListener(props.host)
  })

  const { dashboard } = props
  const component = dashboard.component
  const wm = component && component.isWindowManager ? (component as WindowManager) : undefined
  const requiresOverflow = wm ? wm.isRequiresOverflow : false
  return (
    <div
      id={props.dashboard.id}
      className={css(DashboardStylesheet.root, { hidden: props.hidden })}
      ref={_onRef}
    >
      <DashboardBlockOverlay dashboard={props.dashboard} className={DashboardStylesheet.overlay} />
      <ComponentRemoveDialog remove={ComponentRemoveStore} />
      <div
        className={css(DashboardStylesheet.content, { overflow: requiresOverflow ? true : false })}
      >
        <DashboardPortals {...props} />
        <ComponentView component={component} />
      </div>
    </div>
  )
})

export const DashboardViewContainer = observer((props: IDashboardProps) => {
  const _onRenderDone = () => {
    return <DashboardView {...props} />
  }
  return (
    <SyncComponent
      sync={props.dashboard.sync}
      syncLabel="Loading Dashboard..."
      onRenderDone={_onRenderDone}
    />
  )
})

export interface IDashboardWrapperProps {
  className?: string
  config?: any
  addApp?: Component["addApp"]
  loader?: () => Promise<any>
  saver?: (data: any) => Promise<any>
  saveDelay?: number
  host?: IAppHost
  router?: IRouter
  componentFactory?: IComponentFactory
  afterConfig?: (dashboard: Dashboard) => void
}

export interface IDashboardWrapper {
  dashboard: Dashboard
}

export const DashboardWrapper = observer((props: IDashboardWrapperProps) => {
  let _dashboard = React.useRef(new Dashboard())
  let dashboard = _dashboard.current

  useMount(() => {
    _setFromProps(props)
  })

  React.useEffect(() => {
    // dashboard.close();
    // _setFromProps(nextProps);
    _setFromProps(props)
    _load(props)
    return () => dashboard.close()
  }, [props.host, props.router, props.loader, props.saver, props.componentFactory])

  const _setFromProps = (props: IDashboardWrapperProps) => {
    dashboard.router = props.router
      ? props.router
      : props.host
      ? props.host.router
      : RouterContext.value
    dashboard.addApp = props.addApp
    dashboard.loader = props.loader
    dashboard.saver = props.saver
    dashboard.saveDelay = props.saveDelay
    dashboard.componentFactory = props.componentFactory ? props.componentFactory : ComponentFactory
  }

  const _load = (props: IDashboardWrapperProps) => {
    if (props.loader) {
      dashboard.load()
    } else if (props.config) {
      dashboard.setConfig(props.config)
      if (props.afterConfig) {
        props.afterConfig(dashboard)
      }
    }
  }
  return (
    <DashboardViewContainer className={props.className} dashboard={dashboard} host={props.host} />
  )
})

const dashboardListStyles = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden"
  }
})

interface IDashboardListProps {
  dashboardList: DashboardList
  host?: IAppHost
  className?: string
}

export const DashboardListView = observer((props: IDashboardListProps) => {
  React.useEffect(() => {
    return () => props.dashboardList.close()
  }, [props.dashboardList])

  const dashboards = props.dashboardList.dashboards.map((db) => {
    return (
      <DashboardView
        key={db.id}
        hidden={db !== props.dashboardList.active}
        dashboard={db}
        host={props.host}
      />
    )
  })
  return (
    <div className={dashboardListStyles.root}>
      <DashboardAddPanel add={DashboardAddStore} />
      <DashboardRemoveDialog supplier={DashboardRemoveStore} />
      <DashboardListClearDialog supplier={DashboardListClearStore} />
      {dashboards}
    </div>
  )
})

export const DashboardListViewContainer = observer((props: IDashboardListProps) => {
  let _onRenderDone = () => {
    return <DashboardListView {...props} />
  }
  return (
    <SyncComponent
      sync={props.dashboardList.sync}
      syncLabel="Loading Dashboards..."
      onRenderDone={_onRenderDone}
    />
  )
})

type DashboardListProps = {
  dashboardList: DashboardList
  children?: any
} & IHostAppViewProps

export const DashboardListCommandBar = observer((props: DashboardListProps) => {
  const { dashboardList } = props
  const items: IContextualMenuItem[] = [createCommandBarMenuItem(dashboardList)]
  const layoutItem = createDashboardListMenu(dashboardList)
  if (layoutItem) {
    items.push(layoutItem)
  }
  const actionItems = createDashboardListLayoutActions(dashboardList)
  if (actionItems) {
    actionItems.forEach((i) => items.push(i))
  }
  const commandBarProps = Object.assign({}, props.commandBarProps)
  commandBarProps.items = commandBarProps.items ? commandBarProps.items.concat(items) : items
  return <CommandBar {...commandBarProps} />
})

export const DashboardListAppView = observer((props: DashboardListProps) => {
  React.useEffect(() => {
    props.dashboardList.load()
  }, [props.dashboardList])

  const _onRenderMenu = () => {
    return <DashboardListCommandBar {...props} />
  }
  return (
    <HostAppView {...props} onRenderMenu={_onRenderMenu}>
      <DashboardListViewContainer dashboardList={props.dashboardList} host={props.host} />
      {props.children}
    </HostAppView>
  )
})

const GridStylesheet = mergeStyleSets({
  root: {},
  gridCells: {},
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "white",
    opacity: 0.1,
    zIndex: 2
  },
  row: {
    display: "flex"
  },
  cell: {
    backgroundColor: "gainsboro"
  }
})

export interface IGridProps {
  grid: Grid
  className?: string
  moveTimeout?: number
}

const getRowIndex = (grid: Grid, vy: number): number => {
  if (vy < 0) {
    return 0
  }
  const y = vy - grid.y
  return Math.floor(y / (grid.cellSize + grid.cellMargin))
}

const getColIndex = (grid: Grid, vx: number): number => {
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
      <div
        role="row"
        className={GridStylesheet.row}
        key={row}
        style={{ marginTop: props.grid.cellMargin }}
      >
        {cells}
      </div>
    )
  }

  const { grid } = props
  const rows = []
  for (let r = 0; r < grid.rows; r++) {
    rows.push(_renderRow(r))
  }
  return <div className={GridStylesheet.gridCells}>{rows}</div>
})

const GridDragOverlay = observer((props: IGridProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var moveTimeout = props.moveTimeout >= 0 ? props.moveTimeout : Defaults.moveTimeout

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
    return (
      <div
        className={css(GridStylesheet.overlay, "drag")}
        onDragOver={_onDragOver}
        onDrop={_onDrop}
        ref={ref}
      />
    )
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

export const GridView = observer((props: IGridProps) => {
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

const HSplitStyles = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  splitter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "gray" //theme.palette.themeDark
  },
  splitterHandle: {
    cursor: "ew-resize",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -2,
    right: -2,
    overflow: "hidden",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    transition: "background-color 0.3s ease",
    selectors: {
      ":hover": {
        backgroundColor: "grey", //theme.palette.themeDark,
        opacity: 0.5
      },
      ".hsplit-icon": {
        fontSize: "10px",
        visibility: "hidden",
        color: "white" //theme.palette.white
      },
      "&.active": {
        backgroundColor: "gray", //theme.palette.themeDark,
        opacity: 1.0,
        selectors: {
          ".hsplit-icon": {
            visibility: "visible"
          }
        }
      }
    }
  },
  leftPane: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden"
  },
  leftContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  },
  rightPane: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden"
  },
  rightContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  }
})

export const HSplitView: React.FC<{ hsplit: HSplit }> = observer(({ hsplit }) => {
  var ref = React.useRef<HTMLDivElement>()
  var splitterRef = React.useRef<HTMLDivElement>()

  function _resize(e: MouseEvent) {
    if (!ref.current || !splitterRef.current) return
    const minItemWidth = hsplit.minItemWidth
    const bounds = ref.current && ref.current.getBoundingClientRect()
    const splitterBounds = ref.current && splitterRef.current.getBoundingClientRect()
    const max = bounds.width - splitterBounds.width - minItemWidth
    let splitterPos = e.clientX - bounds.left
    if (splitterPos <= minItemWidth) {
      splitterPos = minItemWidth
    } else if (splitterPos >= max) {
      splitterPos = max
    }
    hsplit.setOffset(splitterPos / bounds.width)
  }

  function _onDocumentMouseUp(e: MouseEvent) {
    if (!ref.current || !splitterRef.current) return
    ref.current.ownerDocument.removeEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.removeEventListener("mouseup", _onDocumentMouseUp)
    hsplit.setSplitActive(false)
  }
  function _onDocumentMouseMove(e: MouseEvent) {
    e.preventDefault()
    _resize(e)
  }

  function _onSplitterMouseDown(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    //if(!ref.current || !splitterRef.current) return;

    ref.current.ownerDocument.addEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.addEventListener("mouseup", _onDocumentMouseUp)
    hsplit.setSplitActive(true)
  }

  return (
    <div className={HSplitStyles.root} ref={ref}>
      <div className={HSplitStyles.leftPane} style={{ width: hsplit.leftWidth }}>
        <div className={HSplitStyles.leftContent}>
          <ComponentView component={hsplit.left} />
        </div>
      </div>
      <div
        className={css(HSplitStyles.splitter, { active: hsplit.splitActive })}
        onMouseDown={_onSplitterMouseDown}
        style={{ left: hsplit.leftWidth, width: hsplit.splitterWidth }}
        ref={splitterRef}
      >
        <div className={css(HSplitStyles.splitterHandle, { active: hsplit.splitActive })}>
          <Icon iconName="GripperBarVertical" className="hsplit-icon" />
        </div>
      </div>
      <div
        className={HSplitStyles.rightPane}
        style={{ left: hsplit.leftWidth + hsplit.splitterWidth, width: hsplit.rightWidth }}
      >
        <div className={HSplitStyles.rightContent}>
          <ComponentView component={hsplit.right} />
        </div>
      </div>
    </div>
  )
})

export const getColumnCount = (dashboard: Dashboard): number => {
  return dashboard && dashboard.component && dashboard.component.type === ComponentTypes.hsplit
    ? (dashboard.component as HSplit).columnCount
    : 0
}

export const getRowCount = (dashboard: Dashboard): number => {
  return dashboard && dashboard.component && dashboard.component.type === ComponentTypes.vsplit
    ? (dashboard.component as VSplit).rowCount
    : 0
}

export const assignWindows = (windows: IWindow[], stacks: Stack[]) => {
  if (windows && windows.length > 0) {
    const stackQuota = Math.ceil(windows.length / stacks.length)
    let stackIdx = 0
    let c
    windows.forEach((w) => {
      c = stacks[stackIdx]
      if (c.windowCount === stackQuota) {
        stackIdx++
        c = stacks[stackIdx]
      }
      c.add(w, false)
    })
    stacks.forEach((c) => {
      if (c.windowCount > 0) {
        c.setActiveIndex(0)
      } else {
        c.addNew()
      }
    })
  }
}

class GridLayout {
  static applyLayout = (dashboard: Dashboard) => {
    const windows = dashboard.windows
    const grid = new Grid()
    dashboard.setComponent(grid)
    windows.forEach((w) => grid.add(w))
  }
  static isLayoutApplied = (dashboard: Dashboard) => {
    return dashboard.component && dashboard.component.type === ComponentTypes.grid
  }
}

const onRenderGridCellSize = (item: IContextualMenuItem) => {
  const grid = item.grid as Grid
  return <GridCellSizeSlider key={item.key} grid={grid} />
}

const onRenderGridCellMargin = (item: IContextualMenuItem) => {
  const grid = item.grid as Grid
  return <GridCellMarginSlider key={item.key} grid={grid} />
}

export const GridDashboardLayout: IDashboardLayout = {
  key: "grid",
  name: "Grid (BETA)",
  title: "Grid (BETA) - NOTE: this is still a work in progress",
  iconProps: { iconName: "GridViewMedium" },
  applyLayout: GridLayout.applyLayout,
  isLayoutApplied: GridLayout.isLayoutApplied,
  createActions(dashboard: Dashboard) {
    const items: IContextualMenuItem[] = []
    const grid = dashboard.component as Grid
    // this is the grid settings icon
    items.push({
      key: "settings",
      iconProps: {
        iconName: "Equalizer"
      },
      subMenuProps: {
        shouldFocusOnContainer: true,
        items: [
          {
            key: "gridCellSizeHeader",
            itemType: ContextualMenuItemType.Header,
            name: "Cell Size"
          },
          {
            key: "gridCellSize",
            name: "Cell Size",
            grid: grid,
            onRender: onRenderGridCellSize
          },
          {
            key: "gridCellMarginHeader",
            itemType: ContextualMenuItemType.Header,
            name: "Cell Margin"
          },
          {
            key: "gridCellMargin",
            name: "Cell Margin",
            grid: grid,
            onRender: onRenderGridCellMargin
          }
        ]
      }
    })
    if (grid.addApp) {
      items.push({
        key: "add",
        name: "Add",
        iconProps: {
          iconName: "Add"
        },
        onClick() {
          grid.addNew()
        }
      })
    }
    return items
  }
}

class TabLayout {
  static applyLayout = (dashboard: Dashboard) => {
    // grab windows
    const windows = dashboard.windows
    // grab active window
    const active = windows.find((w) => w.active)
    const stack = new Stack()
    dashboard.setComponent(stack)
    windows.forEach((w) => {
      stack.add(w)
    })
    if (active) {
      stack.setActive(active)
    } else {
      stack.setActiveIndex(0)
    }
  }

  static isLayoutApplied = (dashboard: Dashboard) => {
    return dashboard.component && dashboard.component.type === ComponentTypes.stack
  }
}

export const TabDashboardLayout: IDashboardLayout = {
  key: "tabs",
  name: "Tabs",
  iconProps: { iconName: "BrowserTab" },
  applyLayout: TabLayout.applyLayout,
  isLayoutApplied: TabLayout.isLayoutApplied,
  createActions(dashboard: Dashboard) {
    const items: IContextualMenuItem[] = []
    const tabStack = dashboard.component as Stack
    // this is the grid settings icon
    items.push({
      key: "settings",
      iconProps: {
        iconName: "ArrangeSendToBack"
      },
      subMenuProps: {
        shouldFocusOnContainer: true,
        items: [
          {
            key: "gridCellSizeHeader",
            itemType: ContextualMenuItemType.Header,
            name: "Cell Size"
          },
          {
            key: "gridCellSize",
            name: "Cell Size",
            grid: tabStack
            // onRender: onRenderGridCellSize
          },
          {
            key: "gridCellMarginHeader",
            itemType: ContextualMenuItemType.Header,
            name: "Cell Margin"
          },
          {
            key: "gridCellMargin",
            name: "Cell Margin",
            grid: tabStack
            //onRender: onRenderGridCellMargin
          }
        ]
      }
    })
    if (tabStack.addApp) {
      items.push({
        key: "add",
        name: "Add",
        iconProps: {
          iconName: "Add"
        },
        onClick() {
          tabStack.addNew()
        }
      })
    }
    return items
  }
}

class ThreeColumnLayout {
  static applyLayout = (dashboard: Dashboard) => {
    const windows = dashboard.windows
    const stacks = [new Stack(), new Stack(), new Stack()]
    const outerSplit = new HSplit()
    outerSplit.setOffset(0.33)
    const innerSplit = new HSplit()
    outerSplit.setLeft(stacks[0])
    outerSplit.setRight(innerSplit)
    innerSplit.setLeft(stacks[1])
    innerSplit.setRight(stacks[2])
    dashboard.setComponent(outerSplit)
    assignWindows(windows, stacks)
  }

  static isLayoutApplied = (dashboard: Dashboard) => {
    return getColumnCount(dashboard) === 3
  }
}

export const ThreeColumnSplitDashboardLayout: IDashboardLayout = {
  key: "threeColumnSplit",
  name: "Three Columns",
  iconProps: { iconName: "TripleColumn" },
  applyLayout: ThreeColumnLayout.applyLayout,
  isLayoutApplied: ThreeColumnLayout.isLayoutApplied
}

class TwoColumnLayout {
  static applyLayout = (dashboard: Dashboard) => {
    const windows = dashboard.windows
    // create the new containers
    const stacks = [new Stack(), new Stack()]
    const split = new HSplit()
    split.setLeft(stacks[0])
    split.setRight(stacks[1])
    dashboard.setComponent(split)
    assignWindows(windows, stacks)
  }

  static isLayoutApplied = (dashboard: Dashboard) => {
    return getColumnCount(dashboard) === 2
  }
}

export const TwoColumnSplitDashboardLayout: IDashboardLayout = {
  key: "twoColumnSplit",
  name: "Two Columns",
  iconProps: { iconName: "DoubleColumn" },
  applyLayout: TwoColumnLayout.applyLayout,
  isLayoutApplied: TwoColumnLayout.isLayoutApplied
}

// the dashboard layout register - initialized with defaults
export const DashboardLayoutRegistry = new ListModel<IDashboardLayout>([
  TabDashboardLayout,
  TwoColumnSplitDashboardLayout,
  ThreeColumnSplitDashboardLayout,
  GridDashboardLayout
])

const onClickDashboardLayoutItem = (
  e: React.MouseEvent<HTMLButtonElement>,
  item: IContextualMenuItem
) => {
  item.applyLayout(item.dashboard)
}

export const createDashboardLayoutMenuItem = (
  dashboard: Dashboard,
  item: IDashboardLayout
): IContextualMenuItem => {
  return {
    key: item.key,
    title: item.title,
    name: item.name,
    iconProps: item.iconProps,
    dashboard: dashboard,
    applyLayout: item.applyLayout,
    canCheck: true,
    checked: item.isLayoutApplied(dashboard),
    onClick: onClickDashboardLayoutItem
  }
}

export const createDashboardLayoutMenuItems = (
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const isAnyLayoutApplied = items.some((item) => item.isLayoutApplied(dashboard))
  const r = items.map((item) => {
    return createDashboardLayoutMenuItem(dashboard, item)
  })
  r.push({
    dashboard: dashboard,
    key: "other",
    name: "Custom",
    iconProps: { iconName: "ViewDashboard" },
    checked: !isAnyLayoutApplied,
    canCheck: true,
    disabled: true
  })
  return r
}

export const createDashboardLayoutMenuSection = (
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutItems: IContextualMenuItem[] = createDashboardLayoutMenuItems(dashboard, items)
  return {
    key: "layoutSectionItem",
    itemType: ContextualMenuItemType.Section,
    sectionProps: {
      key: "layoutSection",
      title: "Layout",
      items: layoutItems
    }
  }
}

export const createDashboardMenu = (
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutSectionItem = createDashboardLayoutMenuSection(dashboard, items)
  const current = layoutSectionItem.sectionProps.items.find((item) => item.checked)
  return {
    key: "dashboardLayout",
    name: dashboard.sync.syncing
      ? "Loading..."
      : dashboard.sync.error
      ? "Error"
      : current
      ? current.name
      : "Layout",
    iconProps: current ? current.iconProps : { iconName: "ViewDashboard" },
    subMenuProps: {
      items: [layoutSectionItem]
    }
  }
}

export const createDashboardSettingsItem = (
  name: string,
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutSectionItem = createDashboardLayoutMenuSection(dashboard, items)
  return {
    key: "dashboardSettings",
    name: name,
    iconProps: { iconName: "Settings" },
    subMenuProps: {
      items: [layoutSectionItem]
    }
  }
}

export const createDashboardListMenu = (
  dashboardList: DashboardList,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  return !sync.syncing && active ? createDashboardMenu(active, items) : undefined
}

export const createDashboardLayoutActions = (
  dashboard: Dashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const currentLayout = items.find((item) => {
    return item.isLayoutApplied(dashboard)
  })
  let actions: IContextualMenuItem[]
  if (currentLayout && currentLayout.createActions) {
    actions = currentLayout.createActions(dashboard)
  }
  if (!actions) {
    actions = []
  }
  return actions
}

export const createDashboardListLayoutActions = (
  dashboardList: DashboardList,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  return !sync.syncing && active ? createDashboardLayoutActions(active, items) : []
}

const onAddDashboardClick = (e, item) => {
  addDashboard({ dashboardList: item.dashboardList })
}
const onDashboardClick = (e, item) => {
  item.dashboardList.setActive(item.dashboard)
}
const onRemoveAllDashboardsClick = (e, item) => {
  clearDashboards(item.dashboardList)
}
const onClickCopyItem = (e, item) => {
  addDashboard({
    dashboardList: item.dashboardList,
    existing: item.dashboard
  })
}
const onClickRemoveItem = (e, item) => {
  removeDashboard(item.dashboard)
}

export const createMenuItems = (dashboardList: DashboardList): IContextualMenuItem[] => {
  const items: IContextualMenuItem[] = []
  const dashboards = dashboardList.dashboards
  const active = dashboardList.active
  if (dashboards.length > 0) {
    const dashboardItems: IContextualMenuItem[] = dashboards.map((d) => {
      return {
        key: d.id,
        name: d.title,
        canCheck: true,
        checked: d === active,
        dashboardList: dashboardList,
        dashboard: d,
        onClick: onDashboardClick,
        split: true,
        subMenuProps: {
          items: [
            {
              key: "copy",
              name: "Copy",
              iconProps: { iconName: "Copy" },
              dashboardList: dashboardList,
              dashboard: d,
              onClick: onClickCopyItem
            },
            {
              key: "remove",
              name: "Remove",
              iconProps: { iconName: "ChromeClose" },
              dashboardList: dashboardList,
              dashboard: d,
              onClick: onClickRemoveItem
            }
          ]
        }
      }
    })
    const dashboardSectionItem: IContextualMenuItem = {
      key: "dashboardSectionItem",
      itemType: ContextualMenuItemType.Section,
      sectionProps: {
        key: "dashboardSection",
        title: "Dashboards",
        items: dashboardItems
      }
    }
    items.push(dashboardSectionItem)
  }
  const actionItems: IContextualMenuItem[] = []
  actionItems.push({
    key: "add",
    name: "Add Dashboard",
    dashboardList: dashboardList,
    onClick: onAddDashboardClick,
    iconProps: { iconName: "Add" },
    disabled: dashboardList.sync.syncing
  })

  if (dashboardList.dashboards.length > 0) {
    actionItems.push({
      key: "removeAllSep",
      name: "-"
    })
    actionItems.push({
      key: "removeAll",
      name: "Remove All Dashboards",
      dashboardList: dashboardList,
      onClick: onRemoveAllDashboardsClick,
      iconProps: { iconName: "Clear" }
    })
  }
  const actionSectionItem: IContextualMenuItem = {
    key: "actionSectionItem",
    itemType: ContextualMenuItemType.Section,
    sectionProps: {
      key: "actionSection",
      title: "Actions",
      items: actionItems,
      topDivider: true
    }
  }
  items.push(actionSectionItem)
  return items
}

export const createCommandBarMenuItem = (dashboardList: DashboardList): IContextualMenuItem => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  const title = sync.syncing
    ? "Loading Dashboards..."
    : sync.error
    ? "Error"
    : active
    ? active.title
    : "Dashboards"
  return {
    key: "dashboardsCommbarBarItem",
    name: title,
    subMenuProps: {
      items: createMenuItems(dashboardList)
    }
  }
}

export interface IDashboardListMenuButtonProps {
  dashboardList: DashboardList
}
export const DashboardListMenuButton = observer((props: IDashboardListMenuButtonProps) => {
  const items = createMenuItems(props.dashboardList)
  const active = props.dashboardList.active
  const title = active ? active.title : "Dashboards"
  const menuProps: IContextualMenuProps = {
    items: items
  }
  return (
    <DefaultButton className="dashboard-list-menu-button app-menu-button" menuProps={menuProps}>
      {title}
    </DefaultButton>
  )
})

export const DashboardListMenuButtonContainer = observer((props: IDashboardListMenuButtonProps) => {
  const _onRenderSync = () => {
    return (
      <DefaultButton className="dashboard-list-menu-button app-menu-button">
        Loading...
      </DefaultButton>
    )
  }
  const _onRenderDone = () => {
    return <DashboardListMenuButton {...props} />
  }
  const _onRenderError = () => {
    return (
      <DefaultButton className="dashboard-list-menu-button app-menu-button error">
        Error
      </DefaultButton>
    )
  }

  return (
    <SyncComponent
      sync={props.dashboardList.sync}
      onRenderSync={_onRenderSync}
      onRenderDone={_onRenderDone}
    />
  )
})

interface IGridSettingsProps {
  grid: Grid
}

export interface IGridCellSliderProps extends IGridSettingsProps {
  min?: number
  max?: number
  label?: string
}

export const GridCellMarginSlider = observer((props: IGridCellSliderProps) => {
  const _onChange = (value: number) => {
    props.grid.setCellMargin(value)
  }
  return (
    <Slider
      label={props.label}
      ariaLabel={`Grid Cell Margin ${props.grid.cellMargin}`}
      min={props.min || 0}
      max={props.max || 16}
      value={props.grid.cellMargin}
      onChange={_onChange}
    />
  )
})

export const GridCellSizeSlider = observer((props: IGridCellSliderProps) => {
  const _onChange = (value: number) => {
    props.grid.setCellSize(value)
  }
  return (
    <Slider
      label={props.label}
      ariaLabel={`Grid Cell Size ${props.grid.cellSize}`}
      min={props.min || 10}
      max={props.max || 160}
      value={props.grid.cellSize}
      onChange={_onChange}
    />
  )
})

export const GridSettings = observer((props: IGridSettingsProps) => {
  return (
    <div>
      <h2>Grid Settings</h2>
      <div style={{ padding: 8 }}>
        <GridCellMarginSlider grid={props.grid} label="Cell Margin" />
      </div>
      <div style={{ padding: 8 }}>
        <GridCellSizeSlider grid={props.grid} label="Cell Size" />
      </div>
    </div>
  )
})

type DashboardDialogViewProps = {
  add?: DashboardAdd
  className?: string
  actionClassName?: string
  remove?: ComponentRemove
  dashboard?: Dashboard
}

// export type DashboardDialogProps<T = any> = DashboardDialogViewProps & {
//   supplier?: IMutableSupplier<T>
// }

const DashboardAddPanelStylesheet = mergeStyleSets({
  root: ["dashboard-add", {}],
  editor: [
    "dashboard-add-editor",
    {
      padding: 8
    }
  ],
  actions: ["dashboard-add-actions", {}],
  action: [
    "dasboard-add-action",
    {
      marginRight: 8
    }
  ]
})

//type IDashboardAddStyles = typeof DashboardAddPanelStylesheet

type ClearDialogProps = DashboardDialogViewProps & { supplier?: ISupplier<DashboardList> }
export const DashboardListClearDialog = observer((props: ClearDialogProps) => {
  const _onClickCancel = () => {
    props.supplier.clearValue()
  }
  const _onClickSave = () => {
    props.supplier.value.clear()
    props.supplier.clearValue()
  }
  const _onDismissed = () => {
    props.supplier.clearValue()
  }

  return (
    <>
      {props.supplier && props.supplier.value && (
        <Dialog
          hidden={!props.supplier.value}
          modalProps={{
            onDismissed: _onDismissed
          }}
          dialogContentProps={{
            title: props.supplier.value ? "Remove all Dashboards" : "",
            subText: props.supplier.value ? `Are you sure you want to remove all Dashboards?` : ""
          }}
        >
          <DialogFooter>
            <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
            <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
          </DialogFooter>
        </Dialog>
      )}
    </>
  )
})


const DashboardPropertyEditor = observer((props: {dashboard: IDashboard}) => {
  const { dashboard } = props
  return (
    <div className="dashboard-property-editor">
      <BoundTextField
        label="Title"
        binding={{
          target: dashboard,
          key: "title",
          setter: "setTitle"
        }}
      />
    </div>
  )
})

const DashboardAddActions = observer((props: DashboardDialogViewProps) => {
  const _onClickCancel = () => {
    props.add.cancel()
  }
  const _onClickSave = () => {
    props.add.save()
  }

  return (
    <div className={props.className}>
      <DefaultButton className={props.actionClassName} onClick={_onClickCancel}>
        Cancel
      </DefaultButton>
      <PrimaryButton
        className={props.actionClassName}
        onClick={_onClickSave}
        disabled={!props.add.saveEnabled}
      >
        OK
      </PrimaryButton>
    </div>
  )
})

const ExistingDashboardSelector = observer((props: DashboardDialogViewProps) => {
  const options: IDropdownOption[] = props.add.dashboardList.dashboards.map((db) => {
    return {
      key: db.id,
      text: db.title
    }
  })
  options.unshift({
    key: "",
    text: ""
  })
  const _onChange = (option: IDropdownOption) => {
    const dashboard = props.add.dashboardList.dashboards.find((db) => db.id === option.key)
    props.add.setExisting(dashboard)
  }

  return (
    <>
      {props.add && props.add.dashboardList.dashboardCount > 0 && (
        <Dropdown
          label="From Existing"
          options={options}
          onChanged={_onChange}
          selectedKey={props.add.existing ? props.add.existing.id : ""}
        />
      )}
    </>
  )
})

const DashboardAddEditor = observer((props: DashboardDialogViewProps) => {
  
  const _onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.which === KeyCodes.enter && props.add.saveEnabled) {
      props.add.save()
    }
  }

  const _onMakeActiveChange = (e, checked) => {
    props.add.setMakeActive(checked)
  }
  return (
    <>
      {props.add.active && (
        <div className={props.className}>
          <DashboardPropertyEditor dashboard={props.add.dashboard} />
          <ExistingDashboardSelector {...props} />
          <Checkbox
            label="Set Dashboard Active"
            onChange={_onMakeActiveChange}
            checked={props.add.makeActive}
            styles={{ root: { marginTop: 8 } }}
          />
        </div>
      )}
    </>
  )
})

export const DashboardAddPanel = observer((props: DashboardDialogViewProps) => {
  const _onRenderActions = () => {
    return (
      <DashboardAddActions
        add={props.add}
        className={DashboardAddPanelStylesheet.actions}
        actionClassName={DashboardAddPanelStylesheet.action}
      />
    )
  }
  const _onRenderEditor = () => {
    return <DashboardAddEditor add={props.add} className={DashboardAddPanelStylesheet.editor} />
  }
  const _onDismiss = () => {
    props.add.cancel()
  }

  const effectiveRootStyle = css([DashboardAddPanelStylesheet.root, props.className])
  return (
    <>
      {props.add.active && (
        <Panel
          className={effectiveRootStyle}
          isOpen={props.add.active}
          isLightDismiss={true}
          onRenderFooterContent={_onRenderActions}
          onRenderBody={_onRenderEditor}
          headerText="Add Dashboard"
          type={PanelType.medium}
          onDismiss={_onDismiss}
        />
      )}
    </>
  )
})

export const ComponentRemoveDialog = observer((props: DashboardDialogViewProps) => {
  const _onClickCancel = () => {
    props.remove.cancel()
  }
  const _onClickSave = () => {
    props.remove.save()
  }
  const _onDismissed = () => {
    props.remove.cancel()
  }

  const c = props.remove.component
  let title
  if (c) {
    if (c.type === "stack" || c.type === "list") {
      title = "all Tabs"
    }
  }
  if (!title) {
    title = "the Tab"
  }

  return (
    <React.Fragment>
      {props.remove && props.remove.active && (
        <Dialog
          hidden={!props.remove.active}
          modalProps={{
            onDismiss: _onDismissed
          }}
          dialogContentProps={{
            title: `Close ${title}`,
            subText: `Are you sure you want to close ${title}?`
          }}
        >
          <DialogFooter>
            <DefaultButton className="dashboard-form-action" onClick={_onClickCancel}>
              Cancel
            </DefaultButton>
            <PrimaryButton className="dashboard-form-action" onClick={_onClickSave}>
              OK
            </PrimaryButton>
          </DialogFooter>
        </Dialog>
      )}
    </React.Fragment>
  )
})

type DashboardSupplier = { supplier: ISupplier<Dashboard> }

export const DashboardRemoveDialog = observer(({ supplier }: DashboardSupplier) => {
  const _onClickCancel = () => {
    supplier.clearValue()
  }
  const _onClickSave = () => {
    supplier.value.removeFromParent()
    supplier.clearValue()
  }
  const _onDismissed = () => {
    supplier.clearValue()
  }

  return (
    <Dialog
      hidden={!supplier.value}
      onDismiss={_onDismissed}
      dialogContentProps={{
        title: supplier.value ? "Remove Dashboard" : "",
        subText:
          (supplier.value && `Are you sure you want to remove ${supplier.value.title}?`) || ""
      }}
    >
      <DialogFooter>
        <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
        <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
})

const stackStyles = mergeStyleSets({
  root: ["stack", {}],
  header: [
    "stack-header",
    {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.white,
      overflow: "hidden"
    }
  ],
  tabBar: [
    "stack-tab-bar",
    {
      background: "transparent",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      height: "100%"
    }
  ],
  actionBar: [
    "stack-action-bar",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralQuaternary
    }
  ],
  action: [
    "stack-action",
    {
      color: DefaultPalette.neutralPrimary,
      height: "100%",
      background: "transparent",
      border: "none",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      selectors: {
        "&.close-action": {
          selectors: {
            ":hover": {
              color: DefaultPalette.white,
              backgroundColor: DefaultPalette.redDark
            }
          }
        }
      }
    }
  ],
  actionIcon: [
    "stack-action-icon",
    {
      fontSize: FontSizes.small,
      fontWeight: FontWeights.regular
    }
  ],
  addAction: [
    "stack-add-action",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.neutralPrimary,
      outline: "none",
      border: "none",
      height: "100%",
      width: 28,
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      selectors: {
        ":hover": {
          backgroundColor: DefaultPalette.neutralQuaternaryAlt
        },
        "&.stack-add-action-icon": {
          color: DefaultPalette.neutralPrimary,
          fontSize: FontSizes.medium
        }
      }
    }
  ],
  addActionIcon: ["stack-add-action-icon", {}],
  tab: [
    "stack-tab",
    {
      position: "relative",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      overflow: "hidden",
      //color of the tab when its not active
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.neutralSecondary,
      cursor: "pointer",
      height: "100%",
      transition: "background-color 0.3s ease",
      zIndex: 0,
      selectors: {
        ".close-action": {
          visibility: "hidden"
        },
        "&.active": {
          //color of the tab when it's active
          backgroundColor: "white", //DefaultPalette.neutralLighter,
          color: DefaultPalette.neutralPrimary,
          boxShadow: `3px 0px 3px -2px ${DefaultPalette.neutralTertiary}, -3px 0px 3px -2px ${DefaultPalette.neutralTertiary}`,
          zIndex: 1,
          selectors: {
            ".close-action": {
              visibility: "visible"
            },
            ":hover": {
              backgroundColor: "white" //DefaultPalette.neutralLighter
            }
          }
        },
        ":hover": {
          selectors: {
            ".close-action": {
              visibility: "visible"
            }
          },
          backgroundColor: DefaultPalette.neutralQuaternaryAlt
        }
      }
    }
  ],
  tabIconContainer: [
    "stack-tab-icon-container",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 20,
      height: 20,
      maxHeight: 20,
      maxWidth: 20,
      overflow: "hidden",
      marginLeft: 4
    }
  ],
  tabTitleContainer: [
    "stack-tab-title-container",
    {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      maxWidth: 130,
      overflow: "hidden",
      paddingLeft: 8,
      paddingRight: 8
    }
  ],
  tabTitle: [
    "stack-tab-title",
    {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontSize: FontSizes.small
    }
  ],

  tabActionBar: [
    "stack-tab-action-bar",
    {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    }
  ],
  tabAction: [
    "stack-tab-action",
    {
      color: DefaultPalette.neutralPrimary,
      marginLeft: 4,
      marginRight: 4,
      height: 20,
      width: 20,
      lineHeight: 0, //16,
      padding: "0px",
      outline: "none",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      selectors: {
        "&.active": {
          color: DefaultPalette.neutralPrimary
        },
        "&.close-action": {
          selectors: {
            ":hover": {
              color: DefaultPalette.white,
              backgroundColor: DefaultPalette.redDark
            }
          }
        }
      }
    }
  ],
  tabActionIcon: [
    "stack-tab-action-icon",
    {
      lineHeight: FontSizes.mini,
      fontSize: FontSizes.mini,
      fontWeight: FontWeights.regular,
      margin: 0,
      height: FontSizes.mini,
      width: FontSizes.mini
    }
  ],
  tabPanel: ["stack-tab-panel", {}],
  body: [
    "stack-body",
    {
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: DefaultPalette.white,
      boxShadow: `0px -3px 3px -2px ${DefaultPalette.neutralTertiary}`
    }
  ],
  dragOverlay: [
    "stack-drag-overlay",
    {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      background: DefaultPalette.white,
      opacity: 0.2,
      zIndex: 3
    }
  ],
  dragFeedbackContainer: [
    "stack-drag-feedback-container",
    {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      background: "transparent",
      zIndex: 2
    }
  ],
  dragFeedback: [
    "stack-drag-feedback",
    {
      position: "absolute",
      transition: "all 100ms ease",
      backgroundColor: DefaultPalette.neutralTertiary,
      opacity: 0.5
    }
  ]
})

//export type IStackStyles = typeof stackStyles;

export type IStackProps = {
  stack?: Stack
  className?: string
  window?: Window
  first?: boolean
  last?: boolean
}

const StackTabIcon = observer((props: IStackProps) => (
  <div className={stackStyles.tabIconContainer}>
    <HostAppIcon host={props.window.appHost} />
  </div>
))

// const StackTabIcon = observer((props: IStackProps) => {
//   const host = props.window.appHost
//   const icon = host.icon
//   if (icon.name || icon.text || icon.url || icon.component) {
//     return (
//       <div className={stackStyles.tabIconContainer}>
//         <Icon iconName={icon.name} />
//       </div>
//     )
//   }
//   return null
// })

//-- THIS IS ONLY THE END X ON THE FAR RIGHT SIDE, STYLING THE <CLOSE/> DOESNT EFFECT ANYTHING ELSE --//
const StackCloseAction = observer((props: IStackProps) => {
  let _onRemoveConfirm = () => {
    props.stack.close()
  }
  let _onClick = () => {
    if (props.stack.windowCount > 1) {
      removeComponent({ component: props.stack, saveHandler: _onRemoveConfirm })
    } else {
      props.stack.close()
    }
  }

  const { stack } = props
  if (!stack.closeDisabled) {
    return (
      <button
        type="button"
        style={{ width: stack.headerHeight }}
        className={css(stackStyles.action, "close-action")}
        title="Close all Tabs"
        onClick={_onClick}
      >
        <Icon className={stackStyles.actionIcon} iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

// -------- this is the toolbar that holds the tabs and the X on the right -----------//

const StackActionBar = observer((props: IStackProps) => (
  <div
    className={stackStyles.actionBar}
    style={{ position: "absolute", top: 0, right: 0, bottom: 0 }}
  >
    <StackCloseAction {...props} />
  </div>
))

const StackTabTitle = observer((props: IStackProps) => (
  <span className={css(stackStyles.tabTitleContainer, stackStyles.tabTitle)}>
    {props.window.title}
  </span>
))

const StackTabCloseAction = observer((props: IStackProps) => {
  let _onMouseDown = (e: E) => e.stopPropagation()

  let _onClick = (e: E) => {
    e.stopPropagation()
    props.window.close()
  }

  if (props.window && !props.window.closeDisabled) {
    return (
      <button
        type="button"
        className={css(stackStyles.tabAction, "close-action", { active: props.window.active })}
        title={`Close ${props.window.title || "Tab"}`}
        onMouseDown={_onMouseDown}
        onClick={_onClick}
      >
        <Icon className={stackStyles.tabActionIcon} iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

const StackTabActionBar = observer((props: IStackProps) => {
  return <StackTabCloseAction {...props} />
})

let DragData = {
  _dragOverStart: undefined
}

const StackTab = observer((props: IStackProps) => {
  let ref = React.useRef<HTMLDivElement>()

  let _onClick = () => {
    props.stack.setActive(props.window)
  }

  let _onDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    const transferText = String(JSON.stringify(props.window.config))
    e.dataTransfer.setData("text", transferText)

    window.setTimeout(() => {
      props.window.dragStart()
    }, 16)
  }
  let _onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    delete DragData._dragOverStart
    props.window.dragEnd()
  }
  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const db = props.stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag) {
      e.stopPropagation()
      if (drag !== props.window) {
        e.preventDefault()
        try {
          e.dataTransfer.dropEffect = "move"
        } catch (ex) {}
      }
    } else {
      if (!props.window.active) {
        if (!DragData._dragOverStart) {
          DragData._dragOverStart = new Date().getTime()
        } else {
          const diff = new Date().getTime() - DragData._dragOverStart
          if (diff >= 600) {
            props.window.activate()
            delete DragData._dragOverStart
          }
        }
      }
    }
  }

  let _onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (e.relatedTarget !== ref.current && !ref.current.contains(e.relatedTarget as HTMLElement)) {
      delete DragData._dragOverStart
    }
  }

  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    delete DragData._dragOverStart
    e.stopPropagation()
    e.preventDefault()
    props.stack.dropWindow(props.window)
  }

  return (
    <div
      className={css(stackStyles.tab, {
        active: props.window.active,
        first: props.first,
        last: props.last
      })}
      role="tab"
      id={`${props.window.id}-tab`}
      aria-controls={props.window.id}
      title={props.window.title}
      ref={ref}
      onClick={_onClick}
      draggable={true}
      onDragStart={_onDragStart}
      onDragEnd={_onDragEnd}
      onDragOver={_onDragOver}
      onDrop={_onDrop}
      onDragLeave={_onDragLeave}
    >
      <StackTabIcon {...props} />
      <StackTabTitle {...props} />
      <StackTabActionBar {...props} />
    </div>
  )
})

const StackTabPanel = observer((props: IStackProps) => {
  const active = props.window.active
  let style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden"
  }
  if (active) {
    style.right = 0
    style.bottom = 0
  } else {
    style.width = 0
    style.height = 0
  }
  return (
    <div
      className={css({ active: active })}
      style={style}
      role="tabpanel"
      id={`${props.window.id}-tab-panel`}
    />
  )
})

const StackAddAction = observer((props: IStackProps) => {
  var _onClick = () => props.stack.addNew({ makeActive: true })

  const { stack } = props
  if (stack.addApp) {
    return (
      <button
        type="button"
        title="Add Tab"
        className={stackStyles.addAction}
        onClick={_onClick}
        style={{ width: stack.headerHeight }}
      >
        <Icon className={stackStyles.addActionIcon} iconName="add" />
      </button>
    )
  }
  return null
})

const StackTabBar = observer((props: IStackProps) => {
  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const stack = props.stack
    const db = stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag && (drag.parent !== stack || (stack.windowCount > 1 && drag !== stack.last))) {
      e.stopPropagation()
      e.preventDefault()
      try {
        e.dataTransfer.dropEffect = "move"
      } catch (ex) {}
    }
  }
  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    props.stack.dropWindow()
  }
  return (
    <div className={stackStyles.tabBar} role="tablist" onDragOver={_onDragOver} onDrop={_onDrop}>
      {props.stack &&
        props.stack.windows &&
        props.stack.windows.map((w, idx) => (
          <StackTab
            key={w.id}
            stack={props.stack}
            window={w}
            first={idx === 0}
            last={idx === props.stack.windowCount - 1}
          />
        ))}
      <StackAddAction {...props} />
    </div>
  )
})

const StackHeader = observer((props: IStackProps) => (
  <div className={stackStyles.header} style={{ height: props.stack.headerHeight }}>
    <StackTabBar {...props} />
    <StackActionBar {...props} />
  </div>
))

let uselessDropHandler = () => {}
let _dropHandler = uselessDropHandler


const StackDragOverlay = observer((props:IStackProps) => {
  let overlayRef = React.useRef<HTMLDivElement>()

  let _onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    if (drag) {
      drag.setDragState({ pos: null, over: null })
    }
    _dropHandler = uselessDropHandler
  }

  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    _dropHandler()
    props.stack.dragEnd()
  }

  let _dropLeft = () => {
    props.stack.splitLeft(props.stack.dashboard.drag)
  }

  let _setDropZoneLeft = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropLeft
    const styles: React.CSSProperties = {
      top: 0,
      left: 0,
      width: Math.floor(width / 2),
      height: height
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropRight = () => {
    props.stack.splitRight(props.stack.dashboard.drag)
  }

  let _setDropZoneRight = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropRight
    const left = Math.floor(width / 2)
    const styles: React.CSSProperties = {
      top: 0,
      left: left,
      width: width - left,
      height: height
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropTop = () => {
    props.stack.splitTop(props.stack.dashboard.drag)
  }

  let _setDropZoneTop = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropTop
    const styles: React.CSSProperties = {
      top: 0,
      left: 0,
      width: width,
      height: Math.floor(height / 2)
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropBottom = () => {
    props.stack.splitBottom(props.stack.dashboard.drag)
  }

  let _setDropZoneBottom = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropBottom
    const top = Math.floor(height / 2)
    const styles: React.CSSProperties = {
      top: top,
      left: 0,
      width: width,
      height: height - top
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropAdd = () => {
    props.stack.add(props.stack.dashboard.drag, { makeActive: true })
  }

  let _setDropZoneAdd = () => {
    _dropHandler = _dropAdd
  }

  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const stack = props.stack
    const db = stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag) {
      e.stopPropagation()
      if ((drag.parent !== stack && stack.windowCount > 0) || stack.windowCount > 1) {
        e.preventDefault()
        const bounds = overlayRef.current.getBoundingClientRect()
        const leftRightZoneWidth = Math.floor(bounds.width / 6)
        const topBottomZoneHeight = Math.floor(bounds.height / 2)
        if (e.clientX >= bounds.left && e.clientX <= bounds.left + leftRightZoneWidth) {
          _setDropZoneLeft(bounds.width, bounds.height)
        } else if (
          e.clientX >= bounds.left + bounds.width - leftRightZoneWidth &&
          e.clientX <= bounds.left + bounds.width
        ) {
          _setDropZoneRight(bounds.width, bounds.height)
        } else if (e.clientY >= bounds.top && e.clientY <= bounds.top + topBottomZoneHeight) {
          _setDropZoneTop(bounds.width, bounds.height)
        } else {
          _setDropZoneBottom(bounds.width, bounds.height)
        }
      } else if (stack.windowCount === 0) {
        e.preventDefault()
        _setDropZoneAdd()
      }
    }
  }

  let motionlessStyle = {
    top: 0,
    left: 0,
    height: 0,
    width: 0
  }

  const { stack } = props
  const headerHeight: React.CSSProperties = { top: stack.headerHeight }
  //const drag = stack.dashboard ? stack.dashboard.drag : undefined

  if (stack.dashboard && stack.dashboard.drag) {
    let drag = stack.dashboard.drag
    const feedbackStyles =
      drag.dragState.over === stack ? drag.dragState.feedbackStyles : motionlessStyle
    return (
      <React.Fragment>
        {[
          <div
            key="overlay"
            className={stackStyles.dragOverlay}
            onDragOver={_onDragOver}
            onDrop={_onDrop}
            onDragLeave={_onDragLeave}
            ref={overlayRef}
            style={{ ...headerHeight }}
          />,
          <div
            key="feedbackContainer"
            className={stackStyles.dragFeedbackContainer}
            style={{ top: stack.headerHeight }}
          >
            <div
              className={css(stackStyles.dragFeedback, drag.dragState.pos)}
              style={{ ...feedbackStyles }}
            />
          </div>
        ]}
      </React.Fragment>
    )
  }
  return null
})

const StackBody = observer((props: IStackProps) => (
  <div className={stackStyles.body} style={{ top: props.stack.headerHeight }}>
    {props.stack &&
      props.stack.windows &&
      props.stack.windows.map((w) => <StackTabPanel key={w.id} stack={props.stack} window={w} />)}
  </div>
))

export const StackView = observer((props: IStackProps) => {
  return (
    <>
      {props.stack && (
        <div id={props.stack.id} className={stackStyles.root}>
          <StackDragOverlay {...props} />
          <StackHeader {...props} />
          <StackBody {...props} />
        </div>
      )}
    </>
  )
})

const VSplitStylesheet = mergeStyleSets({
  root: [
    "vsplit",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  ],
  splitter: [
    "vsplit-splitter",
    {
      cursor: "ns-resize",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      backgroundColor: "gray", //theme.palette.themeDark,
      left: 0,
      right: 0
    }
  ],
  splitterHandle: [
    "vsplit-splitter-content",
    {
      position: "absolute",
      top: -2,
      right: 0,
      bottom: -2,
      left: 0,
      overflow: "hidden",
      backgroundColor: "transparent",
      color: "gray", //theme.palette.themeDark,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      transition: "background-color 0.3s ease",
      selectors: {
        ":hover": {
          backgroundColor: "gray", //theme.palette.themeDark,
          opacity: 0.5
        },
        ".vsplit-icon": {
          fontSize: "10px",
          visibility: "hidden",
          color: "white" //theme.palette.white
        },
        "&.active": {
          backgroundColor: "gray", //theme.palette.themeDark,
          opacity: 1.0,
          selectors: {
            ".vsplit-icon": {
              visibility: "visible"
            }
          }
        }
      }
    }
  ],
  topPane: [
    "vsplit-top-pane",
    {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      overflow: "hidden"
    }
  ],
  topContent: [
    "vsplit-top-content",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "auto"
    }
  ],
  bottomPane: [
    "vsplit-bottom-pane",
    {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      overflow: "hidden"
    }
  ],
  bottomContent: [
    "vsplit-bottom-content",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "auto"
    }
  ]
})
interface IVSplitProps {
  vsplit
  className?: string
}

//export type VSplitView = typeof VSplitView
export const VSplitView = observer((props: IVSplitProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var splitterRef = React.useRef<HTMLDivElement>()

  var _resize = (e: MouseEvent) => {
    if (!ref.current || !splitterRef.current) return
    const minItemHeight = props.vsplit.minItemHeight
    const bounds = ref.current.getBoundingClientRect()
    const splitterBounds = splitterRef.current.getBoundingClientRect()
    const max = bounds.height - splitterBounds.height - minItemHeight
    let splitterPos = e.clientY - bounds.top
    if (splitterPos <= minItemHeight) {
      splitterPos = minItemHeight
    } else if (splitterPos >= max) {
      splitterPos = max
    }
    const offset = splitterPos / bounds.height
    props.vsplit.setOffset(offset)
  }
  var _onDocumentMouseUp = (e: MouseEvent) => {
    if (!ref.current || !splitterRef.current) return
    ref.current.ownerDocument.removeEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.removeEventListener("mouseup", _onDocumentMouseUp)
    props.vsplit.setSplitActive(false)
  }
  var _onDocumentMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    _resize(e)
  }

  var _onSplitterMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    ref.current.ownerDocument.addEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.addEventListener("mouseup", _onDocumentMouseUp)
    props.vsplit.setSplitActive(true)
  }

  return (
    <div className={VSplitStylesheet.root} ref={ref}>
      <div className={VSplitStylesheet.topPane} style={{ height: props.vsplit.topHeight }}>
        <div className={VSplitStylesheet.topContent}>
          <ComponentView component={props.vsplit.top} />
        </div>
      </div>
      <div
        className={css(VSplitStylesheet.splitter, { active: props.vsplit.splitActive })}
        onMouseDown={_onSplitterMouseDown}
        style={{ top: props.vsplit.topHeight, height: props.vsplit.splitterHeight }}
        ref={splitterRef}
      >
        <div className={css(VSplitStylesheet.splitterHandle, { active: props.vsplit.splitActive })}>
          <Icon iconName="GripperBarHorizontal" className="vsplit-icon" />
        </div>
      </div>
      <div className={VSplitStylesheet.bottomPane} style={{ height: props.vsplit.bottomHeight }}>
        <div className={VSplitStylesheet.bottomContent}>
          <ComponentView component={props.vsplit.bottom} />
        </div>
      </div>
    </div>
  )
})

const windowStyles = mergeStyleSets({
  root: {
    backgroundColor: DefaultPalette.white,
    borderColor: DefaultPalette.neutralSecondary,
    borderStyle: "solid",
    selectors: {
      "&.content-hidden": {
        height: 28
      },
      "&.animate-position": {
        transition:
          "top 0.2s ease, right 0.2s ease, bottom 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease"
      },
      "&.manager-type-grid": {
        boxShadow: `0 0 ${5}px 0 rgba(0, 0, 0, 0.4)`
      }
    }
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    cursor: "pointer",
    overflow: "hidden",
    backgroundColor: DefaultPalette.neutralSecondary,
    color: DefaultPalette.white
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    maxHeight: 20,
    maxWidth: 20,
    overflow: "hidden",
    marginLeft: 4
  },
  titleContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    paddingLeft: 8,
    paddingRight: 8
  },
  title: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: FontSizes.small
  },
  action: {
    color: DefaultPalette.white,
    height: 28,
    width: 28,
    lineHeight: 28,
    cursor: "pointer",
    padding: "0px",
    outline: "none",
    border: "none",
    background: "transparent",
    selectors: {
      ":hover": {
        color: DefaultPalette.white,
        backgroundColor: DefaultPalette.neutralTertiary
      },
      "&.close-action": {
        selectors: {
          ":hover": {
            color: DefaultPalette.white,
            backgroundColor: DefaultPalette.redDark
          }
        }
      },
      "& .window-action-icon": {
        lineHeight: "16px",
        fontSize: FontSizes.mini,
        fontWeight: FontWeights.regular,
        margin: "0px",
        height: "16px",
        width: "16px"
      }
    }
  },
  actionBar: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  body: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    overflow: "auto",
    backgroundColor: DefaultPalette.white,
    selectors: {
      "&.content-hidden": {
        height: 0,
        overflow: "hidden"
      }
    }
  },
  resize: {
    selectors: {
      "&.top": {
        position: "absolute",
        zIndex: 2,
        top: -2,
        height: 5,
        left: 0,
        right: 0,
        cursor: "n-resize"
      },
      "&.right": {
        position: "absolute",
        zIndex: 2,
        right: -2,
        width: 5,
        top: 0,
        bottom: 0,
        cursor: "e-resize"
      },
      "&.bottom": {
        position: "absolute",
        zIndex: 2,
        bottom: -2,
        height: 5,
        left: 0,
        right: 0,
        cursor: "s-resize"
      },
      "&.left": {
        position: "absolute",
        zIndex: 2,
        left: -2,
        width: 5,
        top: 0,
        bottom: 0,
        cursor: "w-resize"
      },
      "&.topLeft": {
        position: "absolute",
        zIndex: 3,
        left: -4,
        top: -4,
        width: 10,
        height: 10,
        cursor: "nw-resize"
      },
      "&.topRight": {
        position: "absolute",
        zIndex: 3,
        right: -4,
        top: -4,
        width: 10,
        height: 10,
        cursor: "ne-resize"
      },
      "&.bottomLeft": {
        position: "absolute",
        zIndex: 3,
        left: -4,
        bottom: -4,
        width: 10,
        height: 10,
        cursor: "sw-resize"
      },
      "&.bottomRight": {
        position: "absolute",
        zIndex: 3,
        right: -4,
        bottom: -4,
        width: 10,
        height: 10,
        cursor: "se-resize"
      }
    }
  }
})

export interface IWindowProps {
  window: Window
  className?: string
}

export const WindowCloseAction = observer((props: IWindowProps) => {
  const _onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }
  const _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    props.window.close()
  }

  if (props.window && !props.window.closeDisabled) {
    return (
      <button
        type="button"
        className={css(props.className, "close-action")}
        title={`Close ${props.window.title || "App"}`}
        onClick={_onClick}
        onMouseDown={_onMouseDown}
      >
        <Icon className="window-action-icon" iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

export const WindowMaximizeAction = observer((props: IWindowProps) => {
  const _onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }
  const _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    props.window.setMaximized(!props.window.maximized)
  }

  if (props.window) {
    return (
      <button
        type="button"
        className={css(props.className, "maximize-action")}
        title={props.window.maximized ? "Restore" : "Maximize"}
        onClick={_onClick}
        onMouseDown={_onMouseDown}
      >
        <Icon
          className="window-action-icon"
          iconName={props.window.maximized ? "BackToWindow" : "FullScreen"}
        />
      </button>
    )
  }
  return null
})

export const WindowIconContainer: FC<{ windowHost: Window }> = observer(({ windowHost }) => {
  const host = windowHost.appHost
  const icon = host.icon
  if (icon.name || icon.text || icon.url || icon.component) {
    return (
      <div className={windowStyles.iconContainer}>
        <HostAppIcon host={host} />
      </div>
    )
  }
  return null
})

type WindowResizeHandleProps = {
  windowHost: IWindow,
  resizeType: any
}

const WindowResizeHandle = observer((props: WindowResizeHandleProps) => {
  const { windowHost, resizeType } = props
  const _resizeDragStartHandler = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.dataTransfer.setData("text", "Resizing Window " + windowHost.id)
    //windowHost.resizeStart(resizeType)
    //Promise.resolve().then(() => windowHost.resizeStart(resizeType))
    window.setTimeout(() => {
      windowHost.resizeStart(resizeType)
    }, 1)
  }

  const _onResizeDragEnd = (e: React.DragEvent<HTMLElement>) => {
    windowHost.resizeEnd()
  }

  return (
    <>
      {windowHost.settings.resizable && !windowHost.maximized && (
        <div
          className={css(windowStyles.resize, resizeType)}
          draggable
          onDragStart={_resizeDragStartHandler}
          onDragEnd={_onResizeDragEnd}
        />
      )}
    </>
  )
})


type WindowHeaderProps = {
  windowHost: IWindow
} & JSX.IntrinsicElements["div"];

const WindowHeader = observer((props: WindowHeaderProps) => {
  const { onMouseDown, windowHost, children } = props
  const _onHeaderDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    windowHost.setMaximized(!windowHost.maximized)
  }

  return (
    <>
      <div
        className={windowStyles.header}
        onMouseDown={onMouseDown}
        onDoubleClick={_onHeaderDoubleClick}
        style={{ top: 0, right: 0, left: 0, height: windowHost.settings.headerHeight }}
      >
        {children}
      </div>
    </>
  )
})

export const WindowView = observer((props: IWindowProps) => {
  let windowRef = React.useRef<HTMLDivElement>()
  let _canDrag: boolean = false
  let _dragOffsetX: number
  let _dragOffsetY: number

  const _onHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (props.window.settings.draggable) {
      _canDrag = true
      windowRef.current.draggable = true
      const bounds = windowRef.current.getBoundingClientRect()
      _dragOffsetX = e.clientX - bounds.left
      _dragOffsetY = e.clientY - bounds.top
    }
  }

  const _onDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (_canDrag) {
      e.stopPropagation()
      const transferText = String(JSON.stringify(props.window.config))
      e.dataTransfer.setData("text", transferText)
      window.setTimeout(() => {
        props.window.dragStart({ offsetX: _dragOffsetX, offsetY: _dragOffsetY })
      }, 1)
    } else {
      e.preventDefault()
    }
  }
  const _onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    _canDrag = false
    windowRef.current.draggable = false
    props.window.dragEnd()
  }

  const notifyResize = () => {
    props.window.appHost.emit({ type: "resize" })
    //dispatchWindowResize()
  }
  const _onTransitionEnd = () => {
    notifyResize()
  }

  React.useEffect(() => {
    notifyResize()
  })

  //const { window, className } = props
  const { draggable } = props.window.settings
  const style: React.CSSProperties = {
    position: "absolute",
    top: props.window.y,
    left: props.window.x,
    width: props.window.width,
    height: props.window.height,
    overflow: "hidden",
    zIndex: props.window.maximized ? 4 : 1,
    borderWidth: props.window.maximized ? 0 : props.window.settings.borderWidth
  }
  return (
    <div
      id={props.window.id}
      className={css(
        windowStyles.root,
        `manager-type-${props.window.manager ? props.window.manager.type : "unknown"}`,
        {
          maximized: props.window.maximized,
          "animate-position": props.window.settings.animatePosition
        }
      )}
      style={style}
      onDragStart={draggable ? _onDragStart : undefined}
      onDragEnd={draggable ? _onDragEnd : undefined}
      onTransitionEnd={props.window.settings.animatePosition ? _onTransitionEnd : undefined}
      role={props.window.settings.role}
      ref={windowRef}
    >
      {
        <>
          {props.window.settings.headerHeight > 0 && (
            <WindowHeader
              onMouseDown={_onHeaderMouseDown}
              //onDoubleClick={_onHeaderDoubleClick}
              windowHost={props.window}
            >
              <WindowIconContainer windowHost={props.window} />
              <div id="window-title" className={windowStyles.titleContainer}>
                <div className={windowStyles.title}>{props.window.title}</div>
              </div>

              <div id="window-action-bar" className={windowStyles.actionBar}>
                <WindowMaximizeAction
                  {...props}
                  className={css(windowStyles.action, "maximize-action")}
                />
                <WindowCloseAction
                  {...props}
                  className={css(windowStyles.action, "close-action")}
                />
              </div>
            </WindowHeader>
          )}
        </>
      }
      <div
        id="window-body"
        className={css(windowStyles.body, { "content-hidden": props.window.contentHidden })}
        style={{
          top: props.window.settings.headerHeight,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <AppHostContainer host={props.window.appHost} />
      </div>
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.top} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.right} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottom} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.left} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.topRight} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.topLeft} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottomRight} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottomLeft} />
    </div>
  )
})






/* -------------------------------------------------------------------------- */
/*                                   factory                                  */
/* -------------------------------------------------------------------------- */

type K = "window" | "hsplit" | "vsplit" | "stack" | "grid" | "basic"

export const ComponentFactory = (kind: K) => {
  return when(kind)
    .is("window", () => new Window())
    .is("stack", () => new Stack())
    .is("basic", () => new Stack())
    .is("hsplit", () => new HSplit())
    .is("vsplit", () => new VSplit())
    .is("grid", () => new Grid())
    .else(() => new Stack())
}



type E = React.MouseEvent<HTMLButtonElement>

const renderView = (comp: IComponent) => {
  return when(comp && comp.type)
    .is("stack", <StackView stack={comp as Stack} />)
    .is("hsplit", <HSplitView hsplit={comp as HSplit} />)
    .is("vsplit", <VSplitView vsplit={comp as VSplit} />)
    .is("grid", <GridView grid={comp as Grid} />)
    .else(() => <StackView stack={comp as Stack} />)
}


export const ComponentView = observer((props: {component: IComponent}) => {
  return renderView(props.component)
})