import { Link } from "@uifabric/components"
import { IAppHost, IRequest } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"

type IAppLinkProps = {
  host: IAppHost
  request?: IRequest
  title?: string
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
  open?: boolean
  onHostOpened?: (host: IAppHost) => void
} & React.HTMLProps<any>

export const AppLink = observer((props: IAppLinkProps) => {
  const href = props.host.getUrl(props.request)
  const content = React.Children.count(props.children) > 0 ? props.children : props.title
  var _onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (props.onClick) {
      props.onClick()
    } else {
      if (props.open) {
        props.host.open(props.request).then((openedHost) => {
          if (props.onHostOpened) {
            props.onHostOpened(openedHost)
          }
        })
      } else {
        props.host.load(props.request)
      }
    }
  }
  return (
    <Link style={props.style} className={props.className} title={props.title} href={href} onClick={_onClick}>
      {content}
    </Link>
  )
})

export { AppLink as HostLink }
