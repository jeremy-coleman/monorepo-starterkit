import { FontWeights, Icon, ITheme, PersonaCoin, Pivot, PivotItem } from "office-ui-fabric-react"
import * as React from "react"
import { createComponent } from "../utilities"
import { Divider } from "./Divider"
import { RoundButton } from "./RoundButton"

const SingleLineText = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "inline-block",
  maxWidth: "100%"
}

type IChatContentHeaderProps = {
  className: string
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
}

const view = (props: IChatContentHeaderProps) => {
  const { styles } = props
  return (
    <div className={styles.root}>
      <div className={styles.nameArea}>
        <PersonaCoin className={styles.persona} size={3} />
        <span className={styles.name}>Name of person</span>
        <div className={styles.buttonArea}>
          <RoundButton primary>
            <Icon iconName="video" />
          </RoundButton>
          <RoundButton primary>
            <Icon iconName="phone" />
          </RoundButton>
          <RoundButton>
            <Icon iconName="addfriend" />
          </RoundButton>
        </div>
      </div>
      <Pivot>
        <PivotItem linkText="Conversation" />
        <PivotItem linkText="Files" />
        <PivotItem linkText="Activity" />
      </Pivot>
      <Divider />
    </div>
  )
}

const getStyles = (props: IChatContentHeaderProps) => {
  const { theme, className } = props
  const { fonts } = theme
  return {
    root: [
      {
        marginTop: 12
      },
      className
    ],
    nameArea: [
      {
        display: "flex",
        alignItems: "center"
      }
    ],
    persona: [
      {
        margin: 10
      }
    ],
    name: [
      fonts.xLarge,
      SingleLineText,
      {
        flexGrow: 1,
        fontWeight: FontWeights.bold,
        margin: 10
      }
    ],
    buttonArea: [
      {
        display: "flex",
        flexWrap: "nowrap",
        margin: -4,
        selectors: {
          "& > *": {
            margin: 4
          }
        }
      }
    ]
  }
}

export const ChatContentHeader = createComponent<IChatContentHeaderProps>({
  scope: "ChatContentHeader",
  view,
  styles: getStyles
})
