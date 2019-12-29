import { classNamesFunction, IsFocusVisibleClassName, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import {
  AnimationVariables,
  FontSizes,
  FontWeights,
  getGlobalClassNames,
  HighContrastSelector,
  ITheme,
  normalize
} from "@uifabric/styleguide"
import { divProperties, getId, getNativeProps, IRefObject, IRenderFunction, KeyCodes, warn } from "@uifabric/styleguide"
import * as React from "react"
import { ActionButton } from "./Buttons/ActionButton"
import { FocusZone, FocusZoneDirection } from "./FocusZone"
import { Icon } from "./Icon"
import { IKeytipProps } from "./Keytip"


export interface IPivotState {
  selectedKey: string | undefined
}

type PivotLinkCollection = {
  links: IPivotItemProps[]
  keyToIndexMapping: { [key: string]: number }
  keyToTabIdMapping: { [key: string]: string }
}

/**
 *  Usage:
 *
 *     <Pivot>
 *       <PivotItem headerText="Foo">
 *         <Label>Pivot #1</Label>
 *       </PivotItem>
 *       <PivotItem headerText="Bar">
 *         <Label>Pivot #2</Label>
 *       </PivotItem>
 *       <PivotItem headerText="Bas">
 *         <Label>Pivot #3</Label>
 *       </PivotItem>
 *     </Pivot>
 */
export class PivotBase extends React.Component<IPivotProps, IPivotState> {
  private _pivotId: string
  private _focusZone = React.createRef<FocusZone>()
  private _classNames: { [key in keyof IPivotStyles]: string }

  constructor(props: IPivotProps) {
    super(props)

    // this._warnDeprecations({
    //   initialSelectedKey: 'defaultSelectedKey',
    //   initialSelectedIndex: 'defaultSelectedIndex'
    // });

    this._pivotId = getId("Pivot")
    const links: IPivotItemProps[] = this._getPivotLinks(props).links

    const { defaultSelectedKey = props.initialSelectedKey, defaultSelectedIndex = props.initialSelectedIndex } = props

    let selectedKey: string | undefined

    if (defaultSelectedKey) {
      selectedKey = defaultSelectedKey
    } else if (typeof defaultSelectedIndex === "number") {
      selectedKey = links[defaultSelectedIndex].itemKey!
    } else if (links.length) {
      selectedKey = links[0].itemKey!
    }

    this.state = {
      selectedKey
    }
  }

  /**
   * Sets focus to the first pivot tab.
   */
  public focus(): void {
    if (this._focusZone.current) {
      this._focusZone.current.focus()
    }
  }

  public render(): JSX.Element {
    const linkCollection = this._getPivotLinks(this.props)
    const selectedKey = this._getSelectedKey(linkCollection)

    const divProps = getNativeProps(this.props, divProperties)

    this._classNames = this._getClassNames(this.props)

    return (
      <div {...divProps}>
        {this._renderPivotLinks(linkCollection, selectedKey)}
        {selectedKey && this._renderPivotItem(linkCollection, selectedKey)}
      </div>
    )
  }

  private _getSelectedKey(linkCollection: PivotLinkCollection) {
    const { selectedKey: propsSelectedKey } = this.props

    if (this._isKeyValid(linkCollection, propsSelectedKey) || propsSelectedKey === null) {
      return propsSelectedKey
    }

    const { selectedKey: stateSelectedKey } = this.state
    if (this._isKeyValid(linkCollection, stateSelectedKey)) {
      return stateSelectedKey
    }

    if (linkCollection.links.length) {
      return linkCollection.links[0].itemKey
    }

    return undefined
  }

  /**
   * Renders the set of links to route between pivots
   */
  private _renderPivotLinks(linkCollection: PivotLinkCollection, selectedKey: string | null | undefined): JSX.Element {
    const items = linkCollection.links.map((l) => this._renderPivotLink(linkCollection, l, selectedKey))

    return (
      <FocusZone componentRef={this._focusZone} direction={FocusZoneDirection.horizontal}>
        <div className={this._classNames.root} role="tablist">
          {items}
        </div>
      </FocusZone>
    )
  }

  private _renderPivotLink = (
    linkCollection: PivotLinkCollection,
    link: IPivotItemProps,
    selectedKey: string | null | undefined
  ): JSX.Element => {
    const { itemKey, headerButtonProps } = link
    const tabId = linkCollection.keyToTabIdMapping[itemKey!]
    const { onRenderItemLink } = link
    let linkContent: JSX.Element | null
    const isSelected: boolean = selectedKey === itemKey

    if (onRenderItemLink) {
      linkContent = onRenderItemLink(link, this._renderLinkContent)
    } else {
      linkContent = this._renderLinkContent(link)
    }

    let contentString = link.headerText || ""
    contentString += link.itemCount ? " (" + link.itemCount + ")" : ""
    // Adding space supplementary for icon
    contentString += link.itemIcon ? " xx" : ""

    return (
      <ActionButton
        {...headerButtonProps}
        id={tabId}
        key={itemKey}
        className={isSelected ? this._classNames.linkIsSelected : this._classNames.link}
        onClick={this._onLinkClick.bind(this, itemKey)}
        onKeyPress={this._onKeyPress.bind(this, itemKey)}
        ariaLabel={link.ariaLabel}
        role="tab"
        aria-selected={isSelected}
        name={link.headerText}
        keytipProps={link.keytipProps}
        data-content={contentString}
      >
        {linkContent}
      </ActionButton>
    )
  }

  private _renderLinkContent = (link: IPivotItemProps): JSX.Element => {
    const { itemCount, itemIcon, headerText } = link
    const classNames = this._classNames

    return (
      <span className={classNames.linkContent}>
        {itemIcon !== undefined && (
          <span className={classNames.icon}>
            <Icon iconName={itemIcon} />
          </span>
        )}
        {headerText !== undefined && <span className={classNames.text}> {link.headerText}</span>}
        {itemCount !== undefined && <span className={classNames.count}> ({itemCount})</span>}
      </span>
    )
  }

  /**
   * Renders the current Pivot Item
   */
  private _renderPivotItem(linkCollection: PivotLinkCollection, itemKey: string | undefined): JSX.Element | null {
    if (this.props.headersOnly || !itemKey) {
      return null
    }

    const index = linkCollection.keyToIndexMapping[itemKey]
    const selectedTabId = linkCollection.keyToTabIdMapping[itemKey]

    return (
      <div role="tabpanel" aria-labelledby={selectedTabId} className={this._classNames.itemContainer}>
        {React.Children.toArray(this.props.children)[index]}
      </div>
    )
  }

  /**
   * Gets the set of PivotLinks as array of IPivotItemProps
   * The set of Links is determined by child components of type PivotItem
   */
  private _getPivotLinks(props: IPivotProps): PivotLinkCollection {
    const result: PivotLinkCollection = {
      links: [],
      keyToIndexMapping: {},
      keyToTabIdMapping: {}
    }

    React.Children.map(React.Children.toArray(props.children), (child: any, index: number) => {
      if (typeof child === "object" && child.type === PivotItemType) {
        const pivotItem = child as PivotItem
        const { linkText, ...pivotItemProps } = pivotItem.props
        const itemKey = pivotItem.props.itemKey || index.toString()

        result.links.push({
          // Use linkText (deprecated) if headerText is not provided
          headerText: linkText,
          ...pivotItemProps,
          itemKey: itemKey
        })
        result.keyToIndexMapping[itemKey] = index
        result.keyToTabIdMapping[itemKey] = this._getTabId(itemKey, index)
      } else {
        warn("The children of a Pivot component must be of type PivotItem to be rendered.")
      }
    })

    return result
  }

  /**
   * Generates the Id for the tab button.
   */
  private _getTabId(itemKey: string, index: number): string {
    if (this.props.getTabId) {
      return this.props.getTabId(itemKey, index)
    }

    return this._pivotId + `-Tab${index}`
  }

  /**
   * whether the key exists in the pivot items.
   */
  private _isKeyValid(linkCollection: PivotLinkCollection, itemKey: string | null | undefined): boolean {
    return itemKey !== undefined && itemKey !== null && linkCollection.keyToIndexMapping[itemKey] !== undefined
  }

  /**
   * Handles the onClick event on PivotLinks
   */
  private _onLinkClick(itemKey: string, ev: React.MouseEvent<HTMLElement>): void {
    ev.preventDefault()
    this._updateSelectedItem(itemKey, ev)
  }

  /**
   * Handle the onKeyPress eventon the PivotLinks
   */
  private _onKeyPress(itemKey: string, ev: React.KeyboardEvent<HTMLElement>): void {
    if (ev.which === KeyCodes.enter) {
      ev.preventDefault()
      this._updateSelectedItem(itemKey)
    }
  }

  /**
   * Updates the state with the new selected index
   */
  private _updateSelectedItem(itemKey: string, ev?: React.MouseEvent<HTMLElement>): void {
    this.setState({
      selectedKey: itemKey
    })

    const linkCollection = this._getPivotLinks(this.props)

    if (this.props.onLinkClick && linkCollection.keyToIndexMapping[itemKey] >= 0) {
      const index = linkCollection.keyToIndexMapping[itemKey]

      // React.Element<any> cannot directly convert to PivotItem.
      const item = React.Children.toArray(this.props.children)[index] as any

      if (typeof item === "object" && item.type === PivotItemType) {
        this.props.onLinkClick(item as PivotItem, ev)
      }
    }
  }

  private _getClassNames(props: IPivotProps): { [key in keyof IPivotStyles]: string } {
    const { theme } = props
    const rootIsLarge: boolean = props.linkSize === PivotLinkSize.large
    const rootIsTabs: boolean = props.linkFormat === PivotLinkFormat.tabs

    return classNamesFunction<IPivotStyleProps, IPivotStyles>()(props.styles!, {
      theme: theme!,
      rootIsLarge,
      rootIsTabs
    })
  }
}

const globalPivotClassNames = {
  count: "ms-Pivot-count",
  icon: "ms-Pivot-icon",
  linkIsSelected: "is-selected",
  link: "ms-Pivot-link",
  linkContent: "ms-Pivot-linkContent",
  root: "ms-Pivot",
  rootIsLarge: "ms-Pivot--large",
  rootIsTabs: "ms-Pivot--tabs",
  text: "ms-Pivot-text"
}

const linkStyles = (props: IPivotStyleProps): IStyle[] => {
  const { rootIsLarge, rootIsTabs } = props
  const { palette, semanticColors } = props.theme
  return [
    {
      color: semanticColors.actionLink,
      display: "inline-block",
      fontSize: FontSizes.small,
      fontWeight: FontWeights.regular,
      lineHeight: 44,
      height: 44,
      marginRight: 8,
      padding: "0 8px",
      textAlign: "center",
      position: "relative",
      backgroundColor: "transparent",
      border: 0,
      borderRadius: 0,
      selectors: {
        ":before": {
          backgroundColor: "transparent",
          bottom: 0,
          content: '""',
          height: 2,
          left: 8,
          position: "absolute",
          right: 8,
          transition: `left ${AnimationVariables.durationValue2} ${AnimationVariables.easeFunction2},
                      right ${AnimationVariables.durationValue2} ${AnimationVariables.easeFunction2}`
        },
        ":after": {
          color: "transparent",
          content: "attr(data-content)",
          display: "block",
          fontWeight: FontWeights.bold,
          height: 1,
          overflow: "hidden",
          visibility: "hidden"
        },
        ":hover": {
          backgroundColor: palette.neutralLighter,
          color: semanticColors.actionLinkHovered,
          cursor: "pointer"
        },
        ":active": {
          backgroundColor: palette.neutralLight
        },
        ":focus": {
          outline: "none"
        },
        [`.${IsFocusVisibleClassName} &:focus`]: {
          outline: `1px solid ${semanticColors.focusBorder}`
        },
        [`.${IsFocusVisibleClassName} &:focus:after`]: {
          content: "attr(data-content)",
          position: "relative",
          border: 0
        }
      }
    },
    rootIsLarge && {
      fontSize: FontSizes.medium
    },
    rootIsTabs && [
      {
        marginRight: 0,
        height: 44,
        lineHeight: 44,
        backgroundColor: palette.neutralLighter,
        padding: "0 10px",
        verticalAlign: "top",
        selectors: {
          ":focus": {
            outlineOffset: "-1px"
          },
          [`.${IsFocusVisibleClassName} &:focus::before`]: {
            height: "auto",
            background: "transparent",
            transition: "none"
          }
        }
      }
    ]
  ]
}

export const getPivotStyles = (props: IPivotStyleProps): IPivotStyles => {
  const { className, rootIsLarge, rootIsTabs, theme } = props
  const { palette, semanticColors } = theme

  const classNames = getGlobalClassNames(globalPivotClassNames, theme)

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      normalize,
      {
        fontSize: FontSizes.small,
        fontWeight: FontWeights.regular,
        position: "relative",
        color: palette.themePrimary,
        whiteSpace: "nowrap"
      },
      rootIsLarge && classNames.rootIsLarge,
      rootIsTabs && classNames.rootIsTabs,
      className
    ],
    link: [
      classNames.link,
      ...linkStyles(props),
      rootIsTabs && {
        selectors: {
          "&:hover, &:focus": {
            color: palette.black
          },
          "&:active, &:hover": {
            color: palette.white,
            backgroundColor: palette.themePrimary
          }
        }
      }
    ],
    linkIsSelected: [
      classNames.link,
      classNames.linkIsSelected,
      ...linkStyles(props),
      {
        fontWeight: FontWeights.semibold,
        selectors: {
          ":before": {
            backgroundColor: semanticColors.inputBackgroundChecked,
            selectors: {
              [HighContrastSelector]: {
                backgroundColor: "Highlight"
              }
            }
          },
          ":hover::before": {
            left: 0,
            right: 0
          },
          [HighContrastSelector]: {
            color: "Highlight"
          }
        }
      },
      rootIsTabs && {
        backgroundColor: palette.themePrimary,
        color: palette.white,
        fontWeight: FontWeights.regular,
        selectors: {
          ":before": {
            backgroundColor: "transparent",
            transition: "none",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            content: '""',
            height: "auto"
          },
          ":hover": {
            backgroundColor: palette.themeDarkAlt,
            color: palette.white
          },
          "&:active": {
            backgroundColor: palette.themeDark,
            color: palette.white
          },
          [HighContrastSelector]: {
            fontWeight: FontWeights.semibold,
            color: "HighlightText",
            background: "Highlight",
            MsHighContrastAdjust: "none"
          }
        }
      }
    ],
    linkContent: [classNames.linkContent],
    text: [
      classNames.text,
      {
        display: "inline-block",
        verticalAlign: "top"
      }
    ],
    count: [
      classNames.count,
      {
        marginLeft: "4px",
        display: "inline-block",
        verticalAlign: "top"
      }
    ],
    icon: [
      classNames.icon,
      {
        selectors: {
          "& + $text": {
            marginLeft: "4px"
          }
        }
      }
    ]
  }
}

/**
 * The Pivot control and related tabs pattern are used for navigating frequently accessed,
 * distinct content categories. Pivots allow for navigation between two or more content
 * views and relies on text headers to articulate the different sections of content.
 */
export const Pivot: React.FunctionComponent<IPivotProps> = styled<IPivotProps, IPivotStyleProps, IPivotStyles>(
  PivotBase,
  getPivotStyles,
  undefined,
  {
    scope: "Pivot"
  }
)

export interface IPivot {
  /**
   * Sets focus to the first pivot tab.
   */
  focus(): void
}

export interface IPivotProps extends React.ClassAttributes<PivotBase>, React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional callback to access the IPivot interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IPivot>

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IPivotStyleProps, IPivotStyles>

  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme

  /**
   * Additional css class to apply to the Pivot
   * @defaultvalue undefined
   */
  className?: string

  /**
   * Default selected key for the pivot. Only provide this if the pivot is an uncontrolled component;
   * otherwise, use the `selectedKey` property.
   *
   * This property is also mutually exclusive with `defaultSelectedIndex`.
   */
  defaultSelectedKey?: string

  /**
   * Default selected index for the pivot. Only provide this if the pivot is an uncontrolled component;
   * otherwise, use the `selectedKey` property.
   *
   * This property is also mutually exclusive with `defaultSelectedKey`.
   */
  defaultSelectedIndex?: number

  /**
   * Index of the pivot item initially selected. Mutually exclusive with `initialSelectedKey`.
   * Only provide this if the pivot is an uncontrolled component; otherwise, use `selectedKey`.
   *
   * @deprecated Use `defaultSelectedIndex`
   */
  initialSelectedIndex?: number

  /**
   * Key of the pivot item initially selected. Mutually exclusive with `initialSelectedIndex`.
   * Only provide this if the pivot is an uncontrolled component; otherwise, use `selectedKey`.
   *
   * @deprecated Use `defaultSelectedKey`
   */
  initialSelectedKey?: string

  /**
   * Key of the selected pivot item. Updating this will override the Pivot's selected item state.
   * Only provide this if the pivot is a controlled component where you are maintaining the
   * current state; otherwise, use `defaultSelectedKey`.
   */
  selectedKey?: string | null

  /**
   * Callback for when the selected pivot item is changed.
   */
  onLinkClick?: (item?: PivotItem, ev?: React.MouseEvent<HTMLElement>) => void

  /**
   * PivotLinkSize to use (normal, large)
   */
  linkSize?: PivotLinkSize

  /**
   * PivotLinkFormat to use (links, tabs)
   */
  linkFormat?: PivotLinkFormat

  /**
   * Whether to skip rendering the tabpanel with the content of the selected tab.
   * Use this prop if you plan to separately render the tab content
   * and don't want to leave an empty tabpanel in the page that may confuse Screen Readers.
   */
  headersOnly?: boolean

  /**
   * Callback to customize how IDs are generated for each tab header.
   * Useful if you're rendering content outside and need to connect aria-labelledby.
   */
  getTabId?: (itemKey: string, index: number) => string
}

export type IPivotStyleProps = Required<Pick<IPivotProps, "theme">> &
  Pick<IPivotProps, "className"> & {
    /** Indicates whether Pivot has large format. */
    rootIsLarge?: boolean
    /** Indicates whether Pivot has tabbed format. */
    rootIsTabs?: boolean
    /**
     * Indicates whether Pivot link is selected.
     * @deprecated Is not populated with valid value. Specify `linkIsSelected` styling instead.
     */
    linkIsSelected?: boolean
  }

export interface IPivotStyles {
  /**
   * Style for the root element.
   */
  root: IStyle
  link: IStyle
  linkContent: IStyle
  linkIsSelected: IStyle
  text: IStyle
  count: IStyle
  icon: IStyle
  itemContainer?: IStyle
}

export enum PivotLinkFormat {
  /**
   * Display Pivot Links as links
   */
  links = 0,

  /**
   * Display Pivot Links as Tabs
   */
  tabs = 1
}

export enum PivotLinkSize {
  /**
   * Display Link using normal font size
   */
  normal = 0,

  /**
   * Display links using large font size
   */
  large = 1
}

export class PivotItem extends React.Component<IPivotItemProps, {}> {
  constructor(props: IPivotItemProps) {
    super(props)
  }

  public render(): JSX.Element {
    return <div {...getNativeProps(this.props, divProperties)}>{this.props.children}</div>
  }
}

const PivotItemType = (<PivotItem /> as React.ReactElement<IPivotItemProps>).type

/**
 * {@docCategory Pivot}
 */
export interface IPivotItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<{}>

  /**
   * The text displayed of each pivot link - renaming to `headerText`.
   * @deprecated Use `headerText` instead.
   */
  linkText?: string

  /**
   * The text displayed of each pivot link.
   */
  headerText?: string

  /**
   * Props for the header command button supporting native props - data-* and aria-* - for each pivot header/link element
   */
  headerButtonProps?: { [key: string]: string | number | boolean }

  /**
   * An required key to uniquely identify a pivot item.
   *
   * Note: The 'key' from react props cannot be used inside component.
   */
  itemKey?: string

  /**
   * The aria label of each pivot link which will read by screen reader instead of linkText.
   *
   * Note that unless you have compelling requirements you should not override aria-label.
   */
  ariaLabel?: string

  /**
   * Defines an optional item count displayed in parentheses just after the `linkText`.
   *
   * Examples: completed (4), Unread (99+)
   */
  itemCount?: number | string

  /**
   * An optional icon to show next to the pivot link.
   */
  itemIcon?: string

  /**
   * Optional custom renderer for the pivot item link
   */
  onRenderItemLink?: IRenderFunction<IPivotItemProps>

  /**
   * Optional keytip for this PivotItem
   */
  keytipProps?: IKeytipProps
}
