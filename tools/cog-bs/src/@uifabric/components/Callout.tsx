import {
  classNamesFunction,
  css,
  IRawStyle,
  IStyle,
  IStyleFunctionOrObject,
  getDocument,
  styled,
  getWindow
} from "@uifabric/styleguide"
import { AnimationClassNames, focusClear, getGlobalClassNames, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import {
  assign,
  Async,
  DirectionalHint,
  divProperties,
  elementContains,
  focusFirstChild,
  getMaxHeight,
  getNativeProps,
  ICalloutPositionedInfo,
  IPoint,
  IPosition,
  IPositionProps,
  IRectangle,
  on,
  positionCallout,
  RectangleEdge,
  shallowCompare
} from "@uifabric/styleguide"
import * as React from "react"
import { FocusTrapZone, IFocusTrapZoneProps } from "./FocusTrapZone"
import { ILayerProps, Layer } from "./Layer"
import { Popup } from "./Popup"

export class Callout extends React.Component<ICalloutProps, ICalloutState> {
  public render(): JSX.Element {
    const { layerProps, ...rest } = this.props
    const content = <CalloutContent {...rest} />
    return this.props.doNotLayer ? content : <Layer {...layerProps}>{content}</Layer>
  }
}


export type Target = Element | string | MouseEvent | IPoint | null


export interface ICalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The target that the Callout should try to position itself based on.
   * It can be either an Element a querySelector string of a valid Element
   * or a MouseEvent. If MouseEvent is given then the origin point of the event will be used.
   */
  target?: Target

  /**
   * How the element should be positioned
   * @defaultvalue DirectionalHint.BottomAutoEdge
   */
  directionalHint?: DirectionalHint

  /**
   * How the element should be positioned in RTL layouts.
   * If not specified, a mirror of `directionalHint` will be used instead
   */
  directionalHintForRTL?: DirectionalHint

  /**
   * The gap between the Callout and the target
   * @defaultvalue 0
   */
  gapSpace?: number

  /**
   * The width of the beak.
   * @defaultvalue 16
   */
  beakWidth?: number

  /**
   * Custom width for callout including borders. If value is 0, no width is applied.
   * @defaultvalue 0
   */
  calloutWidth?: number

  /**
   * Custom width for callout including borders. If value is 0, no width is applied.
   * @defaultvalue 0
   */
  calloutMaxWidth?: number

  /**
   * The background color of the Callout in hex format ie. #ffffff.
   * @defaultvalue $ms-color-white
   */
  backgroundColor?: string

  /**
   * The bounding rectangle for which  the contextual menu can appear in.
   */
  bounds?: IRectangle

  /**
   * The minimum distance the callout will be away from the edge of the screen.
   *  @defaultvalue 8
   */
  minPagePadding?: number

  /**
   * If true then the beak is visible. If false it will not be shown.
   * @defaultvalue true
   */
  isBeakVisible?: boolean

  /**
   * If true then the callout will not dismiss on scroll
   * @defaultvalue false
   */
  preventDismissOnScroll?: boolean

  /**
   * If true then the callout will not dismiss on resize
   * @defaultvalue false
   */
  preventDismissOnResize?: boolean

  /**
   * If true then the callout will not dismiss when it loses focus
   * @defaultvalue false
   */
  preventDismissOnLostFocus?: boolean

  /**
   * If true the position returned will have the menu element cover the target.
   * If false then it will position next to the target;
   * @defaultvalue false
   */
  coverTarget?: boolean

  /**
   * If true the positioning logic will prefer to flip edges rather than to nudge the rectangle to fit within bounds,
   * thus making sure the element aligns perfectly with target's alignment edge
   */
  alignTargetEdge?: boolean

  /**
   * Aria role assigned to the callout (Eg. dialog, alertdialog).
   */
  role?: string

  /**
   * Accessible label text for callout.
   */
  ariaLabel?: string

  /**
   *  Defines the element id referencing the element containing label text for callout.
   */
  ariaLabelledBy?: string

  /**
   * Defines the element id referencing the element containing the description for the callout.
   */
  ariaDescribedBy?: string

  /**
   * CSS class to apply to the callout.
   * @defaultvalue null
   */
  className?: string

  /**
   * CSS style to apply to the callout.
   */
  style?: React.CSSProperties

  /**
   * Optional callback when the layer content has mounted.
   */
  onLayerMounted?: () => void

  /**
   * Optional props to pass to the Layer component hosting the panel.
   */
  layerProps?: ILayerProps

  /**
   * Optional callback that is called once the callout has been correctly positioned.
   * @param positions - Gives the user information about how the callout is positioned such as the
   * final edge of the target that it positioned against, the beak position, and the beaks relationship to the
   * edges of the callout.
   */
  onPositioned?: (positions?: ICalloutPositionedInfo) => void

  /**
   * Callback when the Callout tries to close.
   */
  onDismiss?: (ev?: any) => void

  /**
   * If true do not render on a new layer. If false render on a new layer.
   */
  doNotLayer?: boolean

  /**
   * If true the position will not change sides in an attempt to fit the callout within bounds.
   * It will still attempt to align it to whatever bounds are given.
   * @defaultvalue false
   */
  directionalHintFixed?: boolean

  /**
   * Specify the final height of the content.
   * To be used when expanding the content dynamically so that callout can adjust its position.
   */
  finalHeight?: number

  /**
   * Manually set OverflowYHidden style prop to true on calloutMain element
   * A variety of callout load animations will need this to hide the scollbar that can appear
   */
  hideOverflow?: boolean

  /**
   * If true then the callout will attempt to focus the first focusable element that it contains.
   * If it doesn't find an element, no focus will be set and the method will return false.
   * This means that it's the contents responsibility to either set focus or have
   * focusable items.
   * @returns True if focus was set, false if it was not.
   */
  setInitialFocus?: boolean

  /**
   * Set max height of callout
   * When not set the callout will expand with contents up to the bottom of the screen
   */
  calloutMaxHeight?: number

  /**
   * Callback when the Callout body is scrolled.
   */
  onScroll?: () => void

  /**
   * Optional theme for component
   */
  theme?: ITheme

  /**
   * Optional styles for the component.
   */
  styles?: IStyleFunctionOrObject<ICalloutContentStyleProps, ICalloutContentStyles>

  /**
   * If specified, renders the Callout in a hidden state.
   * Use this flag, rather than rendering a callout conditionally based on visibility,
   * to improve rendering performance when it becomes visible.
   * Note: When callout is hidden its content will not be rendered. It will only render
   * once the callout is visible.
   */
  hidden?: boolean
}

/**
 * {@docCategory Callout}
 */
export interface ICalloutContentStyleProps {
  /**
   * Theme to apply to the calloutContent.
   */
  theme: ITheme

  /**
   * Width for callout including borders.
   */
  calloutWidth?: number

  /**
   * CSS class to apply to the callout.
   */
  className?: string

  /**
   * Callout positioning data
   */
  positions?: ICalloutPositionedInfo

  /**
   * Whether or not to clip content of the callout,
   * if it overflows vertically.
   */
  overflowYHidden?: boolean

  /**
   * Background color for the beak and callout.
   */
  backgroundColor?: string

  /**
   * Width of Callout beak
   */
  beakWidth?: number

  /**
   * Max width for callout including borders.
   */
  calloutMaxWidth?: number
}

/**
 * {@docCategory Callout}
 */
export interface ICalloutContentStyles {
  /**
   * Style for wrapper of Callout component.
   */
  container: IStyle

  /**
   * Style for callout container root element.
   */
  root: IStyle

  /**
   * Style for callout beak.
   */
  beak: IStyle

  /**
   * Style for callout beak curtain.
   */
  beakCurtain: IStyle

  /**
   * Style for content component of the callout.
   */
  calloutMain: IStyle
}

const ANIMATIONS: { [key: number]: string | undefined } = {
  [RectangleEdge.top]: AnimationClassNames.slideUpIn10,
  [RectangleEdge.bottom]: AnimationClassNames.slideDownIn10,
  [RectangleEdge.left]: AnimationClassNames.slideLeftIn10,
  [RectangleEdge.right]: AnimationClassNames.slideRightIn10
}

const BEAK_ORIGIN_POSITION = { top: 0, left: 0 }
// Microsoft Edge will overwrite inline styles if there is an animation pertaining to that style.
// To help ensure that edge will respect the offscreen style opacity
// filter needs to be added as an additional way to set opacity.
const OFF_SCREEN_STYLE = { opacity: 0, filter: "opacity(0)" }

export interface ICalloutState {
  positions?: ICalloutPositionedInfo
  slideDirectionalClassName?: string
  calloutElementRect?: ClientRect
  heightOffset?: number
}

export class CalloutContentBase extends React.Component<ICalloutProps, ICalloutState> {
  public static defaultProps = {
    preventDismissOnLostFocus: false,
    preventDismissOnScroll: false,
    preventDismissOnResize: false,
    isBeakVisible: true,
    beakWidth: 16,
    gapSpace: 0,
    minPagePadding: 8,
    directionalHint: DirectionalHint.bottomAutoEdge
  }

  private _classNames: { [key in keyof ICalloutContentStyles]: string }
  private _didSetInitialFocus: boolean
  private _hostElement = React.createRef<HTMLDivElement>()
  private _calloutElement = React.createRef<HTMLDivElement>()
  private _targetWindow: Window
  private _bounds: IRectangle | undefined
  private _positionAttempts: number
  private _target: Element | MouseEvent | IPoint | null
  private _setHeightOffsetTimer: number
  private _hasListeners = false
  private _maxHeight: number | undefined
  private _blockResetHeight: boolean

  private _async: Async
  private _disposables: (() => void)[] = []

  constructor(props: ICalloutProps) {
    super(props)

    this._async = new Async(this)
    this._didSetInitialFocus = false
    this.state = {
      positions: undefined,
      slideDirectionalClassName: undefined,
      // @TODO it looks like this is not even being used anymore.
      calloutElementRect: undefined,
      heightOffset: 0
    }
    this._positionAttempts = 0
  }

  public componentDidUpdate() {
    if (!this.props.hidden) {
      this._setInitialFocus()
      if (!this._hasListeners) {
        this._addListeners()
      }
      this._updateAsyncPosition()
    } else {
      if (this._hasListeners) {
        this._removeListeners()
      }
    }
  }

  public shouldComponentUpdate(newProps: ICalloutProps, newState: ICalloutState): boolean {
    if (this.props.hidden && newProps.hidden) {
      // Do not update when hidden.
      return false
    }

    return !shallowCompare(this.props, newProps) || !shallowCompare(this.state, newState)
  }

  public UNSAFE_componentWillMount() {
    this._setTargetWindowAndElement(this._getTarget())
  }

  public componentWillUnmount() {
    this._async.dispose()
    this._disposables.forEach((dispose: () => void) => dispose())
  }

  public UNSAFE_componentWillUpdate(newProps: ICalloutProps): void {
    // If the target element changed, find the new one. If we are tracking target with class name, always find element because we
    // do not know if fabric has rendered a new element and disposed the old element.
    const newTarget = this._getTarget(newProps)
    const oldTarget = this._getTarget()
    if ((newTarget !== oldTarget || typeof newTarget === "string" || newTarget instanceof String) && !this._blockResetHeight) {
      this._maxHeight = undefined
      this._setTargetWindowAndElement(newTarget!)
    }
    if (newProps.gapSpace !== this.props.gapSpace || this.props.beakWidth !== newProps.beakWidth) {
      this._maxHeight = undefined
    }

    if (newProps.finalHeight !== this.props.finalHeight) {
      this._setHeightOffsetEveryFrame()
    }

    // Ensure positioning is recalculated when we are about to show a persisted menu.
    if (!newProps.hidden && newProps.hidden !== this.props.hidden) {
      this._maxHeight = undefined
      // Target might have been updated while hidden.
      this._setTargetWindowAndElement(newTarget)
      this.setState({
        positions: undefined
      })
      this._didSetInitialFocus = false
      this._bounds = undefined
    }

    this._blockResetHeight = false
  }

  public componentDidMount(): void {
    if (!this.props.hidden) {
      this._onComponentDidMount()
    }
  }

  public render(): JSX.Element | null {
    // If there is no target window then we are likely in server side rendering and we should not render anything.
    if (!this._targetWindow) {
      return null
    }
    let { target } = this.props
    const {
      styles,
      style,
      role,
      ariaLabel,
      ariaDescribedBy,
      ariaLabelledBy,
      className,
      isBeakVisible,
      children,
      beakWidth,
      calloutWidth,
      calloutMaxWidth,
      finalHeight,
      hideOverflow = !!finalHeight,
      backgroundColor,
      calloutMaxHeight,
      onScroll
    } = this.props
    target = this._getTarget()
    const { positions } = this.state

    const getContentMaxHeight: number | undefined = this._getMaxHeight() ? this._getMaxHeight()! + this.state.heightOffset! : undefined
    const contentMaxHeight: number | undefined =
      calloutMaxHeight! && getContentMaxHeight && calloutMaxHeight! < getContentMaxHeight ? calloutMaxHeight! : getContentMaxHeight!
    const overflowYHidden = hideOverflow

    const beakVisible = isBeakVisible && !!target
    this._classNames = classNamesFunction<ICalloutContentStyleProps, ICalloutContentStyles>()(styles!, {
      theme: this.props.theme!,
      className,
      overflowYHidden: overflowYHidden,
      calloutWidth,
      positions,
      beakWidth,
      backgroundColor,
      calloutMaxWidth
    })

    const overflowStyle: React.CSSProperties = {
      ...style,
      maxHeight: contentMaxHeight,
      ...(overflowYHidden && { overflowY: "hidden" })
    }

    const visibilityStyle: React.CSSProperties | undefined = this.props.hidden ? { visibility: "hidden" } : undefined
    // React.CSSProperties does not understand IRawStyle, so the inline animations will need to be cast as any for now.
    const content = (
      <div ref={this._hostElement} className={this._classNames.container} style={visibilityStyle}>
        <div
          {...getNativeProps(this.props, divProperties)}
          className={css(this._classNames.root, positions && positions.targetEdge && ANIMATIONS[positions.targetEdge!])}
          style={positions ? positions.elementPosition : OFF_SCREEN_STYLE}
          tabIndex={-1} // Safari and Firefox on Mac OS requires this to back-stop click events so focus remains in the Callout.
          // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
          ref={this._calloutElement}
        >
          {beakVisible && <div className={this._classNames.beak} style={this._getBeakPosition()} />}
          {beakVisible && <div className={this._classNames.beakCurtain} />}
          <Popup
            role={role}
            ariaLabel={ariaLabel}
            ariaDescribedBy={ariaDescribedBy}
            ariaLabelledBy={ariaLabelledBy}
            className={this._classNames.calloutMain}
            onDismiss={this.dismiss}
            onScroll={onScroll}
            shouldRestoreFocus={true}
            style={overflowStyle}
          >
            {children}
          </Popup>
        </div>
      </div>
    )

    return content
  }

  public dismiss = (ev?: Event | React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>): void => {
    const { onDismiss } = this.props

    if (onDismiss) {
      onDismiss(ev)
    }
  }

  protected _dismissOnScroll = (ev: Event) => {
    const { preventDismissOnScroll } = this.props
    if (this.state.positions && !preventDismissOnScroll) {
      this._dismissOnLostFocus(ev)
    }
  }

  protected _dismissOnResize = (ev: Event) => {
    const { preventDismissOnResize } = this.props
    if (!preventDismissOnResize) {
      this.dismiss(ev)
    }
  }

  protected _dismissOnLostFocus = (ev: Event) => {
    const target = ev.target as HTMLElement
    const clickedOutsideCallout = this._hostElement.current && !elementContains(this._hostElement.current, target)
    const { preventDismissOnLostFocus } = this.props

    if (
      !preventDismissOnLostFocus &&
      ((!this._target && clickedOutsideCallout) ||
        (ev.target !== this._targetWindow &&
          clickedOutsideCallout &&
          ((this._target as MouseEvent).stopPropagation ||
            (!this._target || (target !== this._target && !elementContains(this._target as HTMLElement, target))))))
    ) {
      this.dismiss(ev)
    }
  }

  protected _setInitialFocus = (): void => {
    if (this.props.setInitialFocus && !this._didSetInitialFocus && this.state.positions && this._calloutElement.current) {
      this._didSetInitialFocus = true
      this._async.requestAnimationFrame(() => focusFirstChild(this._calloutElement.current!))
    }
  }

  protected _onComponentDidMount = (): void => {
    this._addListeners()

    if (this.props.onLayerMounted) {
      this.props.onLayerMounted()
    }

    this._updateAsyncPosition()
    this._setHeightOffsetEveryFrame()
  }

  private _addListeners() {
    // This is added so the callout will dismiss when the window is scrolled
    // but not when something inside the callout is scrolled. The delay seems
    // to be required to avoid React firing an async focus event in IE from
    // the target changing focus quickly prior to rendering the callout.
    this._async.setTimeout(() => {
      this._disposables.push(
        on(this._targetWindow, "scroll", this._dismissOnScroll, true),
        on(this._targetWindow, "resize", this._dismissOnResize, true),
        on(this._targetWindow.document.documentElement, "focus", this._dismissOnLostFocus, true),
        on(this._targetWindow.document.documentElement, "click", this._dismissOnLostFocus, true)
      )
      this._hasListeners = true
    }, 0)
  }

  private _removeListeners() {
    this._disposables.forEach((dispose: () => void) => dispose())
    this._disposables = []
    this._hasListeners = false
  }

  private _updateAsyncPosition(): void {
    this._async.requestAnimationFrame(() => this._updatePosition())
  }

  private _getBeakPosition(): React.CSSProperties {
    const { positions } = this.state
    const beakPostionStyle: React.CSSProperties = {
      ...(positions && positions.beakPosition ? positions.beakPosition.elementPosition : null)
    }

    if (!beakPostionStyle.top && !beakPostionStyle.bottom && !beakPostionStyle.left && !beakPostionStyle.right) {
      beakPostionStyle.left = BEAK_ORIGIN_POSITION.left
      beakPostionStyle.top = BEAK_ORIGIN_POSITION.top
    }

    return beakPostionStyle
  }

  private _updatePosition(): void {
    // Try to update the target, page might have changed
    this._setTargetWindowAndElement(this._getTarget())

    const { positions } = this.state
    const hostElement: HTMLElement | null = this._hostElement.current
    const calloutElement: HTMLElement | null = this._calloutElement.current

    // If we expect a target element to position against, we need to wait until `this._target` is resolved. Otherwise
    // we can try to position.
    const expectsTarget = !!this.props.target

    if (hostElement && calloutElement && (!expectsTarget || this._target)) {
      let currentProps: IPositionProps | undefined
      currentProps = assign(currentProps, this.props)
      currentProps!.bounds = this._getBounds()
      currentProps!.target = this._target!
      const newPositions: ICalloutPositionedInfo = positionCallout(currentProps!, hostElement, calloutElement, positions)

      // Set the new position only when the positions are not exists or one of the new callout positions are different.
      // The position should not change if the position is within 2 decimal places.
      if (
        (!positions && newPositions) ||
        (positions && newPositions && !this._arePositionsEqual(positions, newPositions) && this._positionAttempts < 5)
      ) {
        // We should not reposition the callout more than a few times, if it is then the content is likely resizing
        // and we should stop trying to reposition to prevent a stack overflow.
        this._positionAttempts++
        this.setState({
          positions: newPositions
        })
      } else if (this._positionAttempts > 0) {
        // Only call the onPositioned callback if the callout has been re-positioned at least once.
        this._positionAttempts = 0
        if (this.props.onPositioned) {
          this.props.onPositioned(this.state.positions)
        }
      }
    }
  }

  private _getBounds(): IRectangle {
    if (!this._bounds) {
      let currentBounds = this.props.bounds

      if (!currentBounds) {
        currentBounds = {
          top: 0 + this.props.minPagePadding!,
          left: 0 + this.props.minPagePadding!,
          right: this._targetWindow.innerWidth - this.props.minPagePadding!,
          bottom: this._targetWindow.innerHeight - this.props.minPagePadding!,
          width: this._targetWindow.innerWidth - this.props.minPagePadding! * 2,
          height: this._targetWindow.innerHeight - this.props.minPagePadding! * 2
        }
      }
      this._bounds = currentBounds
    }
    return this._bounds
  }

  // Max height should remain as synchronous as possible, which is why it is not done using set state.
  // It needs to be synchronous since it will impact the ultimate position of the callout.
  private _getMaxHeight(): number | undefined {
    if (!this._maxHeight) {
      if (this.props.directionalHintFixed && this._target) {
        const beakWidth = this.props.isBeakVisible ? this.props.beakWidth : 0
        const gapSpace = this.props.gapSpace ? this.props.gapSpace : 0
        // Since the callout cannot measure it's border size it must be taken into account here. Otherwise it will
        // overlap with the target.
        const totalGap = gapSpace + beakWidth!
        this._async.requestAnimationFrame(() => {
          if (this._target) {
            this._maxHeight = getMaxHeight(this._target, this.props.directionalHint!, totalGap, this._getBounds(), this.props.coverTarget)
            this._blockResetHeight = true
            this.forceUpdate()
          }
        })
      } else {
        this._maxHeight = this._getBounds().height!
      }
    }
    return this._maxHeight!
  }

  private _arePositionsEqual(positions: ICalloutPositionedInfo, newPosition: ICalloutPositionedInfo): boolean {
    return (
      this._comparePositions(positions.elementPosition, newPosition.elementPosition) &&
      this._comparePositions(positions.beakPosition.elementPosition, newPosition.beakPosition.elementPosition)
    )
  }

  private _comparePositions(oldPositions: IPosition, newPositions: IPosition): boolean {
    for (const key in newPositions) {
      // This needs to be checked here and below because there is a linting error if for in does not immediately have an if statement
      if (newPositions.hasOwnProperty(key)) {
        const oldPositionEdge = oldPositions[key]
        const newPositionEdge = newPositions[key]

        if (oldPositionEdge !== undefined && newPositionEdge !== undefined) {
          if (oldPositionEdge.toFixed(2) !== newPositionEdge.toFixed(2)) {
            return false
          }
        } else {
          return false
        }
      }
    }
    return true
  }

  private _setTargetWindowAndElement(target: Element | string | MouseEvent | IPoint | null): void {
    if (target) {
      if (typeof target === "string") {
        const currentDoc: Document = getDocument()!
        this._target = currentDoc ? (currentDoc.querySelector(target) as Element) : null
        this._targetWindow = getWindow()!
      } else if ((target as MouseEvent).stopPropagation) {
        //@ts-ignore
        this._targetWindow = getWindow((target as MouseEvent).toElement as HTMLElement)!
        this._target = target
      } else if ((target as Element).getBoundingClientRect) {
        const targetElement: Element = target as Element
        this._targetWindow = getWindow(targetElement)!
        this._target = target
        // HTMLImgElements can have x and y values. The check for it being a point must go last.
      } else {
        this._targetWindow = getWindow()!
        this._target = target
      }
    } else {
      this._targetWindow = getWindow()!
    }
  }

  private _setHeightOffsetEveryFrame(): void {
    if (this._calloutElement.current && this.props.finalHeight) {
      this._setHeightOffsetTimer = this._async.requestAnimationFrame(() => {
        const calloutMainElem = this._calloutElement.current && (this._calloutElement.current.lastChild as HTMLElement)

        if (!calloutMainElem) {
          return
        }

        const cardScrollHeight: number = calloutMainElem.scrollHeight
        const cardCurrHeight: number = calloutMainElem.offsetHeight
        const scrollDiff: number = cardScrollHeight - cardCurrHeight

        this.setState({
          heightOffset: this.state.heightOffset! + scrollDiff
        })

        if (calloutMainElem.offsetHeight < this.props.finalHeight!) {
          this._setHeightOffsetEveryFrame()
        } else {
          this._async.cancelAnimationFrame(this._setHeightOffsetTimer)
        }
      })
    }
  }

  private _getTarget(props: ICalloutProps = this.props): Element | string | MouseEvent | IPoint | null {
    const { target } = props
    return target!
  }
}

function getBeakStyle(beakWidth?: number): IRawStyle {
  return {
    height: beakWidth,
    width: beakWidth
  }
}

const GlobalClassNames = {
  container: "ms-Callout-container",
  root: "ms-Callout",
  beak: "ms-Callout-beak",
  beakCurtain: "ms-Callout-beakCurtain",
  calloutMain: "ms-Callout-main"
}

export const getCalloutStyles = (props: ICalloutContentStyleProps): ICalloutContentStyles => {
  const { theme, className, overflowYHidden, calloutWidth, beakWidth, backgroundColor, calloutMaxWidth } = props

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  const { palette, effects } = theme

  return {
    container: [
      classNames.container,
      {
        position: "relative"
      }
    ],
    root: [
      classNames.root,
      theme.fonts.small,
      {
        position: "absolute",
        boxSizing: "border-box",
        borderRadius: effects.roundedCorner2,
        boxShadow: effects.elevation16,
        selectors: {
          [HighContrastSelector]: {
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "WindowText"
          }
        }
      },
      focusClear(),
      className,
      !!calloutWidth && { width: calloutWidth },
      !!calloutMaxWidth && { maxWidth: calloutMaxWidth }
    ],
    beak: [
      classNames.beak,
      {
        position: "absolute",
        backgroundColor: palette.white,
        boxShadow: "inherit",
        border: "inherit",
        boxSizing: "border-box",
        transform: "rotate(45deg)"
      },
      getBeakStyle(beakWidth),
      backgroundColor && {
        backgroundColor: backgroundColor
      }
    ],
    beakCurtain: [
      classNames.beakCurtain,
      {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: palette.white,
        borderRadius: effects.roundedCorner2
      }
    ],
    calloutMain: [
      classNames.calloutMain,
      {
        backgroundColor: palette.white,
        overflowX: "hidden",
        overflowY: "auto",
        position: "relative",
        borderRadius: effects.roundedCorner2
      },
      overflowYHidden && {
        overflowY: "hidden"
      },
      backgroundColor && {
        backgroundColor: backgroundColor
      }
    ]
  }
}

export const CalloutContent: React.FunctionComponent<ICalloutProps> = styled<
  ICalloutProps,
  ICalloutContentStyleProps,
  ICalloutContentStyles
>(CalloutContentBase, getCalloutStyles, undefined, { scope: "CalloutContent" })

/**
 * A special Callout that uses FocusTrapZone to trap focus
 * @param props - Props for the component
 */
export const FocusTrapCallout: React.FunctionComponent<IFocusTrapCalloutProps> = (props: IFocusTrapCalloutProps): JSX.Element => {
  return (
    <Callout {...props}>
      <FocusTrapZone disabled={props.hidden} {...props.focusTrapProps}>
        {props.children}
      </FocusTrapZone>
    </Callout>
  )
}

export interface IFocusTrapCalloutProps extends ICalloutProps {
  /**
   * Optional props to be passed on to FocusTrapZone
   */
  focusTrapProps?: IFocusTrapZoneProps
}
