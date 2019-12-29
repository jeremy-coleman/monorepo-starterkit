import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { FontWeights, getGlobalClassNames, ITheme } from "@uifabric/styleguide"
import { IRefObject } from "@uifabric/styleguide"
import * as React from "react"
import { IButtonProps } from "./Buttons/Button"
import { IconButton } from "./Buttons/IconButton"
import { DialogFooterType } from "./DialogFooter"

//@withResponsiveMode
export class DialogContentBase extends React.Component<IDialogContentProps, {}> {
  public static defaultProps: IDialogContentProps = {
    showCloseButton: false,
    className: "",
    topButtonsProps: [],
    closeButtonAriaLabel: "Close"
  }

  constructor(props: IDialogContentProps) {
    super(props)
  }

  public render(): JSX.Element {
    const {
      showCloseButton,
      className,
      closeButtonAriaLabel,
      onDismiss,
      subTextId,
      subText,
      titleId,
      title,
      type,
      styles,
      theme,
      draggableHeaderClassName
    } = this.props

    const classNames = classNamesFunction<IDialogContentStyleProps, IDialogContentStyles>()(styles!, {
      theme: theme!,
      className,
      isLargeHeader: type === DialogType.largeHeader,
      isClose: type === DialogType.close,
      draggableHeaderClassName
    })

    const groupings = this._groupChildren()
    let subTextContent
    if (subText) {
      subTextContent = (
        <p className={classNames.subText} id={subTextId}>
          {subText}
        </p>
      )
    }

    return (
      <div className={classNames.content}>
        <div className={classNames.header}>
          <p className={classNames.title} id={titleId} role="heading" aria-level={2}>
            {title}
          </p>
          <div className={classNames.topButton}>
            {this.props.topButtonsProps!.map((props, index) => (
              <IconButton key={props.uniqueId || index} {...props} />
            ))}
            {(type === DialogType.close || (showCloseButton && type !== DialogType.largeHeader)) && (
              <IconButton
                className={classNames.button}
                iconProps={{ iconName: "Cancel" }}
                ariaLabel={closeButtonAriaLabel}
                onClick={onDismiss as any}
              />
            )}
          </div>
        </div>
        <div className={classNames.inner}>
          <div className={classNames.innerContent}>
            {subTextContent}
            {groupings.contents}
          </div>
          {groupings.footers}
        </div>
      </div>
    )
  }

  // @TODO - typing the footers as an array of DialogFooter is difficult because
  // casing "child as DialogFooter" causes a problem because
  // "Neither type 'ReactElement<any>' nor type 'DialogFooter' is assignable to the other."
  private _groupChildren(): { footers: any[]; contents: any[] } {
    const groupings: { footers: any[]; contents: any[] } = {
      footers: [],
      contents: []
    }

    React.Children.map(this.props.children, (child) => {
      if (typeof child === "object" && child !== null && (child as any).type === DialogFooterType) {
        groupings.footers.push(child)
      } else {
        groupings.contents.push(child)
      }
    })

    return groupings
  }
}

const GlobalClassNames = {
  contentLgHeader: "ms-Dialog-lgHeader",
  close: "ms-Dialog--close",
  subText: "ms-Dialog-subText",
  header: "ms-Dialog-header",
  headerLg: "ms-Dialog--lgHeader",
  button: "ms-Dialog-button ms-Dialog-button--close",
  inner: "ms-Dialog-inner",
  content: "ms-Dialog-content",
  title: "ms-Dialog-title"
}

export const getDialogContentStyles = (props: IDialogContentStyleProps): IDialogContentStyles => {
  const { className, theme, isLargeHeader, isClose, hidden, isMultiline, draggableHeaderClassName } = props

  const { palette, fonts, effects } = theme

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    content: [
      isLargeHeader && classNames.contentLgHeader,
      isClose && classNames.close,
      {
        flexGrow: 1,
        overflowY: "hidden" // required for allowScrollOnElement
      },
      className
    ],

    subText: [
      classNames.subText,
      isLargeHeader ? fonts.small : fonts.xSmall,
      {
        margin: "0 0 20px 0",
        paddingTop: "8px",
        color: palette.neutralPrimary,
        lineHeight: "1.5",
        wordWrap: "break-word",
        fontWeight: FontWeights.regular
      }
    ],

    header: [
      classNames.header,
      {
        position: "relative",
        width: "100%",
        boxSizing: "border-box"
      },
      isLargeHeader && [
        classNames.headerLg,
        {
          backgroundColor: palette.themePrimary
        }
      ],
      isClose && classNames.close,
      draggableHeaderClassName && [
        draggableHeaderClassName,
        {
          cursor: "move"
        }
      ]
    ],

    button: [
      classNames.button,
      hidden && {
        selectors: {
          ".ms-Icon.ms-Icon--Cancel": {
            color: palette.neutralSecondary,
            fontSize: "16px"
          }
        }
      }
    ],

    inner: [
      classNames.inner,
      {
        padding: "0 24px 24px"
      }
    ],

    innerContent: [
      classNames.content,
      {
        position: "relative",
        width: "100%"
      }
    ],

    title: [
      classNames.title,
      fonts.mediumPlus,
      {
        color: palette.neutralPrimary,
        margin: "0",
        padding: "16px 46px 24px 24px",
        fontSize: 20, // TODO: after updating the type ramp this needs reevaluated
        fontWeight: FontWeights.semibold,
        lineHeight: "normal"
      },
      isLargeHeader && [
        fonts.xLarge,
        {
          color: palette.white,
          marginBottom: "8px",
          padding: "22px 24px",
          fontWeight: FontWeights.semibold
        }
      ],
      isMultiline && fonts.xLarge
    ],

    topButton: [
      {
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        position: "absolute",
        top: "0",
        right: "0",
        padding: "14px 14px 0 0",

        selectors: {
          "> *": {
            flex: "0 0 auto"
          },
          ".ms-Dialog-button": {
            color: palette.neutralSecondary
          },
          ".ms-Dialog-button:hover": {
            color: palette.neutralDark,
            borderRadius: effects.roundedCorner2
          }
        }
      }
    ]
  }
}

export const DialogContent: React.FunctionComponent<IDialogContentProps> = styled<
  IDialogContentProps,
  IDialogContentStyleProps,
  IDialogContentStyles
>(DialogContentBase, getDialogContentStyles, undefined, { scope: "DialogContent" })

export interface IDialogContent {}

export interface IDialogContentProps extends React.ClassAttributes<DialogContentBase> {
  /**
   * Optional callback to access the IDialogContent interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IDialogContent>

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<IDialogContentStyleProps, IDialogContentStyles>

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Is inside a multiline wrapper
   */
  isMultiline?: boolean

  /**
   * Show an 'x' close button in the upper-right corner
   */
  showCloseButton?: boolean

  /**
   * Other top buttons that will show up next to the close button
   */
  topButtonsProps?: IButtonProps[]

  /**
   * Optional override class name
   */
  className?: string

  /**
   * A callback function for when the Dialog is dismissed from the close button or light dismiss, before the animation completes.
   */
  onDismiss?: (ev?: React.MouseEvent<HTMLButtonElement>) => any

  /**
   * The Id for subText container
   */
  subTextId?: string

  /**
   * The subtext to display in the dialog
   */
  subText?: string

  /**
   * The Id for title container
   */
  titleId?: string

  /**
   * The title text to display at the top of the dialog.
   */
  title?: string | JSX.Element

  /**
   * Responsive mode passed in from decorator.
   */
  responsiveMode?: any //ResponsiveMode;

  /**
   * Label to be passed to to aria-label of close button
   * @defaultvalue Close
   */
  closeButtonAriaLabel?: string

  /**
   * The type of Dialog to display.
   * @defaultvalue DialogType.normal
   */
  type?: DialogType

  /**
   * The classname for when the header is draggable
   */
  draggableHeaderClassName?: string
}

/**
 * {@docCategory Dialog}
 */
export enum DialogType {
  /** Standard dialog */
  normal = 0,
  /** Dialog with large header banner */
  largeHeader = 1,
  /** Dialog with an 'x' close button in the upper-right corner */
  close = 2
}

/**
 * {@docCategory Dialog}
 */
export interface IDialogContentStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  isLargeHeader?: boolean
  isClose?: boolean
  hidden?: boolean

  /**
   * Is inside a multiline wrapper
   */
  isMultiline?: boolean

  /**
   * The classname for when the header is draggable
   */
  draggableHeaderClassName?: string
}

/**
 * {@docCategory Dialog}
 */
export interface IDialogContentStyles {
  /**
   * Style for the content element.
   */
  content: IStyle
  subText: IStyle
  header: IStyle
  button: IStyle
  inner: IStyle
  innerContent: IStyle
  title: IStyle
  topButton: IStyle
}
