import { observer } from "mobx-react-lite"
import { CommandBarButton, IContextualMenuItem, Spinner, SpinnerSize } from "office-ui-fabric-react"
import * as React from "react"
import { ISync } from "../models/Sync"

export interface IRefreshButtonProps {
  title?: string
  syncTitle?: string
  sync?: ISync<any>
  showLabel?: boolean
  key?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const RefreshCommandBarButton = observer((props: IRefreshButtonProps) => {
  var _onRenderSync = () => {
    return <Spinner size={SpinnerSize.small} />
  }
  const { sync, syncTitle, title } = props
  const iconProps = sync.syncing ? undefined : { iconName: "Refresh" }
  const onRenderIcon = sync.syncing ? _onRenderSync : undefined
  const buttonTitle = sync.syncing ? syncTitle || "Refreshing..." : title || "Refresh"
  const disabled = sync.syncing || !props.onClick
  return (
    <CommandBarButton
      iconProps={iconProps}
      onRenderIcon={onRenderIcon}
      title={buttonTitle}
      ariaLabel={buttonTitle}
      disabled={disabled}
      onClick={props.onClick}
    >
      {props.showLabel ? buttonTitle : undefined}
    </CommandBarButton>
  )
})

export const createRefreshMenuItem = (
  props: IRefreshButtonProps,
  key: string = "refresh"
): IContextualMenuItem => {
  return {
    key: key,
    onRender(item) {
      return <RefreshCommandBarButton key={item.key} {...props} />
    }
  }
}

export { createRefreshMenuItem as refreshMenuItem }
