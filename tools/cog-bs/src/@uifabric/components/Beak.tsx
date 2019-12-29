import { classNamesFunction, IStyle } from "@uifabric/styleguide"
import { IBaseProps, IRefObject, RectangleEdge } from "@uifabric/styleguide"
import * as React from "react"

export interface IBeakStyles {
  /**
   * Style for the root element in the default enabled/unchecked state.
   */
  root?: IStyle
  beak?: IStyle
}

export function getBeakStyles(props: IBeakStylesProps): IBeakStyles {
  return {
    root: [
      {
        position: "absolute",
        boxShadow: "inherit",
        border: "none",
        boxSizing: "border-box",
        transform: props.transform,
        width: props.width,
        height: props.height,
        left: props.left,
        top: props.top,
        right: props.right,
        bottom: props.bottom
      }
    ],
    beak: {
      fill: props.color,
      display: "block"
    }
  }
}

export const BEAK_HEIGHT = 10
export const BEAK_WIDTH = 18

export class Beak extends React.Component<IBeakProps, {}> {
  constructor(props: IBeakProps) {
    super(props)
  }

  public render(): JSX.Element {
    const { left, top, bottom, right, color, direction = RectangleEdge.top } = this.props

    let svgHeight: number
    let svgWidth: number

    if (direction === RectangleEdge.top || direction === RectangleEdge.bottom) {
      svgHeight = BEAK_HEIGHT
      svgWidth = BEAK_WIDTH
    } else {
      svgHeight = BEAK_WIDTH
      svgWidth = BEAK_HEIGHT
    }

    let pointOne: string
    let pointTwo: string
    let pointThree: string
    let transform: string

    switch (direction) {
      case RectangleEdge.top:
      default:
        pointOne = `${BEAK_WIDTH / 2}, 0`
        pointTwo = `${BEAK_WIDTH}, ${BEAK_HEIGHT}`
        pointThree = `0, ${BEAK_HEIGHT}`
        transform = "translateY(-100%)"
        break
      case RectangleEdge.right:
        pointOne = `0, 0`
        pointTwo = `${BEAK_HEIGHT}, ${BEAK_HEIGHT}`
        pointThree = `0, ${BEAK_WIDTH}`
        transform = "translateX(100%)"
        break
      case RectangleEdge.bottom:
        pointOne = `0, 0`
        pointTwo = `${BEAK_WIDTH}, 0`
        pointThree = `${BEAK_WIDTH / 2}, ${BEAK_HEIGHT}`
        transform = "translateY(100%)"
        break
      case RectangleEdge.left:
        pointOne = `${BEAK_HEIGHT}, 0`
        pointTwo = `0, ${BEAK_HEIGHT}`
        pointThree = `${BEAK_HEIGHT}, ${BEAK_WIDTH}`
        transform = "translateX(-100%)"
        break
    }

    const classNames = classNamesFunction<IBeakStylesProps, IBeakStyles>()(getBeakStyles, {
      left,
      top,
      bottom,
      right,
      height: `${svgHeight}px`,
      width: `${svgWidth}px`,
      transform: transform,
      color
    })

    return (
      <div className={classNames.root} role="presentation">
        <svg height={svgHeight} width={svgWidth} className={classNames.beak}>
          <polygon points={pointOne + " " + pointTwo + " " + pointThree} />
        </svg>
      </div>
    )
  }
}

export interface IBeak {}

export interface IBeakProps extends IBaseProps<IBeak> {
  /**
   * All props for your component are to be defined here.
   */
  componentRef?: IRefObject<IBeak>

  /**
   * Beak width.
   * @defaultvalue 18
   * @deprecated Do not use.
   */
  width?: number

  /**
   * Beak height.
   * @defaultvalue 18
   * @deprecated Do not use.
   */
  height?: number

  /**
   * Color of the beak
   */
  color?: string

  /**
   * Left position of the beak
   */
  left?: string

  /**
   * Top position of the beak
   */
  top?: string

  /**
   * Right position of the beak
   */
  right?: string

  /**
   * Bottom position of the beak
   */
  bottom?: string

  /**
   * Direction of beak
   */
  direction?: RectangleEdge
}

export interface IBeakStylesProps {
  left?: string | undefined
  top?: string | undefined
  bottom?: string | undefined
  right?: string | undefined
  width?: string
  height?: string
  transform?: string
  color?: string
}
