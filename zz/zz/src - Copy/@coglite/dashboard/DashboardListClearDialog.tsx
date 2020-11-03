
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from "@fluentui/react"
import { Supplier } from "@coglite/app-host";
import { action } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { IDashboardList } from './models';


const DashboardListClearStore = new Supplier()

const DashboardListClearDialog = observer(() => {
  const _onClickCancel = () => {
    DashboardListClearStore.clearValue()
  }
  const _onClickSave = () => {
    DashboardListClearStore.value.clear()
    DashboardListClearStore.clearValue()
  }
  const _onDismissed = () => {
    DashboardListClearStore.clearValue()
  }

  return (
    <>
      {DashboardListClearStore.value && (
        <Dialog
          hidden={!DashboardListClearStore.value}
          modalProps={{
            onDismissed: _onDismissed
          }}
          dialogContentProps={{
            title: DashboardListClearStore.value ? "Remove all Dashboards" : "",
            subText: DashboardListClearStore.value ? `Are you sure you want to remove all Dashboards?` : ""
          }}
        >
          <DialogFooter>
            <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
            <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
          </DialogFooter>
        </Dialog>
      )}
    </>
  )
})

const clearDashboards = action((dashboardList : IDashboardList) => {
  DashboardListClearStore.value = dashboardList;
});

export { DashboardListClearStore, clearDashboards };
export { DashboardListClearDialog };



