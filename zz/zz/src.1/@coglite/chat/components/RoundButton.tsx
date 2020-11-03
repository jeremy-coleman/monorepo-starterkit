import { getFocusStyle, ITheme } from "office-ui-fabric-react"
import * as React from "react"
import { createComponent } from "../utilities"

type IRoundButtonProps = {
  as?: (React.ComponentType<any> & React.ReactElement<any>) | keyof JSX.IntrinsicElements
  className?: string
  primary?: boolean
  styles?: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme?: ITheme
} & React.HTMLProps<any>

export const view = (props: IRoundButtonProps): JSX.Element => {
  const { as: RootTag = "button", styles } = props
  //const nativeProps = getNativeProps(props, buttonProperties);

  return <RootTag {...props} className={styles.root} />
}

const getStyles = (props: IRoundButtonProps) => {
  const { className, theme, primary } = props
  const { palette } = theme

  return {
    root: [
      getFocusStyle(theme, -4),
      {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        fontSize: 14,
        backgroundColor: primary ? palette.themePrimary : "inherit",
        borderColor: primary ? palette.themePrimary : palette.neutralSecondary,
        color: primary ? theme.palette.white : "inherit",
        borderRadius: "50%",
        borderWidth: 1,
        borderStyle: "solid",
        outline: "none",

        selectors: {
          ":hover": {
            backgroundColor: primary ? palette.themeDark : palette.themeLight
          },

          "&:active": {
            borderColor: palette.themeSecondary,
            backgroundColor: palette.themeSecondary,
            color: palette.neutralLight
          }
        }
      },
      className
    ]
  }
}

export const RoundButton = createComponent<IRoundButtonProps>({
  scope: "RoundButton",
  styles: getStyles,
  view
})
