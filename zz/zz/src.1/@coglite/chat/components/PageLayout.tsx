import { ITheme } from "office-ui-fabric-react"
import * as React from "react"
import { createComponent } from "../utilities"
import { ChatContent } from "./ChatContent"
import { ChatList } from "./ChatList"

type IPageLayoutProps = {
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
}

const getStyles = (props) => {
  const { palette } = props.theme

  return {
    root: [
      {
        display: "flex",
        flexDirection: "column",
        // jusifyContent: "stretch",
        alignItems: "stretch",
        width: "100vw",
        height: "100vh"
      }
    ],

    header: [
      {
        background: palette.themeDark,
        height: 50,
        flexShrink: 0
      }
    ],

    content: [
      {
        display: "flex",
        // justifyContent: "stretch",
        alignItems: "stretch",
        flexGrow: 1,
        minHeight: "55px",
        width: "100%"
      }
    ],

    sideNav: [
      {
        background: palette.themeDarker,
        width: 60,
        flexShrink: 0
      }
    ],

    chatList: [
      {
        width: 300,
        flexShrink: 0,
        position: "relative"
      }
    ],

    chatContent: [
      {
        flexGrow: 1
      }
    ]
  }
}

const view = (props: IPageLayoutProps) => {
  const { styles } = props

  return (
    <div className={styles.root}>
      <div className={styles.header} />
      <div className={styles.content}>
        <div className={styles.sideNav} />
        <div className={styles.chatList}>
          <ChatList />
        </div>
        <ChatContent className={styles.chatContent} />
      </div>
    </div>
  )
}

export const PageLayout = createComponent<IPageLayoutProps>({
  scope: "PageLayout",
  styles: getStyles,
  view
})
