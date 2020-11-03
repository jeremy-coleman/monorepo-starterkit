import { FocusZone, ITheme, Pivot, PivotItem } from "@fluentui/react"
import * as React from "react"
import { ChatListData } from "../testData"
import { createComponent } from "../utilities"
import { Accordion } from "./Accordion"
import { AccordionTitle } from "./AccordionTitle"
import { ChatTile } from "./ChatTile"

type IChatListProps = {
  className?: string
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
}

const view = (props: IChatListProps) => {
  const { styles } = props
  return (
    <div className={styles.root}>
      <Pivot>
        <PivotItem linkText="Recent" />
        <PivotItem linkText="Contacts" />
      </Pivot>
      <div className={styles.scrollView}>
        <FocusZone>
          <Accordion titleAs={AccordionTitle} titleProps={{ text: "Pinned" }}>
            {ChatListData.map((chat) => (
              <ChatTile key={chat.id} {...chat} />
            ))}
          </Accordion>
        </FocusZone>
      </div>
    </div>
  )
}

const getStyles = (props) => ({
  root: [
    {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      overflow: "hidden"
    }
  ],
  scrollView: {
    flexGrow: 1,
    overflowX: "hidden",
    overflowY: "scroll"
  }
})

export const ChatList = createComponent<IChatListProps>({
  scope: "ChatList",
  styles: getStyles,
  view
})
