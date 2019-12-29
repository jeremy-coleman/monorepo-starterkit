import {
  classNamesFunction,
  IStyle,
  IStyleFunction,
  IStyleFunctionOrObject,
  mergeStyleSets,
  styled
} from "@uifabric/styleguide"
import { HighContrastSelector, ITheme } from "@uifabric/styleguide"
import { DirectionalHint, IPoint } from "@uifabric/styleguide"
import * as React from "react"
import { Callout, ICalloutContentStyleProps, ICalloutContentStyles, ICalloutProps } from "./Callout"
import { ktpTargetFromSequences, mergeOverflows } from "./KeytipManager"

export const getKeytipStyles = (props: IKeytipStyleProps): IKeytipStyles => {
  const { theme, disabled, visible } = props
  return {
    container: [
      {
        backgroundColor: theme.palette.neutralDark
      },
      disabled && {
        opacity: 0.5,
        selectors: {
          [HighContrastSelector]: {
            color: "GrayText",
            opacity: 1
          }
        }
      },
      !visible && {
        visibility: "hidden"
      }
    ],
    root: [
      theme.fonts.small,
      {
        textAlign: "center",
        paddingLeft: "3px",
        paddingRight: "3px",
        backgroundColor: theme.palette.neutralDark,
        color: theme.palette.neutralLight,
        minWidth: "11px",
        lineHeight: "17px",
        height: "17px",
        display: "inline-block"
      },
      disabled && {
        color: theme.palette.neutralTertiaryAlt
      }
    ]
  }
}

export const getKeytipCalloutStyles = (props: ICalloutContentStyleProps): ICalloutContentStyles => {
  return {
    container: [],
    root: [
      {
        border: "none",
        boxShadow: "none"
      }
    ],
    beak: [],
    beakCurtain: [],
    calloutMain: [
      {
        backgroundColor: "transparent"
      }
    ]
  }
}

export const getKeytipCalloutOffsetStyles = (offset: IPoint): IStyleFunction<ICalloutContentStyleProps, ICalloutContentStyles> => {
  return (props: ICalloutContentStyleProps): ICalloutContentStyles => {
    return mergeStyleSets(getKeytipCalloutStyles(props), {
      root: [
        {
          marginLeft: offset.x,
          marginTop: offset.y
        }
      ]
    })
  }
}

/**
 * A callout corresponding to another Fabric component to describe a key sequence that will activate that component
 */
export class Keytip extends React.Component<IKeytipProps, {}> {
  public render(): JSX.Element {
    const { keySequences, offset, overflowSetSequence } = this.props
    let { calloutProps } = this.props

    let keytipTarget: string
    // Take into consideration the overflow sequence
    if (overflowSetSequence) {
      keytipTarget = ktpTargetFromSequences(mergeOverflows(keySequences, overflowSetSequence))
    } else {
      keytipTarget = ktpTargetFromSequences(keySequences)
    }

    if (offset) {
      // Set callout to top-left corner, will be further positioned in
      // getCalloutOffsetStyles
      calloutProps = {
        ...calloutProps,
        coverTarget: true,
        directionalHint: DirectionalHint.topLeftEdge
      }
    }

    if (!calloutProps || calloutProps.directionalHint === undefined) {
      // Default callout directional hint to BottomCenter
      calloutProps = {
        ...calloutProps,
        directionalHint: DirectionalHint.bottomCenter
      }
    }

    return (
      <Callout
        {...calloutProps}
        isBeakVisible={false}
        doNotLayer={true}
        minPagePadding={0}
        styles={offset ? getKeytipCalloutOffsetStyles(offset) : getKeytipCalloutStyles}
        preventDismissOnScroll={true}
        target={keytipTarget}
      >
        <KeytipContent {...this.props} />
      </Callout>
    )
  }
}

/**
 * {@docCategory Keytips}
 */
export interface IKeytipProps {
  /**
   * Content to put inside the keytip
   */
  content: string

  /**
   * Theme for the component
   */
  theme?: ITheme

  /**
   * T/F if the corresponding control for this keytip is disabled
   */
  disabled?: boolean

  /**
   * T/F if the keytip is visible
   */
  visible?: boolean

  /**
   * Function to call when this keytip is activated.
   * 'executeTarget' is the DOM element marked with 'data-ktp-execute-target'.
   * 'target' is the DOM element marked with 'data-ktp-target'.
   */
  onExecute?: (executeTarget: HTMLElement | null, target: HTMLElement | null) => void

  /**
   * Function to call when the keytip is the currentKeytip and a return sequence is pressed.
   * 'executeTarget' is the DOM element marked with 'data-ktp-execute-target'.
   * 'target' is the DOM element marked with 'data-ktp-target'.
   */
  onReturn?: (executeTarget: HTMLElement | null, target: HTMLElement | null) => void

  /**
   * Array of KeySequences which is the full key sequence to trigger this keytip
   * Should not include initial 'start' key sequence
   */
  keySequences: string[]

  /**
   * Full KeySequence of the overflow set button, will be set automatically if this keytip is inside an overflow
   */
  overflowSetSequence?: string[]

  /**
   * ICalloutProps to pass to the callout element
   */
  calloutProps?: ICalloutProps

  /**
   * Optional styles for the component.
   */
  styles?: IStyleFunctionOrObject<IKeytipStyleProps, IKeytipStyles>

  /**
   * Offset x and y for the keytip, added from the top-left corner
   * By default the keytip will be anchored to the bottom-center of the element
   */
  offset?: IPoint

  /**
   * Whether or not this keytip will have children keytips that are dynamically created (DOM is generated on keytip activation)
   * Common cases are a Pivot or Modal
   */
  hasDynamicChildren?: boolean

  /**
   * Whether or not this keytip belongs to a component that has a menu
   * Keytip mode will stay on when a menu is opened, even if the items in that menu have no keytips
   */
  hasMenu?: boolean
}

/**
 * Props to style Keytip component
 * {@docCategory Keytips}
 */
export interface IKeytipStyleProps {
  /**
   * The theme for the keytip.
   */
  theme: ITheme

  /**
   * Whether the keytip is disabled or not.
   */
  disabled?: boolean

  /**
   * T/F if the keytip is visible
   */
  visible?: boolean
}

/**
 * {@docCategory Keytips}
 */
export interface IKeytipStyles {
  /**
   * Style for the div container surrounding the keytip content.
   */
  container: IStyle

  /**
   * Style for the keytip content element.
   */
  root: IStyle
}

/**
 * A component corresponding the the content rendered inside the callout of the keytip component.
 * {@docCategory Keytips}
 */
export class KeytipContentBase extends React.Component<IKeytipProps, {}> {
  public render(): JSX.Element {
    const { content, styles, theme, disabled, visible } = this.props

    const classNames = classNamesFunction<IKeytipStyleProps, IKeytipStyles>()(styles!, {
      theme: theme!,
      disabled,
      visible
    })

    return (
      <div className={classNames.container}>
        <span className={classNames.root}>{content}</span>
      </div>
    )
  }
}

export const KeytipContent: React.FunctionComponent<IKeytipProps> = styled<IKeytipProps, IKeytipStyleProps, IKeytipStyles>(
  KeytipContentBase,
  getKeytipStyles,
  undefined,
  {
    scope: "KeytipContent"
  }
)
