import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import {
  getGlobalClassNames,
  getScreenSelector,
  HighContrastSelector,
  IPalette,
  ISemanticColors,
  ITheme,
  ScreenWidthMaxSmall
} from "@uifabric/styleguide"
import { getId, getNativeProps, htmlElementProperties, IRefObject } from "@uifabric/styleguide"
import * as React from "react"
import { BaseButton } from "./Buttons/BaseButton"
import { IconButton } from "./Buttons/IconButton"
import { DelayedRender } from "./DelayedRender"
//import { Button } from './Buttons';
import { Icon } from "./Icon"

/**
 * {@docCategory MessageBar}
 */
export enum MessageBarType {
  /** Info styled MessageBar */
  info = 0,
  /** Error styled MessageBar */
  error = 1,
  /** Blocked styled MessageBar */
  blocked = 2,
  /** SevereWarning styled MessageBar */
  severeWarning = 3,
  /** Success styled MessageBar */
  success = 4,
  /** Warning styled MessageBar */
  warning = 5,
  /**
   * Deprecated at v0.48.0, to be removed at \>= v1.0.0. Use `blocked` instead.
   * @deprecated Use `blocked` instead.
   */
  remove = 90000
}


export interface IMessageBarState {
  labelId?: string
  showContent?: boolean
  expandSingleLine?: boolean
}

export class MessageBarBase extends React.Component<IMessageBarProps, IMessageBarState> {
  public static defaultProps: IMessageBarProps = {
    messageBarType: MessageBarType.info,
    onDismiss: undefined,
    isMultiline: true
  }

  private ICON_MAP = {
    [MessageBarType.info]: "Info",
    [MessageBarType.warning]: "Info",
    [MessageBarType.error]: "ErrorBadge",
    [MessageBarType.blocked]: "Blocked2",
    [MessageBarType.remove]: "Blocked", // TODO remove deprecated value at >= 1.0.0
    [MessageBarType.severeWarning]: "Warning",
    [MessageBarType.success]: "Completed"
  }

  private _classNames: { [key in keyof IMessageBarStyles]: string }

  constructor(props: IMessageBarProps) {
    super(props)

    this.state = {
      labelId: getId("MessageBar"),
      showContent: false,
      expandSingleLine: false
    }
  }

  public render(): JSX.Element {
    const { isMultiline } = this.props

    this._classNames = this._getClassNames()

    return isMultiline ? this._renderMultiLine() : this._renderSingleLine()
  }

  private _getActionsDiv(): JSX.Element | null {
    if (this.props.actions) {
      return <div className={this._classNames.actions}>{this.props.actions}</div>
    }
    return null
  }

  private _getDismissDiv(): JSX.Element | null {
    if (this.props.onDismiss) {
      return (
        <IconButton
          disabled={false}
          className={this._classNames.dismissal}
          onClick={this.props.onDismiss}
          iconProps={{ iconName: "Clear" }}
          ariaLabel={this.props.dismissButtonAriaLabel}
        />
      )
    }
    return null
  }

  private _getDismissSingleLine(): JSX.Element | null {
    if (this.props.onDismiss) {
      return <div className={this._classNames.dismissSingleLine}>{this._getDismissDiv()}</div>
    }
    return null
  }

  private _getExpandSingleLine(): JSX.Element | null {
    if (!this.props.actions && this.props.truncated) {
      return (
        <div className={this._classNames.expandSingleLine}>
          <IconButton
            disabled={false}
            className={this._classNames.expand}
            onClick={this._onClick}
            iconProps={{ iconName: this.state.expandSingleLine ? "DoubleChevronUp" : "DoubleChevronDown" }}
            ariaLabel={this.props.overflowButtonAriaLabel}
            aria-expanded={this.state.expandSingleLine}
            aria-controls={this.state.labelId}
          />
        </div>
      )
    }
    return null
  }

  private _getIconSpan(): JSX.Element {
    return (
      <div className={this._classNames.iconContainer}>
        <Icon iconName={this.ICON_MAP[this.props.messageBarType!]} className={this._classNames.icon} />
      </div>
    )
  }

  private _renderMultiLine(): React.ReactElement<React.HTMLAttributes<HTMLAreaElement>> {
    const { theme } = this.props
    return (
      <div style={{ background: theme!.semanticColors.bodyBackground }}>
        <div className={this._classNames.root}>
          <div className={this._classNames.content}>
            {this._getIconSpan()}
            {this._renderInnerText()}
            {this._getDismissDiv()}
          </div>
          {this._getActionsDiv()}
        </div>
      </div>
    )
  }

  private _renderSingleLine(): React.ReactElement<React.HTMLAttributes<HTMLAreaElement>> {
    const { theme } = this.props
    return (
      <div style={{ background: theme!.semanticColors.bodyBackground }}>
        <div className={this._classNames.root}>
          <div className={this._classNames.content}>
            {this._getIconSpan()}
            {this._renderInnerText()}
            {this._getExpandSingleLine()}
            {this._getActionsDiv()}
            {this._getDismissSingleLine()}
          </div>
        </div>
      </div>
    )
  }

  private _renderInnerText(): JSX.Element {
    const nativeProps = getNativeProps(this.props, htmlElementProperties, ["className"])

    return (
      <div className={this._classNames.text} id={this.state.labelId}>
        <span className={this._classNames.innerText} role="status" aria-live={this._getAnnouncementPriority()} {...nativeProps}>
          <DelayedRender>
            <span>{this.props.children}</span>
          </DelayedRender>
        </span>
      </div>
    )
  }

  private _getClassNames(): { [key in keyof IMessageBarStyles]: string } {
    const { theme, className, messageBarType, onDismiss, actions, truncated, isMultiline } = this.props
    const { expandSingleLine } = this.state

    return classNamesFunction<IMessageBarStyleProps, IMessageBarStyles>()(this.props.styles!, {
      theme: theme!,
      messageBarType: messageBarType || MessageBarType.info,
      onDismiss: onDismiss !== undefined,
      actions: actions !== undefined,
      truncated: truncated,
      isMultiline: isMultiline,
      expandSingleLine: expandSingleLine,
      className
    })
  }

  private _getAnnouncementPriority(): "assertive" | "polite" {
    switch (this.props.messageBarType) {
      case MessageBarType.blocked:
      case MessageBarType.error:
      case MessageBarType.severeWarning:
        return "assertive"
    }
    return "polite"
  }

  private _onClick = (ev: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    this.setState({ expandSingleLine: !this.state.expandSingleLine })
  }
}

const GlobalClassNames = {
  root: "ms-MessageBar",
  error: "ms-MessageBar--error",
  blocked: "ms-MessageBar--blocked",
  severeWarning: "ms-MessageBar--severeWarning",
  success: "ms-MessageBar--success",
  warning: "ms-MessageBar--warning",
  multiline: "ms-MessageBar-multiline",
  singleline: "ms-MessageBar-singleline",
  dismissalSingleLine: "ms-MessageBar-dismissalSingleLine",
  expandingSingleLine: "ms-MessageBar-expandingSingleLine",
  content: "ms-MessageBar-content",
  iconContainer: "ms-MessageBar-icon",
  text: "ms-MessageBar-text",
  innerText: "ms-MessageBar-innerText",
  dismissSingleLine: "ms-MessageBar-dismissSingleLine",
  expandSingleLine: "ms-MessageBar-expandSingleLine",
  dismissal: "ms-MessageBar-dismissal",
  expand: "ms-MessageBar-expand",
  actions: "ms-MessageBar-actions",
  actionsSingleline: "ms-MessageBar-actionsSingleLine"
}

// Returns the background color of the MessageBar root element based on the type of MessageBar.
const getRootBackground = (messageBarType: MessageBarType | undefined, palette: IPalette, semanticColors: ISemanticColors): string => {
  switch (messageBarType) {
    case MessageBarType.error:
    case MessageBarType.blocked:
      return semanticColors.errorBackground
    case MessageBarType.severeWarning:
      return semanticColors.blockingBackground
    case MessageBarType.success:
      return semanticColors.successBackground
    case MessageBarType.warning:
      return semanticColors.warningBackground
  }
  return palette.neutralLighter
}

// Returns the icon color based on the type of MessageBar.
const getIconColor = (messageBarType: MessageBarType | undefined, palette: IPalette, semanticColors: ISemanticColors): string => {
  switch (messageBarType) {
    case MessageBarType.error:
    case MessageBarType.blocked:
    case MessageBarType.severeWarning:
      return semanticColors.errorText
    case MessageBarType.success:
      return palette.green
    case MessageBarType.warning:
      return semanticColors.warningText
  }
  return palette.neutralSecondary
}

export const getMessageBarStyles = (props: IMessageBarStyleProps): IMessageBarStyles => {
  const { theme, className, messageBarType, onDismiss, truncated, isMultiline, expandSingleLine } = props
  const { semanticColors, palette, fonts } = theme

  const SmallScreenSelector = getScreenSelector(0, ScreenWidthMaxSmall)

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  const dismissalAndExpandIconStyle: IStyle = {
    fontSize: 10,
    height: 10,
    lineHeight: "10px",
    color: palette.neutralPrimary,
    selectors: {
      [HighContrastSelector]: {
        MsHighContrastAdjust: "none",
        color: "Window"
      }
    }
  }

  const dismissalAndExpandStyle: IStyle = {
    flexShrink: 0,
    width: 32,
    height: 32,
    padding: "8px 12px",
    selectors: {
      "& .ms-Button-icon": dismissalAndExpandIconStyle,
      ":hover": {
        backgroundColor: "transparent"
      },
      ":active": {
        backgroundColor: "transparent"
      }
    }
  }

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      messageBarType === MessageBarType.error && classNames.error,
      messageBarType === MessageBarType.blocked && classNames.blocked,
      messageBarType === MessageBarType.severeWarning && classNames.severeWarning,
      messageBarType === MessageBarType.success && classNames.success,
      messageBarType === MessageBarType.warning && classNames.warning,
      isMultiline ? classNames.multiline : classNames.singleline,
      !isMultiline && onDismiss && classNames.dismissalSingleLine,
      !isMultiline && truncated && classNames.expandingSingleLine,
      {
        background: getRootBackground(messageBarType, palette, semanticColors),
        color: palette.neutralPrimary,
        minHeight: 32,
        width: "100%",
        display: "flex",
        wordBreak: "break-word",
        selectors: {
          "& .ms-Link": {
            color: palette.themeDark,
            ...fonts.xSmall
          },
          [HighContrastSelector]: {
            background: "WindowText",
            color: "Window"
          }
        }
      },
      isMultiline && {
        flexDirection: "column"
      },
      className
    ],
    content: [
      classNames.content,
      {
        display: "flex",
        width: "100%"
      }
    ],
    iconContainer: [
      classNames.iconContainer,
      {
        fontSize: 16,
        minWidth: 16,
        minHeight: 16,
        display: "flex",
        flexShrink: 0,
        margin: "8px 0 8px 12px"
      }
    ],
    icon: {
      color: getIconColor(messageBarType, palette, semanticColors),
      selectors: {
        [HighContrastSelector]: {
          MsHighContrastAdjust: "none",
          color: "Window"
        }
      }
    },
    text: [
      classNames.text,
      {
        minWidth: 0,
        display: "flex",
        flexGrow: 1,
        margin: 8,
        ...fonts.xSmall,
        selectors: {
          [HighContrastSelector]: {
            MsHighContrastAdjust: "none"
          }
        }
      },
      !onDismiss && {
        marginRight: 12
      }
    ],
    innerText: [
      classNames.innerText,
      {
        lineHeight: 16,
        selectors: {
          "& span a": {
            paddingLeft: 4
          }
        }
      },
      truncated && {
        overflow: "visible",
        whiteSpace: "pre-wrap"
      },
      !isMultiline && {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      },
      !isMultiline &&
        !truncated && {
          selectors: {
            [SmallScreenSelector]: {
              overflow: "visible",
              whiteSpace: "pre-wrap"
            }
          }
        },
      expandSingleLine && {
        overflow: "visible",
        whiteSpace: "pre-wrap"
      }
    ],
    dismissSingleLine: [classNames.dismissSingleLine],
    expandSingleLine: [classNames.expandSingleLine],
    dismissal: [classNames.dismissal, dismissalAndExpandStyle],
    expand: [classNames.expand, dismissalAndExpandStyle],
    actions: [
      isMultiline ? classNames.actions : classNames.actionsSingleline,
      {
        display: "flex",
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: "auto",
        flexDirection: "row-reverse",
        alignItems: "center",
        margin: "0 12px 0 8px",
        selectors: {
          "& button:nth-child(n+2)": {
            marginLeft: 8
          }
        }
      },
      isMultiline && {
        marginBottom: 8
      },
      onDismiss &&
        !isMultiline && {
          marginRight: 0
        }
    ]
  }
}

export const MessageBar: React.FunctionComponent<IMessageBarProps> = styled<IMessageBarProps, IMessageBarStyleProps, IMessageBarStyles>(
  MessageBarBase,
  getMessageBarStyles,
  undefined,
  {
    scope: "MessageBar"
  }
)

/**
 * {@docCategory MessageBar}
 */
export interface IMessageBar {}

/**
 * {@docCategory MessageBar}
 */
export interface IMessageBarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Optional callback to access the IMessageBar interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IMessageBar>

  /**
   * The type of MessageBar to render.
   * @defaultvalue MessageBarType.info
   */
  messageBarType?: MessageBarType

  /**
   * The actions you want to show on the other side.
   */
  actions?: JSX.Element

  /**
   * A description of the message bar for the benefit of screen readers.
   * @deprecated Use native prop `aria-label` instead.
   */
  ariaLabel?: string

  /**
   * Whether the message bar has a dismiss button and its callback.
   * If null, we don't show a dismiss button.
   * @defaultvalue null
   */
  onDismiss?: (ev?: React.MouseEvent<HTMLButtonElement | BaseButton | HTMLAnchorElement | HTMLDivElement>) => any

  /**
   * Determines if the message bar is multi lined.
   * If false, and the text overflows over buttons or to another line, it is clipped.
   * @defaultvalue true
   */
  isMultiline?: boolean

  /**
   * Aria label on dismiss button if onDismiss is defined.
   */
  dismissButtonAriaLabel?: string

  /**
   * Determines if the message bar text is truncated.
   * If true, a button will render to toggle between a single line view and multiline view.
   * This prop is for single line message bars with no buttons only in a limited space scenario.
   * @defaultvalue false
   */
  truncated?: boolean

  /**
   * Aria label on overflow button if truncated is defined.
   */
  overflowButtonAriaLabel?: string

  /**
   * Additional CSS class(es) to apply to the MessageBar.
   */
  className?: string

  /**
   * Theme (provided through customization.)
   */
  theme?: ITheme

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IMessageBarStyleProps, IMessageBarStyles>
}

/**
 * {@docCategory MessageBar}
 */
export interface IMessageBarStyleProps {
  /**
   * Theme (provided through customization).
   */
  theme: ITheme

  /**
   * Additional CSS class(es).
   */
  className?: string

  /**
   * Type of the MessageBar.
   */
  messageBarType?: MessageBarType

  /**
   * Whether the MessageBar contains a dismiss button.
   */
  onDismiss?: boolean

  /**
   * Whether the text is truncated.
   */
  truncated?: boolean

  /**
   * Whether the MessageBar is rendered in multi line (as opposed to single line) mode.
   */
  isMultiline?: boolean

  /**
   * Whether the single line MessageBar is being expanded.
   */
  expandSingleLine?: boolean

  /**
   * Whether the MessageBar contains any action elements.
   */
  actions?: boolean
}

/**
 * {@docCategory MessageBar}
 */
export interface IMessageBarStyles {
  /**
   * Style set for the root element.
   */
  root?: IStyle

  /**
   * Style set for the element containing the icon, text, and optional dismiss button.
   */
  content?: IStyle

  /**
   * Style set for the element containing the icon.
   */
  iconContainer?: IStyle

  /**
   * Style set for the icon.
   */
  icon?: IStyle

  /**
   * Style set for the element containing the text.
   */
  text?: IStyle

  /**
   * Style set for the text.
   */
  innerText?: IStyle

  /**
   * Style set for the optional dismiss button.
   */
  dismissal?: IStyle

  /**
   * Style set for the icon used to expand and collapse the MessageBar.
   */
  expand?: IStyle

  /**
   * Style set for the element containing the dismiss button.
   */
  dismissSingleLine?: IStyle

  /**
   * Style set for the element containing the expand icon.
   */
  expandSingleLine?: IStyle

  /**
   * Style set for the optional element containing the action elements.
   */
  actions?: IStyle
}
