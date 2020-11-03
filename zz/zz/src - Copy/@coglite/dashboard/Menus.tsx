import {
  ContextualMenuItemType,
  DefaultButton,
  IContextualMenuItem,
  IContextualMenuProps,
  Slider
} from "@fluentui/react"
import { SyncComponent } from "@coglite/app-host";
import { observer } from "mobx-react";
import * as React from "react";
import { addDashboard } from "./DashboardAddPanel";
import { clearDashboards } from "./DashboardListClearDialog";
import { removeDashboard } from "./DashboardRemoveDialog";
import { DashboardLayoutRegistry, IDashboardLayout } from "./layouts";
import { IDashboard, IDashboardList, IGrid } from "./models";

const onClickDashboardLayoutItem = (
  e: React.MouseEvent<HTMLButtonElement>,
  item: IContextualMenuItem
) => {
  item.applyLayout(item.dashboard);
};

const createDashboardLayoutMenuItem = (
  dashboard: IDashboard,
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
  };
};

const createDashboardLayoutMenuItems = (
  dashboard: IDashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const isAnyLayoutApplied = items.some(item => item.isLayoutApplied(dashboard));
  const r = items.map(item => {
    return createDashboardLayoutMenuItem(dashboard, item);
  });
  r.push({
    dashboard: dashboard,
    key: "other",
    name: "Custom",
    iconProps: { iconName: "ViewDashboard" },
    checked: !isAnyLayoutApplied,
    canCheck: true,
    disabled: true
  });
  return r;
};

const createDashboardLayoutMenuSection = (
  dashboard: IDashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutItems: IContextualMenuItem[] = createDashboardLayoutMenuItems(dashboard, items);
  return {
    key: "layoutSectionItem",
    itemType: ContextualMenuItemType.Section,
    sectionProps: {
      key: "layoutSection",
      title: "Layout",
      items: layoutItems
    }
  };
};

const createDashboardMenu = (
  dashboard: IDashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutSectionItem = createDashboardLayoutMenuSection(dashboard, items);
  const current = layoutSectionItem.sectionProps.items.find(item => item.checked);
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
  };
};

const createDashboardSettingsItem = (
  name: string,
  dashboard: IDashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const layoutSectionItem = createDashboardLayoutMenuSection(dashboard, items);
  return {
    key: "dashboardSettings",
    name: name,
    iconProps: { iconName: "Settings" },
    subMenuProps: {
      items: [layoutSectionItem]
    }
  };
};

const createDashboardListMenu = (
  dashboardList: IDashboardList,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem => {
  const sync = dashboardList.sync;
  const active = dashboardList.active;
  return !sync.syncing && active ? createDashboardMenu(active, items) : undefined;
};

const createDashboardLayoutActions = (
  dashboard: IDashboard,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const currentLayout = items.find(item => {
    return item.isLayoutApplied(dashboard);
  });
  let actions: IContextualMenuItem[];
  if (currentLayout && currentLayout.createActions) {
    actions = currentLayout.createActions(dashboard);
  }
  if (!actions) {
    actions = [];
  }
  return actions;
};

const createDashboardListLayoutActions = (
  dashboardList: IDashboardList,
  items: IDashboardLayout[] = DashboardLayoutRegistry.itemsView
): IContextualMenuItem[] => {
  const sync = dashboardList.sync;
  const active = dashboardList.active;
  return !sync.syncing && active ? createDashboardLayoutActions(active, items) : [];
};

interface IDashboardListMenuButtonProps {
  dashboardList: IDashboardList;
}

@observer
class DashboardListMenuButton extends React.Component<IDashboardListMenuButtonProps, any> {
  render() {
    const items = createMenuItems(this.props.dashboardList);
    const active = this.props.dashboardList.active;
    const title = active ? active.title : "Dashboards";
    const menuProps: IContextualMenuProps = {
      items: items
    };
    return (
      <DefaultButton className="dashboard-list-menu-button app-menu-button" menuProps={menuProps}>
        {title}
      </DefaultButton>
    );
  }
}

class DashboardListMenuButtonContainer extends React.Component<IDashboardListMenuButtonProps, any> {
  private _onRenderSync = () => {
    return (
      <DefaultButton className="dashboard-list-menu-button app-menu-button">
        Loading...
      </DefaultButton>
    );
  };
  private _onRenderDone = () => {
    return <DashboardListMenuButton {...this.props} />;
  };
  private _onRenderError = () => {
    return (
      <DefaultButton className="dashboard-list-menu-button app-menu-button error">
        Error
      </DefaultButton>
    );
  };
  render() {
    return (
      <SyncComponent
        sync={this.props.dashboardList.sync}
        onRenderSync={this._onRenderSync}
        onRenderDone={this._onRenderDone}
      />
    );
  }
}

type Item = {
  dashboard?: IDashboard;
  dashboardList?: IDashboardList;
} & Partial<IContextualMenuItem>;

//React.SyntheticEvent<KeyboardEvent | MouseEvent, Event>
type E = React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>;

const onAddDashboardClick = (e: E, item: Item) => {
  addDashboard({ dashboardList: item.dashboardList });
};
const onDashboardClick = (e: E, item: Item) => {
  item.dashboardList.setActive(item.dashboard);
};
const onRemoveAllDashboardsClick = (e: E, item: Item) => {
  clearDashboards(item.dashboardList);
};
const onClickCopyItem = (e: E, item: Item) => {
  addDashboard({ dashboardList: item.dashboardList, existing: item.dashboard });
};
const onClickRemoveItem = (e: E, item: Item) => {
  removeDashboard(item.dashboard);
};

const createMenuItems = (dashboardList: IDashboardList): IContextualMenuItem[] => {
  const items: IContextualMenuItem[] = [];
  const dashboards = dashboardList.dashboards;
  const active = dashboardList.active;
  if (dashboards.length > 0) {
    const dashboardItems: IContextualMenuItem[] = dashboards.map(d => {
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
      };
    });
    const dashboardSectionItem: IContextualMenuItem = {
      key: "dashboardSectionItem",
      itemType: ContextualMenuItemType.Section,
      sectionProps: {
        key: "dashboardSection",
        title: "Dashboards",
        items: dashboardItems
      }
    };
    items.push(dashboardSectionItem);
  }
  const actionItems: IContextualMenuItem[] = [];
  actionItems.push({
    key: "add",
    name: "Add Dashboard",
    dashboardList: dashboardList,
    onClick: onAddDashboardClick,
    iconProps: { iconName: "Add" },
    disabled: dashboardList.sync.syncing
  });

  if (dashboardList.dashboards.length > 0) {
    actionItems.push({
      key: "removeAllSep",
      name: "-"
    });
    actionItems.push({
      key: "removeAll",
      name: "Remove All Dashboards",
      dashboardList: dashboardList,
      onClick: onRemoveAllDashboardsClick,
      iconProps: { iconName: "Clear" }
    });
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
  };
  items.push(actionSectionItem);
  return items;
};

const createCommandBarMenuItem = (dashboardList: IDashboardList): IContextualMenuItem => {
  const sync = dashboardList.sync;
  const active = dashboardList.active;
  const title = sync.syncing
    ? "Loading Dashboards..."
    : sync.error
    ? "Error"
    : active
    ? active.title
    : "Dashboards";
  return {
    key: "dashboardsCommbarBarItem",
    name: title,
    subMenuProps: {
      items: createMenuItems(dashboardList)
    }
  };
};

type IGridSettingsProps = {
  grid: IGrid;
};

type IGridCellSliderProps = {
  min?: number;
  max?: number;
  label?: string;
  grid: IGrid;
};

const GridCellMarginSlider = observer((props: IGridCellSliderProps) => {
  const _onChange = (value: number) => {
    props.grid.setCellMargin(value);
  };
  return (
    <Slider
      label={props.label}
      ariaLabel={`Grid Cell Margin ${props.grid.cellMargin}`}
      min={props.min || 0}
      max={props.max || 16}
      value={props.grid.cellMargin}
      onChange={_onChange}
    />
  );
});

const GridCellSizeSlider = observer((props: IGridCellSliderProps) => {
  const _onChange = (value: number) => {
    props.grid.setCellSize(value);
  };
  return (
    <Slider
      label={props.label}
      ariaLabel={`Grid Cell Size ${props.grid.cellSize}`}
      min={props.min || 10}
      max={props.max || 160}
      value={props.grid.cellSize}
      onChange={_onChange}
    />
  );
});

const GridSettings = observer((props: IGridSettingsProps) => {
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
  );
});

const onRenderGridCellSize = (item: IContextualMenuItem) => {
  const grid = item.grid as IGrid;
  return <GridCellSizeSlider key={item.key} grid={grid} />;
};

const onRenderGridCellMargin = (item: IContextualMenuItem) => {
  const grid = item.grid as IGrid;
  return <GridCellMarginSlider key={item.key} grid={grid} />;
};

export {
  onRenderGridCellMargin,
  onRenderGridCellSize,
  //IGridCellSliderProps,
  GridCellMarginSlider,
  GridCellSizeSlider,
  GridSettings,
  createMenuItems,
  createCommandBarMenuItem,
  //IDashboardListMenuButtonProps,
  DashboardListMenuButtonContainer,
  DashboardListMenuButton,
  createDashboardLayoutMenuItems,
  createDashboardLayoutMenuSection,
  createDashboardSettingsItem,
  createDashboardLayoutMenuItem,
  createDashboardMenu,
  createDashboardListMenu,
  createDashboardLayoutActions,
  createDashboardListLayoutActions
};
