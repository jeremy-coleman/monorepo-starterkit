import { IContextualMenuItem } from "@fluentui/react"
import { HostAppView, IHostAppViewProps } from "@coglite/app-host";
import { observer } from "mobx-react";
import * as React from "react";
import { DashboardListViewContainer } from "./DashboardListView";
import { createCommandBarMenuItem, createDashboardListLayoutActions, createDashboardListMenu } from "./Menus";
import { IDashboardList } from './models';


type IDashboardListAppViewProps = {
  dashboardList: IDashboardList
} & IHostAppViewProps & React.PropsWithChildren<any>

const DashboardListAppView = observer((props:IDashboardListAppViewProps) => {
    React.useEffect(() => {
      props.dashboardList.load()
    }, [props.dashboardList])

    const { dashboardList } = props;
    const items: IContextualMenuItem[] = [
      createCommandBarMenuItem(dashboardList)
    ];
    const layoutItem = createDashboardListMenu(dashboardList);
    if (layoutItem) {
      items.push(layoutItem);
    }
    const actionItems = createDashboardListLayoutActions(dashboardList);
    if (actionItems) {
      actionItems.forEach(i => items.push(i));
    }
    const commandBarProps = Object.assign({}, props.commandBarProps);

    commandBarProps.items = commandBarProps.items
      ? commandBarProps.items.concat(items)
      : items;
    return (
      <HostAppView {...props} commandBarProps={commandBarProps}>
        <DashboardListViewContainer
          dashboardList={dashboardList}
          host={props.host}
        />
        {props.children}
      </HostAppView>
    )
})

export { DashboardListAppView };

//export const DashboardListCommandBar = observer((props: DashboardListProps) => {
//   const { dashboardList } = props
//   const items: IContextualMenuItem[] = [createCommandBarMenuItem(dashboardList)]
//   const layoutItem = createDashboardListMenu(dashboardList)
//   if (layoutItem) {
//     items.push(layoutItem)
//   }
//   const actionItems = createDashboardListLayoutActions(dashboardList)
//   if (actionItems) {
//     actionItems.forEach((i) => items.push(i))
//   }
//   const commandBarProps = Object.assign({}, props.commandBarProps)
//   commandBarProps.items = commandBarProps.items ? commandBarProps.items.concat(items) : items
//   return <CommandBar {...commandBarProps} />
// })

// const DashboardListAppView1= observer((props: DashboardListProps) => {
//   React.useEffect(() => {
//     props.dashboardList.load()
//   }, [props.dashboardList])

//   const _onRenderMenu = () => {
//     return <DashboardListCommandBar {...props} />
//   }
//   return (
//     <HostAppView {...props} onRenderMenu={_onRenderMenu}>
//       <DashboardListViewContainer dashboardList={props.dashboardList} host={props.host} />
//       {props.children}
//     </HostAppView>
//   )
// })