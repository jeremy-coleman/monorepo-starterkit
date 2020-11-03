import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from "@fluentui/react"
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { IComponent } from './models';


type IComponentRemoveOptions = {
  component: IComponent;
  saveHandler?: (component : IComponent) => void;
}

type IComponentRemove = {
  active : boolean;
  component : IComponent;
  init(opts: IComponentRemoveOptions) : void;
  save() : void;
  cancel() : void;
}

const removeComponent = (opts : IComponentRemoveOptions) => {
    ComponentRemoveStore.init(opts);
};

interface IComponentRemoveProps {
    remove: IComponentRemove;
}

const ComponentRemoveStore = observable({
    _saveHandler: undefined as IComponentRemoveOptions["saveHandler"],
    active: false,
    component: undefined,
    init(opts: IComponentRemoveOptions) {
      ComponentRemoveStore.component = opts.component
      ComponentRemoveStore._saveHandler = opts.saveHandler
      ComponentRemoveStore.active = true
    },
    _close() {
      ComponentRemoveStore.active = false
    },
    save() {
      if (ComponentRemoveStore._saveHandler) {
        ComponentRemoveStore._saveHandler(ComponentRemoveStore.component)
      } else {
        ComponentRemoveStore.component.removeFromParent()
      }
      ComponentRemoveStore._close()
    },
    cancel() {
      ComponentRemoveStore._close()
    }
  })
  
const ComponentRemoveDialog = observer(() => {
    const _onClickCancel = () => {
      ComponentRemoveStore.cancel()
    }
    const _onClickSave = () => {
      ComponentRemoveStore.save()
    }
    const _onDismissed = () => {
      ComponentRemoveStore.cancel()
    }
  
    const c = ComponentRemoveStore.component
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
      <>
        {ComponentRemoveStore.active && (
          <Dialog
            hidden={!ComponentRemoveStore.active}
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
      </>
    )
  })


export { removeComponent };
export { ComponentRemoveStore };
export { ComponentRemoveDialog };

