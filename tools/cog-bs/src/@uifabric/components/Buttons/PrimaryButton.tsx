import { nullRender } from "@uifabric/styleguide"
import * as React from "react"
import { IButtonProps } from "./Button"
import { DefaultButton } from "./DefaultButton"

//@customizable('PrimaryButton', ['theme', 'styles'], true)
export class PrimaryButton extends React.Component<IButtonProps, {}> {
  public render(): JSX.Element {
    return <DefaultButton {...this.props} primary={true} onRenderDescription={nullRender} />
  }
}
