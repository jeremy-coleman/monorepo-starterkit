import { ISync } from "coglite/types"
import { observer } from "mobx-react"
import { MessageBar, MessageBarType } from "@uifabric/components"
import * as React from "react"

interface IListingSyncError {
  sync: ISync
  messagePrefix?: string
}

@observer
class ListingSyncError extends React.Component<IListingSyncError, any> {
  render() {
    const { sync, messagePrefix } = this.props
    if (sync.error) {
      let message
      let detail
      if (sync.error.errors) {
        message = "Some values are invalid"
        detail = <pre>{JSON.stringify(sync.error.errors, null, "\t")}</pre>
      } else if (sync.error.response) {
        if (sync.error.response.data) {
          if (sync.error.response.data.message) {
            message = sync.error.response.data.message
            detail = sync.error.response.data.detail
          } else {
            detail = <pre>{JSON.stringify(sync.error.response.data, null, "\t")}</pre>
          }
        }
      } else if (sync.error.message) {
        message = sync.error.message
        detail = sync.error.detail
      } else {
        detail = <pre>{JSON.stringify(sync.error, null, "\t")}</pre>
      }
      return (
        <MessageBar messageBarType={MessageBarType.error} styles={{ root: { marginBottom: 8 } }}>
          {message && (
            <div>
              {messagePrefix || "An error has occurred"} - {message}
            </div>
          )}
          <div>{detail}</div>
        </MessageBar>
      )
    }
    return null
  }
}

export { ListingSyncError, IListingSyncError }
