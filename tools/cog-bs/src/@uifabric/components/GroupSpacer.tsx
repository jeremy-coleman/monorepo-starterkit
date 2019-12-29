import { IStyle, IStyleFunctionOrObject } from "@uifabric/styleguide"
import { ITheme } from "@uifabric/styleguide"
import * as React from "react"
import { IGroupSpacerProps } from "./GroupSpacer"

export const SPACER_WIDTH = 36

export const GroupSpacer: React.SFC<IGroupSpacerProps> = (props: IGroupSpacerProps): ReturnType<React.SFC<IGroupSpacerProps>> => {
  const { count, indentWidth = SPACER_WIDTH } = props
  const width = count * indentWidth

  return count > 0 ? <span className={"ms-GroupSpacer"} style={{ display: "inline-block", width }} /> : null
}

/**
 * {@docCategory GroupedList}
 */
export interface IGroupSpacerProps {
  /**
   * Theme from Higher Order Component
   *
   * @deprecated unused, to be removed in 7.0
   */
  theme?: ITheme

  /**
   * Style function to be passed in to override the themed or default styles
   *
   * @deprecated unused, to be removed in 7.0
   */
  styles?: IStyleFunctionOrObject<IGroupSpacerStyleProps, IGroupSpacerStyles>

  /** Count of spacer(s) */
  count: number

  /** How much to indent */
  indentWidth?: number
}

/**
 * {@docCategory GroupedList}
 * @deprecated unused, to be removed in 7.0. Use {@link IGroupSpacerProps.indentWidth}
 */
export type IGroupSpacerStyleProps = Required<Pick<IGroupSpacerProps, "theme">> & {
  width?: number
}

/**
 * {@docCategory GroupedList}
 * @deprecated unused, to be removed in 7.0.
 */
export interface IGroupSpacerStyles {
  root: IStyle
}
