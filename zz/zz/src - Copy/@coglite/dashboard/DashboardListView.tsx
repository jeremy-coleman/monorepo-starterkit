import { IAppHost } from "@coglite/app-host";
import { SyncComponent } from "@coglite/app-host";
import { observer } from "mobx-react";
import * as React from "react";
import { DashboardAddPanel } from "./DashboardAddPanel";
import { DashboardListClearDialog } from "./DashboardListClearDialog";
import { DashboardRemoveDialog } from "./DashboardRemoveDialog";
import { DashboardView } from "./DashboardView";
import { IDashboardList } from './models';
import { dashboardListStyles } from "./styles";


interface IDashboardListProps {
  dashboardList: IDashboardList
  host?: IAppHost
  className?: string
}

const DashboardListView = observer((props: IDashboardListProps) => {
  React.useEffect(() => {
    return () => props.dashboardList.close()
  }, [props.dashboardList])

  const dashboards = props.dashboardList.dashboards.map((db) => {
    return <DashboardView key={db.id} hidden={db !== props.dashboardList.active} dashboard={db} host={props.host} />
  })
  return (
    <div className={dashboardListStyles.root}>
      <DashboardAddPanel />
      <DashboardRemoveDialog />
      <DashboardListClearDialog />
      {dashboards}
    </div>
  )
})
 const DashboardListViewContainer = observer((props: IDashboardListProps) => {
  let _onRenderDone = () => {
    return <DashboardListView {...props} />
  }
  return (
    <SyncComponent sync={props.dashboardList.sync} syncLabel="Loading Dashboards..." onRenderDone={_onRenderDone} />
  )
})

export { DashboardListViewContainer, DashboardListView };

