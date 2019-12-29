import { concatStyleSets, memoizeFunction } from "@uifabric/styleguide"
import { defaultTheme, HighContrastSelector, ITheme  } from "@uifabric/styleguide"
import { nullRender } from "@uifabric/styleguide"
import * as React from "react"
import { BaseButton, getBaseButtonStyles } from "./BaseButton"
import { IButtonProps, IButtonStyles } from "./Button"

const DEFAULT_BUTTON_HEIGHT = "40px"
const DEFAULT_PADDING = "0 4px"

export const getActionButtonStyles = memoizeFunction(
  (theme: ITheme = defaultTheme, customStyles?: IButtonStyles): IButtonStyles => {
    const baseButtonStyles: IButtonStyles = getBaseButtonStyles(theme)
    const actionButtonStyles: IButtonStyles = {
      root: {
        padding: DEFAULT_PADDING,
        height: DEFAULT_BUTTON_HEIGHT,
        color: theme.palette.neutralPrimary,
        backgroundColor: "transparent",
        border: "1px solid transparent"
      },

      rootHovered: {
        color: theme.palette.themePrimary,
        selectors: {
          [HighContrastSelector]: {
            borderColor: "Highlight",
            color: "Highlight"
          }
        }
      },

      iconHovered: {
        color: theme.palette.themePrimary
      },

      rootPressed: {
        color: theme.palette.black
      },

      rootExpanded: {
        color: theme.palette.themePrimary
      },

      iconPressed: {
        color: theme.palette.themeDarker
      },

      rootDisabled: {
        color: theme.palette.neutralTertiary,
        backgroundColor: "transparent",
        borderColor: "transparent"
      },

      rootChecked: {
        color: theme.palette.black
      },

      iconChecked: {
        color: theme.palette.themeDarker
      },

      flexContainer: {
        justifyContent: "flex-start"
      },

      icon: {
        color: theme.palette.themeDarkAlt
      },

      iconDisabled: {
        color: "inherit"
      },

      menuIcon: {
        color: theme.palette.neutralSecondary
      },

      textContainer: {
        flexGrow: 0
      }
    }

    return concatStyleSets(baseButtonStyles, actionButtonStyles, customStyles)!
  }
)

export class ActionButton extends React.Component<IButtonProps, {}> {
  public render(): JSX.Element {
    const { styles, theme } = this.props

    return (
      <BaseButton
        {...this.props}
        variantClassName="ms-Button--action ms-Button--command"
        styles={getActionButtonStyles(theme!, styles)}
        onRenderDescription={nullRender}
      />
    )
  }
}
