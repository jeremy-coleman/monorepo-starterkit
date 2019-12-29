import { IContextualMenuItem } from "@uifabric/components"
import { observer } from "mobx-react"
import * as React from "react"
import { HostAppView, IAppHostProps } from "../host/views"
import { sampleGroups } from "./sampleGroups"

const SampleHostAppView = observer((props: IAppHostProps) => {
  var _onClickItem = (e, item) => {
    props.host.load({ path: item.path, replace: false })
  }

  const groupItems = sampleGroups.map((g) => {
    const groupItem: IContextualMenuItem = {
      key: g.key,
      name: g.title
    }
    const sampleItems = g.items.map((item) => {
      return {
        key: item.path,
        path: item.path,
        name: item.title,
        canCheck: true,
        checked: props.host.path === item.path,
        onClick: _onClickItem
      }
    })
    groupItem.subMenuProps = {
      items: sampleItems
    }
    return groupItem
  })
  const items: IContextualMenuItem[] = [
    {
      key: "samples",
      name: "Samples",
      subMenuProps: {
        items: groupItems
      }
    }
  ]
  if (props.host.root) {
    items.push({
      key: "title",
      name: `${props.host.title}`
    })
  }
  const farItems: IContextualMenuItem[] = []

  const commandBarItems = {
    items: items,
    farItems: farItems
  }

  return (
    <HostAppView
      //hideTitle
      //showBackLabel
      host={props.host}
      commandBarProps={commandBarItems}
    >
      {props.children}
    </HostAppView>
  )
})

export { SampleHostAppView }
