export enum ComponentTypes {
    dashboard = "dashboard",
    dashboardList = "dashboardList",
    stack = "stack",
    grid = "grid",
    hsplit = "hsplit",
    vsplit = "vsplit",
    window = "window",
    basic = "basic"
}

export enum WindowResizeType {
    top = "top",
    right = "right",
    bottom = "bottom",
    left = "left",
    topRight = "topRight",
    topLeft = "topLeft",
    bottomRight = "bottomRight",
    bottomLeft = "bottomLeft"
}

export const Defaults = {
    offset: 0.5,
    minItemHeight: 28,
    minItemWidth: 28,
    splitterHeight: 1,
    splitterWidth: 1,
    moveTimeout: 200,
    cellSize: 80,
    cellMargin: 8,
    defaultWindowColSpan: 6,
    defaultWindowRowSpan: 4
  }