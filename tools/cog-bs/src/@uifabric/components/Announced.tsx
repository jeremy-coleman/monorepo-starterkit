import { classNamesFunction, IProcessedStyleSet, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { hiddenContentStyle } from "@uifabric/styleguide"
import { divProperties, getNativeProps } from "@uifabric/styleguide"
import * as React from "react"
import { DelayedRender } from "./DelayedRender"


export class AnnouncedBase extends React.Component<IAnnouncedProps> {
  public static defaultProps: Partial<IAnnouncedProps> = {
    "aria-live": "assertive"
  }

  private _classNames: IProcessedStyleSet<IAnnouncedStyles>

  public render(): JSX.Element {
    const { message, styles } = this.props

    this._classNames = classNamesFunction<{}, IAnnouncedStyles>()(styles)

    return (
      <div role="status" {...getNativeProps(this.props, divProperties)}>
        <DelayedRender>
          <div className={this._classNames.screenReaderText}>{message}</div>
        </DelayedRender>
      </div>
    )
  }
}

export const getAnnouncedStyles = (): IAnnouncedStyles => {
  return {
    screenReaderText: hiddenContentStyle
  }
}

export const Announced: React.FunctionComponent<IAnnouncedProps> = styled<IAnnouncedProps, {}, IAnnouncedStyles>(
  AnnouncedBase,
  getAnnouncedStyles
)

/**
 * {@docCategory Announced}
 */
export interface IAnnouncedProps extends React.Props<AnnouncedBase>, React.HTMLAttributes<HTMLDivElement> {
  /** Call to provide customized styling that will layer on top of the variant rules. */
  styles?: IStyleFunctionOrObject<{}, IAnnouncedStyles>

  /**
   * The status message provided as screen reader output
   */
  message?: string
}

/**
 * {@docCategory Announced}
 */
export interface IAnnouncedStyles {
  /**
   * Style override for the screen reader text.
   */
  screenReaderText: IStyle
}
