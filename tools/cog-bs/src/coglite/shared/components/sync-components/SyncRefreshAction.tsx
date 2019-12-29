import { CommandBarButton, IContextualMenuItem } from "@uifabric/components"
import { ISync } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"

type ISyncRefreshActionProps = {
  sync: ISync
  onClick: () => void
  title?: string
} & React.HTMLProps<any>

export const SyncRefreshCommandBarButton = observer((props: ISyncRefreshActionProps) => {
  return (
    <CommandBarButton disabled={props.sync.syncing} iconProps={{ iconName: "Refresh" }} onClick={props.onClick} title={props.title}>
      {props.children}
    </CommandBarButton>
  )
})

export const syncRefreshItem = (props: ISyncRefreshActionProps, key: string = "refresh"): IContextualMenuItem => {
  return {
    key: key,
    onRender(item) {
      return <SyncRefreshCommandBarButton key={item.key} {...props} />
    }
  }
}
