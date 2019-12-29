import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import { disableBodyScroll, divProperties, enableBodyScroll, getNativeProps, IRefObject } from "@uifabric/styleguide"
import * as React from "react"

export class OverlayBase extends React.Component<IOverlayProps, {}> {
  public componentDidMount(): void {
    disableBodyScroll()
  }

  public componentWillUnmount(): void {
    enableBodyScroll()
  }

  public render(): JSX.Element {
    const { isDarkThemed: isDark, className, theme, styles } = this.props

    const divProps = getNativeProps(this.props, divProperties)

    const classNames = classNamesFunction<IOverlayStyleProps, IOverlayStyles>()(styles!, {
      theme: theme!,
      className,
      isDark
    })

    return <div {...divProps} className={classNames.root} />
  }
}

const GlobalClassNames = {
  root: "ms-Overlay",
  rootDark: "ms-Overlay--dark"
}

export const getOverlayStyles = (props: IOverlayStyleProps): IOverlayStyles => {
  const { className, theme, isNone, isDark } = props

  const { palette } = theme

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      {
        backgroundColor: palette.whiteTranslucent40,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        position: "absolute",

        selectors: {
          [HighContrastSelector]: {
            border: "1px solid WindowText",
            opacity: 0
          }
        }
      },

      isNone && {
        visibility: "hidden"
      },

      isDark && [
        classNames.rootDark,
        {
          backgroundColor: palette.blackTranslucent40
        }
      ],

      className
    ]
  }
}

export const Overlay: React.FunctionComponent<IOverlayProps> = styled<IOverlayProps, IOverlayStyleProps, IOverlayStyles>(
  OverlayBase,
  getOverlayStyles,
  undefined,
  {
    scope: "Overlay"
  }
)

/**
 * {@docCategory Overlay}
 */
export interface IOverlay {}

/**
 * {@docCategory Overlay}
 */
export interface IOverlayProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<IOverlay>

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<IOverlayStyleProps, IOverlayStyles>

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Additional css class to apply to the Overlay
   * @defaultvalue undefined
   */
  className?: string

  /**
   * Whether to use the dark-themed overlay.
   * @defaultvalue false
   */
  isDarkThemed?: boolean

  onClick?: () => void
}

/**
 * {@docCategory Overlay}
 */
export interface IOverlayStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * Is overlay visible
   */
  isNone?: boolean

  /**
   * Is overlay dark themed
   */
  isDark?: boolean
}

/**
 * {@docCategory Overlay}
 */
export interface IOverlayStyles {
  /**
   * Style for the root element.
   */
  root: IStyle
}
