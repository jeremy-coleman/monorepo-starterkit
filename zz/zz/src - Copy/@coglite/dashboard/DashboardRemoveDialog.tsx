import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from "@fluentui/react"
import { Supplier } from "@coglite/app-host";
import { action } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { IDashboard } from './models';

const DashboardRemoveStore = new Supplier<IDashboard>();

const DashboardRemoveDialog = observer(() => {
  const _onClickCancel = () => {
    DashboardRemoveStore.clearValue()
  }
  const _onClickSave = () => {
    DashboardRemoveStore.value.removeFromParent()
    DashboardRemoveStore.clearValue()
  }
  const _onDismissed = () => {
    DashboardRemoveStore.clearValue()
  }

  return (
    <Dialog
      hidden={!DashboardRemoveStore.value}
      onDismiss={_onDismissed}
      dialogContentProps={{
        title: DashboardRemoveStore.value ? "Remove Dashboard" : "",
        subText:
          (DashboardRemoveStore.value && `Are you sure you want to remove ${DashboardRemoveStore.value.title}?`) || ""
      }}
    >
      <DialogFooter>
        <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
        <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
})


const removeDashboard = action((dashboard : IDashboard) => {
  DashboardRemoveStore.value = dashboard;
});

export { DashboardRemoveStore, removeDashboard };
export { DashboardRemoveDialog };

