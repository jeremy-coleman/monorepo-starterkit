import { classNamesFunction, IStyle, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, HighContrastSelector } from "@uifabric/styleguide"
import { IRenderFunction, KeyCodes } from "@uifabric/styleguide"
import * as React from "react"
import { IBaseCardProps, IBaseCardStyleProps, IBaseCardStyles } from "./BaseCard"
import { CardCallout } from "./CardCallout"


export interface IExpandingCardState {
  firstFrameRendered: boolean
  needsScroll: boolean
}

export class ExpandingCardBase extends React.Component<IExpandingCardProps, IExpandingCardState> {
  public static defaultProps = {
    compactCardHeight: 156,
    expandedCardHeight: 384,
    directionalHintFixed: true
  }

  private _classNames: { [key in keyof IExpandingCardStyles]: string }
  private _expandedElem = React.createRef<HTMLDivElement>()

  constructor(props: IExpandingCardProps) {
    super(props)

    this.state = {
      firstFrameRendered: false,
      needsScroll: false
    }
  }

  public componentDidMount(): void {
    this._checkNeedsScroll()
  }

  public componentWillUnmount(): void {
    //this._async.dispose();
  }

  public render(): JSX.Element {
    const { styles, compactCardHeight, expandedCardHeight, theme, mode, className } = this.props
    const { needsScroll, firstFrameRendered } = this.state

    const finalHeight = compactCardHeight! + expandedCardHeight!

    this._classNames = classNamesFunction<IExpandingCardStyleProps, IExpandingCardStyles>()(styles!, {
      theme: theme!,
      compactCardHeight,
      className,
      expandedCardHeight,
      needsScroll: needsScroll,
      expandedCardFirstFrameRendered: mode === ExpandingCardMode.expanded && firstFrameRendered
    })

    const content: JSX.Element = (
      <div onMouseEnter={this.props.onEnter} onMouseLeave={this.props.onLeave} onKeyDown={this._onKeyDown}>
        {this._onRenderCompactCard()}
        {this._onRenderExpandedCard()}
      </div>
    )

    return <CardCallout {...this.props} content={content} finalHeight={finalHeight} className={this._classNames.root} />
  }

  private _onKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCodes.escape) {
      this.props.onLeave && this.props.onLeave(ev)
    }
  }

  private _onRenderCompactCard = (): JSX.Element => {
    return <div className={this._classNames.compactCard}>{this.props.onRenderCompactCard!(this.props.renderData)}</div>
  }

  private _onRenderExpandedCard = (): JSX.Element => {
    // firstFrameRendered helps in initially setting height of expanded card to 1px, even if
    // mode prop is set to ExpandingCardMode.expanded on first render. This is to make sure transition animation takes place.
    !this.state.firstFrameRendered &&
      // this._async.
      requestAnimationFrame(() => {
        this.setState({
          firstFrameRendered: true
        })
      })

    return (
      <div className={this._classNames.expandedCard} ref={this._expandedElem}>
        <div className={this._classNames.expandedCardScroll}>
          {this.props.onRenderExpandedCard && this.props.onRenderExpandedCard(this.props.renderData)}
        </div>
      </div>
    )
  }

  private _checkNeedsScroll = (): void => {
    const { expandedCardHeight } = this.props
    //this._async.
    requestAnimationFrame(() => {
      if (this._expandedElem.current && this._expandedElem.current.scrollHeight >= expandedCardHeight!) {
        this.setState({
          needsScroll: true
        })
      }
    })
  }
}

const GlobalClassNames = {
  root: "ms-ExpandingCard-root",
  compactCard: "ms-ExpandingCard-compactCard",
  expandedCard: "ms-ExpandingCard-expandedCard",
  expandedCardScroll: "ms-ExpandingCard-expandedCardScrollRegion"
}

export function getExpandingCardStyles(props: IExpandingCardStyleProps): IExpandingCardStyles {
  const { theme, needsScroll, expandedCardFirstFrameRendered, compactCardHeight, expandedCardHeight, className } = props

  const { palette } = theme
  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [
      classNames.root,
      {
        width: 320,
        pointerEvents: "none",
        selectors: {
          [HighContrastSelector]: {
            border: "1px solid WindowText"
          }
        }
      },
      className
    ],
    compactCard: [
      classNames.compactCard,
      {
        pointerEvents: "auto",
        position: "relative",
        height: compactCardHeight
      }
    ],
    expandedCard: [
      classNames.expandedCard,
      {
        height: 1,
        overflowY: "hidden",
        pointerEvents: "auto",
        transition: "height 0.467s cubic-bezier(0.5, 0, 0, 1)",
        selectors: {
          ":before": {
            content: '""',
            position: "relative",
            display: "block",
            top: 0,
            left: 24,
            width: 272,
            height: 1,
            backgroundColor: palette.neutralLighter
          }
        }
      },
      expandedCardFirstFrameRendered && {
        height: expandedCardHeight
      }
    ],
    expandedCardScroll: [
      classNames.expandedCardScroll,
      needsScroll && {
        height: "100%",
        boxSizing: "border-box",
        overflowY: "auto"
      }
    ]
  }
}

export const ExpandingCard: React.FunctionComponent<IExpandingCardProps> = styled<
  IExpandingCardProps,
  IExpandingCardStyleProps,
  IExpandingCardStyles
>(ExpandingCardBase, getExpandingCardStyles, undefined, {
  scope: "ExpandingCard"
})

/**
 * {@docCategory HoverCard}
 */
export interface IExpandingCard {}

/**
 * ExpandingCard component props.
 * {@docCategory HoverCard}
 */
export interface IExpandingCardProps extends IBaseCardProps<IExpandingCard, IExpandingCardStyles, IExpandingCardStyleProps> {
  /**
   * Height of compact card
   * @defaultvalue 156
   */
  compactCardHeight?: number

  /**
   * Height of expanded card
   * @defaultvalue 384
   */
  expandedCardHeight?: number

  /**
   * Use to open the card in expanded format and not wait for the delay
   * @defaultvalue ExpandingCardMode.compact
   */
  mode?: ExpandingCardMode

  /**
   *  Render function to populate compact content area
   */
  onRenderCompactCard?: IRenderFunction<any>

  /**
   *  Render function to populate expanded content area
   */
  onRenderExpandedCard?: IRenderFunction<any>
}

/**
 * {@docCategory HoverCard}
 */
export enum ExpandingCardMode {
  /**
   * To have top compact card only
   */
  compact = 0,

  /**
   * To have both top compact and bottom expanded card
   */
  expanded = 1
}

/**
 * {@docCategory HoverCard}
 */
export interface IExpandingCardStyleProps extends IBaseCardStyleProps {
  /**
   * Height of the compact section of the card.
   */
  compactCardHeight?: number

  /**
   * Boolean flag that expanded card is in Expanded.mode === expanded && first frame was rendered.
   */
  expandedCardFirstFrameRendered?: boolean

  /**
   * Height of the expanded section of the card.
   */
  expandedCardHeight?: number

  /**
   * Whether the content of the expanded card overflows vertically.
   */
  needsScroll?: boolean
}

/**
 * {@docCategory HoverCard}
 */
export interface IExpandingCardStyles extends IBaseCardStyles {
  /**
   * Style for the main card element.
   */
  compactCard?: IStyle

  /**
   * Base Style for the expanded card content.
   */
  expandedCard?: IStyle

  /**
   * Style for the expanded card scroll content.
   */
  expandedCardScroll?: IStyle
}
