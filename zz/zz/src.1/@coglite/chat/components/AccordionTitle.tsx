import { getFocusStyle, Icon, ITheme } from "office-ui-fabric-react"
import * as React from "react"
import { createComponent } from "../utilities"

export interface IAccordionTitleProps {
  focusElementRef?: React.RefObject<HTMLButtonElement>
  collapsed?: boolean
  onToggleCollapse?: () => void
  onKeyDown?: (ev: React.KeyboardEvent<Element>) => void
  indent?: number
  noChevron?: boolean
  text?: string
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
}

const getStyles = (props: IAccordionTitleProps) => {
  const { theme } = props

  return {
    root: [
      getFocusStyle(theme),
      {
        width: "100%",
        display: "flex",
        alignItems: "center",
        background: "none",
        border: "none",
        height: 36,
        margin: 0,
        padding: 8,
        paddingLeft: 8 + (props.indent || 0) * 22,
        selectors: {
          ":hover": {
            background: theme.palette.neutralLight
          }
        }
      }
    ],
    icon: [
      {
        flexShrink: 0,
        padding: 0,
        marginRight: 8,
        transition: "transform .1s linear"
      },
      props.collapsed && {
        transform: "rotate(-90deg)"
      }
    ],
    text: theme.fonts.small
  }
}

const view = (props: IAccordionTitleProps) => {
  return (
    <button
      ref={props.focusElementRef}
      className={props.styles.root}
      onClick={props.onToggleCollapse}
      onKeyDown={props.onKeyDown}
    >
      {!props.noChevron && <Icon className={props.styles.icon} iconName="ChevronDown" />}
      <span className={props.styles.text}>{props.text}</span>
    </button>
  )
}

export const AccordionTitle = createComponent<IAccordionTitleProps>({
  scope: "AccordionTitle",
  view,
  styles: getStyles
})
