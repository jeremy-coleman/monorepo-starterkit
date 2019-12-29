import { classNamesFunction, IStyle, IStyleFunctionOrObject, keyframes, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, hiddenContentStyle, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import { divProperties, getNativeProps, IRefObject } from "@uifabric/styleguide"
import * as React from "react"
import { DelayedRender } from "./DelayedRender"

/**
 * xSmall: 12px
 * small: 16px,
 * medium: 20px
 * large: 28px
 * }
 */
export enum SpinnerSize {
  xSmall = 0,
  small = 1,
  medium = 2,
  large = 3
}


export class SpinnerBase extends React.Component<ISpinnerProps, any> {
  public static defaultProps: ISpinnerProps = {
    size: SpinnerSize.medium,
    ariaLive: "polite",
    labelPosition: "bottom"
  }

  public render() {
    const { type, size, ariaLabel, ariaLive, styles, label, theme, className, labelPosition } = this.props
    const statusMessage = ariaLabel
    const nativeProps = getNativeProps(this.props, divProperties, ["size"])

    // SpinnerType is deprecated. If someone is still using this property, rather than putting the SpinnerType into the ISpinnerStyleProps,
    // we'll map SpinnerType to its equivalent SpinnerSize and pass that in. Once SpinnerType finally goes away we should delete this.
    let styleSize = size
    if (styleSize === undefined && type !== undefined) {
      styleSize = type === SpinnerType.large ? SpinnerSize.large : SpinnerSize.medium
    }

    const classNames = classNamesFunction<ISpinnerStyleProps, ISpinnerStyles>()(styles!, {
      theme: theme!,
      size: styleSize,
      className,
      labelPosition
    })

    return (
      <div {...nativeProps} className={classNames.root}>
        <div className={classNames.circle} />
        {label && <div className={classNames.label}>{label}</div>}
        {statusMessage && (
          <div role="status" aria-live={ariaLive}>
            <DelayedRender>
              <div className={classNames.screenReaderText}>{statusMessage}</div>
            </DelayedRender>
          </div>
        )}
      </div>
    )
  }
}

const GlobalClassNames = {
  root: "ms-Spinner",
  circle: "ms-Spinner-circle",
  label: "ms-Spinner-label"
}

const spinAnimation: string = keyframes({
  "0%": {
    transform: "rotate(0deg)"
  },
  "100%": {
    transform: "rotate(360deg)"
  }
})

export const getSpinnerStyles = (props: ISpinnerStyleProps): ISpinnerStyles => {
  const { theme, size, className, labelPosition } = props

  const { palette } = theme

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [
      classNames.root,
      {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      },
      labelPosition === "top" && {
        flexDirection: "column-reverse"
      },
      labelPosition === "right" && {
        flexDirection: "row"
      },
      labelPosition === "left" && {
        flexDirection: "row-reverse"
      },
      className
    ],
    circle: [
      classNames.circle,
      {
        boxSizing: "border-box",
        borderRadius: "50%",
        border: "1.5px solid " + palette.themeLight,
        borderTopColor: palette.themePrimary,
        animationName: spinAnimation,
        animationDuration: "1.3s",
        animationIterationCount: "infinite",
        animationTimingFunction: "cubic-bezier(.53,.21,.29,.67)",
        selectors: {
          [HighContrastSelector]: {
            borderTopColor: "Highlight"
          }
        }
      },
      size === SpinnerSize.xSmall && [
        "ms-Spinner--xSmall",
        {
          width: 12,
          height: 12
        }
      ],
      size === SpinnerSize.small && [
        "ms-Spinner--small",
        {
          width: 16,
          height: 16
        }
      ],
      size === SpinnerSize.medium && [
        "ms-Spinner--medium",
        {
          width: 20,
          height: 20
        }
      ],
      size === SpinnerSize.large && [
        "ms-Spinner--large",
        {
          width: 28,
          height: 28
        }
      ]
    ],
    label: [
      classNames.label,
      {
        color: palette.themePrimary,
        margin: "10px 0 0",
        textAlign: "center"
      },
      labelPosition === "top" && {
        margin: "0 0 10px"
      },
      labelPosition === "right" && {
        margin: "0 0 0 10px"
      },
      labelPosition === "left" && {
        margin: "0 10px 0 0"
      }
    ],
    screenReaderText: hiddenContentStyle
  }
}

export const Spinner: React.FunctionComponent<ISpinnerProps> = styled<ISpinnerProps, ISpinnerStyleProps, ISpinnerStyles>(
  SpinnerBase,
  getSpinnerStyles,
  undefined,
  { scope: "Spinner" }
)

/**
 * {@docCategory Spinner}
 */
export interface ISpinner {}

/**
 * Spinner component props.
 * {@docCategory Spinner}
 */
export interface ISpinnerProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Optional callback to access the ISpinner interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ISpinner>

  /**
   * Deprecated and will be removed at \>= 2.0.0. Use `SpinnerSize` instead.
   * @deprecated Use `SpinnerSize` instead.
   */
  type?: SpinnerType

  /**
   * The size of Spinner to render. \{ extraSmall, small, medium, large \}
   * @defaultvalue SpinnerType.medium
   */
  size?: SpinnerSize

  /**
   * The label to show next to the Spinner. Label updates will be announced to the screen readers.
   * Use ariaLive to control politeness level.
   */
  label?: string

  /**
   * Additional CSS class(es) to apply to the Spinner.
   */
  className?: string

  /**
   * Politeness setting for label update announcement.
   * @defaultvalue polite
   */
  ariaLive?: "assertive" | "polite" | "off"

  /**
   * Alternative status label for screen reader
   */
  ariaLabel?: string

  /**
   * Theme (provided through customization.)
   */
  theme?: ITheme

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ISpinnerStyleProps, ISpinnerStyles>

  /**
   * The position of the label in regards of the spinner animation.
   * @defaultvalue SpinnerLabelPosition.bottom
   */
  labelPosition?: SpinnerLabelPosition
}

/**
 * Possible locations of the label in regards to the spinner
 * @defaultvalue bottom
 * {@docCategory Spinner}
 */
export type SpinnerLabelPosition = "top" | "right" | "bottom" | "left"

/**
 * Deprecated at v2.0.0, use `SpinnerSize` instead.
 * @deprecated Use `SpinnerSize` instead.
 * {@docCategory Spinner}
 */
export enum SpinnerType {
  /**
   * Deprecated and will be removed at \>= 2.0.0. Use `SpinnerSize.medium` instead.
   * @deprecated Use `SpinnerSize.medium` instead.
   */
  normal = 0,

  /**
   * Deprecated and will be removed at \>= 2.0.0. Use `SpinnerSize.large` instead.
   * @deprecated Use `SpinnerSize.large` instead.
   */
  large = 1
}

/**
 * The props needed to construct styles. This represents the simplified set of immutable things which control the class names.
 * {@docCategory Spinner}
 */
export interface ISpinnerStyleProps {
  /** Theme provided by High-Order Component. */
  theme: ITheme

  /** Size of the spinner animation. */
  size?: SpinnerSize

  /** CSS class name for the component attached to the root stylable area. */
  className?: string

  /** Position of the label in regards to the spinner animation. */
  labelPosition?: SpinnerLabelPosition
}

/**
 * Represents the stylable areas of the control.
 * {@docCategory Spinner}
 */
export interface ISpinnerStyles {
  /** Styles for the root element. Refers to the wrapper containing both the circle and the label. */
  root?: IStyle

  /** Styles for the spinner circle animation. */
  circle?: IStyle

  /** Styles for the label accompanying the circle. */
  label?: IStyle

  /** Styles for the hidden helper element to aid with screen readers. */
  screenReaderText?: IStyle
}
