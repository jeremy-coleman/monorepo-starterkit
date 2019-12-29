import { classNamesFunction, getRTL, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide";
import { getGlobalClassNames, HighContrastSelector, ITheme } from "@uifabric/styleguide";
import { IRefObject } from "@uifabric/styleguide";
import * as React from "react";
import { Icon } from "./Icon";

export class CheckBase extends React.Component<ICheckProps, {}> {
  public static defaultProps: ICheckProps = {
    checked: false
  }

  public render(): JSX.Element {
    const { checked, className, theme, styles } = this.props

    const classNames = classNamesFunction<ICheckStyleProps, ICheckStyles>()(styles!, { theme: theme!, className, checked })

    return (
      <div className={classNames.root}>
        <Icon iconName="CircleRing" className={classNames.circle} />
        <Icon iconName="StatusCircleCheckmark" className={classNames.check} />
      </div>
    )
  }
}

const GlobalClassNames = {
  root: "ms-Check",
  circle: "ms-Check-circle",
  check: "ms-Check-check"
}

export const getCheckStyles = (props: ICheckStyleProps): ICheckStyles => {
  const { checkBoxHeight = "18px", checked, className, theme } = props

  const { palette, semanticColors } = theme
  const isRTL = getRTL()

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  const sharedCircleCheck: IStyle = {
    fontSize: checkBoxHeight,
    position: "absolute",
    left: 0,
    top: 0,
    width: checkBoxHeight,
    height: checkBoxHeight,
    textAlign: "center",
    verticalAlign: "middle"
  }

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      {
        // lineHeight currently needs to be a string to output without 'px'
        lineHeight: "1",
        width: checkBoxHeight,
        height: checkBoxHeight,
        verticalAlign: "top",
        position: "relative",
        userSelect: "none",

        selectors: {
          ":before": {
            content: '""',
            position: "absolute",
            top: "1px",
            right: "1px",
            bottom: "1px",
            left: "1px",
            borderRadius: "50%",
            opacity: 1,
            background: semanticColors.bodyBackground
          },

          /**
           * TODO: Come back to this once .checkHost has been
           * converted to mergeStyles
           */
          "$checkHost:hover &, $checkHost:focus &, &:hover, &:focus": {
            opacity: 1
          }
        }
      },

      checked && [
        "is-checked",
        {
          selectors: {
            ":before": {
              background: palette.themePrimary,
              opacity: 1,
              selectors: {
                [HighContrastSelector]: {
                  background: "Window"
                }
              }
            }
          }
        }
      ],
      className
    ],

    circle: [
      classNames.circle,
      sharedCircleCheck,

      {
        color: palette.neutralSecondary,

        selectors: {
          [HighContrastSelector]: {
            color: "WindowText"
          }
        }
      },

      checked && {
        color: palette.white
      }
    ],

    check: [
      classNames.check,
      sharedCircleCheck,

      {
        opacity: 0,
        color: palette.neutralSecondary,
        fontSize: "16px",
        left: isRTL ? "-0.5px" : ".5px", // for centering the check icon inside the circle.

        selectors: {
          ":hover": {
            opacity: 1
          },

          [HighContrastSelector]: {
            MsHighContrastAdjust: "none"
          }
        }
      },

      checked && {
        opacity: 1,
        color: palette.white,
        fontWeight: 900,

        selectors: {
          [HighContrastSelector]: {
            border: "none",
            color: "WindowText"
          }
        }
      }
    ],

    checkHost: [{}]
  }
}

export const Check: React.FunctionComponent<ICheckProps> = styled<ICheckProps, ICheckStyleProps, ICheckStyles>(
  CheckBase,
  getCheckStyles,
  undefined,
  {
    scope: "Check"
  },
  true
)

/**
 * {@docCategory Check}
 */
export interface ICheckProps extends React.ClassAttributes<CheckBase> {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<ICheckProps>

  /**
   * Whether or not this menu item is currently checked.
   * @defaultvalue false
   */
  checked?: boolean

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<ICheckStyleProps, ICheckStyles>

  /**
   * Flag to always show the check icon. Not currently working.
   */
  alwaysShowCheck?: boolean

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Additional css class to apply to the Check
   * @defaultvalue undefined
   */
  className?: string
}

/**
 * {@docCategory Check}
 */
export interface ICheckStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * Accept custom checkBox size in pixels.
   * @defaultvalue '18px'
   */
  checkBoxHeight?: string

  checked?: boolean
}

/**
 * {@docCategory Check}
 */
export interface ICheckStyles {
  /**
   * Style for the root element.
   */
  root: IStyle

  /**
   * The 'check' icon styles.
   */
  check: IStyle

  /**
   * The 'circle' icon styles.
   */
  circle: IStyle

  /**
   * Check host style
   */
  checkHost: IStyle
}
