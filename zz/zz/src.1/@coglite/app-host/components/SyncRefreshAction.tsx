import { ISync } from "../models/Sync"
import { observer } from "mobx-react-lite"
import { CommandBarButton, IContextualMenuItem } from "office-ui-fabric-react"
import * as React from "react"

type ISyncRefreshActionProps = {
  sync: ISync<any>
  onClick: () => void
  title?: string
} & React.HTMLProps<any>

export const SyncRefreshCommandBarButton = observer((props: ISyncRefreshActionProps) => {
  return (
    <CommandBarButton
      disabled={props.sync.syncing}
      iconProps={{ iconName: "Refresh" }}
      onClick={props.onClick}
      title={props.title}
    >
      {props.children}
    </CommandBarButton>
  )
})

export const syncRefreshItem = (
  props: ISyncRefreshActionProps,
  key: string = "refresh"
): IContextualMenuItem => {
  return {
    key: key,
    onRender(item) {
      return <SyncRefreshCommandBarButton key={item.key} {...props} />
    }
  }
}
