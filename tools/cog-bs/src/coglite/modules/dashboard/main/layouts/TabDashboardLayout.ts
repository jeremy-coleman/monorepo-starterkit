import { ContextualMenuItemType, IContextualMenuItem } from "@uifabric/components";
import { ComponentTypes } from "../constants";
import { Stack } from "../models/Stack";
import { IDashboard, IDashboardLayout, IStack } from "../types";

const TabLayout = {
  applyLayout: (dashboard: IDashboard) => {
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
  },

  isLayoutApplied: (dashboard: IDashboard) => {
    return dashboard.component && dashboard.component.type === ComponentTypes.stack
  }
}


export const TabDashboardLayout: IDashboardLayout = {
  key: "tabs",
  name: "Tabs",
  iconProps: { iconName: "BrowserTab" },
  applyLayout: TabLayout.applyLayout,
  isLayoutApplied: TabLayout.isLayoutApplied,
  createActions(dashboard: IDashboard) {
    const items: IContextualMenuItem[] = []
    const tabStack = dashboard.component as IStack
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
