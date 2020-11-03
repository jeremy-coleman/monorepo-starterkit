import { observer } from "mobx-react-lite"
import {
  CommandBarButton,
  Icon,
  IContextualMenuItem,
  Persona,
  PersonaSize
} from "office-ui-fabric-react"
import * as React from "react"
import { IAppHost } from "../models/ApplicationHost"

type IAppHostIconProps = {
  host: Partial<IAppHost>
}


export const HostAppIcon = observer((props: IAppHostIconProps) => {
  const { host } = props
  const icon = host.icon
  if (icon.url || icon.text) {
    return (
      <Persona
        size={PersonaSize.size16}
        imageUrl={icon.url}
        imageAlt={icon.text}
        text={icon.text}
        hidePersonaDetails
      />
    )
  }
  if (icon.name) {
    return <Icon iconName={icon.name} />
  }
  if (icon.component) {
    return icon.component
  } else return null
})

const HostAppIconContainer = observer((props: IAppHostIconProps) => {
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

export const appIconItem = (
  props: IAppHostIconProps,
  key: string = "appIcon"
): IContextualMenuItem => {
  return {
    key: key,
    onRender(item) {
      return <HostAppIconContainer key={item.key} {...props} />
    }
  }
}
