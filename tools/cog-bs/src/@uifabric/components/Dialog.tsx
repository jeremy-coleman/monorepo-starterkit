import { classNamesFunction, ICSSPixelUnitRule, ICSSRule, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, ITheme, ScreenWidthMinMedium } from "@uifabric/styleguide"
import { getId, IAccessiblePopupProps, IRefObject } from "@uifabric/styleguide"
import * as React from "react"
import { IButtonProps } from "./Buttons/Button"
import { DialogContent, DialogType, IDialogContentProps } from "./DialogContent"
import { ILayerProps } from "./Layer"
import { IDragOptions, IModalProps, Modal } from "./Modal"

const DefaultModalProps: IModalProps = {
  isDarkOverlay: false,
  isBlocking: false,
  className: "",
  containerClassName: "",
  topOffsetFixed: false
}

const DefaultDialogContentProps: IDialogContentProps = {
  type: DialogType.normal,
  className: "",
  topButtonsProps: []
}

//@withResponsiveMode
export class DialogBase extends React.Component<IDialogProps, {}> {
  public static defaultProps: IDialogProps = {
    hidden: true
  }

  private _id: string
  private _defaultTitleTextId: string
  private _defaultSubTextId: string

  constructor(props: IDialogProps) {
    super(props)

    this._id = getId("Dialog")
    this._defaultTitleTextId = this._id + "-title"
    this._defaultSubTextId = this._id + "-subText"

    // if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    //   warnDeprecations('Dialog', props, {
    //     isOpen: 'hidden',
    //     type: 'dialogContentProps.type',
    //     subText: 'dialogContentProps.subText',
    //     contentClassName: 'dialogContentProps.className',
    //     topButtonsProps: 'dialogContentProps.topButtonsProps',
    //     className: 'modalProps.className',
    //     isDarkOverlay: 'modalProps.isDarkOverlay',
    //     isBlocking: 'modalProps.isBlocking',
    //     containerClassName: 'modalProps.containerClassName',
    //     onDismissed: 'modalProps.onDismissed',
    //     onLayerDidMount: 'modalProps.layerProps.onLayerDidMount',
    //     ariaDescribedById: 'modalProps.subtitleAriaId',
    //     ariaLabelledById: 'modalProps.titleAriaId'
    //   });
    // }
  }

  public render(): JSX.Element {
    const {
      className,
      containerClassName,
      contentClassName,
      elementToFocusOnDismiss,
      firstFocusableSelector,
      forceFocusInsideTrap,
      styles,
      hidden,
      ignoreExternalFocusing,
      isBlocking,
      isClickableOutsideFocusTrap,
      isDarkOverlay,
      isOpen,
      onDismiss,
      onDismissed,
      onLayerDidMount,
      //responsiveMode,
      subText,
      theme,
      title,
      topButtonsProps,
      type,
      minWidth,
      maxWidth,
      modalProps
    } = this.props

    const mergedLayerProps: ILayerProps = {
      ...(modalProps ? modalProps.layerProps : { onLayerDidMount })
    }
    if (onLayerDidMount && !mergedLayerProps.onLayerDidMount) {
      mergedLayerProps.onLayerDidMount = onLayerDidMount
    }

    let dialogDraggableClassName: string | undefined
    let dragOptions: IDragOptions | undefined

    // if we are draggable, make sure we are using the correct
    // draggable classname and selectors
    if (modalProps && modalProps.dragOptions && !modalProps.dragOptions.dragHandleSelector) {
      dialogDraggableClassName = "ms-Dialog-draggable-header"
      dragOptions = {
        ...modalProps.dragOptions,
        dragHandleSelector: `.${dialogDraggableClassName}`
      }
    } else {
      dragOptions = modalProps && modalProps.dragOptions
    }

    const mergedModalProps = {
      ...DefaultModalProps,
      ...modalProps,
      layerProps: mergedLayerProps,
      dragOptions
    }

    const dialogContentProps: IDialogContentProps = {
      ...DefaultDialogContentProps,
      ...this.props.dialogContentProps,
      draggableHeaderClassName: dialogDraggableClassName
    }

    const classNames = classNamesFunction<IDialogStyleProps, IDialogStyles>()(styles!, {
      theme: theme!,
      className: className || mergedModalProps.className,
      containerClassName: containerClassName || mergedModalProps.containerClassName,
      hidden,
      dialogDefaultMinWidth: minWidth,
      dialogDefaultMaxWidth: maxWidth
    })

    return (
      <Modal
        elementToFocusOnDismiss={elementToFocusOnDismiss}
        firstFocusableSelector={firstFocusableSelector}
        forceFocusInsideTrap={forceFocusInsideTrap}
        ignoreExternalFocusing={ignoreExternalFocusing}
        isClickableOutsideFocusTrap={isClickableOutsideFocusTrap}
        onDismissed={onDismissed}
        //responsiveMode={responsiveMode}
        {...mergedModalProps}
        isDarkOverlay={isDarkOverlay !== undefined ? isDarkOverlay : mergedModalProps.isDarkOverlay}
        isBlocking={isBlocking !== undefined ? isBlocking : mergedModalProps.isBlocking}
        isOpen={isOpen !== undefined ? isOpen : !hidden}
        className={classNames.root}
        containerClassName={classNames.main}
        onDismiss={onDismiss ? onDismiss : mergedModalProps.onDismiss}
        subtitleAriaId={this._getSubTextId()}
        titleAriaId={this._getTitleTextId()}
      >
        <DialogContent
          titleId={this._defaultTitleTextId}
          subTextId={this._defaultSubTextId}
          title={title}
          subText={subText}
          showCloseButton={isBlocking !== undefined ? !isBlocking : !mergedModalProps.isBlocking}
          topButtonsProps={topButtonsProps ? topButtonsProps : dialogContentProps!.topButtonsProps}
          type={type !== undefined ? type : dialogContentProps!.type}
          onDismiss={onDismiss ? onDismiss : dialogContentProps!.onDismiss}
          className={contentClassName || dialogContentProps!.className}
          {...dialogContentProps}
        >
          {this.props.children}
        </DialogContent>
      </Modal>
    )
  }

  private _getSubTextId = (): string | undefined => {
    const { ariaDescribedById, modalProps, dialogContentProps, subText } = this.props
    let id = ariaDescribedById || (modalProps && modalProps.subtitleAriaId)

    if (!id) {
      id = (subText || (dialogContentProps && dialogContentProps.subText)) && this._defaultSubTextId
    }

    return id
  }

  private _getTitleTextId = (): string | undefined => {
    const { ariaLabelledById, modalProps, dialogContentProps, title } = this.props
    let id = ariaLabelledById || (modalProps && modalProps.titleAriaId)

    if (!id) {
      id = (title || (dialogContentProps && dialogContentProps.title)) && this._defaultTitleTextId
    }

    return id
  }
}

const GlobalClassNames = {
  root: "ms-Dialog"
}

export const getDialogStyles = (props: IDialogStyleProps): IDialogStyles => {
  const { className, containerClassName, dialogDefaultMinWidth = "288px", dialogDefaultMaxWidth = "340px", hidden, theme } = props

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [classNames.root, theme.fonts.small, className],

    main: [
      {
        width: dialogDefaultMinWidth,
        outline: "3px solid transparent",

        selectors: {
          [`@media (min-width: ${ScreenWidthMinMedium}px)`]: {
            width: "auto",
            maxWidth: dialogDefaultMaxWidth,
            minWidth: dialogDefaultMinWidth
          }
        }
      },
      !hidden && { display: "flex" },
      containerClassName
    ]
  }
}

export const Dialog: React.FunctionComponent<IDialogProps> = styled<IDialogProps, IDialogStyleProps, IDialogStyles>(
  DialogBase,
  getDialogStyles,
  undefined,
  { scope: "Dialog" }
)

export interface IDialog {}

export interface IDialogProps extends React.ClassAttributes<DialogBase>, IAccessiblePopupProps {
  /**
   * Optional callback to access the IDialog interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IDialog>

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<IDialogStyleProps, IDialogStyles>

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Props to be passed through to Dialog Content
   */
  dialogContentProps?: IDialogContentProps

  /**
   * A callback function for when the Dialog is dismissed from the close button or light dismiss.
   * Can also be specified separately in content and modal.
   */
  onDismiss?: (ev?: React.MouseEvent<HTMLButtonElement>) => any

  /**
   * Whether the dialog is hidden.
   * @defaultvalue true
   */
  hidden?: boolean

  /**
   * Props to be passed through to Modal
   */
  modalProps?: IModalProps

  /**
   * Whether the dialog is displayed.
   * Deprecated, use `hidden` instead.
   * @defaultvalue false
   * @deprecated Use `hidden` instead
   */
  isOpen?: boolean

  /**
   * Whether the overlay is dark themed.
   * @defaultvalue true
   * @deprecated Pass through via `modalProps` instead
   */
  isDarkOverlay?: boolean

  /**
   * A callback function which is called after the Dialog is dismissed and the animation is complete.
   * @deprecated Pass through via `modalProps` instead
   */
  onDismissed?: () => any

  /**
   * Whether the dialog can be light dismissed by clicking outside the dialog (on the overlay).
   * @defaultvalue false
   * @deprecated Pass through via `modalProps` instead
   */
  isBlocking?: boolean

  /**
   * Optional class name to be added to the root class
   * @deprecated Pass through via `modalProps.className` instead
   */
  className?: string

  /**
   * Optional override for container class
   * @deprecated Pass through via `modalProps.className` instead
   */
  containerClassName?: string

  /**
   * A callback function for when the Dialog content is mounted on the overlay layer
   * @deprecated Pass through via `modalProps.layerProps` instead
   */
  onLayerDidMount?: () => void

  /**
   * Deprecated at 0.81.2, use `onLayerDidMount` instead.
   * @deprecated Use `onLayerDidMount` instead.
   */
  onLayerMounted?: () => void

  /**
   * The type of Dialog to display.
   * @defaultvalue DialogType.normal
   * @deprecated Pass through via `dialogContentProps` instead.
   */
  type?: DialogType

  /**
   * The title text to display at the top of the dialog.
   * @deprecated Pass through via `dialogContentProps` instead.
   */
  title?: string | JSX.Element

  /**
   * The subtext to display in the dialog.
   * @deprecated Pass through via `dialogContentProps` instead.
   */
  subText?: string

  /**
   * Optional override content class
   * @deprecated Pass through via `dialogContentProps` instead as `className`.
   */
  contentClassName?: string

  /**
   * Other top buttons that will show up next to the close button
   * @deprecated Pass through via `dialogContentProps` instead.
   */
  topButtonsProps?: IButtonProps[]

  /**
   * Optional id for aria-LabelledBy
   * @deprecated Pass through via `modalProps.titleAriaId` instead.
   */
  ariaLabelledById?: string

  /**
   * Optional id for aria-DescribedBy
   * @deprecated Pass through via `modalProps.subtitleAriaId` instead.
   */
  ariaDescribedById?: string

  /**
   * Sets the minimum width of the dialog. It limits the width property to be not
   * smaller than the value specified in min-width.
   */
  minWidth?: ICSSRule | ICSSPixelUnitRule

  /**
   * Sets the maximum width for the dialog. It limits the width property to be larger
   * than the value specified in max-width.
   */
  maxWidth?: ICSSRule | ICSSPixelUnitRule
}

/**
 * {@docCategory Dialog}
 */
export interface IDialogStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * Optional override for container class
   * @deprecated Pass through via `modalProps.className` instead.
   */
  containerClassName?: string

  /**
   * Optional override content class
   * @deprecated Pass through via `dialogContentProps` instead as `className`.
   */
  contentClassName?: string

  /**
   * Whether the dialog is hidden.
   * @defaultvalue false
   */
  hidden?: boolean

  /**
   * Default min-width for the dialog box.
   * @defaultvalue '288px'
   */
  dialogDefaultMinWidth?: string | ICSSRule | ICSSPixelUnitRule

  /**
   * Default max-width for the dialog box.
   * @defaultvalue '340px'
   */
  dialogDefaultMaxWidth?: string | ICSSRule | ICSSPixelUnitRule
}

/**
 * {@docCategory Dialog}
 */
export interface IDialogStyles {
  /**
   * Style for the root element.
   */
  root: IStyle
  main: IStyle
}
