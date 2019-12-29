import { classNamesFunction, getDocument, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, ITheme } from "@uifabric/styleguide"
import { Async, divProperties, EventGroup, getId, getNativeProps, IRefObject, KeyCodes } from "@uifabric/styleguide"
import * as React from "react"
import { ExpandingCard, ExpandingCardMode, IExpandingCardProps } from "./ExpandingCard"
import { IPlainCardProps, PlainCard } from "./PlainCard"

/**
 * {@docCategory HoverCard}
 */
export enum HoverCardType {
  /**
   * Plain card consisting of one part responsive to the size of content.
   */
  plain = "PlainCard",

  /**
   * File card consisting of two parts: compact and expanded. Has some default sizes if not specified.
   */
  expanding = "ExpandingCard"
}


export interface IHoverCardState {
  isHoverCardVisible?: boolean
  mode?: ExpandingCardMode
  openMode?: OpenCardMode
}

export class HoverCardBase extends React.Component<IHoverCardProps, IHoverCardState> implements IHoverCard {
  public static defaultProps = {
    cardOpenDelay: 500,
    cardDismissDelay: 100,
    expandedCardOpenDelay: 1500,
    instantOpenOnClick: false,
    setInitialFocus: false,
    openHotKey: KeyCodes.c as KeyCodes,
    type: HoverCardType.expanding
  }

  // The wrapping div that gets the hover events
  private _hoverCard = React.createRef<HTMLDivElement>()
  private _dismissTimerId: number
  private _openTimerId: number
  private _currentMouseTarget: EventTarget | null

  private _nativeDismissEvent: (ev?: any) => void
  private _childDismissEvent: (ev?: any) => void

  private _classNames: { [key in keyof IHoverCardStyles]: string }
  _events: any
  _async: Async

  // Constructor
  constructor(props: IHoverCardProps) {
    super(props)

    this._nativeDismissEvent = this._cardDismiss.bind(this, true)
    this._childDismissEvent = this._cardDismiss.bind(this, false)
    this._async = new Async(this)
    this._events = new EventGroup(this)

    this.state = {
      isHoverCardVisible: false,
      mode: ExpandingCardMode.compact,
      openMode: OpenCardMode.hover
    }
  }

  public componentDidMount(): void {
    this._setEventListeners()
  }

  public componentDidUpdate(prevProps: IHoverCardProps, prevState: IHoverCardState) {
    if (prevProps.target !== this.props.target) {
      this._events.off()
      this._setEventListeners()
    }

    if (prevState.isHoverCardVisible !== this.state.isHoverCardVisible) {
      if (this.state.isHoverCardVisible) {
        this._async.setTimeout(() => {
          this.setState(
            {
              mode: ExpandingCardMode.expanded
            },
            () => {
              this.props.onCardExpand && this.props.onCardExpand()
            }
          )
        }, this.props.expandedCardOpenDelay!)
        this.props.onCardVisible && this.props.onCardVisible()
      } else {
        this.setState({
          mode: ExpandingCardMode.compact
        })
        this.props.onCardHide && this.props.onCardHide()
      }
    }
  }

  public dismiss = (withTimeOut?: boolean): void => {
    this._async.clearTimeout(this._openTimerId)
    this._async.clearTimeout(this._dismissTimerId)
    if (!withTimeOut) {
      this._setDismissedState()
    } else {
      this._dismissTimerId = this._async.setTimeout(() => {
        this._setDismissedState()
      }, this.props.cardDismissDelay!)
    }
  }

  // Render
  public render(): JSX.Element {
    const {
      expandingCardProps,
      children,
      id,
      setAriaDescribedBy = true,
      styles: customStyles,
      theme,
      className,
      type,
      plainCardProps,
      trapFocus,
      setInitialFocus
    } = this.props
    const { isHoverCardVisible, mode, openMode } = this.state
    const hoverCardId = id || getId("hoverCard")

    this._classNames = classNamesFunction<IHoverCardStyleProps, IHoverCardStyles>()(customStyles, {
      theme: theme!,
      className
    })

    // Common props for both card types.
    const commonCardProps = {
      ...getNativeProps(this.props, divProperties),
      id: hoverCardId,
      trapFocus: !!trapFocus,
      firstFocus: setInitialFocus || openMode === OpenCardMode.hotKey,
      targetElement: this._getTargetElement(),
      onEnter: this._cardOpen,
      onLeave: this._childDismissEvent
    }

    const finalExpandedCardProps: IExpandingCardProps = { ...expandingCardProps, ...commonCardProps, mode }
    const finalPlainCardProps: IPlainCardProps = { ...plainCardProps, ...commonCardProps }

    return (
      <div
        className={this._classNames.host}
        ref={this._hoverCard}
        aria-describedby={setAriaDescribedBy && isHoverCardVisible ? hoverCardId : undefined}
        data-is-focusable={!Boolean(this.props.target)}
      >
        {children}
        {isHoverCardVisible &&
          (type === HoverCardType.expanding ? <ExpandingCard {...finalExpandedCardProps} /> : <PlainCard {...finalPlainCardProps} />)}
      </div>
    )
  }

  private _getTargetElement(): HTMLElement | undefined {
    const { target } = this.props

    switch (typeof target) {
      case "string":
        return getDocument()!.querySelector(target as string) as HTMLElement

      case "object":
        return target as HTMLElement

      default:
        return this._hoverCard.current || undefined
    }
  }

  private _shouldBlockHoverCard(): boolean {
    //@ts-ignore
    return !!(this.props.shouldBlockHoverCard && this.props.shouldBlockHoverCard())
  }

  // Show HoverCard
  private _cardOpen = (ev: MouseEvent): void => {
    if (this._shouldBlockHoverCard() || (ev.type === "keydown" && !(ev.which === this.props.openHotKey))) {
      return
    }
    this._async.clearTimeout(this._dismissTimerId)
    if (ev.type === "mouseenter") {
      this._currentMouseTarget = ev.currentTarget
    }

    this._executeCardOpen(ev)
  }

  private _executeCardOpen = (ev: MouseEvent): void => {
    this._async.clearTimeout(this._openTimerId)
    this._openTimerId = this._async.setTimeout(() => {
      this.setState((prevState: IHoverCardState) => {
        if (!prevState.isHoverCardVisible) {
          return {
            isHoverCardVisible: true,
            mode: ExpandingCardMode.compact,
            openMode: ev.type === "keydown" ? OpenCardMode.hotKey : OpenCardMode.hover
          }
        }

        return prevState
      })
    }, this.props.cardOpenDelay!)
  }

  /**
   * Hide HoverCard
   * How we dismiss the card depends on where the callback is coming from.
   * This is provided by the `isNativeEvent` argument.
   *  true: Event is coming from event listeners set up in componentDidMount.
   *  false: Event is coming from the `onLeave` prop from the HoverCard component.
   */
  private _cardDismiss = (isNativeEvent: boolean, ev: MouseEvent | React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    if (isNativeEvent) {
      // We expect these to be MouseEvents, If not, return.
      if (!(ev instanceof MouseEvent)) {
        return
      }

      if (ev.type === "keydown" && ev.which !== KeyCodes.escape) {
        return
      }

      // Dismiss if not sticky and currentTarget is the same element that mouse last entered
      if (!this.props.sticky && (this._currentMouseTarget === ev.currentTarget || ev.which === KeyCodes.escape)) {
        this.dismiss(true)
      }
    } else {
      // If this is a mouseleave event and the component is sticky, do not dismiss.
      if (this.props.sticky && !(ev instanceof MouseEvent) && ev.nativeEvent instanceof MouseEvent && ev.type === "mouseleave") {
        return
      }

      this.dismiss(true)
    }
  }

  private _setDismissedState = () => {
    this.setState({
      isHoverCardVisible: false,
      mode: ExpandingCardMode.compact,
      openMode: OpenCardMode.hover
    })
  }

  private _instantOpenAsExpanded = (ev: React.MouseEvent<HTMLDivElement>): void => {
    this._async.clearTimeout(this._dismissTimerId)

    this.setState((prevState: IHoverCardState) => {
      if (!prevState.isHoverCardVisible) {
        return {
          isHoverCardVisible: true,
          mode: ExpandingCardMode.expanded
        }
      }

      return prevState
    })
  }

  private _setEventListeners = (): void => {
    const { trapFocus, instantOpenOnClick } = this.props
    const target = this._getTargetElement()
    const nativeEventDismiss = this._nativeDismissEvent

    this._events.on(target, "mouseenter", this._cardOpen)
    this._events.on(target, "mouseleave", nativeEventDismiss)
    if (trapFocus) {
      this._events.on(target, "keydown", this._cardOpen)
    } else {
      this._events.on(target, "focus", this._cardOpen)
      this._events.on(target, "blur", nativeEventDismiss)
    }
    if (instantOpenOnClick) {
      this._events.on(target, "click", this._instantOpenAsExpanded)
    } else {
      this._events.on(target, "mousedown", nativeEventDismiss)
      this._events.on(target, "keydown", nativeEventDismiss)
    }
  }
}

const GlobalClassNames = {
  host: "ms-HoverCard-host"
}

export function getHoverCardStyles(props: IHoverCardStyleProps): IHoverCardStyles {
  const { className, theme } = props

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    host: [classNames.host, className]
  }
}

export const HoverCard: React.FunctionComponent<IHoverCardProps> = styled<IHoverCardProps, IHoverCardStyleProps, IHoverCardStyles>(
  HoverCardBase,
  getHoverCardStyles,
  undefined,
  {
    scope: "HoverCard"
  }
)

/**
 * {@docCategory HoverCard}
 */
export interface IHoverCard {
  /**
   * Public `dismiss` method to be used through `componentRef` of the HoverCard.
   * Boolean argument controls if the dismiss happens with a timeout delay.
   */
  dismiss: (withTimeOut?: boolean) => void
}

/**
 * HoverCard component props.
 * {@docCategory HoverCard}
 */
export interface IHoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional callback to access the IHoverCardHost interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IHoverCard>

  /**
   * Additional CSS class(es) to apply to the HoverCard root element.
   */
  className?: string

  /**
   * Length of card dismiss delay. A min number is necessary for pointer to hop between target and card
   * @defaultvalue 100
   */
  cardDismissDelay?: number

  /**
   * Length of compact card delay
   * @defaultvalue 500
   */
  cardOpenDelay?: number

  /**
   * Time in ms when expanded card should open after compact card
   * @defaultvalue 1500
   */
  expandedCardOpenDelay?: number

  /**
   * Additional ExpandingCard props to pass through HoverCard like renderers, target. gapSpace etc.
   * Used along with 'type' prop set to HoverCardType.expanding.
   * Reference detail properties in ICardProps and IExpandingCardProps.
   */
  expandingCardProps?: IExpandingCardProps

  /**
   * Enables instant open of the full card upon click
   * @defaultvalue false
   */
  instantOpenOnClick?: boolean

  /**
   * Callback when card becomes visible
   */
  onCardVisible?: () => void

  /**
   * Callback when card hides
   */
  onCardHide?: () => void

  /**
   * HotKey used for opening the HoverCard when tabbed to target.
   * @defaultvalue 'KeyCodes.c'
   */
  openHotKey?: KeyCodes

  /**
   * Additional PlainCard props to pass through HoverCard like renderers, target, gapSpace etc.
   * Used along with 'type' prop set to HoverCardType.plain.
   * See for more details ICardProps and IPlainCardProps interfaces.
   */
  plainCardProps?: IPlainCardProps

  /**
   * Whether or not to mark the container as described by the hover card.
   * If not specified, the caller should mark as element as described by the hover card id.
   */
  setAriaDescribedBy?: boolean

  /**
   * Callback when visible card is expanded.
   */
  onCardExpand?: () => void

  /**
   * Set to true to set focus on the first focusable element in the card. Works in pair with the 'trapFocus' prop.
   * @defaultvalue false
   */
  setInitialFocus?: boolean

  /**
   * Should block hover card or not
   */
  shouldBlockHoverCard?: () => void

  /**
   * If true disables Card dismiss upon mouse leave, so that card sticks around.
   * @defaultvalue false
   */
  sticky?: boolean

  /**
   * Custom styles for this component
   */
  styles?: IStyleFunctionOrObject<IHoverCardStyleProps, IHoverCardStyles>

  /**
   * Optional target element to tag hover card on.
   * If not provided and using HoverCard as a wrapper, don't set 'data-is-focusable=true' attribute to the root of the wrapped child.
   * When no target given, HoverCard will use it's root as a target and become the focusable element with a focus listener attached to it.
   */
  target?: HTMLElement | string

  /**
   * Theme provided by higher order component.
   */
  theme?: ITheme

  /**
   * Set to true if you want to render the content of the HoverCard in a FocusTrapZone for accessibility reasons.
   * Optionally 'setInitialFocus' prop can be set to true to move focus inside the FocusTrapZone.
   */
  trapFocus?: boolean

  /**
   * Type of the hover card to render.
   * @defaultvalue HoverCardType.expanding
   */
  type?: HoverCardType
}

/**
 * {@docCategory HoverCard}
 */
export enum OpenCardMode {
  /**
   * Open card by hover
   */
  hover = 0,

  /**
   * Open card by hot key
   */
  hotKey = 1
}

/**
 * {@docCategory HoverCard}
 */
export interface IHoverCardStyleProps {
  /**
   * Theme provided by High-Order Component.
   */
  theme: ITheme

  /**
   * Optional className(s) for the host div of HoverCard.
   */
  className?: string
}

/**
 * {@docCategory HoverCard}
 */
export interface IHoverCardStyles {
  /**
   * Style for the host element in the default enabled, non-toggled state.
   */
  host?: IStyle
}
