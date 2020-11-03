import { ErrorView } from "./ErrorView"
import { observer } from "mobx-react-lite"
import { memoizeFunction, mergeStyleSets, Spinner } from "office-ui-fabric-react"
import * as React from "react"
import { ISync } from "../models/Sync"

const getSyncComponentStyles = memoizeFunction((props) => {
  return mergeStyleSets({
    root: [
      "sync",
      {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 8
      },
      props.className
    ]
  })
})

type ISyncStyles = ReturnType<typeof getSyncComponentStyles>

export type ISyncProps = {
  sync: ISync<any>
  onRenderDone?: (props: ISyncProps) => React.ReactNode
  syncLabel?: string
  onRenderDefault?: (props: ISyncProps) => React.ReactNode
  onRenderSync?: (props: ISyncProps) => React.ReactNode
  onRenderError?: (error: any, props: ISyncProps) => React.ReactNode
  styles?: ISyncStyles
  className?: string
}

const defaultOnRenderDone = (props: ISyncProps) => {
  return null
}

export let SyncSpinner = observer((props: ISyncProps) => {
  return <Spinner className="sync-spinner" label={props.syncLabel || "Loading..."} />
})

const defaultOnRenderSync = (props: ISyncProps) => {
  return <SyncSpinner {...props} />
}

const defaultOnRenderError = (error: any) => {
  return <ErrorView className="sync-error-message" error={error} />
}

export const DefaultSyncProps: ISyncProps = {
  sync: null,
  onRenderDone: defaultOnRenderDone,
  onRenderSync: defaultOnRenderSync,
  onRenderError: defaultOnRenderError
}

export const SyncComponent = observer((props: ISyncProps) => {
  var _classNames = getSyncComponentStyles(props)
  var _renderSyncError = () => {
    const error = props.sync.error
    return props.onRenderError
      ? props.onRenderError(error, props)
      : DefaultSyncProps.onRenderError(error, props)
  }

  var _renderSyncing = (): React.ReactNode => {
    const syncContent = props.onRenderSync
      ? props.onRenderSync(props)
      : DefaultSyncProps.onRenderSync(props)
    return <div className={_classNames.root}>{syncContent}</div>
  }
  let content
  const sync = props.sync
  if (sync.syncing) {
    content = _renderSyncing()
  } else if (sync.error) {
    content = _renderSyncError()
  } else if (sync.hasSynced) {
    content = props.onRenderDone(props)
  } else {
    content = props.onRenderDefault ? props.onRenderDefault(props) : null
  }

  return content
})

export { SyncComponent as SyncView }
