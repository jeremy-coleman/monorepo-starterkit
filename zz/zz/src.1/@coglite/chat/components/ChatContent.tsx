import { ITheme, TextField } from "office-ui-fabric-react"
import * as React from "react"
import { createComponent } from "../utilities"
import { ChatContentHeader } from "./ChatContentHeader"
import { ChatContentList } from "./ChatContentList"

type IChatContentProps = {
  className?: string
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
}

const view = (props: IChatContentProps) => {
  const { styles } = props
  return (
    <div className={styles.root}>
      <ChatContentHeader className={styles.header} />
      <ChatContentList className={styles.list} />
      <div className={styles.textField}>
        <TextField placeholder="Type a new message" underlined />
      </div>
    </div>
  )
}

const getStyles = (props: IChatContentProps) => {
  return {
    root: [
      {
        background: props.theme.palette.neutralLighter,
        display: "flex",
        flexDirection: "column",
        minHeight: 0
      },
      props.className
    ],
    header: [
      {
        flexShrink: 0,
        padding: "0 20px"
      }
    ],
    list: [
      {
        flexGrow: 1,
        overflowX: "hidden",
        overflowY: "scroll"
      }
    ],
    textField: [
      {
        flexShrink: 0,
        padding: "0 20px",
        margin: "20px 0"
      }
    ]
  }
}

export const ChatContent = createComponent<IChatContentProps>({
  scope: "ChatContent",
  styles: getStyles,
  view
})
