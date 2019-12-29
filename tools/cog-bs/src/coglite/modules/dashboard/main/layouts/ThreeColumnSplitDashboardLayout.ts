
import { IDashboardLayout } from "../types"


import { IDashboard } from "../types"
import { assignWindows, getColumnCount } from "./DashboardLayoutHelper"
import { HSplit } from "../models/Split"
import { Stack } from "../models/Stack"

const ThreeColumnLayout = {
 applyLayout : (dashboard: IDashboard) => {
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
},

 isLayoutApplied : (dashboard: IDashboard) => {
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
