import { FontWeights, ITheme } from "office-ui-fabric-react"
import * as React from "react"
import { createComponent } from "../utilities"

type IDividerProps = {
  className?: string
  text?: string
  emphasized?: boolean
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
}

const view = (props: IDividerProps) => {
  const { styles, text } = props
  if (!text) {
    return <hr className={styles.root} />
  } else {
    return (
      <div className={styles.root}>
        <hr className={styles.partialDivider} />
        <span className={styles.text}>{text}</span>
        <hr className={styles.partialDivider} />
      </div>
    )
  }
}

const getStyles = (props: IDividerProps) => {
  const { className, theme, text, emphasized } = props
  const ForegroundColor = emphasized ? theme.palette.themePrimary : theme.palette.neutralTertiaryAlt

  const HorizontalDividerStyle = {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    border: "none",
    height: 1, // emphasized ? 2 : 1,
    background: ForegroundColor
  }

  return {
    root: [
      !text && HorizontalDividerStyle,

      !!text && {
        display: "flex",
        alignItems: "center",
        // justifyContent: "stretch",
        width: "100%"
      },
      className
    ],
    partialDivider: [HorizontalDividerStyle],
    text: [
      theme.fonts.small,
      {
        margin: "0 12px",
        color: ForegroundColor,
        fontWeight: emphasized ? FontWeights.bold : FontWeights.regular
      }
    ]
  }
}

export const Divider = createComponent<IDividerProps>({
  scope: "Divider",
  styles: getStyles,
  view
})
