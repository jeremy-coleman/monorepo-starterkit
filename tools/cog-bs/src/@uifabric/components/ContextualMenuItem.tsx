import {
  getRTL,
  concatStyleSets,
  IRawStyle,
  IStyle,
  IStyleFunctionOrObject,
  memoizeFunction,
  mergeStyleSets,
  IsFocusVisibleClassName,
  styled
} from "@uifabric/styleguide"
import {
  FontSizes,
  getFocusStyle,
  getGlobalClassNames,
  getScreenSelector,
  HighContrastSelector,
  IconFontSizes,
  ITheme,
  ScreenWidthMaxMedium
} from "@uifabric/styleguide"
import { IRefObject, IRenderFunction } from "@uifabric/styleguide"
import * as React from "react"
import { IButtonStyles } from "./Buttons/Button"
import { ICalloutContentStyleProps } from "./Callout"
import { IContextualMenuProps, IContextualMenuSection } from "./ContextualMenu"
import { getIsChecked, hasSubmenu } from "./contextualMenuUtility"
import { Icon, IIconProps } from "./Icon"
import { IKeytipProps } from "./Keytip"
import { getVerticalDividerStyles } from "./VerticalDivider"

export enum ContextualMenuItemType {
  Normal = 0,
  Divider = 1,
  Header = 2,
  Section = 3
}

export const CONTEXTUAL_MENU_ITEM_HEIGHT = 36

const MediumScreenSelector = getScreenSelector(0, ScreenWidthMaxMedium)

const getItemHighContrastStyles = memoizeFunction(
  (): IRawStyle => {
    return {
      selectors: {
        [HighContrastSelector]: {
          backgroundColor: "Highlight",
          borderColor: "Highlight",
          color: "HighlightText",
          MsHighContrastAdjust: "none"
        }
      }
    }
  }
)

export const getMenuItemStyles = memoizeFunction(
  (theme: ITheme): IMenuItemStyles => {
    const { semanticColors, fonts, palette } = theme
    const ContextualMenuItemBackgroundHoverColor = semanticColors.menuItemBackgroundHovered
    const ContextualMenuItemTextHoverColor = semanticColors.menuItemTextHovered
    const ContextualMenuItemBackgroundSelectedColor = semanticColors.menuItemBackgroundPressed
    const ContextualMenuItemDividerColor = semanticColors.bodyDivider

    const menuItemStyles: IMenuItemStyles = {
      item: [
        fonts.small,
        {
          color: semanticColors.bodyText,
          position: "relative",
          boxSizing: "border-box"
        }
      ],
      divider: {
        display: "block",
        height: "1px",
        backgroundColor: ContextualMenuItemDividerColor,
        position: "relative"
      },
      root: [
        getFocusStyle(theme),
        fonts.small,
        {
          color: semanticColors.bodyText,
          backgroundColor: "transparent",
          border: "none",
          width: "100%",
          height: CONTEXTUAL_MENU_ITEM_HEIGHT,
          lineHeight: CONTEXTUAL_MENU_ITEM_HEIGHT,
          display: "block",
          cursor: "pointer",
          padding: "0px 8px 0 4px", // inner elements have a margin of 4px (4 + 4 = 8px as on right side)
          textAlign: "left"
        }
      ],
      rootDisabled: {
        color: semanticColors.disabledBodyText,
        cursor: "default",
        pointerEvents: "none",
        selectors: {
          [HighContrastSelector]: {
            color: "GrayText",
            opacity: 1
          }
        }
      },
      rootHovered: {
        backgroundColor: ContextualMenuItemBackgroundHoverColor,
        color: ContextualMenuItemTextHoverColor,
        selectors: {
          ".ms-ContextualMenu-icon": {
            color: palette.themeDarkAlt
          },
          ".ms-ContextualMenu-submenuIcon": {
            color: palette.neutralPrimary
          }
        },
        ...getItemHighContrastStyles()
      },
      rootFocused: {
        backgroundColor: palette.white,
        ...getItemHighContrastStyles()
      },
      rootChecked: {
        selectors: {
          ".ms-ContextualMenu-checkmarkIcon": {
            color: palette.neutralPrimary
          }
        },
        ...getItemHighContrastStyles()
      },
      rootPressed: {
        backgroundColor: ContextualMenuItemBackgroundSelectedColor,
        selectors: {
          ".ms-ContextualMenu-icon": {
            color: palette.themeDark
          },
          ".ms-ContextualMenu-submenuIcon": {
            color: palette.neutralPrimary
          }
        },
        ...getItemHighContrastStyles()
      },
      rootExpanded: {
        backgroundColor: ContextualMenuItemBackgroundSelectedColor,
        color: semanticColors.bodyTextChecked,
        ...getItemHighContrastStyles()
      },
      linkContent: {
        whiteSpace: "nowrap",
        height: "inherit",
        display: "flex",
        alignItems: "center",
        maxWidth: "100%"
      },
      anchorLink: {
        padding: "0px 8px 0 4px", // inner elements have a margin of 4px (4 + 4 = 8px as on right side)
        textRendering: "auto",
        color: "inherit",
        letterSpacing: "normal",
        wordSpacing: "normal",
        textTransform: "none",
        textIndent: "0px",
        textShadow: "none",
        textDecoration: "none",
        boxSizing: "border-box"
      },
      label: {
        margin: "0 4px",
        verticalAlign: "middle",
        display: "inline-block",
        flexGrow: "1",
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap"
      },
      secondaryText: {
        color: theme.palette.neutralSecondary,
        paddingLeft: "20px",
        textAlign: "right"
      },
      icon: {
        display: "inline-block",
        minHeight: "1px",
        maxHeight: CONTEXTUAL_MENU_ITEM_HEIGHT,
        fontSize: IconFontSizes.medium,
        width: IconFontSizes.medium,
        margin: "0 4px",
        verticalAlign: "middle",
        flexShrink: "0",
        selectors: {
          [MediumScreenSelector]: {
            fontSize: IconFontSizes.large,
            width: IconFontSizes.large
          }
        }
      },
      iconColor: {
        color: semanticColors.menuIcon,
        selectors: {
          [HighContrastSelector]: {
            color: "inherit"
          },
          ["$root:hover &"]: {
            selectors: {
              [HighContrastSelector]: {
                color: "HighlightText"
              }
            }
          },
          ["$root:focus &"]: {
            selectors: {
              [HighContrastSelector]: {
                color: "HighlightText"
              }
            }
          }
        }
      },
      iconDisabled: {
        color: semanticColors.disabledBodyText
      },
      checkmarkIcon: {
        color: semanticColors.bodySubtext,
        selectors: {
          [HighContrastSelector]: {
            color: "HighlightText"
          }
        }
      },
      subMenuIcon: {
        height: CONTEXTUAL_MENU_ITEM_HEIGHT,
        lineHeight: CONTEXTUAL_MENU_ITEM_HEIGHT,
        color: palette.neutralSecondary,
        textAlign: "center",
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: "0",
        fontSize: FontSizes.xSmall, // 12px
        selectors: {
          ":hover": {
            color: palette.neutralPrimary
          },
          ":active": {
            color: palette.neutralPrimary
          },
          [MediumScreenSelector]: {
            fontSize: FontSizes.icon // 16px
          }
        }
      },
      splitButtonFlexContainer: [
        getFocusStyle(theme),
        {
          display: "flex",
          height: CONTEXTUAL_MENU_ITEM_HEIGHT,
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "flex-start"
        }
      ]
    }

    return concatStyleSets(menuItemStyles)
  }
)

/**
 * {@docCategory ContextualMenu}
 */
export interface IContextualMenuItem {
  /**
   * Optional callback to access the IContextualMenuRenderItem interface. This will get passed down to ContextualMenuItem.
   */
  componentRef?: IRefObject<IContextualMenuRenderItem>

  /**
   * Unique id to identify the item
   */
  key: string

  /**
   * Text description for the menu item to display
   */
  text?: string

  /**
   * Seconday description for the menu item to display
   */
  secondaryText?: string

  itemType?: ContextualMenuItemType

  /**
   * Props that go to the IconComponent
   */
  iconProps?: IIconProps

  /**
   * Custom render function for the menu item icon
   */
  onRenderIcon?: IRenderFunction<IContextualMenuItemProps>

  /**
   * Props that go to the IconComponent used for the chevron.
   */
  submenuIconProps?: IIconProps

  /**
   * Whether the menu item is disabled
   * @defaultvalue false
   */
  disabled?: boolean

  /**
   * If the menu item is a split button, this prop disables purely the primary action of the button.
   * @defaultvalue false
   */
  primaryDisabled?: boolean

  /**
   * [TODO] Not Yet Implemented
   */
  shortCut?: string

  /**
   * Whether or not this menu item can be checked
   * @defaultvalue false
   */
  canCheck?: boolean

  /**
   * Whether or not this menu item is currently checked.
   * @defaultvalue false
   */
  checked?: boolean

  /**
   * Whether or not this menu item is a splitButton.
   * @defaultvalue false
   */
  split?: boolean

  /**
   * Any custom data the developer wishes to associate with the menu item.
   */
  data?: any

  /**
   * Callback issued when the menu item is invoked. If ev.preventDefault() is called in onClick, click will not close menu.
   * Returning true will dismiss the menu even if ev.preventDefault() was called.
   */
  onClick?: (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, item?: IContextualMenuItem) => boolean | void

  /**
   * An optional URL to navigate to upon selection
   */
  href?: string

  /**
   * An optional target when using href
   */
  target?: string

  /**
   * An optional rel when using href. If target is _blank rel is defaulted to a value to prevent clickjacking.
   */
  rel?: string

  /**
   * Properties to apply to a submenu to this item.
   *
   * The ContextualMenu will provide default values for `target`, `onDismiss`, `isSubMenu`,
   * `id`, `shouldFocusOnMount`, `directionalHint`, `className`, and `gapSpace`, all of which
   * can be overridden.
   */
  subMenuProps?: IContextualMenuProps

  /**
   * Method to provide the classnames to style the individual items inside a menu.
   * Deprecated, use `styles` prop of `IContextualMenuItemProps` to leverage mergeStyles API.
   * @deprecated Use `styles` prop of `IContextualMenuItemProps` to leverage mergeStyles API.
   */
  getItemClassNames?: (
    theme: ITheme,
    disabled: boolean,
    expanded: boolean,
    checked: boolean,
    isAnchorLink: boolean,
    knownIcon: boolean,
    itemClassName?: string,
    dividerClassName?: string,
    iconClassName?: string,
    subMenuClassName?: string,
    primaryDisabled?: boolean
  ) => IMenuItemClassNames

  /**
   * Optional IContextualMenuItemProps overrides to customize behaviors such as item styling via `styles`.
   */
  itemProps?: Partial<IContextualMenuItemProps>

  /**
   * Method to provide the classnames to style the Vertical Divider of a split button inside a menu.
   * Default value is the getVerticalDividerClassnames func defined in ContextualMenu.classnames
   * @defaultvalue getSplitButtonVerticalDividerClassNames
   */
  getSplitButtonVerticalDividerClassNames?: (theme: ITheme) => typeof getSplitButtonVerticalDividerClassNames

  /**
   *  Properties to apply to render this item as a section.
   *  This prop is mutually exclusive with subMenuProps.
   */
  sectionProps?: IContextualMenuSection

  /**
   * Additional css class to apply to the menu item
   * @defaultvalue undefined
   */
  className?: string

  /**
   * Additional styles to apply to the menu item
   * Deprecated, use `styles` instead.
   * @defaultvalue undefined
   * @deprecated in favor of the `styles` prop to leverage mergeStyles API.
   */
  style?: React.CSSProperties

  /**
   * Optional accessibility label (aria-label) attribute that will be stamped on to the element.
   * If none is specified, the aria-label attribute will contain the item name
   */
  ariaLabel?: string

  /**
   * Optional title for displaying text when hovering over an item.
   */
  title?: string

  /**
   * Method to custom render this menu item.
   * For keyboard accessibility, the top-level rendered item should be a focusable element
   * (like an anchor or a button) or have the `data-is-focusable` property set to true.
   *
   * The function receives a function that can be called to dismiss the menu as a second argument.
   *  This can be used to make sure that a custom menu item click dismisses the menu.
   * @defaultvalue undefined
   */
  onRender?: (item: any, dismissMenu: (ev?: any, dismissAll?: boolean) => void) => React.ReactNode

  /**
   * A function to be executed onMouseDown. This is executed before an onClick event and can
   * be used to interrupt native on click events as well. The click event should still handle
   * the commands. This should only be used in special cases when react and non-react are mixed.
   */
  onMouseDown?: (item: IContextualMenuItem, event: React.MouseEvent<HTMLElement>) => void

  /**
   * Optional override for the role attribute on the menu button. If one is not provided, it will
   * have a value of menuitem or menuitemcheckbox.
   */
  role?: string

  /**
   * When rendering a custom component that is passed in, the component might also be a list of
   * elements. We want to keep track of the correct index our menu is using based off of
   * the length of the custom list. It is up to the user to increment the count for their list.
   */
  customOnRenderListLength?: number

  /**
   * Keytip for this contextual menu item
   */
  keytipProps?: IKeytipProps

  /**
   * Any additional properties to use when custom rendering menu items.
   */
  [propertyName: string]: any

  /**
   * This prop is no longer used. All contextual menu items are now focusable when disabled.
   * @deprecated in 6.38.2 will be removed in 7.0.0
   */
  inactive?: boolean

  /**
   * Text description for the menu item to display
   * Deprecated, use `text` instead.
   * @deprecated Use `text` instead.
   */
  name?: string
}
/**
 * {@docCategory ContextualMenu}
 */
export interface IContextualMenuSubComponentStyles {
  /** Refers to the callout that hosts the ContextualMenu options */
  callout: IStyleFunctionOrObject<ICalloutContentStyleProps, any>

  /** Refers to the item in the list */
  menuItem: IStyleFunctionOrObject<IContextualMenuItemStyleProps, any>
}

/**
 * @deprecated in favor of mergeStyles API.
 */
export interface IContextualMenuClassNames {
  container: string
  root: string
  list: string
  header: string
  title: string
  subComponentStyles?: IContextualMenuSubComponentStyles
}

/**
 * @deprecated in favor of mergeStyles API.
 */
export interface IMenuItemClassNames {
  item: string
  divider: string
  root: string
  linkContent: string
  icon: string
  checkmarkIcon: string
  subMenuIcon: string
  label: string
  secondaryText: string
  splitContainer: string
  splitPrimary: string
  splitMenu: string
  linkContentMenu: string
}

export const getSplitButtonVerticalDividerClassNames = memoizeFunction(
  (theme: ITheme) => {
    return mergeStyleSets(getVerticalDividerStyles({ theme }), {
      wrapper: {
        position: "absolute",
        right: 28, // width of the splitMenu based on the padding plus icon fontSize
        selectors: {
          [MediumScreenSelector]: {
            right: 32 // fontSize of the icon increased from 12px to 16px
          }
        }
      },
      divider: {
        height: 16,
        width: 1
      }
    })
  }
)

const GlobalClassNames = {
  item: "ms-ContextualMenu-item",
  divider: "ms-ContextualMenu-divider",
  root: "ms-ContextualMenu-link",
  isChecked: "is-checked",
  isExpanded: "is-expanded",
  isDisabled: "is-disabled",
  linkContent: "ms-ContextualMenu-linkContent",
  linkContentMenu: "ms-ContextualMenu-linkContent",
  icon: "ms-ContextualMenu-icon",
  iconColor: "ms-ContextualMenu-iconColor",
  checkmarkIcon: "ms-ContextualMenu-checkmarkIcon",
  subMenuIcon: "ms-ContextualMenu-submenuIcon",
  label: "ms-ContextualMenu-itemText",
  secondaryText: "ms-ContextualMenu-secondaryText"
}

/**
 * @deprecated To be removed in 7.0.
 * @internal
 * This is a package-internal method that has been depended on.
 * It is being kept in this form for backwards compatibility.
 * It should be cleaned up in 7.0.
 *
 * TODO: Audit perf. impact of and potentially remove memoizeFunction.
 * https://github.com/OfficeDev/office-ui-fabric-react/issues/5534
 */
export const getItemClassNames = memoizeFunction(
  (
    theme: ITheme,
    disabled: boolean,
    expanded: boolean,
    checked: boolean,
    isAnchorLink: boolean,
    knownIcon: boolean,
    itemClassName?: string,
    dividerClassName?: string,
    iconClassName?: string,
    subMenuClassName?: string,
    primaryDisabled?: boolean,
    className?: string
  ): IContextualMenuItemStyles => {
    const styles = getMenuItemStyles(theme)
    const classNames = getGlobalClassNames(GlobalClassNames, theme)

    return mergeStyleSets({
      item: [classNames.item, styles.item, itemClassName],
      divider: [classNames.divider, styles.divider, dividerClassName],
      root: [
        classNames.root,
        styles.root,
        checked && [classNames.isChecked, styles.rootChecked],
        isAnchorLink && styles.anchorLink,
        expanded && [classNames.isExpanded, styles.rootExpanded],
        disabled && [classNames.isDisabled, styles.rootDisabled],
        !disabled &&
          !expanded && [
            {
              selectors: {
                ":hover": styles.rootHovered,
                ":active": styles.rootPressed,
                [`.${IsFocusVisibleClassName} &:focus, .${IsFocusVisibleClassName} &:focus:hover`]: styles.rootFocused,
                [`.${IsFocusVisibleClassName} &:hover`]: { background: "inherit;" }
              }
            }
          ],
        className
      ],
      splitPrimary: [
        styles.root,
        checked && ["is-checked", styles.rootChecked],
        (disabled || primaryDisabled) && ["is-disabled", styles.rootDisabled],
        !(disabled || primaryDisabled) &&
          !checked && [
            {
              selectors: {
                ":hover": styles.rootHovered,
                ":hover ~ $splitMenu": styles.rootHovered, // when hovering over the splitPrimary also affect the splitMenu
                ":active": styles.rootPressed,
                [`.${IsFocusVisibleClassName} &:focus, .${IsFocusVisibleClassName} &:focus:hover`]: styles.rootFocused,
                [`.${IsFocusVisibleClassName} &:hover`]: { background: "inherit;" }
              }
            }
          ]
      ],
      splitMenu: [
        styles.root,
        {
          flexBasis: "0",
          padding: "0 8px",
          minWidth: 28
        },
        expanded && ["is-expanded", styles.rootExpanded],
        disabled && ["is-disabled", styles.rootDisabled],
        !disabled &&
          !expanded && [
            {
              selectors: {
                ":hover": styles.rootHovered,
                ":active": styles.rootPressed,
                [`.${IsFocusVisibleClassName} &:focus, .${IsFocusVisibleClassName} &:focus:hover`]: styles.rootFocused,
                [`.${IsFocusVisibleClassName} &:hover`]: { background: "inherit;" }
              }
            }
          ]
      ],
      anchorLink: styles.anchorLink,
      linkContent: [classNames.linkContent, styles.linkContent],
      linkContentMenu: [
        classNames.linkContentMenu,
        styles.linkContent,
        {
          justifyContent: "center"
        }
      ],
      icon: [
        classNames.icon,
        knownIcon && styles.iconColor,
        styles.icon,
        iconClassName,
        disabled && [classNames.isDisabled, styles.iconDisabled]
      ],
      iconColor: styles.iconColor,
      checkmarkIcon: [classNames.checkmarkIcon, knownIcon && styles.checkmarkIcon, styles.icon, iconClassName],
      subMenuIcon: [
        classNames.subMenuIcon,
        styles.subMenuIcon,
        subMenuClassName,
        expanded && { color: theme.palette.neutralPrimary },
        disabled && [styles.iconDisabled]
      ],
      label: [classNames.label, styles.label],
      secondaryText: [classNames.secondaryText, styles.secondaryText],
      splitContainer: [
        styles.splitButtonFlexContainer,
        !disabled &&
          !checked && [
            {
              selectors: {
                [`.${IsFocusVisibleClassName} &:focus, .${IsFocusVisibleClassName} &:focus:hover`]: styles.rootFocused
              }
            }
          ]
      ]
    })
  }
)

/**
 * Wrapper function for generating ContextualMenuItem classNames which adheres to
 * the getStyles API, but invokes memoized className generator function with
 * primitive values.
 *
 * @param props the ContextualMenuItem style props used to generate its styles.
 */
export const getItemStyles = (props: IContextualMenuItemStyleProps): IContextualMenuItemStyles => {
  const {
    theme,
    disabled,
    expanded,
    checked,
    isAnchorLink,
    knownIcon,
    itemClassName,
    dividerClassName,
    iconClassName,
    subMenuClassName,
    primaryDisabled,
    className
  } = props

  return getItemClassNames(
    theme,
    disabled,
    expanded,
    checked,
    isAnchorLink,
    knownIcon,
    itemClassName,
    dividerClassName,
    iconClassName,
    subMenuClassName,
    primaryDisabled,
    className
  )
}

const renderItemIcon = (props: IContextualMenuItemProps) => {
  const { item, hasIcons, classNames } = props

  const { iconProps } = item

  if (!hasIcons) {
    return null
  }

  if (item.onRenderIcon) {
    return item.onRenderIcon(props)
  }

  return <Icon {...iconProps} className={classNames.icon} />
}

const renderCheckMarkIcon = ({ onCheckmarkClick, item, classNames }: IContextualMenuItemProps) => {
  const isItemChecked = getIsChecked(item)
  if (onCheckmarkClick) {
    // Ensures that the item is passed as the first argument to the checkmark click callback.
    const onClick = (e: React.MouseEvent<HTMLElement>) => onCheckmarkClick(item, e)

    return <Icon iconName={isItemChecked ? "CheckMark" : ""} className={classNames.checkmarkIcon} onClick={onClick} />
  }
  return null
}

const renderItemName = ({ item, classNames }: IContextualMenuItemProps) => {
  if (item.text || item.name) {
    return <span className={classNames.label}>{item.text || item.name}</span>
  }
  return null
}

const renderSecondaryText = ({ item, classNames }: IContextualMenuItemProps) => {
  if (item.secondaryText) {
    return <span className={classNames.secondaryText}>{item.secondaryText}</span>
  }
  return null
}

const renderSubMenuIcon = ({ item, classNames }: IContextualMenuItemProps) => {
  if (hasSubmenu(item)) {
    return <Icon iconName={getRTL() ? "ChevronLeft" : "ChevronRight"} {...item.submenuIconProps} className={classNames.subMenuIcon} />
  }
  return null
}

export class ContextualMenuItemBase extends React.Component<IContextualMenuItemProps, {}> {
  public render() {
    const { item, classNames } = this.props

    return (
      <div className={item.split ? classNames.linkContentMenu : classNames.linkContent}>
        {renderCheckMarkIcon(this.props)}
        {renderItemIcon(this.props)}
        {renderItemName(this.props)}
        {renderSecondaryText(this.props)}
        {renderSubMenuIcon(this.props)}
      </div>
    )
  }

  public openSubMenu = (): void => {
    const { item, openSubMenu, getSubmenuTarget } = this.props
    if (getSubmenuTarget) {
      const submenuTarget = getSubmenuTarget()
      if (hasSubmenu(item) && openSubMenu && submenuTarget) {
        openSubMenu(item, submenuTarget)
      }
    }
  }

  public dismissSubMenu = (): void => {
    const { item, dismissSubMenu } = this.props
    if (hasSubmenu(item) && dismissSubMenu) {
      dismissSubMenu()
    }
  }

  public dismissMenu = (dismissAll?: boolean): void => {
    const { dismissMenu } = this.props
    if (dismissMenu) {
      dismissMenu(undefined /* ev */, dismissAll)
    }
  }
}

/**
 * ContextualMenuItem description
 */
export const ContextualMenuItem: React.FunctionComponent<IContextualMenuItemProps> = styled<
  IContextualMenuItemProps,
  IContextualMenuItemStyleProps,
  IContextualMenuItemStyles
>(ContextualMenuItemBase, getItemStyles, undefined, { scope: "ContextualMenuItem" })

/**
 * {@docCategory ContextualMenu}
 */
export interface IContextualMenuRenderItem {
  /**
   * Function to open this item's subMenu, if present.
   */
  openSubMenu: () => void

  /**
   * Function to close this item's subMenu, if present.
   */
  dismissSubMenu: () => void

  /**
   * Dismiss the menu this item belongs to.
   */
  dismissMenu: (dismissAll?: boolean) => void
}

/**
 * {@docCategory ContextualMenu}
 */
export interface IContextualMenuItemProps extends React.HTMLAttributes<IContextualMenuItemProps> {
  /**
   * Optional callback to access the IContextualMenuRenderItem interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IContextualMenuRenderItem>

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IContextualMenuItemStyleProps, IContextualMenuItemStyles>

  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme

  /**
   * Additional css class to apply to the ContextualMenuItem
   * @defaultvalue undefined
   */
  className?: string

  /**
   * The item to display
   */
  item: IContextualMenuItem

  /**
   * Classnames for different aspects of a menu item
   */
  classNames: IMenuItemClassNames

  /**
   * Index of the item
   */
  index: number

  /**
   * If this item has icons
   */
  hasIcons: boolean | undefined

  /**
   * Click handler for the checkmark
   */
  onCheckmarkClick?: (item: IContextualMenuItem, ev: React.MouseEvent<HTMLElement>) => void

  /**
   * This prop will get set by ContextualMenu and can be called to open this item's subMenu, if present.
   */
  openSubMenu?: (item: any, target: HTMLElement) => void

  /**
   * This prop will get set by ContextualMenu and can be called to close this item's subMenu, if present.
   */
  dismissSubMenu?: () => void

  /**
   * This prop will get set by ContextualMenu and can be called to close the menu this item belongs to.
   * If dismissAll is true, all menus will be closed.
   */
  dismissMenu?: (ev?: any, dismissAll?: boolean) => void

  /**
   * This prop will get set by the wrapping component and will return the element that wraps this ContextualMenuItem.
   * Used for openSubMenu.
   */
  getSubmenuTarget?: () => HTMLElement | undefined
}

/**
 * {@docCategory ContextualMenu}
 */
export interface IContextualMenuItemStyleProps {
  /**
   * Theme provided by High-Order Component.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * Whether or not the menu item is disabled.
   */
  disabled: boolean

  /**
   * Whether or not the menu item is expanded.
   */
  expanded: boolean

  /**
   * Whether or not the menu item is checked.
   */
  checked: boolean

  /**
   * Indicates if a menu item is an anchor link.
   */
  isAnchorLink: boolean

  /**
   * Indicates if the icon used is of the known set of icons.
   */
  knownIcon: boolean

  /**
   * The optional class name to apply to the item element.
   */
  itemClassName?: string

  /**
   * The optional class name to apply to the divider element.
   */
  dividerClassName?: string

  /**
   * The optional class name to apply to the icon element.
   */
  iconClassName?: string

  /**
   * The optional class name to apply to the sub-menu if present.
   */
  subMenuClassName?: string

  /**
   * Whether or not the primary section of a split menu item is disabled.
   */
  primaryDisabled?: boolean
}

/**
 * {@docCategory ContextualMenu}
 */
export interface IContextualMenuItemStyles extends IButtonStyles {
  /**
   * Style for the root element.
   */
  root: IStyle

  /**
   * Styles for a menu item that is an anchor link.
   */
  item: IStyle

  /**
   * Styles for a divider item of a ContextualMenu.
   */
  divider: IStyle

  /**
   * Styles for the content inside the button/link of the menuItem.
   */
  linkContent: IStyle

  /**
   * Styles for a menu item that is an anchor link.
   */
  anchorLink: IStyle

  /**
   * Styles for the icon element of a menu item.
   */
  icon: IStyle

  /**
   * Default icon color style for known icons.
   */
  iconColor: IStyle

  /**
   * Default style for checkmark icons.
   */
  checkmarkIcon: IStyle

  /**
   * Styles for the submenu icon of a menu item.
   */
  subMenuIcon: IStyle

  /**
   * Styles for the label of a menu item.
   */
  label: IStyle

  /**
   * Styles for the secondary text of a menu item.
   */
  secondaryText: IStyle

  /**
   * Styles for the container of a split menu item.
   */
  splitContainer: IStyle

  /**
   * Styles for the primary portion of a split menu item.
   */
  splitPrimary: IStyle

  /**
   * Styles for the menu portion of a split menu item.
   */
  splitMenu: IStyle

  /**
   * Styles for a menu item that is a link.
   */
  linkContentMenu: IStyle
}

/**
 * {@docCategory ContextualMenu}
 */
export interface IMenuItemStyles extends IButtonStyles {
  /**
   * Styles for a menu item that is an anchor link.
   */
  item: IStyle

  /**
   * Styles for the content inside the button/link of the menuItem.
   */
  linkContent: IStyle

  /**
   * Styles for a menu item that is an anchor link.
   */
  anchorLink: IStyle

  /**
   * Default icon color style for known icons.
   */
  iconColor: IStyle

  /**
   * Default style for checkmark icons.
   */
  checkmarkIcon: IStyle

  /**
   * Styles for the submenu icon of a menu item.
   */
  subMenuIcon: IStyle

  /**
   * Styles for a divider item of a ConextualMenu.
   */
  divider: IStyle
}
