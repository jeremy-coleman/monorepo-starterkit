import { ISync } from "../models/Sync"
import { observer } from "mobx-react-lite"
import { IOverlayProps, mergeStyleSets, Overlay, Spinner } from "@fluentui/react"
import * as React from "react"

const SyncOverlayStylesheet = mergeStyleSets({
  root: [
    "sync-overlay",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 30000
    }
  ],
  content: ["sync-overlay-content", {}]
})

export interface ISyncOverlayProps {
  sync: ISync<any>
  syncLabel?: string
  onRenderSync?: (props: ISyncOverlayProps) => React.ReactNode
  className?: string
  overlayProps?: IOverlayProps
}

const defaultRenderSync = (props: ISyncOverlayProps) => {
  return <Spinner label={props.syncLabel || "Loading..."} />
}

export const SyncOverlay = observer((props: ISyncOverlayProps) => {
  if (props.sync.syncing) {
    const content = (props.onRenderSync || defaultRenderSync)(props)
    return (
      <Overlay {...props.overlayProps} className={SyncOverlayStylesheet.root}>
        <div className={SyncOverlayStylesheet.content}>{content}</div>
      </Overlay>
    )
  }
  return null
})
