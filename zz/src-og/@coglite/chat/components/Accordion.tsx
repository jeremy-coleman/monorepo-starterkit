import { ITheme } from "@fluentui/react"
import * as React from "react"
import { IAccordionTitleProps } from "./AccordionTitle"

type IAccordionProps = {
  className?: string
  defaultCollapsed?: boolean
  collapsed?: boolean
  titleAs: React.ComponentType<IAccordionTitleProps>
  titleProps?: {}
  theme?: ITheme
} & React.PropsWithChildren<any>

export const Accordion = (props: IAccordionProps) => {
  const _titleElement = React.useRef<HTMLButtonElement>()
  const [state, setState] = React.useState({
    collapsed: !!(props.defaultCollapsed === undefined ? props.collapsed : props.defaultCollapsed)
  })

  const { className, titleAs: TitleType, titleProps, children } = props
  const { collapsed } = state

  const _onRootKeyDown = (ev: React.KeyboardEvent<Element>) => {
    switch (ev.which) {
      case 37:
        if (ev.target !== _titleElement.current && _titleElement.current) {
          _titleElement.current.focus()
          ev.preventDefault()
          ev.stopPropagation()
        }
        break

      default:
        break
    }
  }

  const _onToggleCollapse = () => {
    setState((state) => ({ collapsed: !state.collapsed }))
  }

  const _onKeyDown = (ev: React.KeyboardEvent<Element>) => {
    switch (ev.which) {
      case 37: // left
        if (!collapsed) {
          setState({ collapsed: true })
          break
        }
        return

      case 39: // right
        if (collapsed) {
          setState({ collapsed: false })
          break
        }
        return

      default:
        return
    }

    ev.preventDefault()
    ev.stopPropagation()
  }

  return (
    <div className={className} onKeyDown={_onRootKeyDown}>
      <TitleType
        {...titleProps}
        focusElementRef={_titleElement}
        collapsed={collapsed}
        onToggleCollapse={_onToggleCollapse}
        onKeyDown={_onKeyDown}
      />
      {!collapsed && children}
    </div>
  )
}
