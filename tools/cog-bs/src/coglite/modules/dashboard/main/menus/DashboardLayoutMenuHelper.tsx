import { ContextualMenuItemType, IContextualMenuItem } from "@uifabric/components"
import * as React from "react"
import { IDashboard, IDashboardLayout, IDashboardList } from "../types"
import { DashboardLayoutRegistry } from "../layouts/DashboardLayoutRegistry"

const onClickDashboardLayoutItem = (e: React.MouseEvent<HTMLButtonElement>, item: IContextualMenuItem) => {
  item.applyLayout(item.dashboard)
}

const createDashboardLayoutMenuItem = (dashboard: IDashboard, item: IDashboardLayout): IContextualMenuItem => {
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

const createDashboardLayoutMenuItems = (
  dashboard: IDashboard,
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

const createDashboardLayoutMenuSection = (
  dashboard: IDashboard,
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

const createDashboardMenu = (dashboard: IDashboard, items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView): IContextualMenuItem => {
  const layoutSectionItem = createDashboardLayoutMenuSection(dashboard, items)
  const current = layoutSectionItem.sectionProps.items.find((item) => item.checked)
  return {
    key: "dashboardLayout",
    name: dashboard.sync.syncing ? "Loading..." : dashboard.sync.error ? "Error" : current ? current.name : "Layout",
    iconProps: current ? current.iconProps : { iconName: "ViewDashboard" },
    subMenuProps: {
      items: [layoutSectionItem]
    }
  }
}

const createDashboardSettingsItem = (
  name: string,
  dashboard: IDashboard,
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

const createDashboardListMenu = (
  dashboardList: IDashboardList,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  return !sync.syncing && active ? createDashboardMenu(active, items) : undefined
}

const createDashboardLayoutActions = (
  dashboard: IDashboard,
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

const createDashboardListLayoutActions = (
  dashboardList: IDashboardList,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const sync = dashboardList.sync
  const active = dashboardList.active
  return !sync.syncing && active ? createDashboardLayoutActions(active, items) : []
}

export {
  createDashboardLayoutMenuItems,
  createDashboardLayoutMenuSection,
  createDashboardSettingsItem,
  createDashboardLayoutMenuItem,
  createDashboardMenu,
  createDashboardListMenu,
  createDashboardLayoutActions,
  createDashboardListLayoutActions
}
