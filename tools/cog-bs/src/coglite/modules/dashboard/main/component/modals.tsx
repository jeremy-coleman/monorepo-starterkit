import { concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { KeyCodes } from "@uifabric/styleguide"
import { BoundTextField } from "coglite/shared/components"
import { IMutableSupplier } from "coglite/types"
import { observer } from "mobx-react"
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  Dropdown,
  IDropdownOption,
  Panel,
  PanelType,
  PrimaryButton
} from "@uifabric/components"
import * as React from "react"
import { IComponentRemove, IDashboard, IDashboardAdd, IDashboardList } from "../types"

type DashboardDialogViewProps = {
  add?: IDashboardAdd
  className?: string
  actionClassName?: string
  remove?: IComponentRemove
  styles?: IDashboardAddStyles
  dashboard?: IDashboard
}

export type DashboardDialogProps<T = any> = DashboardDialogViewProps & {
  supplier?: IMutableSupplier<T>
}

const useDashboardAddPanelStyles = (props) => {
  let styles = concatStyleSets({
    root: {},
    editor: {
      padding: 8
    },
    actions: {},
    action: {
      marginRight: 8
    }
  })
  return mergeStyleSets({
    root: ["dashboard-add", styles.root, props.className],
    editor: ["dashboard-add-editor", styles.editor],
    actions: ["dashboard-add-actions", styles.actions],
    action: ["dasboard-add-action", styles.action]
  })
}

type IDashboardAddStyles = ReturnType<typeof useDashboardAddPanelStyles>

export let DashboardListClearDialog = observer((props: DashboardDialogProps<IDashboardList>) => {
  const _onClickCancel = () => {
    props.supplier.clearValue()
  }
  const _onClickSave = () => {
    props.supplier.value.clear()
    props.supplier.clearValue()
  }
  const _onDismissed = () => {
    props.supplier.clearValue()
  }

  return (
    <Dialog
      hidden={!props.supplier.value}
      onDismiss={_onDismissed}
      dialogContentProps={{
        title: props.supplier.value ? "Remove all Dashboards" : "",
        subText: props.supplier.value ? `Are you sure you want to remove all Dashboards?` : ""
      }}
    >
      <DialogFooter>
        <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
        <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
})

let DashboardPropertyEditor = observer((props: DashboardDialogProps) => {
  return (
    <div className="dashboard-property-editor">
      <BoundTextField
        label="Title"
        binding={{
          target: props.dashboard,
          key: "title",
          setter: "setTitle"
        }}
      />
    </div>
  )
})

let DashboardAddActions = observer((props: DashboardDialogProps) => {
  const _onClickCancel = () => {
    props.add.cancel()
  }
  const _onClickSave = () => {
    props.add.save()
  }

  return (
    <div className={props.className}>
      <DefaultButton className={props.actionClassName} onClick={_onClickCancel}>
        Cancel
      </DefaultButton>
      <PrimaryButton className={props.actionClassName} onClick={_onClickSave} disabled={!props.add.saveEnabled}>
        OK
      </PrimaryButton>
    </div>
  )
})

let ExistingDashboardSelector = observer((props: DashboardDialogProps) => {
  const options: IDropdownOption[] = props.add.dashboardList.dashboards.map((db) => {
    return {
      key: db.id,
      text: db.title
    }
  })
  options.unshift({
    key: "",
    text: ""
  })
  const _onChange = (option: IDropdownOption) => {
    const dashboard = props.add.dashboardList.dashboards.find((db) => db.id === option.key)
    props.add.setExisting(dashboard)
  }

  return (
    <React.Fragment>
      {props.add && props.add.dashboardList.dashboardCount > 0 && (
        <Dropdown
          label="From Existing"
          options={options}
          onChanged={_onChange}
          selectedKey={props.add.existing ? props.add.existing.id : ""}
        />
      )}
    </React.Fragment>
  )
})

let DashboardAddEditor = observer((props: DashboardDialogProps) => {
  const _onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.which === KeyCodes.enter && props.add.saveEnabled) {
      props.add.save()
    }
  }
  const _onMakeActiveChange = (e, checked) => {
    props.add.setMakeActive(checked)
  }
  return (
    <React.Fragment>
      {props.add.active && (
        <div className={props.className}>
          <DashboardPropertyEditor dashboard={props.add.dashboard} />
          <ExistingDashboardSelector {...props} />
          <Checkbox
            label="Set Dashboard Active"
            onChange={_onMakeActiveChange}
            checked={props.add.makeActive}
            styles={{ root: { marginTop: 8 } }}
          />
        </div>
      )}
    </React.Fragment>
  )
})

export let DashboardAddPanel = observer((props: DashboardDialogProps) => {
  let _classNames = useDashboardAddPanelStyles(props)
  const _onRenderActions = () => {
    return <DashboardAddActions add={props.add} className={_classNames.actions} actionClassName={_classNames.action} />
  }
  const _onRenderEditor = () => {
    return <DashboardAddEditor add={props.add} className={_classNames.editor} />
  }
  const _onDismiss = () => {
    props.add.cancel()
  }

  return (
    <Panel
      className={_classNames.root}
      isOpen={props.add.active}
      isLightDismiss={true}
      onRenderFooterContent={_onRenderActions}
      onRenderBody={_onRenderEditor}
      headerText="Add Dashboard"
      type={PanelType.medium}
      onDismiss={_onDismiss}
    />
  )
})

export let ComponentRemoveDialog = observer((props: DashboardDialogProps) => {
  const _onClickCancel = () => {
    props.remove.cancel()
  }
  const _onClickSave = () => {
    props.remove.save()
  }
  const _onDismissed = () => {
    props.remove.cancel()
  }

  const c = props.remove.component
  let title
  if (c) {
    if (c.type === "stack" || c.type === "list") {
      title = "all Tabs"
    }
  }
  if (!title) {
    title = "the Tab"
  }

  return (
    <Dialog
      hidden={!props.remove.active}
      onDismiss={_onDismissed}
      dialogContentProps={{
        title: `Close ${title}`,
        subText: `Are you sure you want to close ${title}?`
      }}
    >
      <DialogFooter>
        <DefaultButton className="dashboard-form-action" onClick={_onClickCancel}>
          Cancel
        </DefaultButton>
        <PrimaryButton className="dashboard-form-action" onClick={_onClickSave}>
          OK
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
})

export let DashboardRemoveDialog = observer(({ supplier }: DashboardDialogProps<IDashboard>) => {
  const _onClickCancel = () => {
    supplier.clearValue()
  }
  const _onClickSave = () => {
    supplier.value.removeFromParent()
    supplier.clearValue()
  }
  const _onDismissed = () => {
    supplier.clearValue()
  }

  return (
    <Dialog
      hidden={!supplier.value}
      onDismiss={_onDismissed}
      dialogContentProps={{
        title: supplier.value ? "Remove Dashboard" : "",
        subText: (supplier.value && `Are you sure you want to remove ${supplier.value.title}?`) || ""
      }}
    >
      <DialogFooter>
        <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
        <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
})
