import { ContextualMenuItemType, IContextualMenuItem } from "@uifabric/components"
import { addDashboard, clearDashboards, removeDashboard } from "../actions"
import { IDashboardList } from "../types"

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
  addDashboard({ dashboardList: item.dashboardList, existing: item.dashboard })
}
const onClickRemoveItem = (e, item) => {
  removeDashboard(item.dashboard)
}

const createMenuItems = (dashboardList: IDashboardList): IContextualMenuItem[] => {
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

const createCommandBarMenuItem = (dashboardList: IDashboardList): IContextualMenuItem => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  const title = sync.syncing ? "Loading Dashboards..." : sync.error ? "Error" : active ? active.title : "Dashboards"
  return {
    key: "dashboardsCommbarBarItem",
    name: title,
    subMenuProps: {
      items: createMenuItems(dashboardList)
    }
  }
}

export { createMenuItems, createCommandBarMenuItem }
