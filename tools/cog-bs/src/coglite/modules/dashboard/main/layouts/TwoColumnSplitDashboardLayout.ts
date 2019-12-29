import { HSplit } from "../models/Split";
import { Stack } from "../models/Stack";
import { IDashboard, IDashboardLayout } from "../types";
import { assignWindows, getColumnCount } from "./DashboardLayoutHelper";


const TwoColumnLayout = {
 applyLayout : (dashboard: IDashboard) => {
  const windows = dashboard.windows
  // create the new containers
  const stacks = [new Stack(), new Stack()]
  const split = new HSplit()
  split.setLeft(stacks[0])
  split.setRight(stacks[1])
  dashboard.setComponent(split)
  assignWindows(windows, stacks)
},

 isLayoutApplied : (dashboard: IDashboard) => {
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
