import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { FontWeights, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import { divProperties, getNativeProps, IComponentAs, IRefObject } from "@uifabric/styleguide"
import * as React from "react"


export class LabelBase extends React.Component<ILabelProps, {}> {
  public render(): JSX.Element {
    const { as: RootType = "label", children, className, disabled, styles, required, theme } = this.props
    const classNames = classNamesFunction<ILabelStyleProps, ILabelStyles>()(styles, {
      className,
      disabled,
      required,
      theme: theme!
    })
    return (
      <RootType {...getNativeProps(this.props, divProperties)} className={classNames.root}>
        {children}
      </RootType>
    )
  }
}

export const getLabelStyles = (props: ILabelStyleProps): ILabelStyles => {
  const { theme, className, disabled, required } = props
  const { semanticColors } = theme

  // Tokens
  const labelFontWeight = FontWeights.semibold
  const labelColor = semanticColors.bodyText
  const labelDisabledColor = semanticColors.disabledBodyText
  const labelRequiredStarColor = semanticColors.errorText

  return {
    root: [
      "ms-Label",
      theme.fonts.small,
      {
        fontWeight: labelFontWeight,
        color: labelColor,
        boxSizing: "border-box",
        boxShadow: "none",
        margin: 0,
        display: "block",
        padding: "5px 0",
        wordWrap: "break-word",
        overflowWrap: "break-word"
      },
      disabled && {
        color: labelDisabledColor,
        selectors: {
          [HighContrastSelector]: {
            color: "GrayText"
          }
        }
      },
      required && {
        selectors: {
          "::after": {
            content: `' *'`,
            color: labelRequiredStarColor,
            paddingRight: 12
          }
        }
      },
      className
    ]
  }
}

export const Label: React.FunctionComponent<ILabelProps> = styled<ILabelProps, ILabelStyleProps, ILabelStyles>(
  LabelBase,
  getLabelStyles,
  undefined,
  {
    scope: "Label"
  }
)

/**
 * {@docCategory Label}
 */
export interface ILabel {}

/**
 * {@docCategory Label}
 */
export interface ILabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Render the root element as another type.
   */
  as?: IComponentAs<React.AllHTMLAttributes<HTMLElement>>

  /**
   * Optional callback to access the ILabel interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ILabel>

  /**
   * Whether the associated form field is required or not
   * @defaultvalue false
   */
  required?: boolean

  /**
   * Renders the label as disabled.
   */
  disabled?: boolean

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Styles for the label.
   */
  styles?: IStyleFunctionOrObject<ILabelStyleProps, ILabelStyles>
}

/**
 * {@docCategory Label}
 */
export interface ILabelStyles {
  /**
   * Styles for the root element.
   */
  root: IStyle
}

/**
 * {@docCategory Label}
 */
export interface ILabelStyleProps {
  /**
   *
   */
  theme: ITheme
  className?: string
  disabled?: boolean
  required?: boolean
}
