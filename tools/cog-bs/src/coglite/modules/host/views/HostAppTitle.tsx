import { CommandBarButton } from "@uifabric/components";
import { observer } from "mobx-react";
import * as React from "react";

export const HostAppTitle = observer((props) => <CommandBarButton>{props.host.title}</CommandBarButton>)

export const appTitleItem = (props, key: string = "appTitle") => {
  return {
    key: key,
    onRender: (item) => <HostAppTitle key={item.key} {...props} />
  }
}
