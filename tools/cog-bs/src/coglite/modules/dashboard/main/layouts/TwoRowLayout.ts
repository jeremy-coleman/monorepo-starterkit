import { VSplit } from "../models/Split"
import { Stack } from "../models/Stack"
import { IDashboard } from "../types"
import { assignWindows, getColumnCount } from "./DashboardLayoutHelper"

export const TwoRowLayout = {
  applyLayout: (dashboard: IDashboard) => {
    const windows = dashboard.windows
    // create the new containers
    const stacks = [new Stack(), new Stack()]
    const split = new VSplit()
    split.setTop(stacks[0])
    split.setBottom(stacks[1])
    dashboard.setComponent(split)
    assignWindows(windows, stacks)
  },

  isLayoutApplied: (dashboard: IDashboard) => {
    return getColumnCount(dashboard) === 2
  }
}
