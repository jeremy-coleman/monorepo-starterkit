import {
  classNamesFunction,
  getDocument,
  IProcessedStyleSet,
  IRawStyle,
  IsFocusVisibleClassName,
  isIOS,
  isMac,
  IStyle,
  IStyleFunction,
  IStyleFunctionOrObject,
  styled
} from "@uifabric/styleguide"
import {
  FontSizes,
  FontWeights,
  getGlobalClassNames,
  HighContrastSelector,
  HighContrastSelectorWhite,
  ITheme,
  normalize
} from "@uifabric/styleguide"
import {
  DirectionalHint,
  divProperties,
  findIndex,
  getFirstFocusable,
  getId,
  getLastFocusable,
  getNativeProps,
  ICalloutPositionedInfo,
  initializeComponentRef,
  IRenderFunction,
  KeyCodes,
  mergeAriaAttributeValues,
  RectangleEdge,
  safeRequestAnimationFrame,
  warnDeprecations,
  warnMutuallyExclusive
} from "@uifabric/styleguide"
import * as React from "react"
import { ActionButton } from "./Buttons/ActionButton"
import { Callout } from "./Callout"
import { Checkbox } from "./Checkbox"
import { FocusZone, FocusZoneDirection } from "./FocusZone"
import { Icon } from "./Icon"
import { IKeytipProps } from "./Keytip"
import { KeytipData } from "./KeytipData"
import { ILabelStyleProps, ILabelStyles, Label } from "./Label"
import { IPanelStyleProps, IPanelStyles, Panel } from "./Panel"
import { ISelectableDroppableTextProps, ISelectableOption, SelectableOptionMenuItemType } from "./Selectable"

/**
 * A utility class to cache size and position in cache.
 *
 * Dropdown options has non-selectable display types. It is therefore not cheap to determine
 * the total number of actual selectable options as well as the position an option is in the
 * list of options - O(n) cost for each lookup.
 *
 * Given that we potentially have to make this determination on every single render pass, this
 * cache should provide a little bit of relief.
 */
export class DropdownSizePosCache {
  private _displayOnlyOptionsCache: number[]
  private _size = 0

  /**
   * Invalidates the cache and recalculate the size of selectable options.
   */
  public updateOptions(options: IDropdownOption[]) {
    const displayOnlyOptionsCache = []
    let size = 0
    for (let i = 0; i < options.length; i++) {
      if (options[i].itemType === DropdownMenuItemType.Divider || options[i].itemType === DropdownMenuItemType.Header) {
        displayOnlyOptionsCache.push(i)
      } else {
        size++
      }
    }

    this._size = size
    this._displayOnlyOptionsCache = displayOnlyOptionsCache
  }

  /**
   * The size of all the selectable options.
   */
  public get optionSetSize(): number {
    return this._size
  }

  /**
   * Returns the position of this option element relative to the full set of selectable option elements.
   * Note: the first selectable element is position 1 in the set.
   * @param index The raw index of the option element.
   */
  public positionInSet(index: number | undefined): number | undefined {
    if (index === undefined) {
      return undefined
    }

    // we could possibly memoize this too but this should be good enough, most of the time (the expectation is that
    // when you have a lot of options, the selectable options will heavily dominate over the non-selectable options.
    let offset = 0
    while (index > this._displayOnlyOptionsCache[offset]) {
      offset++
    }

    if (this._displayOnlyOptionsCache[offset] === index) {
      throw new Error(`Unexpected: Option at index ${index} is not a selectable element.`)
    }

    return index - offset + 1
  }
}

export interface IDropdown {
  focus: (shouldOpenOnFocus?: boolean) => void
}

/**
 * {@docCategory Dropdown}
 */
export interface IDropdownProps extends ISelectableDroppableTextProps<IDropdown, HTMLDivElement> {
  /**
   * Input placeholder text. Displayed until option is selected.
   * @deprecated Use `placeholder`
   */
  placeHolder?: string

  /**
   * Options for the dropdown. If using `defaultSelectedKey` or `defaultSelectedKeys`, options must be
   * pure for correct behavior.
   */
  options: IDropdownOption[]

  /**
   * Callback issued when the selected option changes.
   */
  onChange?: (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => void

  /**
   * @deprecated Use `onChange` instead.
   */
  onChanged?: (option: IDropdownOption, index?: number) => void

  /**
   * Callback issues when the options callout is dismissed
   */
  onDismiss?: () => void

  /**
   * Optional custom renderer for placeholder text
   */
  onRenderPlaceholder?: IRenderFunction<IDropdownProps>

  /**
   * Optional custom renderer for placeholder text
   * @deprecated Use `onRenderPlaceholder`
   */
  onRenderPlaceHolder?: IRenderFunction<IDropdownProps>

  /**
   * Optional custom renderer for selected option displayed in input
   */
  onRenderTitle?: IRenderFunction<IDropdownOption[]>

  /**
   * Optional custom renderer for chevron icon
   */
  onRenderCaretDown?: IRenderFunction<IDropdownProps>

  /**
   * Custom width for dropdown. If value is 0, width of the input field is used.
   * @defaultvalue 0
   */
  dropdownWidth?: number

  /**
   * Pass in ResponsiveMode to manually overwrite the way the Dropdown renders.
   * ResponsiveMode.Large would, for instance, disable the behavior where Dropdown options
   * get rendered into a Panel while ResponsiveMode.Small would result in the Dropdown
   * options always getting rendered in a Panel.
   */
  responsiveMode?: any //ResponsiveMode;

  /**
   * Optional mode indicates if multi-choice selections is allowed.  Default to false
   */
  multiSelect?: boolean

  /**
   * Keys that will be initially used to set selected items. This prop is used for `multiSelect`
   * scenarios. In other cases, `defaultSelectedKey` should be used.
   */
  defaultSelectedKeys?: string[] | number[]

  /**
   * Keys of the selected items. If you provide this, you must maintain selection
   * state by observing onChange events and passing a new value in when changed.
   * Passing null in will clear the selection.
   */
  selectedKeys?: string[] | number[] | null

  /**
   * When multiple items are selected, this still will be used to separate values in
   * the dropdown title.
   *
   * @defaultvalue ", "
   */
  multiSelectDelimiter?: string

  /**
   * Optional preference to have onChanged still be called when an already selected item is
   * clicked in single select mode.  Default to false
   */
  notifyOnReselect?: boolean

  /**
   * Deprecated at v0.52.0, use `disabled` instead.
   * @deprecated Use `disabled` instead.
   */
  isDisabled?: boolean

  /**
   * Optional keytip for this dropdown
   */
  keytipProps?: IKeytipProps

  /**
   * Theme provided by higher order component.
   */
  theme?: ITheme

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IDropdownStyleProps, IDropdownStyles>
}

/**
 * {@docCategory Dropdown}
 */
export interface IDropdownOption extends ISelectableOption {
  /**
   * Deprecated at v.65.1, use `selected` instead.
   * @deprecated Use `selected` instead.
   */
  isSelected?: boolean
}

/**
 * The props needed to construct styles. This represents the simplified set of immutable things which control the class names.
 * {@docCategory Dropdown}
 */
export type IDropdownStyleProps = Pick<IDropdownProps, "theme" | "className" | "disabled" | "required"> & {
  /**
   * Whether the dropdown is in an error state.
   */
  hasError: boolean

  /**
   * Whether the dropdown is in an opened state.
   */
  isOpen: boolean

  /**
   * Whether the dropdown is presently rendering a placeholder.
   */
  isRenderingPlaceholder: boolean

  /**
   * Optional custom className for the panel that displays in small viewports, hosting the Dropdown options.
   * This is primarily provided for backwards compatibility.
   */
  panelClassName?: string

  /**
   * Optional custom className for the callout that displays in larger viewports, hosting the Dropdown options.
   * This is primarily provided for backwards compatibility.
   */
  calloutClassName?: string

  /**
   * Prop to notify on what edge the dropdown callout was positioned respective to the title.
   */
  calloutRenderEdge?: RectangleEdge
}

/**
 * Represents the stylable areas of the control.
 * {@docCategory Dropdown}
 */
export interface IDropdownStyles {
  /** Root element of the Dropdown (includes Label and the actual Dropdown). */
  root: IStyle

  /** Refers to the label associated with the dropdown. This is enclosed by the root. */
  label: IStyle

  /** Refers to the actual Dropdown element. */
  dropdown: IStyle

  /** Refers to the primary title of the Dropdown (rendering the selected options/placeholder/etc.). */
  title: IStyle

  /** Refers to the wrapping container around the downward pointing caret users click on to expand the Dropdown. */
  caretDownWrapper: IStyle

  /** Refers to the downward pointing caret icon users click on to expand the Dropdown. */
  caretDown: IStyle

  /** Refers to the error message being rendered under the Dropdown (if any). */
  errorMessage: IStyle

  /** Refers to the element that wraps `dropdownItems`. */
  dropdownItemsWrapper: IStyle

  /** Refers to the FocusZone wrapping the individual dropdown items. */
  dropdownItems: IStyle

  /** Refers to the individual dropdown item. */
  dropdownItem: IStyle

  /** Style for a dropdown item when it is being selected. */
  dropdownItemSelected: IStyle

  /** Style for a dropdown item when it is disabled. */
  dropdownItemDisabled: IStyle

  /** Style for a dropdown item when it is both selected and disabled. */
  dropdownItemSelectedAndDisabled: IStyle

  /** Style for a dropdown item when it is hidden */
  dropdownItemHidden: IStyle

  /**
   * Refers to the text element that renders the actual dropdown item/option text. This would be wrapped by the element
   * referred to by `dropdownItem`.
   */
  dropdownOptionText: IStyle

  /** Refers to the dropdown separator. */
  dropdownDivider: IStyle

  /** Refers to the individual dropdown items that are being rendered as a header. */
  dropdownItemHeader: IStyle

  /**
   * Refers to the panel that hosts the Dropdown options in small viewports.
   * Note: This will be deprecated when Panel supports JS Styling.
   */
  panel: IStyle

  /** Refers to the callout that hosts Dropdown options in larger viewports. */
  callout: IStyle

  /** Subcomponent styles. */
  subComponentStyles: IDropdownSubComponentStyles
}

/**
 * {@docCategory Dropdown}
 */
export interface IDropdownSubComponentStyles {
  /** Refers to the panel that hosts the Dropdown options in small viewports. */
  panel: IStyleFunctionOrObject<IPanelStyleProps, any>
  // #5690: replace any with ILabelStyles in TS 2.9

  /** Refers to the primary label for the Dropdown. */
  label: IStyleFunctionOrObject<ILabelStyleProps, any>
  // #5690: replace any with ILabelStyles in TS 2.9
}

const GlobalClassNames = {
  root: "ms-Dropdown-container",
  label: "ms-Dropdown-label",
  dropdown: "ms-Dropdown",
  title: "ms-Dropdown-title",
  caretDownWrapper: "ms-Dropdown-caretDownWrapper",
  caretDown: "ms-Dropdown-caretDown",
  callout: "ms-Dropdown-callout",
  panel: "ms-Dropdown-panel",
  dropdownItems: "ms-Dropdown-items",
  dropdownItem: "ms-Dropdown-item",
  dropdownDivider: "ms-Dropdown-divider",
  dropdownOptionText: "ms-Dropdown-optionText",
  dropdownItemHeader: "ms-Dropdown-header",
  titleIsPlaceHolder: "ms-Dropdown-titleIsPlaceHolder",
  titleHasError: "ms-Dropdown-title--hasError"
}

const DROPDOWN_HEIGHT = 32
const DROPDOWN_ITEM_HEIGHT = 36

const highContrastAdjustMixin = {
  [`${HighContrastSelector}, ${HighContrastSelectorWhite.replace("@media ", "")}`]: {
    MsHighContrastAdjust: "none"
  }
}

const highContrastItemAndTitleStateMixin: IRawStyle = {
  selectors: {
    [HighContrastSelector]: {
      backgroundColor: "Highlight",
      borderColor: "Highlight",
      color: "HighlightText",
      selectors: {
        ":hover": {
          color: "HighlightText" // overrides the hover styling for buttons that are also selected
        }
      }
    },
    ...highContrastAdjustMixin
  }
}

const highContrastBorderState: IRawStyle = {
  selectors: {
    [HighContrastSelector]: {
      borderColor: "Highlight"
    }
  }
}

export const getDropDownStyles: IStyleFunction<IDropdownStyleProps, IDropdownStyles> = (props) => {
  const {
    theme,
    hasError,
    className,
    isOpen,
    disabled,
    required,
    isRenderingPlaceholder,
    panelClassName,
    calloutClassName,
    calloutRenderEdge
  } = props

  if (!theme) {
    throw new Error("theme is undefined or null in base Dropdown getStyles function.")
  }

  const globalClassnames = getGlobalClassNames(GlobalClassNames, theme)
  const { palette, semanticColors, effects } = theme

  const rootHoverFocusActiveSelectorNeutralDarkMixin: IStyle = {
    color: palette.neutralDark
  }

  const rootHoverFocusActiveSelectorNeutralPrimaryMixin: IStyle = {
    color: palette.neutralPrimary
  }

  const borderColorError: IStyle = {
    borderColor: semanticColors.errorText
  }

  const dropdownItemStyle: IStyle = [
    globalClassnames.dropdownItem,
    {
      backgroundColor: "transparent",
      boxSizing: "border-box",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      padding: "0 8px",
      width: "100%",
      minHeight: DROPDOWN_ITEM_HEIGHT,
      lineHeight: 20,
      height: "auto",
      position: "relative",
      border: "1px solid transparent",
      borderRadius: 0,
      wordWrap: "break-word",
      overflowWrap: "break-word",
      textAlign: "left"
    }
  ]

  const itemSelectors = (isSelected: boolean = false) => {
    return {
      selectors: {
        "&:hover:focus": {
          color: palette.neutralDark,
          backgroundColor: !isSelected ? palette.neutralLighter : palette.neutralLight
        },
        "&:focus": {
          backgroundColor: !isSelected ? "transparent" : palette.neutralLight
        },
        "&:active": {
          color: palette.neutralDark,
          backgroundColor: !isSelected ? palette.neutralLighter : palette.neutralLight
        },
        [HighContrastSelector]: {
          borderColor: "Window"
        },
        [`.${IsFocusVisibleClassName} &:focus:after`]: {
          left: 0,
          top: 0,
          bottom: 0,
          right: 0
        }
      }
    }
  }

  const dropdownItemSelected: IStyle = [
    ...dropdownItemStyle,
    {
      backgroundColor: palette.neutralLight,
      color: palette.neutralDark
    },
    itemSelectors(true),
    highContrastItemAndTitleStateMixin
  ]

  const dropdownItemDisabled: IStyle = [
    ...dropdownItemStyle,
    {
      color: semanticColors.disabledText,
      cursor: "default"
    }
  ]

  const titleOpenBorderRadius =
    calloutRenderEdge === RectangleEdge.bottom
      ? `${effects.roundedCorner2} ${effects.roundedCorner2} 0 0`
      : `0 0 ${effects.roundedCorner2} ${effects.roundedCorner2}`

  const calloutOpenBorderRadius =
    calloutRenderEdge === RectangleEdge.bottom
      ? `0 0 ${effects.roundedCorner2} ${effects.roundedCorner2}`
      : `${effects.roundedCorner2} ${effects.roundedCorner2} 0 0`

  return {
    root: globalClassnames.root,
    label: globalClassnames.label,
    dropdown: [
      globalClassnames.dropdown,
      normalize,
      {
        ...theme.fonts.small,
        color: palette.neutralPrimary,
        borderColor: palette.neutralSecondary,
        position: "relative",
        outline: 0,
        userSelect: "none",
        selectors: {
          ["&:hover ." + globalClassnames.title]: [
            !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
            { borderColor: !isOpen ? palette.neutralPrimary : palette.themePrimary },
            highContrastBorderState
          ],
          ["&:focus ." + globalClassnames.title]: [
            !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
            { borderColor: palette.themePrimary },
            highContrastItemAndTitleStateMixin
          ],
          ["&:active ." + globalClassnames.title]: [
            !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
            { borderColor: palette.themePrimary },
            highContrastBorderState
          ],

          ["&:hover ." + globalClassnames.caretDown]: !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
          ["&:focus ." + globalClassnames.caretDown]: [
            !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
            { selectors: { [HighContrastSelector]: { color: "HighlightText" }, ...highContrastAdjustMixin } }
          ],
          ["&:active ." + globalClassnames.caretDown]: !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,

          ["&:hover ." + globalClassnames.titleIsPlaceHolder]: !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
          ["&:focus ." + globalClassnames.titleIsPlaceHolder]: !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
          ["&:active ." + globalClassnames.titleIsPlaceHolder]: !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,

          ["&:hover ." + globalClassnames.titleHasError]: borderColorError,
          ["&:active ." + globalClassnames.titleHasError]: borderColorError,
          ["&:focus ." + globalClassnames.titleHasError]: borderColorError
        }
      },
      className,
      isOpen && "is-open",
      disabled && "is-disabled",
      required && "is-required"
    ],
    title: [
      globalClassnames.title,
      normalize,
      {
        backgroundColor: semanticColors.inputBackground,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: semanticColors.inputBorder,
        borderRadius: isOpen ? titleOpenBorderRadius : effects.roundedCorner2,
        cursor: "pointer",
        display: "block",
        height: DROPDOWN_HEIGHT,
        lineHeight: DROPDOWN_HEIGHT - 2,
        padding: `0 28px 0 8px`,
        position: "relative",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
      },
      isRenderingPlaceholder && [globalClassnames.titleIsPlaceHolder, { color: semanticColors.inputPlaceholderText }],
      hasError && [globalClassnames.titleHasError, borderColorError],
      disabled && {
        backgroundColor: semanticColors.disabledBackground,
        border: "none",
        color: semanticColors.disabledText,
        cursor: "default",
        selectors: { [HighContrastSelector]: { border: "1px solid GrayText", color: "GrayText" } }
      }
    ],
    caretDownWrapper: [
      globalClassnames.caretDownWrapper,
      {
        position: "absolute",
        top: 1,
        right: 8,
        height: DROPDOWN_HEIGHT,
        lineHeight: DROPDOWN_HEIGHT - 2 // height minus the border
      },
      !disabled && {
        cursor: "pointer"
      }
    ],
    caretDown: [
      globalClassnames.caretDown,
      { color: palette.neutralSecondary, fontSize: FontSizes.xSmall, pointerEvents: "none" },
      disabled && { color: semanticColors.disabledText, selectors: { [HighContrastSelector]: { color: "GrayText" } } }
    ],
    errorMessage: { color: semanticColors.errorText, ...theme.fonts.xSmall, paddingTop: 5 },
    callout: [
      globalClassnames.callout,
      {
        boxShadow: effects.elevation8,
        borderRadius: calloutOpenBorderRadius,
        selectors: {
          [".ms-Callout-main"]: { borderRadius: calloutOpenBorderRadius }
        }
      },
      calloutClassName
    ],
    dropdownItemsWrapper: { selectors: { "&:focus": { outline: 0 } } },
    dropdownItems: [globalClassnames.dropdownItems, { display: "block" }],
    dropdownItem: [...dropdownItemStyle, itemSelectors()],
    dropdownItemSelected: dropdownItemSelected,
    dropdownItemDisabled: dropdownItemDisabled,
    dropdownItemSelectedAndDisabled: [dropdownItemSelected, dropdownItemDisabled, { backgroundColor: "transparent" }],
    dropdownItemHidden: [...dropdownItemStyle, { display: "none" }],
    dropdownDivider: [globalClassnames.dropdownDivider, { height: 1, backgroundColor: semanticColors.bodyDivider }],
    dropdownOptionText: [
      globalClassnames.dropdownOptionText,
      {
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        minWidth: 0,
        maxWidth: "100%",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        margin: "1px"
      }
    ],
    dropdownItemHeader: [
      globalClassnames.dropdownItemHeader,
      {
        ...theme.fonts.small,
        fontWeight: FontWeights.semibold,
        color: semanticColors.menuHeader,
        background: "none",
        backgroundColor: "transparent",
        border: "none",
        height: DROPDOWN_ITEM_HEIGHT,
        lineHeight: DROPDOWN_ITEM_HEIGHT,
        cursor: "default",
        padding: "0 8px",
        userSelect: "none",
        textAlign: "left"
      }
    ],
    subComponentStyles: {
      label: { root: { display: "inline-block" } },
      panel: {
        root: [panelClassName],
        content: { padding: 0 }
      }
    }
  }
}

export const DropdownMenuItemType = SelectableOptionMenuItemType


/** Internal only props interface to support mixing in responsive mode */
export interface IDropdownInternalProps extends IDropdownProps {}

export interface IDropdownState {
  isOpen: boolean
  selectedIndices: number[]
  /** Whether the root dropdown element has focus. */
  hasFocus: boolean
  calloutRenderEdge?: RectangleEdge
}

//@withResponsiveMode
export class DropdownBase extends React.Component<IDropdownInternalProps, IDropdownState> implements IDropdown {
  public static defaultProps = {
    options: [] as any[]
  }

  private _host = React.createRef<HTMLDivElement>()
  private _focusZone = React.createRef<FocusZone>()
  private _dropDown = React.createRef<HTMLDivElement>()
  private _id: string
  private _isScrollIdle: boolean
  private readonly _scrollIdleDelay: number = 250 /* ms */
  private _scrollIdleTimeoutId: number | undefined
  /** True if the most recent keydown event was for alt (option) or meta (command). */
  private _lastKeyDownWasAltOrMeta: boolean | undefined
  private _sizePosCache: DropdownSizePosCache = new DropdownSizePosCache()
  private _classNames: IProcessedStyleSet<IDropdownStyles>
  private _requestAnimationFrame = safeRequestAnimationFrame(this)

  /** Flag for when we get the first mouseMove */
  private _gotMouseMove: boolean

  constructor(props: IDropdownProps) {
    super(props)

    initializeComponentRef(this)

    //if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    warnDeprecations("Dropdown", props, {
      isDisabled: "disabled",
      onChanged: "onChange",
      placeHolder: "placeholder",
      onRenderPlaceHolder: "onRenderPlaceholder"
    })

    warnMutuallyExclusive("Dropdown", props, {
      defaultSelectedKey: "selectedKey",
      defaultSelectedKeys: "selectedKeys",
      selectedKeys: "selectedKey",
      multiSelect: "defaultSelectedKey",
      selectedKey: "multiSelect"
    })
    //}

    this._id = props.id || getId("Dropdown")
    this._isScrollIdle = true

    let selectedIndices: number[]

    if (this.props.multiSelect) {
      const selectedKeys = props.defaultSelectedKeys !== undefined ? props.defaultSelectedKeys : props.selectedKeys
      selectedIndices = this._getSelectedIndexes(props.options, selectedKeys)
    } else {
      const selectedKey = props.defaultSelectedKey !== undefined ? props.defaultSelectedKey : props.selectedKey
      selectedIndices = this._getSelectedIndexes(props.options, selectedKey!)
      this._sizePosCache.updateOptions(props.options)
    }

    this.state = {
      isOpen: false,
      selectedIndices,
      hasFocus: false,
      calloutRenderEdge: undefined
    }
  }

  public componentWillUnmount() {
    clearTimeout(this._scrollIdleTimeoutId)
  }

  public UNSAFE_componentWillReceiveProps(newProps: IDropdownProps): void {
    // In controlled component usage where selectedKey is provided, update the selectedIndex
    // state if the key or options change.
    let selectedKeyProp: "defaultSelectedKeys" | "selectedKeys" | "defaultSelectedKey" | "selectedKey"

    // this does a shallow compare (assumes options are pure), for the purposes of determining whether
    // defaultSelectedKey/defaultSelectedKeys are respected.
    const didOptionsChange = newProps.options !== this.props.options

    if (newProps.multiSelect) {
      if (didOptionsChange && newProps.defaultSelectedKeys !== undefined) {
        selectedKeyProp = "defaultSelectedKeys"
      } else {
        selectedKeyProp = "selectedKeys"
      }
    } else {
      if (didOptionsChange && newProps.defaultSelectedKey !== undefined) {
        selectedKeyProp = "defaultSelectedKey"
      } else {
        selectedKeyProp = "selectedKey"
      }
    }

    if (newProps[selectedKeyProp] !== undefined && (newProps[selectedKeyProp] !== this.props[selectedKeyProp] || didOptionsChange)) {
      this.setState({
        selectedIndices: this._getSelectedIndexes(newProps.options, newProps[selectedKeyProp])
      })
    }

    if (
      newProps.options !== this.props.options && // preexisting code assumes purity of the options...
      !newProps.multiSelect // only relevant in single selection
    ) {
      this._sizePosCache.updateOptions(newProps.options)
    }
  }

  public componentDidUpdate(prevProps: IDropdownProps, prevState: IDropdownState) {
    if (prevState.isOpen === true && this.state.isOpen === false) {
      this._gotMouseMove = false

      if (this._dropDown.current) {
        this._dropDown.current.focus()
      }

      if (this.props.onDismiss) {
        this.props.onDismiss()
      }
    }
  }

  public render(): JSX.Element {
    const id = this._id

    const props = this.props
    const {
      className,
      label,
      options,
      ariaLabel,
      required,
      errorMessage,
      multiSelect,
      keytipProps,
      styles: propStyles,
      theme,
      panelProps,
      calloutProps,
      onRenderTitle = this._onRenderTitle,
      onRenderContainer = this._onRenderContainer,
      onRenderCaretDown = this._onRenderCaretDown
    } = props
    const { isOpen, selectedIndices, hasFocus, calloutRenderEdge } = this.state
    const onRenderPlaceholder = props.onRenderPlaceholder || props.onRenderPlaceHolder || this._onRenderPlaceholder

    const selectedOptions = this._getAllSelectedOptions(options, selectedIndices)
    const divProps = getNativeProps(props, divProperties)

    const disabled = this._isDisabled()

    const optionId = id + "-option"
    const ariaAttrs =
      multiSelect || disabled
        ? {
            role: undefined,
            ariaActiveDescendant: undefined,
            childRole: undefined,
            ariaSetSize: undefined,
            ariaPosInSet: undefined,
            ariaSelected: undefined
          }
        : // single select
          {
            role: "listbox",
            ariaActiveDescendant:
              isOpen && selectedIndices.length === 1 && selectedIndices[0] >= 0 ? this._id + "-list" + selectedIndices[0] : optionId,
            childRole: "option",
            ariaSetSize: this._sizePosCache.optionSetSize,
            ariaPosInSet: this._sizePosCache.positionInSet(selectedIndices[0]),
            ariaSelected: selectedIndices[0] === undefined ? undefined : true
          }

    this._classNames = classNamesFunction<IDropdownStyleProps, IDropdownStyles>()(propStyles, {
      theme,
      className,
      hasError: !!(errorMessage && errorMessage.length > 0),
      isOpen,
      required,
      disabled,
      isRenderingPlaceholder: !selectedOptions.length,
      panelClassName: !!panelProps ? panelProps.className : undefined,
      calloutClassName: !!calloutProps ? calloutProps.className : undefined,
      calloutRenderEdge: calloutRenderEdge
    })

    const labelStyles = this._classNames.subComponentStyles
      ? (this._classNames.subComponentStyles.label as IStyleFunctionOrObject<ILabelStyleProps, ILabelStyles>)
      : undefined

    return (
      <div className={this._classNames.root}>
        {label && (
          <Label className={this._classNames.label} id={id + "-label"} htmlFor={id} required={required} styles={labelStyles}>
            {label}
          </Label>
        )}
        <KeytipData keytipProps={keytipProps} disabled={disabled}>
          {(keytipAttributes: any): JSX.Element => (
            <div
              {...keytipAttributes}
              data-is-focusable={!disabled}
              ref={this._dropDown}
              id={id}
              tabIndex={disabled ? -1 : 0}
              aria-expanded={isOpen ? "true" : "false"}
              role={ariaAttrs.role}
              aria-label={ariaLabel}
              aria-labelledby={label && !ariaLabel ? id + "-label" : undefined}
              aria-describedby={mergeAriaAttributeValues(optionId, keytipAttributes["aria-describedby"])}
              aria-activedescendant={isOpen ? ariaAttrs.ariaActiveDescendant : undefined}
              aria-required={required}
              aria-disabled={disabled}
              aria-owns={isOpen ? id + "-list" : undefined}
              {...divProps}
              className={this._classNames.dropdown}
              onBlur={this._onDropdownBlur}
              onKeyDown={this._onDropdownKeyDown}
              onKeyUp={this._onDropdownKeyUp}
              onClick={this._onDropdownClick}
              onFocus={this._onFocus}
            >
              <span
                id={optionId}
                className={this._classNames.title}
                aria-atomic={true}
                role={ariaAttrs.childRole}
                aria-live={!hasFocus || disabled || multiSelect || isOpen ? "off" : "assertive"}
                aria-label={selectedOptions.length ? selectedOptions[0].text : this._placeholder}
                aria-setsize={ariaAttrs.ariaSetSize}
                aria-posinset={ariaAttrs.ariaPosInSet}
                aria-selected={ariaAttrs.ariaSelected}
              >
                {// If option is selected render title, otherwise render the placeholder text
                selectedOptions.length
                  ? onRenderTitle(selectedOptions, this._onRenderTitle)
                  : onRenderPlaceholder(props, this._onRenderPlaceholder)}
              </span>
              <span className={this._classNames.caretDownWrapper}>{onRenderCaretDown(props, this._onRenderCaretDown)}</span>
            </div>
          )}
        </KeytipData>
        {isOpen && onRenderContainer(props, this._onRenderContainer)}
        {errorMessage && errorMessage.length > 0 && <div className={this._classNames.errorMessage}>{errorMessage}</div>}
      </div>
    )
  }

  public focus(shouldOpenOnFocus?: boolean): void {
    if (this._dropDown.current && this._dropDown.current.tabIndex !== -1) {
      this._dropDown.current.focus()

      if (shouldOpenOnFocus) {
        this.setState({
          isOpen: true
        })
      }
    }
  }

  public setSelectedIndex(event: React.FormEvent<HTMLDivElement>, index: number): void {
    const { onChange, onChanged, options, selectedKey, selectedKeys, multiSelect, notifyOnReselect } = this.props
    const { selectedIndices = [] } = this.state
    const checked: boolean = selectedIndices ? selectedIndices.indexOf(index) > -1 : false

    index = Math.max(0, Math.min(options.length - 1, index))

    if (!multiSelect && !notifyOnReselect && index === selectedIndices[0]) {
      return
    } else if (!multiSelect && selectedKey === undefined) {
      // Set the selected option if this is an uncontrolled component
      this.setState({
        selectedIndices: [index]
      })
    } else if (multiSelect && selectedKeys === undefined) {
      const newIndexes = selectedIndices ? this._copyArray(selectedIndices) : []
      if (checked) {
        const position = newIndexes.indexOf(index)
        if (position > -1) {
          // unchecked the current one
          newIndexes.splice(position, 1)
        }
      } else {
        // add the new selected index into the existing one
        newIndexes.push(index)
      }
      this.setState({
        selectedIndices: newIndexes
      })
    }

    if (onChange) {
      // for single-select, option passed in will always be selected.
      // for multi-select, flip the checked value
      const changedOpt = multiSelect ? { ...options[index], selected: !checked } : options[index]

      onChange({ ...event, target: this._dropDown.current as EventTarget }, changedOpt, index)
    }

    if (onChanged) {
      // for single-select, option passed in will always be selected.
      // for multi-select, flip the checked value
      const changedOpt = multiSelect ? { ...options[index], selected: !checked } : options[index]
      onChanged(changedOpt, index)
    }
  }

  /** Get either props.placeholder (new name) or props.placeHolder (old name) */
  private get _placeholder(): string | undefined {
    return this.props.placeholder || this.props.placeHolder
  }

  private _copyArray(array: any[]): any[] {
    const newArray = []
    for (const element of array) {
      newArray.push(element)
    }
    return newArray
  }

  /**
   * Finds the next valid Dropdown option and sets the selected index to it.
   * @param stepValue - Value of how many items the function should traverse.  Should be -1 or 1.
   * @param index - Index of where the search should start
   * @param selectedIndex - The selectedIndex Dropdown's state
   * @returns The next valid dropdown option's index
   */
  private _moveIndex(event: React.FormEvent<HTMLDivElement>, stepValue: number, index: number, selectedIndex: number): number {
    const { options } = this.props
    // Return selectedIndex if nothing has changed or options is empty
    if (selectedIndex === index || options.length === 0) {
      return selectedIndex
    }

    // Set starting index to 0 if index is < 0
    if (index < 0) {
      index = 0
    }
    // Set starting index to last option index if greater than options.length
    if (index >= options.length) {
      index = options.length - 1
    }
    let stepCounter = 0
    // If current index is a header or divider, or disabled, increment by step
    while (
      options[index].itemType === DropdownMenuItemType.Header ||
      options[index].itemType === DropdownMenuItemType.Divider ||
      options[index].disabled
    ) {
      // If stepCounter exceeds length of options, then return selectedIndex (-1)
      if (stepCounter >= options.length) {
        return selectedIndex
      }
      // If index + stepValue is out of bounds, wrap around
      if (index + stepValue < 0) {
        index = options.length
      } else if (index + stepValue >= options.length) {
        index = -1
      }

      index = index + stepValue
      stepCounter++
    }

    this.setSelectedIndex(event, index)
    return index
  }

  /** Render text in dropdown input */
  private _onRenderTitle = (items: IDropdownOption[]): JSX.Element => {
    const { multiSelectDelimiter = ", " } = this.props

    const displayTxt = items.map((i) => i.text).join(multiSelectDelimiter)
    return <span>{displayTxt}</span>
  }

  /** Render placeholder text in dropdown input */
  private _onRenderPlaceholder = (props: IDropdownProps): JSX.Element | null => {
    if (!this._placeholder) {
      return null
    }
    return <span>{this._placeholder}</span>
  }

  /** Render Callout or Panel container and pass in list */
  private _onRenderContainer = (props: IDropdownProps): JSX.Element => {
    const { responsiveMode, calloutProps, panelProps, dropdownWidth } = this.props

    const isSmall = responsiveMode <= 1 || responsiveMode === "small" || responsiveMode === "medium" //<= ResponsiveMode.medium;

    const panelStyles = this._classNames.subComponentStyles
      ? (this._classNames.subComponentStyles.panel as IStyleFunctionOrObject<IPanelStyleProps, IPanelStyles>)
      : undefined

    return isSmall ? (
      <Panel isOpen={true} isLightDismiss={true} onDismissed={this._onDismiss} hasCloseButton={false} styles={panelStyles} {...panelProps}>
        {this._renderFocusableList(props)}
      </Panel>
    ) : (
      <Callout
        isBeakVisible={false}
        gapSpace={0}
        doNotLayer={false}
        directionalHintFixed={false}
        directionalHint={DirectionalHint.bottomLeftEdge}
        {...calloutProps}
        className={this._classNames.callout}
        target={this._dropDown.current}
        onDismiss={this._onDismiss}
        onScroll={this._onScroll}
        onPositioned={this._onPositioned}
        calloutWidth={dropdownWidth || (this._dropDown.current ? this._dropDown.current.clientWidth : 0)}
      >
        {this._renderFocusableList(props)}
      </Callout>
    )
  }

  /** Render Caret Down Icon */
  private _onRenderCaretDown = (props: IDropdownProps): JSX.Element => {
    return <Icon className={this._classNames.caretDown} iconName="ChevronDown" />
  }

  /** Wrap item list in a FocusZone */
  private _renderFocusableList(props: IDropdownProps): JSX.Element {
    const { onRenderList = this._onRenderList, label } = props
    const id = this._id

    return (
      <div
        className={this._classNames.dropdownItemsWrapper}
        onKeyDown={this._onZoneKeyDown}
        onKeyUp={this._onZoneKeyUp}
        ref={this._host}
        tabIndex={0}
      >
        <FocusZone
          ref={this._focusZone}
          direction={FocusZoneDirection.vertical}
          id={id + "-list"}
          className={this._classNames.dropdownItems}
          aria-labelledby={label ? id + "-label" : undefined}
          role="listbox"
        >
          {onRenderList(props, this._onRenderList)}
        </FocusZone>
      </div>
    )
  }

  /** Render List of items */
  private _onRenderList = (props: IDropdownProps): JSX.Element => {
    const { onRenderItem = this._onRenderItem } = this.props

    return <>{this.props.options.map((item: any, index: number) => onRenderItem({ ...item, index }, this._onRenderItem))}</>
  }

  private _onRenderItem = (item: IDropdownOption): JSX.Element | null => {
    switch (item.itemType) {
      case SelectableOptionMenuItemType.Divider:
        return this._renderSeparator(item)
      case SelectableOptionMenuItemType.Header:
        return this._renderHeader(item)
      default:
        return this._renderOption(item)
    }
  }

  private _renderSeparator(item: IDropdownOption): JSX.Element | null {
    const { index, key } = item
    if (index! > 0) {
      return <div role="separator" key={key} className={this._classNames.dropdownDivider} />
    }
    return null
  }

  private _renderHeader(item: IDropdownOption): JSX.Element {
    const { onRenderOption = this._onRenderOption } = this.props
    const { key } = item
    return (
      <div key={key} className={this._classNames.dropdownItemHeader}>
        {onRenderOption(item, this._onRenderOption)}
      </div>
    )
  }

  private _renderOption = (item: IDropdownOption): JSX.Element => {
    const { onRenderOption = this._onRenderOption } = this.props
    const { selectedIndices = [] } = this.state
    const id = this._id
    const isItemSelected = item.index !== undefined && selectedIndices ? selectedIndices.indexOf(item.index) > -1 : false

    // select the right className based on the combination of selected/disabled
    const itemClassName = item.hidden // predicate: item hidden
      ? this._classNames.dropdownItemHidden
      : isItemSelected && item.disabled === true // predicate: both selected and disabled
      ? this._classNames.dropdownItemSelectedAndDisabled
      : isItemSelected // predicate: selected only
      ? this._classNames.dropdownItemSelected
      : item.disabled === true // predicate: disabled only
      ? this._classNames.dropdownItemDisabled
      : this._classNames.dropdownItem

    return !this.props.multiSelect ? (
      <ActionButton
        id={id + "-list" + item.index}
        key={item.key}
        data-index={item.index}
        data-is-focusable={!item.disabled}
        disabled={item.disabled}
        className={itemClassName}
        onClick={this._onItemClick(item)}
        onMouseEnter={this._onItemMouseEnter.bind(this, item)}
        onMouseLeave={this._onMouseItemLeave.bind(this, item)}
        onMouseMove={this._onItemMouseMove.bind(this, item)}
        role="option"
        aria-selected={isItemSelected ? "true" : "false"}
        ariaLabel={item.ariaLabel}
        title={item.title ? item.title : item.text}
      >
        {onRenderOption(item, this._onRenderOption)}
      </ActionButton>
    ) : (
      <Checkbox
        id={id + "-list" + item.index}
        key={item.key}
        data-index={item.index}
        data-is-focusable={!item.disabled}
        disabled={item.disabled}
        onChange={this._onItemClick(item)}
        inputProps={{
          onMouseEnter: this._onItemMouseEnter.bind(this, item),
          onMouseLeave: this._onMouseItemLeave.bind(this, item),
          onMouseMove: this._onItemMouseMove.bind(this, item)
        }}
        label={item.text}
        title={item.title ? item.title : item.text}
        onRenderLabel={this._onRenderLabel.bind(this, item)}
        className={itemClassName}
        role="option"
        aria-selected={isItemSelected ? "true" : "false"}
        checked={isItemSelected}
      />
    )
  }

  /** Render content of item (i.e. text/icon inside of button) */
  private _onRenderOption = (item: IDropdownOption): JSX.Element => {
    return <span className={this._classNames.dropdownOptionText}>{item.text}</span>
  }

  /** Render custom label for drop down item */
  private _onRenderLabel = (item: IDropdownOption): JSX.Element | null => {
    const { onRenderOption = this._onRenderOption } = this.props
    return onRenderOption(item, this._onRenderOption)
  }

  private _onPositioned = (positions?: ICalloutPositionedInfo): void => {
    if (this._focusZone.current) {
      // Focusing an element can trigger a reflow. Making this wait until there is an animation
      // frame can improve perf significantly.
      this._requestAnimationFrame(() => {
        const selectedIndices = this.state.selectedIndices
        if (selectedIndices && selectedIndices[0] && !this.props.options[selectedIndices[0]].disabled) {
          const element: HTMLElement = getDocument()!.querySelector(`#${this._id}-list${selectedIndices[0]}`) as HTMLElement
          this._focusZone.current!.focusElement(element)
        } else {
          this._focusZone.current!.focus()
        }
      })
    }

    if (!this.state.calloutRenderEdge || this.state.calloutRenderEdge !== positions!.targetEdge) {
      this.setState({
        calloutRenderEdge: positions!.targetEdge
      })
    }
  }

  private _onItemClick = (item: IDropdownOption): ((event: React.MouseEvent<HTMLDivElement>) => void) => {
    return (event: React.MouseEvent<HTMLDivElement>): void => {
      if (!item.disabled) {
        this.setSelectedIndex(event, item.index!)
        if (!this.props.multiSelect) {
          // only close the callout when it's in single-select mode
          this.setState({
            isOpen: false
          })
        }
      }
    }
  }

  /**
   * Scroll handler for the callout to make sure the mouse events
   * for updating focus are not interacting during scroll
   */
  private _onScroll = (): void => {
    if (!this._isScrollIdle && this._scrollIdleTimeoutId !== undefined) {
      clearTimeout(this._scrollIdleTimeoutId)
      this._scrollIdleTimeoutId = undefined
    } else {
      this._isScrollIdle = false
    }

    //@ts-ignore
    this._scrollIdleTimeoutId = setTimeout(() => {
      this._isScrollIdle = true
    }, this._scrollIdleDelay)
  }

  private _onItemMouseEnter(item: any, ev: React.MouseEvent<HTMLElement>): void {
    if (this._shouldIgnoreMouseEvent()) {
      return
    }

    const targetElement = ev.currentTarget as HTMLElement
    targetElement.focus()
  }

  private _onItemMouseMove(item: any, ev: React.MouseEvent<HTMLElement>): void {
    const targetElement = ev.currentTarget as HTMLElement
    this._gotMouseMove = true

    if (!this._isScrollIdle || document.activeElement === targetElement) {
      return
    }

    targetElement.focus()
  }

  private _onMouseItemLeave = (item: any, ev: React.MouseEvent<HTMLElement>): void => {
    if (this._shouldIgnoreMouseEvent()) {
      return
    }

    /**
     * IE11 focus() method forces parents to scroll to top of element.
     * Edge and IE expose a setActive() function for focusable divs that
     * sets the page focus but does not scroll the parent element.
     */
    if (this._host.current) {
      if ((this._host.current as any).setActive) {
        try {
          ;(this._host.current as any).setActive()
        } catch (e) {
          /* no-op */
        }
      } else {
        this._host.current.focus()
      }
    }
  }

  private _shouldIgnoreMouseEvent(): boolean {
    return !this._isScrollIdle || !this._gotMouseMove
  }

  private _onDismiss = (): void => {
    this.setState({ isOpen: false })

    if (this._dropDown.current) {
      this._dropDown.current.focus()
    }
  }

  /** Get all selected indexes for multi-select mode */
  private _getSelectedIndexes(options: IDropdownOption[], selectedKey: string | number | string[] | number[] | null | undefined): number[] {
    if (selectedKey === undefined) {
      if (this.props.multiSelect) {
        return this._getAllSelectedIndices(options)
      }
      const selectedIndex = this._getSelectedIndex(options, null)
      return selectedIndex !== -1 ? [selectedIndex] : []
    } else if (!Array.isArray(selectedKey)) {
      const selectedIndex = this._getSelectedIndex(options, selectedKey)
      return selectedIndex !== -1 ? [selectedIndex] : []
    }

    const selectedIndices: number[] = []
    for (const key of selectedKey) {
      const selectedIndex = this._getSelectedIndex(options, key)
      selectedIndex !== -1 && selectedIndices.push(selectedIndex)
    }
    return selectedIndices
  }

  /** Get all selected options for multi-select mode */
  private _getAllSelectedOptions(options: IDropdownOption[], selectedIndices: number[]): IDropdownOption[] {
    const selectedOptions: IDropdownOption[] = []
    for (const index of selectedIndices) {
      const option = options[index]

      if (option) {
        selectedOptions.push(option)
      }
    }

    return selectedOptions
  }

  private _getAllSelectedIndices(options: IDropdownOption[]): number[] {
    return options.map((option: IDropdownOption, index: number) => (option.selected ? index : -1)).filter((index) => index !== -1)
  }

  private _getSelectedIndex(options: IDropdownOption[], selectedKey: string | number | null): number {
    return findIndex(options, (option) => {
      // tslint:disable-next-line:triple-equals
      if (selectedKey != null) {
        return option.key === selectedKey
      } else {
        return !!option.isSelected || !!option.selected
      }
    })
  }

  private _onDropdownBlur = (ev: React.FocusEvent<HTMLDivElement>): void => {
    // If Dropdown disabled do not proceed with this logic.
    const disabled = this._isDisabled()
    if (disabled) {
      return
    }

    // hasFocus tracks whether the root element has focus so always update the state.
    this.setState({ hasFocus: false })

    if (this.state.isOpen) {
      // Do not onBlur when the callout is opened
      return
    }
    if (this.props.onBlur) {
      this.props.onBlur(ev)
    }
  }

  private _onDropdownKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>): void => {
    // If Dropdown disabled do not process any keyboard events.
    const disabled = this._isDisabled()
    if (disabled) {
      return
    }

    // Take note if we are processing an alt (option) or meta (command) keydown.
    // See comment in _shouldHandleKeyUp for reasoning.
    this._lastKeyDownWasAltOrMeta = this._isAltOrMeta(ev)

    if (this.props.onKeyDown) {
      this.props.onKeyDown(ev)
      if (ev.defaultPrevented) {
        return
      }
    }

    let newIndex: number | undefined
    const selectedIndex = this.state.selectedIndices.length ? this.state.selectedIndices[0] : -1
    const containsExpandCollapseModifier = ev.altKey || ev.metaKey
    const isOpen = this.state.isOpen

    switch (ev.which) {
      case KeyCodes.enter:
        this.setState({
          isOpen: !isOpen
        })
        break

      case KeyCodes.escape:
        if (!isOpen) {
          return
        }

        this.setState({
          isOpen: false
        })
        break

      case KeyCodes.up:
        if (containsExpandCollapseModifier) {
          if (isOpen) {
            this.setState({ isOpen: false })
            break
          }

          return
        }
        if (this.props.multiSelect) {
          this.setState({ isOpen: true })
        } else if (!this._isDisabled()) {
          newIndex = this._moveIndex(ev, -1, selectedIndex - 1, selectedIndex)
        }
        break

      case KeyCodes.down:
        if (containsExpandCollapseModifier) {
          ev.stopPropagation()
          ev.preventDefault()
        }
        if ((containsExpandCollapseModifier && !isOpen) || this.props.multiSelect) {
          this.setState({ isOpen: true })
        } else if (!this._isDisabled()) {
          newIndex = this._moveIndex(ev, 1, selectedIndex + 1, selectedIndex)
        }
        break

      case KeyCodes.home:
        if (!this.props.multiSelect) {
          newIndex = this._moveIndex(ev, 1, 0, selectedIndex)
        }
        break

      case KeyCodes.end:
        if (!this.props.multiSelect) {
          newIndex = this._moveIndex(ev, -1, this.props.options.length - 1, selectedIndex)
        }
        break

      case KeyCodes.space:
        // event handled in _onDropdownKeyUp
        break

      default:
        return
    }

    if (newIndex !== selectedIndex) {
      ev.stopPropagation()
      ev.preventDefault()
    }
  }

  private _onDropdownKeyUp = (ev: React.KeyboardEvent<HTMLDivElement>): void => {
    // If Dropdown disabled do not process any keyboard events.
    const disabled = this._isDisabled()
    if (disabled) {
      return
    }

    const shouldHandleKey = this._shouldHandleKeyUp(ev)
    const isOpen = this.state.isOpen

    if (this.props.onKeyUp) {
      this.props.onKeyUp(ev)
      if (ev.preventDefault) {
        return
      }
    }
    switch (ev.which) {
      case KeyCodes.space:
        this.setState({
          isOpen: !isOpen
        })
        break

      default:
        if (shouldHandleKey && isOpen) {
          this.setState({ isOpen: false })
        }
        return
    }

    ev.stopPropagation()
    ev.preventDefault()
  }

  /**
   * Returns true if the key for the event is alt (Mac option) or meta (Mac command).
   */
  private _isAltOrMeta(ev: React.KeyboardEvent<HTMLElement>): boolean {
    return ev.which === KeyCodes.alt || ev.key === "Meta"
  }

  /**
   * We close the menu on key up only if ALL of the following are true:
   * - Most recent key down was alt or meta (command)
   * - The alt/meta key down was NOT followed by some other key (such as down/up arrow to
   *   expand/collapse the menu)
   * - We're not on a Mac (or iOS)
   *
   * This is because on Windows, pressing alt moves focus to the application menu bar or similar,
   * closing any open context menus. There is not a similar behavior on Macs.
   */
  private _shouldHandleKeyUp(ev: React.KeyboardEvent<HTMLElement>): boolean {
    const keyPressIsAltOrMetaAlone = this._lastKeyDownWasAltOrMeta && this._isAltOrMeta(ev)
    this._lastKeyDownWasAltOrMeta = false
    return !!keyPressIsAltOrMetaAlone && !(isMac() || isIOS())
  }

  private _onZoneKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    let elementToFocus

    // Take note if we are processing an alt (option) or meta (command) keydown.
    // See comment in _shouldHandleKeyUp for reasoning.
    this._lastKeyDownWasAltOrMeta = this._isAltOrMeta(ev)
    const containsExpandCollapseModifier = ev.altKey || ev.metaKey

    switch (ev.which) {
      case KeyCodes.up:
        if (containsExpandCollapseModifier) {
          this.setState({ isOpen: false })
        } else {
          if (this._host.current) {
            elementToFocus = getLastFocusable(this._host.current, this._host.current.lastChild as HTMLElement, true)
          }
        }
        break

      // All directional keystrokes should be canceled when the zone is rendered.
      // This avoids the body scroll from reacting and thus dismissing the dropdown.
      case KeyCodes.home:
      case KeyCodes.end:
      case KeyCodes.pageUp:
      case KeyCodes.pageDown:
        break

      case KeyCodes.down:
        if (!containsExpandCollapseModifier && this._host.current) {
          elementToFocus = getFirstFocusable(this._host.current, this._host.current.firstChild as HTMLElement, true)
        }
        break

      case KeyCodes.escape:
        this.setState({ isOpen: false })
        break

      case KeyCodes.tab:
        this.setState({ isOpen: false })
        return

      default:
        return
    }

    if (elementToFocus) {
      elementToFocus.focus()
    }

    ev.stopPropagation()
    ev.preventDefault()
  }

  private _onZoneKeyUp = (ev: React.KeyboardEvent<HTMLElement>): void => {
    const shouldHandleKey = this._shouldHandleKeyUp(ev)

    if (shouldHandleKey && this.state.isOpen) {
      this.setState({ isOpen: false })
      ev.preventDefault()
    }
  }

  private _onDropdownClick = (ev: React.MouseEvent<HTMLDivElement>): void => {
    if (this.props.onClick) {
      this.props.onClick(ev)
      if (ev.preventDefault) {
        return
      }
    }

    const { isOpen } = this.state
    const disabled = this._isDisabled()

    if (!disabled) {
      this.setState({
        isOpen: !isOpen
      })
    }
  }

  private _onFocus = (ev: React.FocusEvent<HTMLDivElement>): void => {
    const { isOpen, selectedIndices, hasFocus } = this.state
    const { multiSelect, openOnKeyboardFocus } = this.props

    const disabled = this._isDisabled()

    if (!disabled) {
      if (!isOpen && selectedIndices.length === 0 && !multiSelect) {
        // Per aria
        this._moveIndex(ev, 1, 0, -1)
      }
      if (this.props.onFocus) {
        this.props.onFocus(ev)
      }
      const state: Pick<IDropdownState, "hasFocus"> | Pick<IDropdownState, "hasFocus" | "isOpen"> = { hasFocus: true }
      if (openOnKeyboardFocus && !hasFocus) {
        ;(state as Pick<IDropdownState, "hasFocus" | "isOpen">).isOpen = true
      }
      this.setState(state)
    }
  }

  /**
   * Because the isDisabled prop is deprecated, we have had to repeat this logic all over the place.
   * This helper method avoids all the repetition.
   */
  private _isDisabled: () => boolean | undefined = () => {
    let { disabled } = this.props
    const { isDisabled } = this.props

    // Remove this deprecation workaround at 1.0.0
    if (isDisabled !== undefined) {
      disabled = isDisabled
    }

    return disabled
  }
}

export const Dropdown: React.FunctionComponent<IDropdownProps> = styled<IDropdownProps, IDropdownStyleProps, IDropdownStyles>(
  DropdownBase,
  getDropDownStyles,
  undefined,
  {
    scope: "Dropdown"
  }
)
