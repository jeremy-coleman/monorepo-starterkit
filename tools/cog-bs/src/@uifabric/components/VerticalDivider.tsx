import { classNamesFunction, concatStyleSets, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { ITheme } from "@uifabric/styleguide"
import * as React from "react"

export const VerticalDividerBase = (props: IVerticalDividerProps) => {
  const { styles, theme, className } = props
  const classNames = classNamesFunction<IVerticalDividerPropsStyles, IVerticalDividerStyles>()(styles, { theme: theme, className })
  return (
    <span className={classNames.wrapper}>
      <span className={classNames.divider} />
    </span>
  )
}

export const getVerticalDividerStyles = (props: IVerticalDividerPropsStyles) => {
  const { theme, className } = props
  return concatStyleSets({
    wrapper: [
      {
        display: "inline-flex",
        height: "100%",
        alignItems: "center"
      },
      className
    ],
    divider: [
      {
        width: 1,
        height: "100%",
        backgroundColor: theme.palette.neutralTertiaryAlt
      }
    ]
  })
}

export const VerticalDivider: React.FunctionComponent<IVerticalDividerProps> = styled<
  IVerticalDividerProps,
  IVerticalDividerPropsStyles,
  IVerticalDividerStyles
>(VerticalDividerBase, getVerticalDividerStyles, undefined, {
  scope: "VerticalDivider"
})


export interface IVerticalDividerProps {
  theme?: ITheme
  styles?: IStyleFunctionOrObject<IVerticalDividerPropsStyles, IVerticalDividerStyles>
  className?: string
}

export type IVerticalDividerPropsStyles = Pick<IVerticalDividerProps, "theme" | "styles" | "className">

export interface IVerticalDividerStyles {
  wrapper: IStyle
  divider: IStyle
}

