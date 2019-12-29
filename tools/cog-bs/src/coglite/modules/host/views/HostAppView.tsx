import { IAppHost, IAppHostBaseProps } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"
import { AppView, IAppViewProps } from "./AppView"

export type IHostAppViewProps = {
  hideBackNavigation?: boolean
  showBackLabel?: boolean
  backFallback?: any
} & IAppHostBaseProps &
  IAppViewProps &
  React.HTMLProps<any>

export const HostAppView = observer((props: IHostAppViewProps) => {
  const myCommandBarItems: any[] = []
  if (!props.hideBackNavigation) {
    const backItem = createBackItem(props.host, props.backFallback, props.showBackLabel)
    if (backItem) {
      myCommandBarItems.push(backItem)
    }
  }
  const commandBarProps = Object.assign({}, props.commandBarProps)

  commandBarProps.items = commandBarProps.items ? myCommandBarItems.concat(commandBarProps.items) : myCommandBarItems

  return (
    <AppView {...props} root={props.host.root} commandBarProps={commandBarProps}>
      {props.children}
    </AppView>
  )
})

export const createBackItem = (host: IAppHost, fallback?: any, showLabel?: boolean) => {
  if (host.canGoBack) {
    const backRequest = host.backRequest
    const title = backRequest.title ? `Back to ${backRequest.title}` : "Back"
    return {
      key: "back",
      iconProps: {
        iconName: "Back"
      },
      name: showLabel ? title : undefined,
      host,
      path: backRequest.path,
      title,
      ariaLabel: title,
      onClick: () => {
        host.back()
      }
    }
  }
  return fallback
}

// import { IAppHost } from "coglite/types"
// import { observer } from "mobx-react"
// import * as React from "react"
// import { AppView, IAppViewProps } from "./AppView"
// import { createBackItem } from "./createBackItem"
// import { appIconItem } from "./HostAppIcon"
// import { appTitleItem } from "./HostAppTitle"

// //import { IContextualMenuItem } from '@uifabric/components'
// export type IHostAppViewProps = {
//   commandBarProps?
//   onRenderMenu?: (props: IAppViewProps) => React.ReactNode
//   onRenderMenuOther?: (props: IAppViewProps) => React.ReactNode
//   root?: boolean
//   styles?
//   className?: string
//   host: IAppHost
//   hideBackNavigation?: boolean
//   showBackLabel?: boolean
//   backFallback?
//   hideTitle?: boolean
//   hideIcon?: boolean
// } & React.HTMLProps<any>

// @observer
// class HostAppView extends React.Component<IHostAppViewProps, any> {
//   render() {
//     const items = []

//     if (this.props.host.root && !this.props.hideIcon) {
//       items.push(appIconItem(this.props))
//     }
//     if (!this.props.hideBackNavigation) {
//       const backItem = createBackItem(this.props.host, this.props.backFallback, this.props.showBackLabel)
//       if (backItem) {
//         items.push(backItem)
//       }
//     }
//     if (this.props.host.root && !this.props.hideTitle) {
//       items.push(appTitleItem(this.props))
//     }
//     const commandBarProps = Object.assign({}, this.props.commandBarProps)
//     commandBarProps.items = commandBarProps.items ? items.concat(commandBarProps.items) : items
//     return (
//       <AppView {...this.props} root={this.props.host.root} commandBarProps={commandBarProps}>
//         {this.props.children}
//       </AppView>
//     )
//   }
// }

// export { HostAppView }
