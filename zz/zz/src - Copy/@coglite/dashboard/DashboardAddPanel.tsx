import {
  Checkbox,
  DefaultButton,
  Dropdown,
  IDropdownOption,
  Panel,
  PanelType,
  PrimaryButton
} from "@fluentui/react";
import { BoundTextField } from "@coglite/app-host";
import { isNotBlank } from "@coglite/app-host";
import { action, computed, observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { Dashboard, IDashboard, IDashboardList } from "./models";
import { DashboardAddPanelStylesheet } from "./styles";

type InitArgs = { dashboardList: IDashboardList; existing?: IDashboard };

class DashboardAdd {
  @observable active: boolean = false;
  @observable dashboardList: IDashboardList;
  @observable existing: IDashboard;
  @observable dashboard: IDashboard;
  @observable makeActive: boolean = true;

  @action
  init({ dashboardList, existing }: InitArgs) {
    this.dashboardList = dashboardList;
    this.dashboard = new Dashboard();
    this.existing = existing;
    let dashboardNumber = 1;
    let suggestedTitle: string;
    while (true) {
      suggestedTitle = `Dashboard ${dashboardNumber}`;
      if (!this.dashboardList.dashboards.some(db => db.title === suggestedTitle)) {
        break;
      } else {
        dashboardNumber++;
      }
    }
    this.dashboard.setTitle(suggestedTitle);
    this.active = true;
  }

  @action
  setExisting(existing: IDashboard) {
    this.existing = existing;
  }

  @action
  setMakeActive(makeActive: boolean) {
    this.makeActive = makeActive;
  }

  @computed
  get saveEnabled() {
    return isNotBlank(this.dashboard.title) ? true : false;
  }

  @action
  save() {
    if (this.existing) {
      this.dashboard.setComponentConfig(this.existing.componentConfig);
    }

    this.dashboardList.add(this.dashboard, this.makeActive);
    this.cancel();
  }

  @action
  cancel() {
    this.existing = undefined;
    this.dashboardList = undefined;
    this.active = false;
  }

  @computed
  get options() {
    const _options: IDropdownOption[] = this.dashboardList.dashboards.map(db => {
      return { key: db.id, text: db.title };
    });
    return _options;
  }
}

const DashboardAddStore = new DashboardAdd();

const addDashboard = action(({ dashboardList, existing }: InitArgs) => {
  DashboardAddStore.init({ dashboardList, existing });
});

const DashboardAddEditor = observer(() => {
  const _onMakeActiveChange = (e, checked) => {
    DashboardAddStore.setMakeActive(checked);
  };

  const options: IDropdownOption[] = DashboardAddStore.dashboardList.dashboards.map(db => {
    return { key: db.id, text: db.title };
  });
  options.unshift({ key: "", text: "" });

  const _onChange = (option: IDropdownOption) => {
    const dashboard = DashboardAddStore.dashboardList.dashboards.find(db => db.id === option.key);
    DashboardAddStore.setExisting(dashboard);
  };

  return (
    <>
      {DashboardAddStore.active && (
        <div className={DashboardAddPanelStylesheet.editor}>
          <BoundTextField
            label="Title"
            binding={{ target: DashboardAddStore.dashboard, key: "title", setter: "setTitle" }}
          />
          <>
            {DashboardAddStore.dashboardList.dashboardCount > 0 && (
              <Dropdown
                label="From Existing"
                options={options}
                onChanged={_onChange}
                selectedKey={DashboardAddStore.existing ? DashboardAddStore.existing.id : ""}
              />
            )}
          </>
          <Checkbox
            label="Set Dashboard Active"
            onChange={_onMakeActiveChange}
            checked={DashboardAddStore.makeActive}
            styles={{ root: { marginTop: 8 } }}
          />
        </div>
      )}
    </>
  );
});

const DashboardAddPanel = observer(() => {
  const _onClickCancel = () => {
    DashboardAddStore.cancel();
  };
  const _onClickSave = () => {
    DashboardAddStore.save();
  };
  const _onDismiss = () => {
    DashboardAddStore.cancel();
  };
  const _onRenderEditor = () => <DashboardAddEditor />;
  const _onRenderActions = () => (
    <div className={DashboardAddPanelStylesheet.actions}>
      <DefaultButton className={DashboardAddPanelStylesheet.actions} onClick={_onClickCancel}>
        Cancel
      </DefaultButton>
      <PrimaryButton
        className={DashboardAddPanelStylesheet.actions}
        onClick={_onClickSave}
        disabled={!DashboardAddStore.saveEnabled}
      >
        OK
      </PrimaryButton>
    </div>
  );

  return (
    <>
      {DashboardAddStore.active && (
        <Panel
          className={DashboardAddPanelStylesheet.root}
          isOpen={DashboardAddStore.active}
          isLightDismiss={true}
          onRenderFooterContent={_onRenderActions}
          onRenderBody={_onRenderEditor}
          headerText="Add Dashboard"
          type={PanelType.medium}
          onDismiss={_onDismiss}
        />
      )}
    </>
  );
});

export { DashboardAddStore };
export { addDashboard };
export { DashboardAddPanel };
