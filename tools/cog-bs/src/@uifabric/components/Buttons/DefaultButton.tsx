import { concatStyleSets, memoizeFunction } from "@uifabric/styleguide"
import { defaultTheme, FontWeights, ITheme } from "@uifabric/styleguide"
import { nullRender } from "@uifabric/styleguide"
import * as React from "react"
import { BaseButton, getBaseButtonStyles } from "./BaseButton"
import { IButtonProps, IButtonStyles } from "./Button"
import { primaryStyles, standardStyles } from "./ButtonThemes"
import { getSplitButtonStyles } from "./SplitButton"

const DEFAULT_BUTTON_HEIGHT = "32px"
const DEFAULT_BUTTON_MIN_WIDTH = "80px"

export const getDefaultButtonStyles = memoizeFunction(
  (theme: ITheme, customStyles?: IButtonStyles, primary?: boolean): IButtonStyles => {
    const baseButtonStyles: IButtonStyles = getBaseButtonStyles(theme)
    const splitButtonStyles: IButtonStyles = getSplitButtonStyles(theme)
    const defaultButtonStyles: IButtonStyles = {
      root: {
        minWidth: DEFAULT_BUTTON_MIN_WIDTH,
        height: DEFAULT_BUTTON_HEIGHT
      },
      label: {
        fontWeight: FontWeights.semibold
      }
    }

    return concatStyleSets(
      baseButtonStyles,
      defaultButtonStyles,
      primary ? primaryStyles(theme) : standardStyles(theme),
      splitButtonStyles,
      customStyles
    )!
  }
)

//@customizable('DefaultButton', ['theme', 'styles'], true)
export class DefaultButton extends React.Component<IButtonProps, {}> {
  public render(): JSX.Element {
    const { primary = false, styles, theme = defaultTheme } = this.props

    return (
      <BaseButton
        {...this.props}
        variantClassName={primary ? "ms-Button--primary" : "ms-Button--default"}
        styles={getDefaultButtonStyles(theme!, styles, primary)}
        onRenderDescription={nullRender}
      />
    )
  }
}
