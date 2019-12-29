import { SyncSpinner } from "coglite/shared/components"
import { IListing, IMutableSync } from "coglite/types"
import { observer } from "mobx-react"
import { DefaultButton, Dialog, DialogFooter, DialogType, MessageBar, MessageBarType } from "@uifabric/components"
import * as React from "react"

interface IListingLaunchDialogProps {
  sync: IMutableSync<IListing>
}

@observer
class ListingLaunchDialog extends React.Component<IListingLaunchDialogProps, any> {
  private _onRenderError = (error: any, idx: number) => {
    return <div key={idx}>{error.message || error}</div>
  }
  private _onRenderErrors = () => {
    const error = this.props.sync.error
    let content
    if (error.errors) {
      content = error.errors.map(this._onRenderError)
    } else {
      content = error.message
    }
    return <MessageBar messageBarType={MessageBarType.blocked}>{content}</MessageBar>
  }
  private _onDismiss = () => {
    this.props.sync.clear()
  }
  render() {
    const { sync } = this.props
    const open = sync.syncing || sync.error ? true : false
    let title
    let content
    if (open) {
      const listing = sync.id
      title = listing.title
      content = sync.syncing ? <SyncSpinner sync={sync} syncLabel={`Launching ${title}`} /> : this._onRenderErrors()
    }
    return (
      <Dialog hidden={!open} title={title} onDismiss={this._onDismiss} dialogContentProps={{ type: DialogType.normal }}>
        {content}
        {sync.error && (
          <DialogFooter>
            <DefaultButton onClick={this._onDismiss}>OK</DefaultButton>
          </DialogFooter>
        )}
      </Dialog>
    )
  }
}

export { IListingLaunchDialogProps, ListingLaunchDialog }
