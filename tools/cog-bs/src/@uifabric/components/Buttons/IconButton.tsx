import { concatStyleSets, memoizeFunction } from "@uifabric/styleguide"
import { defaultTheme, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import { nullRender } from "@uifabric/styleguide"
import * as React from "react"
import { BaseButton, getBaseButtonStyles } from "./BaseButton"
import { IButtonProps, IButtonStyles } from "./Button"
import { getSplitButtonStyles } from "./SplitButton"

export const getIconButtonStyles = memoizeFunction(
  (theme: ITheme = defaultTheme, customStyles?: IButtonStyles): IButtonStyles => {
    const baseButtonStyles: IButtonStyles = getBaseButtonStyles(theme)
    const splitButtonStyles: IButtonStyles = getSplitButtonStyles(theme)
    const { palette, semanticColors } = theme
    const iconButtonStyles: IButtonStyles = {
      root: {
        padding: "0 4px",
        width: "32px",
        height: "32px",
        backgroundColor: "transparent",
        border: "none",
        color: semanticColors.link
      },

      rootHovered: {
        color: palette.themeDarkAlt,
        backgroundColor: palette.neutralLighter,
        selectors: {
          [HighContrastSelector]: {
            borderColor: "Highlight",
            color: "Highlight"
          }
        }
      },

      rootPressed: {
        color: palette.themeDark,
        backgroundColor: palette.neutralLight
      },

      rootExpanded: {
        color: palette.themeDark,
        backgroundColor: palette.neutralLight
      },

      rootChecked: {
        color: palette.themeDark,
        backgroundColor: palette.neutralLight
      },

      rootCheckedHovered: {
        color: palette.themeDark,
        backgroundColor: palette.neutralQuaternaryAlt
      },

      rootDisabled: {
        color: palette.neutralTertiaryAlt
      }
    }

    return concatStyleSets(baseButtonStyles, iconButtonStyles, splitButtonStyles, customStyles)!
  }
)

//@customizable('IconButton', ['theme', 'styles'], true)
export class IconButton extends React.Component<IButtonProps, {}> {
  public render(): JSX.Element {
    const { styles, theme } = this.props

    return (
      <BaseButton
        {...this.props}
        variantClassName="ms-Button--icon"
        styles={getIconButtonStyles(theme!, styles)}
        onRenderText={nullRender}
        onRenderDescription={nullRender}
      />
    )
  }
}
