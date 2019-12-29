import { concatStyleSets, memoizeFunction } from "@uifabric/styleguide"
import { ITheme, defaultTheme } from "@uifabric/styleguide"
import { nullRender } from "@uifabric/styleguide"
import * as React from "react"
import { getBaseButtonStyles } from "./Buttons/BaseButton"
import { IButtonProps, IButtonStyles } from "./Buttons/Button"
import { DefaultButton } from "./Buttons/DefaultButton"

export const getMessageBarButtonStyles = memoizeFunction(
  (theme: ITheme = defaultTheme, customStyles?: IButtonStyles, focusInset?: string, focusColor?: string): IButtonStyles => {
    const baseButtonStyles: IButtonStyles = getBaseButtonStyles(theme)
    const messageBarButtonStyles: IButtonStyles = {
      root: {
        height: 24,
        width: 84,
        borderColor: theme.palette.neutralTertiaryAlt
      }
    }

    return concatStyleSets(baseButtonStyles, messageBarButtonStyles, customStyles)!
  }
)

export class MessageBarButton extends React.Component<IButtonProps, {}> {
  public render(): JSX.Element {
    const { styles, theme } = this.props

    return <DefaultButton {...this.props} styles={getMessageBarButtonStyles(theme!, styles)} onRenderDescription={nullRender} />
  }
}
