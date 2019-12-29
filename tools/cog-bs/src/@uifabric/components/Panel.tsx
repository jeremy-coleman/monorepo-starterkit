import {
  classNamesFunction,
  getRTL,
  getWindow,
  IProcessedStyleSet,
  IStyle,
  IStyleFunctionOrObject
} from "@uifabric/styleguide"
import {
  AnimationClassNames,
  AnimationVariables,
  DefaultFontStyles,
  getGlobalClassNames,
  getTheme,
  HighContrastSelector,
  IconFontSizes,
  ITheme,
  ScreenWidthMinLarge,
  ScreenWidthMinMedium,
  ScreenWidthMinUhfMobile,
  ScreenWidthMinXLarge,
  ScreenWidthMinXXLarge
} from "@uifabric/styleguide"
import {
  allowScrollOnElement,
  Async,
  divProperties,
  elementContains,
  EventGroup,
  getId,
  getNativeProps,
  IRefObject,
  IRenderFunction
} from "@uifabric/styleguide"
import * as React from "react"
import { IconButton } from "./Buttons/IconButton"
import { FocusTrapZone, IFocusTrapZoneProps } from "./FocusTrapZone"
import { ILayerProps, Layer } from "./Layer"
import { Overlay } from "./Overlay"
import { Popup } from "./Popup"

export interface IPanel {
  /**
   * Forces the panel to open.
   */
  open: () => void

  /**
   * Forces the panel to dismiss.
   */
  dismiss: (ev?: React.KeyboardEvent<HTMLElement>) => void
}

export interface IPanelProps extends React.HTMLAttributes<Panel> {
  /**
   * Optional callback to access the IPanel interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IPanel>

  /**
   * Whether the panel is displayed.
   * @defaultvalue false
   */
  isOpen?: boolean

  /**
   * Has the close button visible.
   * @defaultvalue true
   */
  hasCloseButton?: boolean

  /**
   * Whether the panel can be light dismissed.
   * @defaultvalue false
   */
  isLightDismiss?: boolean

  /**
   * Whether the panel is hidden on dismiss, instead of destroyed in the DOM.
   * Protects the contents from being destroyed when the panel is dismissed.
   * @defaultvalue false
   */
  isHiddenOnDismiss?: boolean

  /**
   * Whether the panel uses a modal overlay or not
   * @defaultvalue true
   */
  isBlocking?: boolean

  /**
   * Determines if content should stretch to fill available space putting footer at the bottom of the page
   * @defaultvalue false
   */
  isFooterAtBottom?: boolean

  /**
   * Header text for the Panel.
   * @defaultvalue ""
   */
  headerText?: string

  /**
   * A callback function for when the Panel is opened, before the animation completes.
   */
  onOpen?: () => void

  /**
   * A callback function for when the Panel is opened, after the animation completes.
   */
  onOpened?: () => void

  /**
   * A callback function for when the panel is closed, before the animation completes.
   * If the panel should NOT be dismissed based on some keyboard event, then simply call ev.preventDefault() on it
   */
  onDismiss?: (ev?: React.SyntheticEvent<HTMLElement>) => void

  /**
   * A callback function which is called after the Panel is dismissed and the animation is complete.
   */
  onDismissed?: () => void

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IPanelStyleProps, IPanelStyles>

  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme

  /**
   * Additional css class to apply to the Panel
   * @defaultvalue undefined
   */
  className?: string

  /**
   * Type of the panel.
   * @defaultvalue PanelType.smallFixedRight
   */
  type?: PanelType

  /**
   * Custom panel width, used only when `type` is set to `PanelType.custom`.
   */
  customWidth?: string

  /**
   * Aria label on close button
   */
  closeButtonAriaLabel?: string

  /**
   * Optional parameter to provider the class name for header text
   */
  headerClassName?: string

  /**
   * Sets the HTMLElement to focus on when exiting the FocusTrapZone.
   * @defaultvalue The element.target that triggered the Panel.
   */
  elementToFocusOnDismiss?: HTMLElement

  /**
   * Indicates if this Panel will ignore keeping track of HTMLElement that activated the Zone.
   * Deprecated, use `focusTrapZoneProps`.
   * @defaultvalue false
   * @deprecated Use `focusTrapZoneProps`.
   */
  ignoreExternalFocusing?: boolean

  /**
   * Indicates whether Panel should force focus inside the focus trap zone.
   * If not explicitly specified, behavior aligns with FocusTrapZone's default behavior.
   * Deprecated, use `focusTrapZoneProps`.
   * @deprecated Use `focusTrapZoneProps`.
   */
  forceFocusInsideTrap?: boolean

  /**
   * Indicates the selector for first focusable item.
   * Deprecated, use `focusTrapZoneProps`.
   * @deprecated Use `focusTrapZoneProps`.
   */
  firstFocusableSelector?: string

  /**
   * Optional props to pass to the FocusTrapZone component to manage focus in the panel.
   */
  focusTrapZoneProps?: IFocusTrapZoneProps

  /**
   * Optional props to pass to the Layer component hosting the panel.
   */
  layerProps?: ILayerProps

  /**
   * Optional custom function to handle clicks outside the panel in lightdismiss mode
   */
  onLightDismissClick?: () => void

  /**
   * Optional custom function to handle clicks outside this component
   */
  onOuterClick?: () => void

  /**
   * Optional custom renderer navigation region. Replaces the region that contains the close button.
   */
  onRenderNavigation?: IRenderFunction<IPanelProps>

  /**
   * Optional custom renderer for content in the navigation region. Replaces current close button.
   */
  onRenderNavigationContent?: IRenderFunction<IPanelProps>

  /**
   * Optional custom renderer for header region. Replaces current title
   */
  onRenderHeader?: IPanelHeaderRenderer

  /**
   * Optional custom renderer for body region. Replaces any children passed into the component.
   */
  onRenderBody?: IRenderFunction<IPanelProps>

  /**
   * Optional custom renderer for footer region. Replaces sticky footer.
   */
  onRenderFooter?: IRenderFunction<IPanelProps>

  /**
   * Custom renderer for content in the sticky footer
   */
  onRenderFooterContent?: IRenderFunction<IPanelProps>

  /**
   * Deprecated property. Serves no function.
   * @deprecated Serves no function.
   */
  componentId?: string
}

/**
 * Renderer function which takes an additional parameter, the ID to use for the element containing
 * the panel's title. This allows the `aria-labelledby` for the panel popup to work correctly.
 * Note that if `headerTextId` is provided, it **must** be used on an element, or screen readers
 * will be confused by the reference to a nonexistent ID.
 * {@docCategory Panel}
 */
export interface IPanelHeaderRenderer extends IRenderFunction<IPanelProps> {
  /**
   * @param props - Props given to the panel
   * @param defaultRender - Default header renderer. If using this renderer in code that does not
   * assign `headerTextId` to an element elsewhere, it **must** be passed to this function.
   * @param headerTextId - If provided, this **must** be used as the ID of an element containing the
   * panel's title, because the panel popup uses this ID as its aria-labelledby.
   */
  (props?: IPanelProps, defaultRender?: IPanelHeaderRenderer, headerTextId?: string | undefined): JSX.Element | null
}

/**
 * {@docCategory Panel}
 */
export enum PanelType {
  /**
   * Renders the Panel with a `fluid` (full screen) width.
   * Recommended for use on small screen breakpoints.
   * - Small (320-479): full screen width, 16px left/right padding
   * - Medium (480-639): full screen width, 16px left/right padding
   * - Large (640-1023): full screen width, 32px left/right padding
   * - XLarge (1024-1365): full screen width, 32px left/right padding
   * - XXLarge (1366-up): full screen width, 40px left/right padding
   */
  smallFluid = 0,

  /**
   * Renders the Panel in fixed-width `small` size, anchored to the far side (right in LTR mode).
   * - Small (320-479): adapts to `PanelType.smallFluid` at this breakpoint
   * - Medium (480-639): 340px width, 16px left/right padding
   * - Large (640-1023): 340px width, 32px left/right padding
   * - XLarge (1024-1365): 340px width, 32px left/right padding
   * - XXLarge (1366-up): 340px width, 40px left/right padding
   */
  smallFixedFar = 1,

  /**
   * Renders the Panel in fixed-width `small` size, anchored to the near side (left in LTR mode).
   * - Small (320-479): 272px width, 16px left/right padding
   * - Medium (480-639): 272px width, 16px left/right padding
   * - Large (640-1023): 272px width, 32px left/right padding
   * - XLarge (1024-1365): 272px width, 32px left/right padding
   * - XXLarge (1366-up): 272px width, 40px left/right padding
   */
  smallFixedNear = 2,

  /**
   * Renders the Panel in `medium` size, anchored to the far side (right in LTR mode).
   * - Small (320-479): adapts to `PanelType.smallFluid` at this breakpoint
   * - Medium (480-639): adapts to `PanelType.smallFixedFar` at this breakpoint
   * - Large (640-1023): 592px width, 32px left/right padding
   * - XLarge (1024-1365): 644px width, 32px left/right padding
   * - XXLarge (1366-up): 644px width, 40px left/right padding
   */
  medium = 3,

  /**
   * Renders the Panel in `large` size, anchored to the far side (right in LTR mode).
   * - Small (320-479): adapts to `PanelType.smallFluid` at this breakpoint
   * - Medium (480-639):  adapts to `PanelType.smallFixedFar` at this breakpoint
   * - Large (640-1023): adapts to `PanelType.medium` at this breakpoint
   * - XLarge (1024-1365): 48px fixed left margin, fluid width, 32px left/right padding
   * - XXLarge (1366-up): 428px fixed left margin, fluid width, 40px left/right padding
   */
  large = 4,

  /**
   * Renders the Panel in `large` size, anchored to the far side (right in LTR mode), with a fixed width at XX-Large breakpoint.
   * - Small (320-479): adapts to `PanelType.smallFluid` at this breakpoint
   * - Medium (480-639): adapts to `PanelType.smallFixedFar` at this breakpoint
   * - Large (640-1023): adapts to `PanelType.medium` at this breakpoint
   * - XLarge (1024-1365): 48px fixed left margin, fluid width, 32px left/right padding
   * - XXLarge (1366-up): 940px width, 40px left/right padding
   */
  largeFixed = 5,

  /**
   * Renders the Panel in `extra large` size, anchored to the far side (right in LTR mode).
   * - Small (320-479): adapts to `PanelType.smallFluid` at this breakpoint
   * - Medium (480-639): adapts to `PanelType.smallFixedFar` at this breakpoint
   * - Large (640-1023): adapts to `PanelType.medium` at this breakpoint
   * - XLarge (1024-1365): adapts to `PanelType.large` at this breakpoint
   * - XXLarge (1366-1919): 176px fixed left margin, fluid width, 40px left/right padding
   * - XXXLarge (1920-up): 176px fixed left margin, fluid width, 40px left/right padding
   */
  extraLarge = 6,

  /**
   * Renders the Panel in `custom` size using `customWidth`, anchored to the far side (right in LTR mode).
   * - Has a fixed width provided by the `customWidth` prop
   * - When screen width reaches the `customWidth` value it will behave like a fluid width Panel
   * taking up 100% of the viewport width
   */
  custom = 7,

  /**
   * Renders the Panel in `custom` size using `customWidth`, anchored to the near side (left in LTR mode).
   * - Has a fixed width provided by the `customWidth` prop
   * - When screen width reaches the `customWidth` value it will behave like a fluid width Panel
   * taking up 100% of the viewport width
   */
  customNear = 8
}

/**
 * {@docCategory Panel}
 */
export interface IPanelStyleProps {
  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * Is Panel open
   */
  isOpen?: boolean

  /**
   * Is animation currently running
   */
  isAnimating?: boolean

  /**
   * Is panel on right side
   */
  isOnRightSide?: boolean

  /**
   * Is panel hidden on dismiss
   */
  isHiddenOnDismiss?: boolean

  /**
   * Classname for FocusTrapZone element
   */
  focusTrapZoneClassName?: string

  /**
   * Determines if content should stretch to fill available space putting footer at the bottom of the page
   */
  isFooterAtBottom?: boolean

  /**
   * Based on state value setting footer to sticky or not
   */
  isFooterSticky?: boolean

  /**
   * Panel has close button
   */
  hasCloseButton?: boolean

  /**
   * Type of the panel.
   */
  type?: PanelType

  /**
   * Optional parameter to provider the class name for header text
   */
  headerClassName?: string
}

// TODO -Issue #5689: Comment in once Button is converted to mergeStyles
// export interface IPanelSubComponentStyles {
//   /**
//    * Styling for Icon child component.
//    */
//   // TODO: this should be the interface once we're on TS 2.9.2 but otherwise causes errors in 2.8.4
//   // button: IStyleFunctionOrObject<IButtonStyleProps, IButtonStyles>;
//   button: IStyleFunctionOrObject<any, any>;
// }

/**
 * {@docCategory Panel}
 */
export interface IPanelStyles {
  /**
   * Style for the root element.
   */
  root: IStyle

  /**
   * Style for the overlay element.
   */
  overlay: IStyle

  /**
   * Style for the hidden element.
   */
  hiddenPanel: IStyle

  /**
   * Style for the main section element.
   */
  main: IStyle

  /**
   * Style for the navigation container element.
   */
  commands: IStyle

  /**
   * Style for the Body and Footer container element.
   */
  contentInner: IStyle

  /**
   * Style for the scrollable content area container element.
   */
  scrollableContent: IStyle

  /**
   * Style for the close button container element.
   */
  navigation: IStyle

  /**
   * Style for the close button IconButton element.
   */
  closeButton: IStyle

  /**
   * Style for the header container div element.
   */
  header: IStyle

  /**
   * Style for the header inner p element.
   */
  headerText: IStyle

  /**
   * Style for the body div element.
   */
  content: IStyle

  /**
   * Style for the footer div element.
   */
  footer: IStyle

  /**
   * Style for the inner footer div element.
   */
  footerInner: IStyle

  // TODO -Issue #5689: Comment in once Button is converted to mergeStyles
  /**
   * Styling for subcomponents.
   */
  // subComponentStyles: IPanelSubComponentStyles;
}

// TODO -Issue #5689: Comment in once Button is converted to mergeStyles
// import { IStyleFunctionOrObject } from '../../Utilities';
// import { IButtonStyles, IButtonStyleProps } from '../../Button';

const GlobalClassNames = {
  root: "ms-Panel",
  main: "ms-Panel-main",
  commands: "ms-Panel-commands",
  contentInner: "ms-Panel-contentInner",
  scrollableContent: "ms-Panel-scrollableContent",
  navigation: "ms-Panel-navigation",
  closeButton: "ms-Panel-closeButton ms-PanelAction-close",
  header: "ms-Panel-header",
  headerText: "ms-Panel-headerText",
  content: "ms-Panel-content",
  footer: "ms-Panel-footer",
  footerInner: "ms-Panel-footerInner",
  isOpen: "is-open",
  hasCloseButton: "ms-Panel--hasCloseButton",
  smallFluid: "ms-Panel--smFluid",
  smallFixedNear: "ms-Panel--smLeft",
  smallFixedFar: "ms-Panel--sm",
  medium: "ms-Panel--md",
  large: "ms-Panel--lg",
  largeFixed: "ms-Panel--fixed",
  extraLarge: "ms-Panel--xl",
  custom: "ms-Panel--custom",
  customNear: "ms-Panel--customLeft"
}

const panelWidth = {
  full: "100%",
  auto: "auto",
  xs: 272,
  sm: 340,
  md1: 592,
  md2: 644,
  lg: 940
}

const panelMargin = {
  auto: "auto",
  none: 0,
  md: 48,
  lg: 428,
  xl: 176
}

// Following consts are used below in `getPanelBreakpoints()` function to provide
// necessary fallbacks for different types of Panel in different breakpoints.
const smallPanelSelectors = {
  [`@media (min-width: ${ScreenWidthMinMedium}px)`]: {
    width: panelWidth.sm
  }
}

const mediumPanelSelectors = {
  [`@media (min-width: ${ScreenWidthMinLarge}px)`]: {
    width: panelWidth.md1
  },
  [`@media (min-width: ${ScreenWidthMinXLarge}px)`]: {
    width: panelWidth.md2
  }
}

const largePanelSelectors = {
  [`@media (min-width: ${ScreenWidthMinUhfMobile}px)`]: {
    left: panelMargin.md,
    width: panelWidth.auto
  },
  [`@media (min-width: ${ScreenWidthMinXXLarge}px)`]: {
    left: panelMargin.lg
  }
}

const largeFixedPanelSelectors = {
  [`@media (min-width: ${ScreenWidthMinXXLarge}px)`]: {
    left: panelMargin.auto,
    width: panelWidth.lg
  }
}

const extraLargePanelSelectors = {
  [`@media (min-width: ${ScreenWidthMinXXLarge}px)`]: {
    left: panelMargin.xl
  }
}

// Make sure Panels have fallbacks to different breakpoints by reusing same selectors.
// This is done in the effort to follow design redlines.
const getPanelBreakpoints = (type: PanelType): { [x: string]: IStyle } | undefined => {
  let selectors

  // Panel types `smallFluid`, `smallFixedNear`, `custom` and `customNear`
  // are not checked in here because they render the same in all the breakpoints
  // and have the checks done separately in the `getStyles` function below.
  switch (type) {
    case PanelType.smallFixedFar:
      selectors = {
        ...smallPanelSelectors
      }
      break
    case PanelType.medium:
      selectors = {
        ...smallPanelSelectors,
        ...mediumPanelSelectors
      }
      break
    case PanelType.large:
      selectors = {
        ...smallPanelSelectors,
        ...mediumPanelSelectors,
        ...largePanelSelectors
      }
      break
    case PanelType.largeFixed:
      selectors = {
        ...smallPanelSelectors,
        ...mediumPanelSelectors,
        ...largePanelSelectors,
        ...largeFixedPanelSelectors
      }
      break
    case PanelType.extraLarge:
      selectors = {
        ...smallPanelSelectors,
        ...mediumPanelSelectors,
        ...largePanelSelectors,
        ...extraLargePanelSelectors
      }
      break
    default:
      break
  }

  return selectors
}

const commandBarHeight = "44px"

const sharedPaddingStyles = {
  paddingLeft: "16px",
  paddingRight: "16px",
  selectors: {
    [`@media screen and (min-width: ${ScreenWidthMinLarge}px)`]: {
      paddingLeft: "32px",
      paddingRight: "32px"
    },
    [`@media screen and (min-width: ${ScreenWidthMinXXLarge}px)`]: {
      paddingLeft: "40px",
      paddingRight: "40px"
    }
  }
}

// // TODO -Issue #5689: Comment in once Button is converted to mergeStyles
// function getIconButtonStyles(props: IPanelStyleProps): IStyleFunctionOrObject<IButtonStyleProps, IButtonStyles> {
//   const { theme } = props;
//   return () => ({
//     root: {
//       height: 'auto',
//       width: '44px',
//       color: theme.palette.neutralSecondary,
//       fontSize: IconFontSizes.large
//     },
//     rootHovered: {
//       color: theme.palette.neutralPrimary
//     }
//   });
// }

export const getPanelStyles = (props: IPanelStyleProps): IPanelStyles => {
  const theme = props.theme || getTheme()
  const {
    className,
    focusTrapZoneClassName,
    hasCloseButton,
    headerClassName,
    isAnimating,
    isFooterAtBottom,
    isFooterSticky,
    isOnRightSide,
    isOpen,
    isHiddenOnDismiss,
    //theme,
    type = PanelType.smallFixedFar
  } = props
  const { palette } = theme
  const classNames = getGlobalClassNames(GlobalClassNames, theme)
  const isCustomPanel = type === PanelType.custom || type === PanelType.customNear
  const win = getWindow()
  const windowHeight = typeof win !== "undefined" ? win.innerHeight : "100%"

  return {
    root: [
      classNames.root,
      theme.fonts.medium,
      isOpen && classNames.isOpen,
      hasCloseButton && classNames.hasCloseButton,
      {
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      isCustomPanel && isOnRightSide && classNames.custom,
      isCustomPanel && !isOnRightSide && classNames.customNear,
      className
    ],
    overlay: [
      {
        pointerEvents: "auto",
        cursor: "pointer"
      },
      isOpen && isAnimating && AnimationClassNames.fadeIn100,
      !isOpen && isAnimating && AnimationClassNames.fadeOut100
    ],
    hiddenPanel: [
      !isOpen &&
        !isAnimating &&
        isHiddenOnDismiss && {
          visibility: "hidden"
        }
    ],
    main: [
      classNames.main,
      {
        backgroundColor: palette.white,
        boxShadow: "0px 0px 30px 0px rgba(0,0,0,0.2)",
        pointerEvents: "auto",
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        maxHeight: "100%",
        bottom: 0,
        top: 0,
        // (left, right, width) - Properties to be overridden depending on the type of the Panel and the screen breakpoint.
        left: panelMargin.auto,
        right: panelMargin.none,
        width: panelWidth.full,
        selectors: {
          ["@supports (-webkit-overflow-scrolling: touch)"]: {
            maxHeight: windowHeight
          },
          [HighContrastSelector]: {
            borderLeft: `3px solid ${palette.neutralLight}`,
            borderRight: `3px solid ${palette.neutralLight}`
          },
          ...getPanelBreakpoints(type)
        }
      },
      type === PanelType.smallFluid && {
        left: panelMargin.none
      },
      type === PanelType.smallFixedNear && {
        left: panelMargin.none,
        right: panelMargin.auto,
        width: panelWidth.xs
      },
      type === PanelType.customNear && {
        right: "auto",
        left: 0
      },
      isCustomPanel && {
        maxWidth: "100vw"
      },
      isFooterAtBottom && {
        height: "100%",
        selectors: {
          ["@supports (-webkit-overflow-scrolling: touch)"]: {
            height: windowHeight
          }
        }
      },
      isOpen && isAnimating && !isOnRightSide && AnimationClassNames.slideRightIn40,
      isOpen && isAnimating && isOnRightSide && AnimationClassNames.slideLeftIn40,
      !isOpen && isAnimating && !isOnRightSide && AnimationClassNames.slideLeftOut40,
      !isOpen && isAnimating && isOnRightSide && AnimationClassNames.slideRightOut40,
      focusTrapZoneClassName
    ],
    commands: [classNames.commands],
    navigation: [
      classNames.navigation,
      {
        padding: "0 5px",
        height: commandBarHeight,
        display: "flex",
        justifyContent: "flex-end"
      }
    ],
    closeButton: [classNames.closeButton],
    contentInner: [
      classNames.contentInner,
      {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        maxHeight: "100%",
        overflowY: "hidden",
        selectors: {
          ["@supports (-webkit-overflow-scrolling: touch)"]: {
            maxHeight: windowHeight
          }
        }
      },
      isFooterAtBottom && {
        height: "100%",
        selectors: {
          ["@supports (-webkit-overflow-scrolling: touch)"]: {
            height: windowHeight
          }
        }
      }
    ],
    header: [
      classNames.header,
      sharedPaddingStyles,
      {
        margin: "14px 0",
        // Ensure that title doesn't shrink if screen is too small
        flexGrow: 0,
        selectors: {
          [`@media (min-width: ${ScreenWidthMinXLarge}px)`]: {
            marginTop: "30px"
          }
        }
      }
    ],
    headerText: [
      classNames.headerText,
      DefaultFontStyles.xLarge,
      {
        color: palette.neutralPrimary,
        lineHeight: "32px",
        margin: 0
      },
      headerClassName
    ],
    scrollableContent: [
      classNames.scrollableContent,
      {
        overflowY: "auto",
        height: "100%",
        selectors: {
          ["@supports (-webkit-overflow-scrolling: touch)"]: {
            height: windowHeight
          }
        }
      }
    ],
    content: [
      classNames.content,
      sharedPaddingStyles,
      {
        marginBottom: 0,
        paddingBottom: 20
      }
    ],
    footer: [
      classNames.footer,
      {
        // Ensure that footer doesn't shrink if screen is too small
        flexGrow: 0,
        borderTop: "1px solid transparent",
        transition: `opacity ${AnimationVariables.durationValue3} ${AnimationVariables.easeFunction2}`
      },
      isFooterSticky && {
        background: palette.white,
        borderTopColor: palette.neutralLight
      }
    ],
    footerInner: [
      classNames.footerInner,
      sharedPaddingStyles,
      {
        paddingBottom: "20px",
        paddingTop: "20px"
      }
    ]
    // subComponentStyles: {
    //   iconButton: getIconButtonStyles(props)
    // }
  }
}


export interface IPanelState {
  isFooterSticky?: boolean
  isAnimating?: boolean
  id?: string
}

export class Panel extends React.Component<IPanelProps, IPanelState> implements IPanel {
  public static defaultProps: IPanelProps = {
    isHiddenOnDismiss: false,
    isOpen: false,
    isBlocking: true,
    hasCloseButton: true,
    type: PanelType.smallFixedFar
  }

  _panel = React.createRef<HTMLDivElement>()
  _classNames: IProcessedStyleSet<IPanelStyles>
  _scrollableContent: HTMLDivElement | null
  _isOpen: boolean
  _events: EventGroup
  _async: Async

  constructor(props: IPanelProps) {
    super(props)

    // this._warnDeprecations({
    //   ignoreExternalFocusing: 'focusTrapZoneProps',
    //   forceFocusInsideTrap: 'focusTrapZoneProps',
    //   firstFocusableSelector: 'focusTrapZoneProps'
    // });

    this._events = new EventGroup(window)
    this._async = new Async()
    this._isOpen = !!props.isOpen

    this.state = {
      isFooterSticky: false,
      isAnimating: false,
      id: getId("Panel")
    }
  }

  public componentDidMount(): void {
    // @ts-ignore
    getWindow().addEventListener("dismiss:panel", this.dismiss)

    this._events.on(window, "resize", this._updateFooterPosition)

    if (this._shouldListenForOuterClick(this.props)) {
      //getDocument().body.addEventListener('mousedown', this._dismissOnOuterClick, true)

      this._events.on(document.body, "mousedown", this._dismissOnOuterClick, true)
    }

    if (this.props.isOpen) {
      this.open()
    }
  }

  public componentDidUpdate(previousProps: IPanelProps): void {
    const shouldListenOnOuterClick = this._shouldListenForOuterClick(this.props)
    const previousShouldListenOnOuterClick = this._shouldListenForOuterClick(previousProps)

    if (shouldListenOnOuterClick && !previousShouldListenOnOuterClick) {
      this._events.on(document.body, "mousedown", this._dismissOnOuterClick, true)
    } else if (!shouldListenOnOuterClick && previousShouldListenOnOuterClick) {
      this._events.off(document.body, "mousedown", this._dismissOnOuterClick, true)
    }
  }

  public UNSAFE_componentWillReceiveProps(newProps: IPanelProps): void {
    if (newProps.isOpen !== this._isOpen) {
      if (newProps.isOpen) {
        this.open()
      } else {
        this.dismiss()
      }
    }
  }

  componentWillUnmount() {
    //@ts-ignore
    window.removeEventListener("dismiss:panel", this.dismiss)
  }

  public dismiss = (ev?: React.SyntheticEvent<HTMLElement>): void => {
    if (this._isOpen) {
      this._isOpen = false
      if (this.props.onDismiss) {
        this.props.onDismiss(ev)
      }

      if (!ev || (ev && !ev.defaultPrevented)) {
        this.setState(
          {
            isAnimating: true
          },
          () => {
            this._async.setTimeout(this._onTransitionComplete, 200)
          }
        )
      }
    }
  }

  public render(): JSX.Element | null {
    const {
      className = "",
      elementToFocusOnDismiss,
      firstFocusableSelector,
      focusTrapZoneProps,
      forceFocusInsideTrap,
      hasCloseButton,
      headerText,
      headerClassName = "",
      ignoreExternalFocusing,
      isBlocking,
      isFooterAtBottom,
      isLightDismiss,
      isHiddenOnDismiss,
      layerProps,
      type,
      styles,
      theme,
      customWidth,
      onLightDismissClick = this._onPanelClick,
      onRenderNavigation = this._onRenderNavigation,
      onRenderHeader = this._onRenderHeader,
      onRenderBody = this._onRenderBody,
      onRenderFooter = this._onRenderFooter
    } = this.props
    const { isFooterSticky, isAnimating, id } = this.state
    const isLeft = type === PanelType.smallFixedNear || type === PanelType.customNear ? true : false
    const isRTL = getRTL()
    const isOnRightSide = isRTL ? isLeft : !isLeft
    const headerTextId = headerText && id + "-headerText"
    const customWidthStyles = type === PanelType.custom || type === PanelType.customNear ? { width: customWidth } : {}
    const nativeProps = getNativeProps(this.props, divProperties)

    const isOpen = this._isOpen

    if (!isOpen && !isAnimating && !isHiddenOnDismiss) {
      return null
    }

    this._classNames = classNamesFunction<IPanelStyleProps, IPanelStyles>()(getPanelStyles(this.props)!, {
      theme: theme!,
      className,
      focusTrapZoneClassName: focusTrapZoneProps ? focusTrapZoneProps.className : undefined,
      hasCloseButton,
      headerClassName,
      isAnimating,
      isFooterAtBottom,
      isFooterSticky,
      isOnRightSide,
      isOpen,
      isHiddenOnDismiss,
      type
    })

    const { _classNames } = this

    let overlay
    if (isBlocking && isOpen) {
      overlay = <Overlay className={_classNames.overlay} isDarkThemed={false} onClick={isLightDismiss ? onLightDismissClick : undefined} />
    }

    const header = onRenderHeader(this.props, this._onRenderHeader, headerTextId)

    return (
      <Layer {...layerProps}>
        <Popup
          role="dialog"
          aria-modal="true"
          ariaLabelledBy={header ? headerTextId : undefined}
          onDismiss={this.dismiss}
          className={_classNames.hiddenPanel}
        >
          <div aria-hidden={!isOpen && isAnimating} {...nativeProps} ref={this._panel} className={_classNames.root}>
            {overlay}
            <FocusTrapZone
              ignoreExternalFocusing={ignoreExternalFocusing}
              forceFocusInsideTrap={!isBlocking || (isHiddenOnDismiss && !isOpen) ? false : forceFocusInsideTrap}
              firstFocusableSelector={firstFocusableSelector}
              isClickableOutsideFocusTrap={true}
              {...focusTrapZoneProps}
              className={_classNames.main}
              style={customWidthStyles}
              elementToFocusOnDismiss={elementToFocusOnDismiss}
            >
              <div className={_classNames.commands} data-is-visible={true}>
                {onRenderNavigation(this.props, this._onRenderNavigation)}
              </div>
              <div className={_classNames.contentInner}>
                {header}
                <div ref={this._allowScrollOnPanel} className={_classNames.scrollableContent} data-is-scrollable={true}>
                  {onRenderBody(this.props, this._onRenderBody)}
                </div>
                {onRenderFooter(this.props, this._onRenderFooter)}
              </div>
            </FocusTrapZone>
          </div>
        </Popup>
      </Layer>
    )
  }

  public open() {
    if (!this._isOpen) {
      this._isOpen = true
      this.setState(
        {
          isAnimating: true
        },
        () => {
          this._async.setTimeout(this._onTransitionComplete, 200)
        }
      )

      if (this.props.onOpen) {
        this.props.onOpen()
      }
    }
  }

  // Allow the user to scroll within the panel but not on the body
  private _allowScrollOnPanel = (elt: HTMLDivElement | null): void => {
    if (elt) {
      allowScrollOnElement(elt, this._events)
    } else {
      this._events.off(this._scrollableContent)
    }
    this._scrollableContent = elt
  }

  private _shouldListenForOuterClick(props: IPanelProps): boolean {
    return !!props.isBlocking && !!props.isOpen
  }

  private _onRenderNavigation = (props: IPanelProps): JSX.Element | null => {
    if (!this.props.onRenderNavigationContent && !this.props.onRenderNavigation && !this.props.hasCloseButton) {
      return null
    }
    const { onRenderNavigationContent = this._onRenderNavigationContent } = this.props
    return <div className={this._classNames.navigation}>{onRenderNavigationContent(props, this._onRenderNavigationContent)}</div>
  }

  private _onRenderNavigationContent = (props: IPanelProps): JSX.Element | null => {
    const { closeButtonAriaLabel, hasCloseButton } = props
    const theme = getTheme()
    if (hasCloseButton) {
      // TODO -Issue #5689: Comment in once Button is converted to mergeStyles
      // const iconButtonStyles = this._classNames.subComponentStyles
      // ? (this._classNames.subComponentStyles.iconButton as IStyleFunctionOrObject<IButtonStyleProps, IButtonStyles>)
      // : undefined;
      return (
        <IconButton
          // TODO -Issue #5689: Comment in once Button is converted to mergeStyles
          // className={iconButtonStyles}
          styles={{
            root: {
              height: "auto",
              width: "44px",
              color: theme.palette.neutralSecondary,
              fontSize: IconFontSizes.large
            },
            rootHovered: {
              color: theme.palette.neutralPrimary
            }
          }}
          className={this._classNames.closeButton}
          onClick={this._onPanelClick}
          ariaLabel={closeButtonAriaLabel}
          title={closeButtonAriaLabel}
          data-is-visible={true}
          iconProps={{ iconName: "Cancel" }}
        />
      )
    }
    return null
  }

  private _onRenderHeader = (
    props: IPanelProps,
    defaultRender?: (props?: IPanelProps) => JSX.Element | null,
    headerTextId?: string | undefined
  ): JSX.Element | null => {
    const { headerText } = props

    if (headerText) {
      return (
        <div className={this._classNames.header}>
          <p className={this._classNames.headerText} id={headerTextId} role="heading" aria-level={2}>
            {headerText}
          </p>
        </div>
      )
    }
    return null
  }

  private _onRenderBody = (props: IPanelProps): JSX.Element => {
    return <div className={this._classNames.content}>{props.children}</div>
  }

  private _onRenderFooter = (props: IPanelProps): JSX.Element | null => {
    const { onRenderFooterContent = null } = this.props
    if (onRenderFooterContent) {
      return (
        <div className={this._classNames.footer}>
          <div className={this._classNames.footerInner}>{onRenderFooterContent()}</div>
        </div>
      )
    }
    return null
  }

  private _updateFooterPosition(): void {
    const scrollableContent = this._scrollableContent
    if (scrollableContent) {
      const height = scrollableContent.clientHeight
      const innerHeight = scrollableContent.scrollHeight

      this.setState({
        isFooterSticky: height < innerHeight ? true : false
      })
    }
  }

  private _dismissOnOuterClick(ev: any): void {
    const panel = this._panel.current
    if (this._isOpen && panel) {
      if (!elementContains(panel, ev.target)) {
        if (this.props.onOuterClick) {
          this.props.onOuterClick()
          ev.preventDefault()
        } else {
          this.dismiss()
        }
      }
    }
  }

  private _onPanelClick = (ev?: any): void => {
    this.dismiss(ev)
  }

  private _onTransitionComplete = (): void => {
    this._updateFooterPosition()
    this.setState({
      isAnimating: false
    })

    if (this._isOpen && this.props.onOpened) {
      this.props.onOpened()
    }

    if (!this._isOpen && this.props.onDismissed) {
      this.props.onDismissed()
    }
  }
}

// export const Panel1: React.StatelessComponent<IPanelProps> = styled<IPanelProps, IPanelStyleProps, IPanelStyles>(
//   PanelBase,
//   getPanelStyles,
//   undefined,
//   {
//     scope: 'Panel'
//   }
// );
