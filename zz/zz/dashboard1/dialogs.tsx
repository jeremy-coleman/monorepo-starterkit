
type DashboardDialogViewProps = {
    add?: DashboardAdd
    className?: string
    actionClassName?: string
    remove?: ComponentRemove
    dashboard?: Dashboard
  }
  
  // export type DashboardDialogProps<T = any> = DashboardDialogViewProps & {
  //   supplier?: IMutableSupplier<T>
  // }
  
  const DashboardAddPanelStylesheet = mergeStyleSets({
    root: ["dashboard-add", {}],
    editor: [
      "dashboard-add-editor",
      {
        padding: 8
      }
    ],
    actions: ["dashboard-add-actions", {}],
    action: [
      "dasboard-add-action",
      {
        marginRight: 8
      }
    ]
  })
  
  //type IDashboardAddStyles = typeof DashboardAddPanelStylesheet
  
  type ClearDialogProps = DashboardDialogViewProps & { supplier?: ISupplier<DashboardList> }
  export const DashboardListClearDialog = observer((props: ClearDialogProps) => {
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
      <>
        {props.supplier && props.supplier.value && (
          <Dialog
            hidden={!props.supplier.value}
            modalProps={{
              onDismissed: _onDismissed
            }}
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
        )}
      </>
    )
  })
  
  
  const DashboardPropertyEditor = observer((props: {dashboard: IDashboard}) => {
    const { dashboard } = props
    return (
      <div className="dashboard-property-editor">
        <BoundTextField
          label="Title"
          binding={{
            target: dashboard,
            key: "title",
            setter: "setTitle"
          }}
        />
      </div>
    )
  })
  
  const DashboardAddActions = observer((props: DashboardDialogViewProps) => {
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
        <PrimaryButton
          className={props.actionClassName}
          onClick={_onClickSave}
          disabled={!props.add.saveEnabled}
        >
          OK
        </PrimaryButton>
      </div>
    )
  })
  
  const ExistingDashboardSelector = observer((props: DashboardDialogViewProps) => {
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
      <>
        {props.add && props.add.dashboardList.dashboardCount > 0 && (
          <Dropdown
            label="From Existing"
            options={options}
            onChanged={_onChange}
            selectedKey={props.add.existing ? props.add.existing.id : ""}
          />
        )}
      </>
    )
  })
  
  const DashboardAddEditor = observer((props: DashboardDialogViewProps) => {
    
    const _onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.which === KeyCodes.enter && props.add.saveEnabled) {
        props.add.save()
      }
    }
  
    const _onMakeActiveChange = (e, checked) => {
      props.add.setMakeActive(checked)
    }
    return (
      <>
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
      </>
    )
  })
  
  export const DashboardAddPanel = observer((props: DashboardDialogViewProps) => {
    const _onRenderActions = () => {
      return (
        <DashboardAddActions
          add={props.add}
          className={DashboardAddPanelStylesheet.actions}
          actionClassName={DashboardAddPanelStylesheet.action}
        />
      )
    }
    const _onRenderEditor = () => {
      return <DashboardAddEditor add={props.add} className={DashboardAddPanelStylesheet.editor} />
    }
    const _onDismiss = () => {
      props.add.cancel()
    }
  
    const effectiveRootStyle = css([DashboardAddPanelStylesheet.root, props.className])
    return (
      <>
        {props.add.active && (
          <Panel
            className={effectiveRootStyle}
            isOpen={props.add.active}
            isLightDismiss={true}
            onRenderFooterContent={_onRenderActions}
            onRenderBody={_onRenderEditor}
            headerText="Add Dashboard"
            type={PanelType.medium}
            onDismiss={_onDismiss}
          />
        )}
      </>
    )
  })
  
  export const ComponentRemoveDialog = observer((props: DashboardDialogViewProps) => {
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
      <React.Fragment>
        {props.remove && props.remove.active && (
          <Dialog
            hidden={!props.remove.active}
            modalProps={{
              onDismiss: _onDismissed
            }}
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
        )}
      </React.Fragment>
    )
  })
  
  type DashboardSupplier = { supplier: ISupplier<Dashboard> }
  
  export const DashboardRemoveDialog = observer(({ supplier }: DashboardSupplier) => {
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
          subText:
            (supplier.value && `Are you sure you want to remove ${supplier.value.title}?`) || ""
        }}
      >
        <DialogFooter>
          <DefaultButton onClick={_onClickCancel}>Cancel</DefaultButton>
          <PrimaryButton onClick={_onClickSave}>OK</PrimaryButton>
        </DialogFooter>
      </Dialog>
    )
  })
  