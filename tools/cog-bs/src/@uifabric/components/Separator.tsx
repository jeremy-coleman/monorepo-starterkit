import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { ITheme } from "@uifabric/styleguide"
import * as React from "react"


export const SeparatorBase: React.FunctionComponent<ISeparatorProps> = (props: ISeparatorProps): JSX.Element => {
  const { styles, theme, className, vertical, alignContent } = props

  const _classNames = classNamesFunction<ISeparatorStyleProps, ISeparatorStyles>()(styles!, {
    theme: theme!,
    className,
    alignContent: alignContent,
    vertical: vertical
  })

  return (
    <div className={_classNames.root}>
      <div className={_classNames.content} role="separator" aria-orientation={vertical ? "vertical" : "horizontal"}>
        {props.children}
      </div>
    </div>
  )
}

export const getSeparatorStyles = (props: ISeparatorStyleProps): ISeparatorStyles => {
  const { theme, alignContent, vertical, className } = props

  const alignStart = alignContent === "start"
  const alignCenter = alignContent === "center"
  const alignEnd = alignContent === "end"

  return {
    root: [
      theme.fonts.small,
      {
        position: "relative"
      },
      alignContent && {
        textAlign: alignContent
      },
      !alignContent && {
        textAlign: "center"
      },
      vertical &&
        (alignCenter || !alignContent) && {
          verticalAlign: "middle"
        },
      vertical &&
        alignStart && {
          verticalAlign: "top"
        },
      vertical &&
        alignEnd && {
          verticalAlign: "bottom"
        },
      vertical && {
        padding: "0 4px",
        height: "inherit",
        display: "table-cell",
        zIndex: 1,
        selectors: {
          ":after": {
            backgroundColor: theme.palette.neutralLighter,
            width: "1px",
            content: '""',
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "50%",
            right: "0",
            zIndex: -1
          }
        }
      },
      !vertical && {
        padding: "4px 0",
        selectors: {
          ":before": {
            backgroundColor: theme.palette.neutralLighter,
            height: "1px",
            content: '""',
            display: "block",
            position: "absolute",
            top: "50%",
            bottom: "0",
            left: "0",
            right: "0"
          }
        }
      },
      className
    ],
    content: [
      {
        position: "relative",
        display: "inline-block",
        padding: "0 12px",
        color: theme.semanticColors.bodyText,
        background: theme.semanticColors.bodyBackground
      },
      vertical && {
        padding: "12px 0"
      }
    ]
  }
}

export const Separator: React.FunctionComponent<ISeparatorProps> = styled<ISeparatorProps, ISeparatorStyleProps, ISeparatorStyles>(
  SeparatorBase,
  getSeparatorStyles,
  undefined,
  {
    scope: "Separator"
  }
)

/**
 * {@docCategory Separator}
 */
export interface ISeparator {}

/**
 * {@docCategory Separator}
 */
export interface ISeparatorProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Theme (provided through customization.)
   */
  theme?: ITheme

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ISeparatorStyleProps, ISeparatorStyles>

  /**
   * Whether the element is a vertical separator.
   */
  vertical?: boolean

  /**
   * Where the content should be aligned in the separator.
   * @defaultValue 'center'
   */
  alignContent?: "start" | "center" | "end"
}

/**
 * {@docCategory Separator}
 */
export type ISeparatorStyleProps = Required<Pick<ISeparatorProps, "theme">> &
  Pick<ISeparatorProps, "className" | "alignContent" | "vertical">

/**
 * {@docCategory Separator}
 */
export interface ISeparatorStyles {
  /**
   * Style for the root element
   */
  root: IStyle

  /**
   * Style for the content
   */
  content: IStyle
}
