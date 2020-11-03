import { observer } from "mobx-react-lite"
import { CommandBarButton } from "@fluentui/react"
import * as React from "react"
import { AppView, IAppViewProps } from "./AppView"
import { createBackItem } from "./createBackItem"
import { appIconItem } from "./HostAppIcon"
import { IAppHost } from "../models/ApplicationHost"


export const HostAppTitle = observer((props: {host: IAppHost}) => {
  return <CommandBarButton>{props.host.title}</CommandBarButton>
})

export const appTitleItem = (props, key: string = "appTitle") => {
  return {
    key: key,
    onRender: (item) => <HostAppTitle key={item.key} {...props} />
  }
}

export type IHostAppViewProps = {
  commandBarProps?: any
  onRenderMenu?: (props: IAppViewProps) => React.ReactNode
  onRenderMenuOther?: (props: IAppViewProps) => React.ReactNode
  root?: boolean
  styles?: any
  className?: string
  host: IAppHost
  hideBackNavigation?: boolean
  showBackLabel?: boolean
  backFallback?: any
  hideTitle?: boolean
  hideIcon?: boolean
}

export const HostAppView: React.FC<IHostAppViewProps> = observer((props) => {
  const items = []
  if (props.host.root && !props.hideIcon) {
    items.push(appIconItem(props))
  }
  if (!props.hideBackNavigation) {
    const backItem = createBackItem(props.host, props.backFallback, props.showBackLabel)
    if (backItem) {
      items.push(backItem)
    }
  }
  if (props.host.root && !props.hideTitle) {
    items.push(appTitleItem(props))
  }
  const commandBarProps = Object.assign({}, props.commandBarProps)
  commandBarProps.items = commandBarProps.items ? items.concat(commandBarProps.items) : items
  return (
    <AppView {...props} root={props.host.root} commandBarProps={commandBarProps}>
      {props.children}
    </AppView>
  )
})
