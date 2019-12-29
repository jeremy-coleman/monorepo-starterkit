import {
  classNamesFunction,
  getRTL,
  IProcessedStyleSet,
  IRawStyle,
  IsFocusVisibleClassName,
  IStyle,
  IStyleFunctionOrObject,
  styled
} from "@uifabric/styleguide"
import {
  FontWeights,
  getFocusStyle,
  getGlobalClassNames,
  getScreenSelector,
  HighContrastSelector,
  ITheme,
  ScreenWidthMaxMedium,
  ScreenWidthMaxSmall,
  ScreenWidthMinMedium
} from "@uifabric/styleguide"
import {
  DirectionalHint,
  getNativeProps,
  htmlElementProperties,
  IComponentAs,
  IRefObject,
  IRenderFunction
} from "@uifabric/styleguide"
import * as React from "react"
import { IconButton } from "./Buttons/IconButton"
import { FocusZone, FocusZoneDirection, IFocusZoneProps } from "./FocusZone"
import { Icon, IIconProps } from "./Icon"
import { Link } from "./Link"
import { ResizeGroup } from "./ResizeGroup"
import { TooltipHost, TooltipOverflowMode } from "./TooltipHost"

const OVERFLOW_KEY = "overflow"
const nullFunction = (): null => null


export class BreadcrumbBase extends React.Component<IBreadcrumbProps, any> {
  get iconName() {
    return (getRTL() && "ChevronLeft") || "ChevronRight"
  }

  public static defaultProps: IBreadcrumbProps = {
    items: [],
    maxDisplayedItems: 999,
    overflowIndex: 0
  }

  private _classNames: IProcessedStyleSet<IBreadcrumbStyles>
  private _focusZone = React.createRef<FocusZone>()

  constructor(props: IBreadcrumbProps) {
    super(props)

    this._validateProps(props)
  }

  /**
   * Sets focus to the first breadcrumb link.
   */
  public focus(): void {
    if (this._focusZone.current) {
      this._focusZone.current.focus()
    }
  }

  public render(): JSX.Element {
    this._validateProps(this.props)

    const { onReduceData = this._onReduceData, overflowIndex, maxDisplayedItems, items, className, theme, styles } = this.props
    const renderedItems = [...items]
    const renderedOverflowItems = renderedItems.splice(overflowIndex!, renderedItems.length - maxDisplayedItems!)
    const breadcrumbData: IBreadcrumbData = {
      props: this.props,
      renderedItems,
      renderedOverflowItems
    }

    this._classNames = classNamesFunction<IBreadcrumbStyleProps, IBreadcrumbStyles>()(styles, {
      className,
      theme: theme!
    })

    return <ResizeGroup onRenderData={this._onRenderBreadcrumb} onReduceData={onReduceData} data={breadcrumbData} />
  }

  private _onReduceData = (data: IBreadcrumbData): IBreadcrumbData | undefined => {
    let { renderedItems, renderedOverflowItems } = data
    const { overflowIndex } = data.props

    const movedItem = renderedItems[overflowIndex!]
    renderedItems = [...renderedItems]
    renderedItems.splice(overflowIndex!, 1)

    renderedOverflowItems = [...renderedOverflowItems, movedItem]

    if (movedItem !== undefined) {
      return { ...data, renderedItems, renderedOverflowItems }
    }
  }

  private _onRenderBreadcrumb = (data: IBreadcrumbData) => {
    const {
      ariaLabel,
      dividerAs: DividerType = Icon as React.ReactType<IDividerAsProps>,
      onRenderItem = this._onRenderItem,
      overflowAriaLabel,
      overflowIndex
    } = data.props
    const { renderedOverflowItems, renderedItems } = data

    const contextualItems = renderedOverflowItems.map((item, index) => ({
      name: item.text,
      key: item.key,
      onClick: item.onClick ? this._onBreadcrumbClicked.bind(this, item) : null,
      href: item.href
    }))

    // Find index of last rendered item so the divider icon
    // knows not to render on that item
    const lastItemIndex = renderedItems.length - 1
    const hasOverflowItems = renderedOverflowItems && renderedOverflowItems.length !== 0

    const itemElements: JSX.Element[] = renderedItems.map((item, index) => (
      <li className={this._classNames.listItem} key={item.key || String(index)}>
        {onRenderItem(item, this._onRenderItem)}
        {(index !== lastItemIndex || (hasOverflowItems && index === overflowIndex! - 1)) && (
          <DividerType className={this._classNames.chevron} iconName={this.iconName} item={item} />
        )}
      </li>
    ))

    if (hasOverflowItems) {
      itemElements.splice(
        overflowIndex!,
        0,
        <li className={this._classNames.overflow} key={OVERFLOW_KEY}>
          <IconButton
            className={this._classNames.overflowButton}
            iconProps={{ iconName: "More" }}
            role="button"
            aria-haspopup="true"
            ariaLabel={overflowAriaLabel}
            onRenderMenuIcon={nullFunction}
            menuProps={{
              items: contextualItems,
              directionalHint: DirectionalHint.bottomLeftEdge
            }}
          />
          {overflowIndex !== lastItemIndex + 1 && (
            <DividerType
              className={this._classNames.chevron}
              iconName={getRTL() ? "ChevronLeft" : "ChevronRight"}
              item={renderedOverflowItems[renderedOverflowItems.length - 1]}
            />
          )}
        </li>
      )
    }

    const nativeProps = getNativeProps(this.props, htmlElementProperties, ["className"])

    return (
      <div className={this._classNames.root} role="navigation" aria-label={ariaLabel} {...nativeProps}>
        <FocusZone componentRef={this._focusZone} direction={FocusZoneDirection.horizontal} {...this.props.focusZoneProps}>
          <ol className={this._classNames.list}>{itemElements}</ol>
        </FocusZone>
      </div>
    )
  }

  private _onRenderItem = (item: IBreadcrumbItem) => {
    if (item.onClick || item.href) {
      return (
        <Link
          className={this._classNames.itemLink}
          href={item.href}
          aria-current={item.isCurrentItem ? "page" : undefined}
          onClick={this._onBreadcrumbClicked.bind(this, item)}
        >
          <TooltipHost content={item.text} overflowMode={TooltipOverflowMode.Parent}>
            {item.text}
          </TooltipHost>
        </Link>
      )
    } else {
      return (
        <span className={this._classNames.item}>
          <TooltipHost content={item.text} overflowMode={TooltipOverflowMode.Parent}>
            {item.text}
          </TooltipHost>
        </span>
      )
    }
  }

  private _onBreadcrumbClicked = (item: IBreadcrumbItem, ev: React.MouseEvent<HTMLElement>) => {
    if (item.onClick) {
      item.onClick(ev, item)
    }
  }

  /**
   * Validate incoming props
   * @param props - Props to validate
   */
  private _validateProps(props: IBreadcrumbProps): void {
    const { maxDisplayedItems, overflowIndex, items } = props
    if (
      overflowIndex! < 0 ||
      (maxDisplayedItems! > 1 && overflowIndex! > maxDisplayedItems! - 1) ||
      (items.length > 0 && overflowIndex! > items.length - 1)
    ) {
      throw new Error("Breadcrumb: overflowIndex out of range")
    }
  }
}

const GlobalClassNames = {
  root: "ms-Breadcrumb",
  list: "ms-Breadcrumb-list",
  listItem: "ms-Breadcrumb-listItem",
  chevron: "ms-Breadcrumb-chevron",
  overflow: "ms-Breadcrumb-overflow",
  overflowButton: "ms-Breadcrumb-overflowButton",
  itemLink: "ms-Breadcrumb-itemLink",
  item: "ms-Breadcrumb-item"
}

const SingleLineTextStyle: IRawStyle = {
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden"
}

const overflowButtonFontSize = 16
const chevronSmallFontSize = 8
const itemLineHeight = 36
const itemFontSize = 18

const MinimumScreenSelector = getScreenSelector(0, ScreenWidthMaxSmall)
const MediumScreenSelector = getScreenSelector(ScreenWidthMinMedium, ScreenWidthMaxMedium)

export const getBreadcrumbStyles = (props: IBreadcrumbStyleProps): IBreadcrumbStyles => {
  const { className, theme } = props
  const { palette, semanticColors } = theme

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  // Tokens
  const itemBackgroundHoveredColor = semanticColors.menuItemBackgroundHovered
  const itemBackgroundPressedColor = semanticColors.menuItemBackgroundPressed
  const itemTextColor = palette.neutralSecondary
  const itemTextFontWeight = FontWeights.regular
  const itemTextHoveredOrPressedColor = palette.neutralPrimary
  const itemLastChildTextColor = palette.neutralPrimary
  const itemLastChildTextFontWeight = FontWeights.semibold
  const chevronButtonColor = palette.neutralSecondary
  const overflowButtonColor = palette.neutralSecondary

  const lastChildItemStyles: IRawStyle = {
    fontWeight: itemLastChildTextFontWeight,
    color: itemLastChildTextColor
  }

  const itemStateSelectors = {
    ":hover": {
      color: itemTextHoveredOrPressedColor,
      backgroundColor: itemBackgroundHoveredColor,
      cursor: "pointer",
      selectors: {
        [HighContrastSelector]: {
          color: "Highlight"
        }
      }
    },
    ":active": {
      backgroundColor: itemBackgroundPressedColor,
      color: itemTextHoveredOrPressedColor
    },
    "&:active:hover": {
      color: itemTextHoveredOrPressedColor,
      backgroundColor: itemBackgroundPressedColor
    },
    "&:active, &:hover, &:active:hover": {
      textDecoration: "none"
    }
  }

  const commonItemStyles: IRawStyle = {
    color: itemTextColor,
    padding: "0 8px",
    lineHeight: itemLineHeight,
    fontSize: itemFontSize,
    fontWeight: itemTextFontWeight
  }

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      {
        margin: "11px 0 1px"
      },
      className
    ],

    list: [
      classNames.list,
      {
        whiteSpace: "nowrap",
        padding: 0,
        margin: 0,
        display: "flex",
        alignItems: "stretch"
      }
    ],

    listItem: [
      classNames.listItem,
      {
        listStyleType: "none",
        margin: "0",
        padding: "0",
        display: "flex",
        position: "relative",
        alignItems: "center",
        selectors: {
          "&:last-child .ms-Breadcrumb-itemLink": lastChildItemStyles,
          "&:last-child .ms-Breadcrumb-item": lastChildItemStyles
        }
      }
    ],

    chevron: [
      classNames.chevron,
      {
        color: chevronButtonColor,
        fontSize: theme.fonts.xSmall.fontSize,
        selectors: {
          [HighContrastSelector]: {
            color: "WindowText",
            MsHighContrastAdjust: "none"
          },
          [MediumScreenSelector]: {
            fontSize: chevronSmallFontSize
          },
          [MinimumScreenSelector]: {
            fontSize: chevronSmallFontSize
          }
        }
      }
    ],

    overflow: [
      classNames.overflow,
      {
        position: "relative",
        display: "flex",
        alignItems: "center"
      }
    ],

    overflowButton: [
      classNames.overflowButton,
      getFocusStyle(theme),
      SingleLineTextStyle,
      {
        fontSize: overflowButtonFontSize,
        color: overflowButtonColor,
        height: "100%",
        cursor: "pointer",
        selectors: {
          ...itemStateSelectors,
          [MinimumScreenSelector]: {
            padding: "4px 6px"
          },
          [MediumScreenSelector]: {
            fontSize: theme.fonts.smallPlus.fontSize
          }
        }
      }
    ],

    itemLink: [
      classNames.itemLink,
      getFocusStyle(theme),
      SingleLineTextStyle,
      {
        ...commonItemStyles,
        selectors: {
          ":focus": {
            color: palette.neutralDark
          },
          [`.${IsFocusVisibleClassName} &:focus`]: {
            outline: `none`
          },
          ...itemStateSelectors
        }
      }
    ],

    item: [
      classNames.item,
      {
        ...commonItemStyles,
        selectors: {
          ":hover": {
            cursor: "default"
          }
        }
      }
    ]
  }
}

export const Breadcrumb: React.FunctionComponent<IBreadcrumbProps> = styled<IBreadcrumbProps, IBreadcrumbStyleProps, IBreadcrumbStyles>(
  BreadcrumbBase,
  getBreadcrumbStyles,
  undefined,
  { scope: "Breadcrumb" }
)

/**
 * {@docCategory Breadcrumb}
 */
export interface IBreadcrumbData {
  props: IBreadcrumbProps
  renderedItems: IBreadcrumbItem[]
  renderedOverflowItems: IBreadcrumbItem[]
}

/**
 * {@docCategory Breadcrumb}
 */
export interface IBreadcrumb {
  /**
   * Sets focus to the first breadcrumb link.
   */
  focus(): void
}

/**
 * {@docCategory Breadcrumb}
 */
export interface IBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Optional callback to access the IBreadcrumb interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IBreadcrumb>

  /**
   * Collection of breadcrumbs to render
   */
  items: IBreadcrumbItem[]

  /**
   * Optional root classname for the root breadcrumb element.
   */
  className?: string

  /**
   * Render a custom divider in place of the default chevron `>`
   */
  dividerAs?: IComponentAs<IDividerAsProps>

  /**
   * The maximum number of breadcrumbs to display before coalescing.
   * If not specified, all breadcrumbs will be rendered.
   */
  maxDisplayedItems?: number

  /** Method to call when trying to render an item. */

  onRenderItem?: IRenderFunction<IBreadcrumbItem>

  /**
   * Method to call when reducing the length of the breadcrumb.
   * Return undefined to never reduce breadcrumb length
   */
  onReduceData?: (data: IBreadcrumbData) => IBreadcrumbData | undefined

  /**
   * Aria label to place on the navigation landmark for breadcrumb
   */
  ariaLabel?: string

  /**
   * Optional name to use for aria label on overflow button.
   */
  overflowAriaLabel?: string

  /**
   * Optional index where overflow items will be collapsed. Defaults to 0.
   */
  overflowIndex?: number

  styles?: IStyleFunctionOrObject<IBreadcrumbStyleProps, IBreadcrumbStyles>
  theme?: ITheme

  /**
   * Focuszone props that will get passed through to the root focus zone.
   */
  focusZoneProps?: IFocusZoneProps
}

/**
 * {@docCategory Breadcrumb}
 */
export interface IBreadcrumbItem {
  /**
   * Text to display to the user for the breadcrumb
   */
  text: string

  /**
   * Arbitrary unique string associated with the breadcrumb
   */
  key: string

  /**
   * Callback issued when the breadcrumb is selected.
   */
  onClick?: (ev?: React.MouseEvent<HTMLElement>, item?: IBreadcrumbItem) => void

  /**
   * Url to navigate to when this breadcrumb is clicked.
   */
  href?: string

  /**
   * If this breadcrumb item is the item the user is currently on, if set to true, aria-current="page" will be applied to this
   * breadcrumb link
   */
  isCurrentItem?: boolean
}

/**
 * {@docCategory Breadcrumb}
 */
export interface IDividerAsProps extends IIconProps {
  /**
   * Optional breadcrumb item corresponds to left of the divider to be passed for custom rendering.
   * For overflowed items, it will be last item in the list
   */
  item?: IBreadcrumbItem
}

/**
 * {@docCategory Breadcrumb}
 */
export interface IBreadcrumbStyleProps {
  className?: string
  theme: ITheme
}

/**
 * {@docCategory Breadcrumb}
 */
export interface IBreadcrumbStyles {
  root: IStyle
  list: IStyle
  listItem: IStyle
  chevron: IStyle
  overflow: IStyle
  overflowButton: IStyle
  itemLink: IStyle
  item: IStyle
}
