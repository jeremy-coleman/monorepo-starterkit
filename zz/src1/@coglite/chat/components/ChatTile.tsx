import {
  FontWeights,
  getFocusStyle,
  Icon,
  IPersonaProps,
  ITheme,
  PersonaCoin,
  PersonaPresence,
  PersonaSize
} from "@fluentui/react"
import * as React from "react"
import { createComponent } from "../utilities"

type IChatTileProps = {
  personaProps?: IPersonaProps
  name?: string
  lastMessage?: string
  lastModified?: string
  selected?: boolean
  unread?: boolean
  skype?: boolean
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
}

const SkypeImageUrl =
  "//upload.wikimedia.org/wikipedia/commons/c/c3/Microsoft_Skype_for_Business_logo.svg"

const SingleLineText = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "inline-block",
  maxWidth: "100%"
}

const getStyles = (props: any) => {
  const { theme } = props

  const FocusHoverTileStyle = {
    color: theme.palette.white,
    background: theme.palette.themePrimary,
    selectors: {
      $moreIcon: {
        display: "block"
      },
      $subTextArea: {
        visibility: "hidden"
      }
    }
  }

  return {
    root: [
      getFocusStyle(theme),
      {
        display: "flex",
        border: 0,
        backgroundColor: "inherit",
        userSelect: "none",
        position: "relative",
        padding: "0 20px",
        width: "100%",
        height: 50,
        alignItems: "center",
        background: props.selected ? theme.palette.themeLighter : undefined,
        selectors: {
          ":hover": FocusHoverTileStyle,
          ":focus": FocusHoverTileStyle
        }
      }
    ],
    thumbArea: {
      flexShrink: 0,
      width: 34
    },
    textArea: [
      {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        alignItems: "flex-start",
        textAlign: "left",
        justifyContent: "space-evenly",
        height: "100%",
        minWidth: 0
      }
    ],
    subTextArea: {
      display: "flex",
      flexShrink: 0,
      flexDirection: "column",
      alignItems: "flex-end",
      textAlign: "right",
      justifyContent: "space-evenly",
      height: "100%"
    },
    name: [
      theme.fonts.medium,
      SingleLineText,
      props.unread && {
        fontWeight: FontWeights.bold
      }
    ],
    lastMessage: [
      theme.fonts.small,
      SingleLineText,
      {
        whiteSpace: "nowrap",
        color: theme.palette.neutralTertiary,

        selectors: {
          "$root:focus &, $root:hover &": {
            color: theme.palette.white
          }
        }
      },
      props.unread && {
        color: theme.palette.neutralPrimary,
        fontWeight: FontWeights.bold
      }
    ],
    lastModified: [theme.fonts.small, SingleLineText],
    moreIcon: {
      display: "none",
      position: "absolute",
      right: 20,
      top: 0,
      height: 50,
      lineHeight: 50,
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      fontWeight: FontWeights.bold
    }
  }
}

const view = (props: IChatTileProps) => {
  const { styles, personaProps } = props

  return (
    <button className={styles.root}>
      <div className={styles.thumbArea}>
        <PersonaCoin
          {...(personaProps as {})}
          size={PersonaSize.size24}
          presence={PersonaPresence.away}
        />
      </div>
      <div className={styles.textArea}>
        <span className={styles.name}>{props.name}</span>
        <span className={styles.lastMessage}>{props.lastMessage}</span>
      </div>
      <div className={styles.subTextArea}>
        <span className={styles.lastModified}>{props.lastModified}</span>
        {props.skype && <img width="12" height="16" src={SkypeImageUrl} />}
      </div>
      <div className={styles.moreIcon}>
        <Icon iconName="more" />
      </div>
    </button>
  )
}

export const ChatTile = createComponent<IChatTileProps>({
  scope: "ChatTile",
  styles: getStyles,
  view
})
