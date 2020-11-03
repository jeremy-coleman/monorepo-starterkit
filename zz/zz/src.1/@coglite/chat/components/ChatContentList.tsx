import { FocusZone, ITheme } from "office-ui-fabric-react"
import * as React from "react"
import { getRandomText } from "../testData"
import { createComponent } from "../utilities"
import { ChatEntry } from "./ChatEntry"
import { Divider } from "./Divider"

type IChatContentListProps = {
  className?: string
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
}

const view = (props: IChatContentListProps) => {
  const { styles } = props

  return (
    <div className={styles.root}>
      <FocusZone className={styles.container}>
        <ChatEntry
          personaProps={{}}
          received
          name="Person"
          date="12/12/12 1:22 PM"
          messages={[getRandomText(100), getRandomText(10)]}
        />
        <ChatEntry
          personaProps={{}}
          name="David"
          date="12/12/12 1:22 PM"
          messages={[getRandomText(33)]}
        />
        <ChatEntry
          personaProps={{}}
          received
          name="Person"
          date="12/12/12 1:22 PM"
          messages={[getRandomText(100), getRandomText(10)]}
        />
        <ChatEntry
          personaProps={{}}
          name="David"
          date="12/12/12 1:22 PM"
          messages={[getRandomText(33)]}
        />
        <Divider text="Today" />
        <Divider text="Last read" emphasized />
        <ChatEntry
          personaProps={{}}
          received
          name="Person"
          date="12/12/12 1:22 PM"
          messages={[getRandomText(100), getRandomText(10)]}
        />
        <ChatEntry
          personaProps={{}}
          name="David"
          date="12/12/12 1:22 PM"
          messages={[getRandomText(33)]}
        />
      </FocusZone>
    </div>
  )
}

const getStyles = (props: IChatContentListProps) => {
  return {
    root: [props.className],
    container: [
      {
        padding: 20,
        selectors: {
          "& > * ": {
            margin: "12px 0"
          }
        }
      }
    ]
  }
}

export const ChatContentList = createComponent<IChatContentListProps>({
  scope: "ChatContentList",
  styles: getStyles,
  view
})
