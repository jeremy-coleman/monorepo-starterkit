import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, ITheme } from "@uifabric/styleguide"
import {
  assign,
  Async,
  DirectionalHint,
  divProperties,
  getId,
  getNativeProps,
  hasOverflow,
  IRefObject,
  portalContainsElement
} from "@uifabric/styleguide"
import * as React from "react"
import { ICalloutProps } from "./Callout"
import { ITooltipProps, Tooltip, TooltipDelay } from "./Tooltip"

const GlobalClassNames = {
  root: "ms-TooltipHost"
}

export const getTooltipHostStyles = (props: ITooltipHostStyleProps): ITooltipHostStyles => {
  const { className, theme } = props
  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [
      classNames.root,
      {
        display: "inline"
      },
      className
    ]
  }
}

export interface ITooltipHostState {
  isTooltipVisible: boolean
}


export class TooltipHostBase extends React.Component<ITooltipHostProps, ITooltipHostState> implements ITooltipHost {
  public static defaultProps = {
    delay: TooltipDelay.medium
  }

  private static _currentVisibleTooltip: ITooltipHost | undefined

  // The wrapping div that gets the hover events
  private _tooltipHost = React.createRef<HTMLDivElement>()
  private _classNames: { [key in keyof ITooltipHostStyles]: string }

  // The ID of the setTimeout that will eventually close the tooltip if the
  // the tooltip isn't hovered over.
  private _closingTimer = -1

  _async = new Async(this)
  // Constructor
  constructor(props: ITooltipHostProps) {
    super(props)

    this.state = {
      isTooltipVisible: false
    }
  }

  // Render
  public render(): JSX.Element {
    const {
      calloutProps,
      children,
      content,
      delay,
      directionalHint,
      directionalHintForRTL,
      hostClassName: className,
      id,
      setAriaDescribedBy = true,
      tooltipProps,
      styles,
      theme
    } = this.props

    this._classNames = classNamesFunction<ITooltipHostStyleProps, ITooltipHostStyles>()(styles!, {
      theme: theme!,
      className
    })

    const { isTooltipVisible } = this.state
    const tooltipId = id || getId("tooltip")
    const isContentPresent = !!(content || (tooltipProps && tooltipProps.onRenderContent && tooltipProps.onRenderContent()))
    const showTooltip = isTooltipVisible && isContentPresent
    const ariaDescribedBy = setAriaDescribedBy && isTooltipVisible && isContentPresent ? tooltipId : undefined

    return (
      <div
        className={this._classNames.root}
        ref={this._tooltipHost}
        {...{ onFocusCapture: this._onTooltipMouseEnter }}
        {...{ onBlurCapture: this._hideTooltip }}
        onMouseEnter={this._onTooltipMouseEnter}
        onMouseLeave={this._onTooltipMouseLeave}
        aria-describedby={ariaDescribedBy}
      >
        {children}
        {showTooltip && (
          <Tooltip
            id={tooltipId}
            delay={delay}
            content={content}
            targetElement={this._getTargetElement()}
            directionalHint={directionalHint}
            directionalHintForRTL={directionalHintForRTL}
            calloutProps={assign({}, calloutProps, {
              onMouseEnter: this._onTooltipMouseEnter,
              onMouseLeave: this._onTooltipMouseLeave
            })}
            onMouseEnter={this._onTooltipMouseEnter}
            onMouseLeave={this._onTooltipMouseLeave}
            {...getNativeProps(this.props, divProperties)}
            {...tooltipProps}
          />
        )}
      </div>
    )
  }

  public componentWillUnmount(): void {
    if (TooltipHostBase._currentVisibleTooltip && TooltipHostBase._currentVisibleTooltip === this) {
      TooltipHostBase._currentVisibleTooltip = undefined
    }
  }

  public show = (): void => {
    this._toggleTooltip(true)
  }

  public dismiss = (): void => {
    this._hideTooltip()
  }

  private _getTargetElement(): HTMLElement | undefined {
    if (!this._tooltipHost.current) {
      return undefined
    }

    const { overflowMode } = this.props

    // Select target element based on overflow mode. For parent mode, you want to position the tooltip relative
    // to the parent element, otherwise it might look off.
    if (overflowMode !== undefined) {
      switch (overflowMode) {
        case TooltipOverflowMode.Parent:
          return this._tooltipHost.current.parentElement!

        case TooltipOverflowMode.Self:
          return this._tooltipHost.current
      }
    }

    return this._tooltipHost.current
  }

  // Show Tooltip
  private _onTooltipMouseEnter = (ev: any): void => {
    const { overflowMode } = this.props

    if (TooltipHostBase._currentVisibleTooltip && TooltipHostBase._currentVisibleTooltip !== this) {
      TooltipHostBase._currentVisibleTooltip.dismiss()
    }
    TooltipHostBase._currentVisibleTooltip = this

    if (overflowMode !== undefined) {
      const overflowElement = this._getTargetElement()
      if (overflowElement && !hasOverflow(overflowElement)) {
        return
      }
    }

    if (ev.target && portalContainsElement(ev.target as HTMLElement, this._getTargetElement())) {
      // Do not show tooltip when target is inside a portal relative to TooltipHost.
      return
    }

    this._toggleTooltip(true)
    this._clearDismissTimer()
  }

  // Hide Tooltip
  private _onTooltipMouseLeave = (ev: any): void => {
    if (this.props.closeDelay) {
      this._clearDismissTimer()

      this._closingTimer = this._async.setTimeout(() => {
        this._toggleTooltip(false)
      }, this.props.closeDelay)
    } else {
      this._toggleTooltip(false)
    }
    if (TooltipHostBase._currentVisibleTooltip === this) {
      TooltipHostBase._currentVisibleTooltip = undefined
    }
  }

  private _clearDismissTimer = (): void => {
    this._async.clearTimeout(this._closingTimer)
  }

  // Hide Tooltip
  private _hideTooltip = (): void => {
    this._toggleTooltip(false)
  }

  private _toggleTooltip(isTooltipVisible: boolean): void {
    if (this.state.isTooltipVisible !== isTooltipVisible) {
      this.setState({ isTooltipVisible }, () => this.props.onTooltipToggle && this.props.onTooltipToggle(this.state.isTooltipVisible))
    }
  }
}

export const TooltipHost: React.FunctionComponent<ITooltipHostProps> = styled<
  ITooltipHostProps,
  ITooltipHostStyleProps,
  ITooltipHostStyles
>(TooltipHostBase, getTooltipHostStyles, undefined, {
  scope: "TooltipHost"
})

/**
 * {@docCategory Tooltip}
 */
export interface ITooltipHost {
  /**
   * Shows the tooltip.
   */
  show: () => void

  /**
   * Dismisses the tooltip.
   */
  dismiss: () => void
}

/**
 * {@docCategory Tooltip}
 */
export enum TooltipOverflowMode {
  /** Only show tooltip if parent DOM element is overflowing */
  Parent,

  /** Only show tooltip if tooltip host's content is overflowing */
  Self
}

/**
 * Tooltip component props.
 * {@docCategory Tooltip}
 */
export interface ITooltipHostProps extends React.HTMLAttributes<HTMLDivElement | TooltipHostBase> {
  /**
   * Optional callback to access the ITooltipHost interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ITooltipHost>

  /**
   * Additional properties to pass through for Callout, reference detail properties in ICalloutProps
   */
  calloutProps?: ICalloutProps

  /**
   * Optionally a number of milliseconds to delay closing the tooltip, so that
   * the user has time to hover over the tooltip and interact with it. Hovering
   * over the tooltip will count as hovering over the host, so that the tooltip
   * will stay open if the user is actively interacting with it.
   */
  closeDelay?: number

  /**
   *  Content to be passed to the tooltip
   */
  content?: string | JSX.Element | JSX.Element[]

  /**
   * Length of delay
   * @defaultvalue medium
   */
  delay?: TooltipDelay

  /**
   * Indicator of how the tooltip should be anchored to its targetElement.
   */
  directionalHint?: DirectionalHint

  /**
   * How the element should be positioned in RTL layouts.
   * If not specified, a mirror of `directionalHint` will be used instead
   */
  directionalHintForRTL?: DirectionalHint

  /**
   * Optional class name to apply to tooltip host.
   */
  hostClassName?: string

  /**
   * Only show if there is overflow. If set, the tooltip hosts observes  and only shows the tooltip if this element has overflow.
   * It also uses the parent as target element for the tooltip.
   */
  overflowMode?: TooltipOverflowMode

  /**
   * Whether or not to mark the container as described by the tooltip.
   * If not specified, the caller should mark as element as described by the tooltip id.
   */
  setAriaDescribedBy?: boolean

  /**
   * Additional properties to pass through for Tooltip, reference detail properties in ITooltipProps
   */
  tooltipProps?: ITooltipProps

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ITooltipHostStyleProps, ITooltipHostStyles>

  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme

  /**
   * Notifies when tooltip becomes visible or hidden, whatever the trigger was.
   */
  onTooltipToggle?(isTooltipVisible: boolean): void
}

/**
 * {@docCategory Tooltip}
 */
export interface ITooltipHostStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept optional classNames for the host wrapper
   */
  className?: string
}

/**
 * {@docCategory Tooltip}
 */
export interface ITooltipHostStyles {
  /**
   * Style for the host wrapper element.
   */
  root: IStyle
}
