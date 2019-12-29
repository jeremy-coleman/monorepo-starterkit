import { classNamesFunction, getRTL, IRawStyle, IStyle, IStyleFunctionOrObject, keyframes, styled } from "@uifabric/styleguide"
import { FontSizes, FontWeights, getGlobalClassNames, HighContrastSelector, ITheme, noWrap } from "@uifabric/styleguide"
import { IRenderFunction } from "@uifabric/styleguide"
import * as React from "react"


// if the percentComplete is near 0, don't animate it.
// This prevents animations on reset to 0 scenarios
const ZERO_THRESHOLD = 0.01

/**
 * ProgressIndicator with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Styling)
 */
export class ProgressIndicatorBase extends React.Component<IProgressIndicatorProps, {}> {
  public static defaultProps = {
    label: "",
    description: "",
    width: 180
  }

  public render() {
    const {
      barHeight,
      className,
      label = this.props.title, // Fall back to deprecated value.
      description,
      styles,
      theme,
      progressHidden,
      onRenderProgress = this._onRenderProgress
    } = this.props

    const percentComplete =
      typeof this.props.percentComplete === "number" ? Math.min(100, Math.max(0, this.props.percentComplete * 100)) : undefined

    const classNames = classNamesFunction<IProgressIndicatorStyleProps, IProgressIndicatorStyles>()(styles, {
      theme: theme!,
      className,
      barHeight,
      indeterminate: percentComplete === undefined ? true : false
    })

    return (
      <div className={classNames.root}>
        {label ? <div className={classNames.itemName}>{label}</div> : null}
        {!progressHidden
          ? onRenderProgress(
              {
                ...(this.props as IProgressIndicatorProps),
                percentComplete: percentComplete
              },
              this._onRenderProgress
            )
          : null}
        {description ? <div className={classNames.itemDescription}>{description}</div> : null}
      </div>
    )
  }

  private _onRenderProgress = (props: IProgressIndicatorProps): JSX.Element => {
    const { ariaValueText, barHeight, className, styles, theme } = this.props

    const percentComplete =
      typeof this.props.percentComplete === "number" ? Math.min(100, Math.max(0, this.props.percentComplete * 100)) : undefined

    const classNames = classNamesFunction<IProgressIndicatorStyleProps, IProgressIndicatorStyles>()(styles, {
      theme: theme!,
      className,
      barHeight,
      indeterminate: percentComplete === undefined ? true : false
    })

    const progressBarStyles = {
      width: percentComplete !== undefined ? percentComplete + "%" : undefined,
      transition: percentComplete !== undefined && percentComplete < ZERO_THRESHOLD ? "none" : undefined
    }

    const ariaValueMin = percentComplete !== undefined ? 0 : undefined
    const ariaValueMax = percentComplete !== undefined ? 100 : undefined
    const ariaValueNow = percentComplete !== undefined ? Math.floor(percentComplete!) : undefined

    return (
      <div className={classNames.itemProgress}>
        <div className={classNames.progressTrack} />
        <div
          className={classNames.progressBar}
          style={progressBarStyles}
          role="progressbar"
          aria-valuemin={ariaValueMin}
          aria-valuemax={ariaValueMax}
          aria-valuenow={ariaValueNow}
          aria-valuetext={ariaValueText}
        />
      </div>
    )
  }
}

const GlobalClassNames = {
  root: "ms-ProgressIndicator",
  itemName: "ms-ProgressIndicator-itemName",
  itemDescription: "ms-ProgressIndicator-itemDescription",
  itemProgress: "ms-ProgressIndicator-itemProgress",
  progressTrack: "ms-ProgressIndicator-progressTrack",
  progressBar: "ms-ProgressIndicator-progressBar"
}

const IndeterminateProgress = keyframes({
  "0%": {
    left: "-30%"
  },
  "100%": {
    left: "100%"
  }
})
const IndeterminateProgressRTL = keyframes({
  "100%": {
    right: "-30%"
  },
  "0%": {
    right: "100%"
  }
})

export const getProgressIndicatorStyles = (props: IProgressIndicatorStyleProps): IProgressIndicatorStyles => {
  const isRTL = getRTL()
  const { className, indeterminate, theme, barHeight = 2 } = props

  const { palette, semanticColors } = theme
  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  const marginBetweenText = 8
  const textHeight = 18
  const progressTrackColor = palette.neutralLight

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      {
        fontWeight: FontWeights.regular
      },
      className
    ],

    itemName: [
      classNames.itemName,
      noWrap,
      {
        color: semanticColors.bodyText,
        fontSize: FontSizes.small,
        paddingTop: marginBetweenText / 2,
        lineHeight: textHeight + 2
      }
    ],

    itemDescription: [
      classNames.itemDescription,
      {
        color: semanticColors.bodySubtext,
        fontSize: FontSizes.mini,
        lineHeight: textHeight
      }
    ],

    itemProgress: [
      classNames.itemProgress,
      {
        position: "relative",
        overflow: "hidden",
        height: barHeight,
        padding: `${marginBetweenText}px 0`
      }
    ],

    progressTrack: [
      classNames.progressTrack,
      {
        position: "absolute",
        width: "100%",
        height: barHeight,
        backgroundColor: progressTrackColor,

        selectors: {
          [HighContrastSelector]: {
            borderBottom: "1px solid WindowText"
          }
        }
      }
    ],

    progressBar: [
      {
        backgroundColor: palette.themePrimary,
        height: barHeight,
        position: "absolute",
        transition: "width .3s ease",
        width: 0,

        selectors: {
          [HighContrastSelector]: {
            backgroundColor: "WindowText"
          }
        }
      },

      indeterminate
        ? ({
            position: "absolute",
            minWidth: "33%",
            background: `linear-gradient(to right, ${progressTrackColor} 0%, ${palette.themePrimary} 50%, ${progressTrackColor} 100%)`,
            animation: `${isRTL ? IndeterminateProgressRTL : IndeterminateProgress} 3s infinite`
          } as IRawStyle)
        : ({
            transition: "width .15s linear"
          } as IRawStyle),
      classNames.progressBar
    ]
  }
}

/**
 * ProgressIndicator description
 */
export const ProgressIndicator: React.FunctionComponent<IProgressIndicatorProps> = styled<
  IProgressIndicatorProps,
  IProgressIndicatorStyleProps,
  IProgressIndicatorStyles
>(ProgressIndicatorBase, getProgressIndicatorStyles, undefined, { scope: "ProgressIndicator" })

/**
 * {@docCategory ProgressIndicator}
 */
export interface IProgressIndicatorProps extends React.ClassAttributes<ProgressIndicatorBase> {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IProgressIndicatorStyleProps, IProgressIndicatorStyles>

  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme

  /**
   * Additional css class to apply to the ProgressIndicator
   * @defaultvalue undefined
   */
  className?: string

  /**
   * Label to display above the control. May be a string or React virtual elements.
   */
  label?: React.ReactNode

  /**
   * Text describing or supplementing the operation. May be a string or React virtual elements.
   */
  description?: React.ReactNode

  /**
   * Percentage of the operation's completeness, numerically between 0 and 1. If this is not set,
   * the indeterminate progress animation will be shown instead.
   */
  percentComplete?: number

  /**
   * Whether or not to hide the progress state.
   */
  progressHidden?: boolean

  /**
   * A render override for the progress track.
   */
  onRenderProgress?: IRenderFunction<IProgressIndicatorProps>

  /**
   * Text alternative of the progress status, used by screen readers for reading the value of the progress.
   */
  ariaValueText?: string

  /**
   * Deprecated at v0.43.0, to be removed at \>= v0.53.0. Use `label` instead.
   * @deprecated Use `label` instead.
   */
  title?: string

  /**
   * Height of the ProgressIndicator
   * @defaultvalue 2
   */
  barHeight?: number
}

/**
 * {@docCategory ProgressIndicator}
 */
export interface IProgressIndicatorStyleProps {
  /**
   * Theme provided by High-Order Component.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string
  indeterminate?: boolean
  barHeight?: number
}

/**
 * {@docCategory ProgressIndicator}
 */
export interface IProgressIndicatorStyles {
  /**
   * Style for the root element.
   */
  root: IStyle
  itemName: IStyle
  itemDescription: IStyle
  itemProgress: IStyle
  progressTrack: IStyle
  progressBar: IStyle
}
