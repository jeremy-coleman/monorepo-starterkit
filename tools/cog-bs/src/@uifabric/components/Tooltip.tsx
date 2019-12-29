import { classNamesFunction, IProcessedStyleSet, IStyleFunctionOrObject, mergeStyleSets, styled } from "@uifabric/styleguide"
import { AnimationClassNames, ITheme } from "@uifabric/styleguide"
import { DirectionalHint, divProperties, getNativeProps, IRefObject, IRenderFunction } from "@uifabric/styleguide"
import * as React from "react"
import { Callout, ICalloutProps } from "./Callout"

export enum TooltipDelay {
  zero = 0,
  medium = 1,
  long = 2
}

export const getTooltipStyles = ({ className, delay, maxWidth, theme }) => {
  const { palette, fonts } = theme
  return mergeStyleSets({
    root: [
      "ms-Tooltip",
      theme.fonts.small,
      AnimationClassNames.fadeIn200,
      {
        background: palette.white,
        padding: "8px",
        animationDelay: "300ms",
        maxWidth: maxWidth
      },
      delay === TooltipDelay.zero && {
        animationDelay: "0s"
      },
      delay === TooltipDelay.long && {
        animationDelay: "500ms"
      },
      className
    ],
    content: [
      "ms-Tooltip-content",
      fonts.xSmall,
      {
        color: palette.neutralPrimary,
        wordWrap: "break-word",
        overflowWrap: "break-word",
        overflow: "hidden"
      }
    ],
    subText: [
      "ms-Tooltip-subtext",
      {
        // Using inherit here to avoid unintentional global overrides of the <p> tag.
        fontSize: "inherit",
        fontWeight: "inherit",
        color: "inherit",
        margin: 0
      }
    ]
  })
}

type ITooltipStyles = ReturnType<typeof getTooltipStyles>


export class TooltipBase extends React.Component<ITooltipProps, any> {
  // Specify default props values
  public static defaultProps: Partial<ITooltipProps> = {
    directionalHint: DirectionalHint.topCenter,
    delay: TooltipDelay.medium,
    maxWidth: "364px",
    calloutProps: {
      isBeakVisible: true,
      beakWidth: 16,
      gapSpace: 0,
      setInitialFocus: true,
      doNotLayer: false
    }
  }

  private _classNames: IProcessedStyleSet<ITooltipStyles>

  public render(): JSX.Element {
    const {
      className,
      calloutProps,
      delay,
      directionalHint,
      directionalHintForRTL,
      styles,
      id,
      maxWidth,
      onRenderContent = this._onRenderContent,
      targetElement,
      theme
    } = this.props

    this._classNames = classNamesFunction<ITooltipStyleProps, ITooltipStyles>()(styles!, {
      theme: theme!,
      className: className || (calloutProps && calloutProps.className),
      delay: delay!,
      maxWidth: maxWidth!
    })

    return (
      <Callout
        target={targetElement}
        directionalHint={directionalHint}
        directionalHintForRTL={directionalHintForRTL}
        {...calloutProps}
        {...getNativeProps(this.props, divProperties, ["id"])} // omitting ID due to it being used in the div below
        className={this._classNames.root}
      >
        <div
          className={this._classNames.content}
          id={id}
          role="tooltip"
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave}
        >
          {onRenderContent(this.props, this._onRenderContent)}
        </div>
      </Callout>
    )
  }

  private _onRenderContent = (props: ITooltipProps): JSX.Element => {
    return <p className={this._classNames.subText}>{props.content}</p>
  }
}

export const Tooltip: React.FunctionComponent<ITooltipProps> = styled<ITooltipProps, ITooltipStyleProps, ITooltipStyles>(
  TooltipBase,
  getTooltipStyles,
  undefined,
  {
    scope: "Tooltip"
  }
)

/**
 * {@docCategory Tooltip}
 */
export interface ITooltip {}

/**
 * Tooltip component props.
 * {@docCategory Tooltip}
 */
export interface ITooltipProps extends React.HTMLAttributes<HTMLDivElement | TooltipBase> {
  /**
   * Optional callback to access the ITooltip interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ITooltip>

  /**
   * Properties to pass through for Callout, reference detail properties in ICalloutProps
   * @defaultvalue isBeakVisible: true, beakWidth: 16, gapSpace: 0, setInitialFocus: true, doNotLayer: false
   */
  calloutProps?: ICalloutProps

  /**
   *  Content to be passed to the tooltip
   */
  content?: string | JSX.Element | JSX.Element[]

  /**
   *  Render function to populate content area
   */
  onRenderContent?: IRenderFunction<ITooltipProps>

  /**
   * Length of delay. Can be set to zero if you do not want a delay.
   * @defaultvalue medium
   */
  delay?: TooltipDelay

  /**
   * Max width of tooltip
   * @defaultvalue 364px
   */
  maxWidth?: string | null

  /**
   * Element to anchor the Tooltip to.
   */
  targetElement?: HTMLElement

  /**
   * Indicator of how the tooltip should be anchored to its targetElement.
   * @defaultvalue DirectionalHint.topCenter
   */
  directionalHint?: DirectionalHint

  /**
   * How the element should be positioned in RTL layouts.
   * If not specified, a mirror of `directionalHint` will be used instead
   */
  directionalHintForRTL?: DirectionalHint

  /**
   * Theme to apply to the component.
   */
  theme?: ITheme

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ITooltipStyleProps, ITooltipStyles>
}

/**
 * {@docCategory Tooltip}
 */
export interface ITooltipStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * Delay before tooltip appears.
   */
  delay?: TooltipDelay

  /**
   * Maximum width of tooltip.
   */
  maxWidth?: string
}
