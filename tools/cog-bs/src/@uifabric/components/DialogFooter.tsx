import { classNamesFunction, IProcessedStyleSet, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, ITheme } from "@uifabric/styleguide"
import { IRefObject } from "@uifabric/styleguide"
import * as React from "react"


export class DialogFooterBase extends React.Component<IDialogFooterProps, {}> {
  private _classNames: IProcessedStyleSet<IDialogFooterStyles>

  public render(): JSX.Element {
    const { className, styles, theme } = this.props

    this._classNames = classNamesFunction<IDialogFooterStyleProps, IDialogFooterStyles>()(styles!, {
      theme: theme!,
      className
    })

    return (
      <div className={this._classNames.actions}>
        <div className={this._classNames.actionsRight}>{this._renderChildrenAsActions()}</div>
      </div>
    )
  }

  private _renderChildrenAsActions(): (JSX.Element | null)[] {
    return React.Children.map(this.props.children, (child) => (child ? <span className={this._classNames.action}>{child}</span> : null))
  }
}

const GlobalClassNames = {
  actions: "ms-Dialog-actions",
  action: "ms-Dialog-action",
  actionsRight: "ms-Dialog-actionsRight"
}

export const getDialogFooterStyles = (props: IDialogFooterStyleProps): IDialogFooterStyles => {
  const { className, theme } = props

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    actions: [
      classNames.actions,
      {
        position: "relative",
        width: "100%",
        minHeight: "24px",
        lineHeight: "24px",
        margin: "16px 0 0",
        fontSize: "0",

        selectors: {
          ".ms-Button": {
            lineHeight: "normal"
          }
        }
      },
      className
    ],

    action: [classNames.action],

    actionsRight: [
      classNames.actionsRight,
      {
        textAlign: "right",
        marginRight: "-4px",
        fontSize: "0",

        selectors: {
          $action: {
            margin: "0 4px"
          }
        }
      }
    ]
  }
}

export const DialogFooter: React.FunctionComponent<IDialogFooterProps> = styled<
  IDialogFooterProps,
  IDialogFooterStyleProps,
  IDialogFooterStyles
>(DialogFooterBase, getDialogFooterStyles, undefined, { scope: "DialogFooter" })

export const DialogFooterType = (<DialogFooter /> as React.ReactElement<IDialogFooterProps>).type

/**
 * {@docCategory Dialog}
 */
export interface IDialogFooter {}

/**
 * {@docCategory Dialog}
 */
export interface IDialogFooterProps extends React.Props<DialogFooterBase> {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<IDialogFooter>

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<IDialogFooterStyleProps, IDialogFooterStyles>

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Optional override class name
   */
  className?: string
}

/**
 * {@docCategory Dialog}
 */
export interface IDialogFooterStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Optional override class name
   */
  className?: string
}

/**
 * {@docCategory Dialog}
 */
export interface IDialogFooterStyles {
  /**
   * Style for the actions element.
   */
  actions: IStyle

  actionsRight: IStyle
  action: IStyle
}
