import { CommandBarButton, Icon, IContextualMenuItem, Persona, PersonaSize } from "@uifabric/components"
import { IAppHostBaseProps } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"

export const HostAppIcon = observer((props: IAppHostBaseProps) => {
  const { host } = props
  const icon = host.icon
  if (icon.url || icon.text) {
    return <Persona size={PersonaSize.size16} imageUrl={icon.url} imageAlt={icon.text} text={icon.text} hidePersonaDetails />
  }
  if (icon.name) {
    return <Icon iconName={icon.name} />
  }
  if (icon.component) {
    return icon.component
  }
  return null
})

const HostAppIconContainer = observer((props: IAppHostBaseProps) => {
  var _onRenderIcon = () => {
    return <HostAppIcon {...props} />
  }

  const { host } = props
  const icon = host.icon
  if (icon.url || icon.text || icon.name || icon.component) {
    return <CommandBarButton onRenderIcon={_onRenderIcon} />
  }
  return null
})

export const appIconItem = (props: IAppHostBaseProps, key: string = "appIcon"): IContextualMenuItem => {
  return {
    key: key,
    onRender(item) {
      return <HostAppIconContainer key={item.key} {...props} />
    }
  }
}
