import { classNamesFunction, css, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { ITheme } from "@uifabric/styleguide"
import { IComponentAs, IRefObject, nullRender } from "@uifabric/styleguide"
import * as React from "react"
import { IButtonProps, IButtonStyles } from "./Buttons/Button"
import { CommandBarButton } from "./Buttons/CommandBarButton"
import { IContextualMenuItem } from "./ContextualMenuItem"
import { FocusZone, FocusZoneDirection } from "./FocusZone"
import { IOverflowSet, OverflowSet } from "./OverflowSet"
import { IResizeGroup, ResizeGroup } from "./ResizeGroup"
import { ITooltipHostProps, TooltipHost } from "./TooltipHost"


export interface ICommandBarData {
  /**
   * Items being rendered in the primary region
   */
  primaryItems: ICommandBarItemProps[]
  /**
   * Items being rendered in the overflow
   */
  overflowItems: ICommandBarItemProps[]
  /**
   * Items being rendered on the far side
   */
  farItems: ICommandBarItemProps[] | undefined
  /**
   * Length of original overflowItems to ensure that they are not moved into primary region on resize
   */
  minimumOverflowItems: number
  /**
   * Unique string used to cache the width of the command bar
   */
  cacheKey: string
}

export class CommandBarBase extends React.Component<ICommandBarProps, {}> implements ICommandBar {
  public static defaultProps: ICommandBarProps = {
    items: [],
    overflowItems: []
  }

  private _overflowSet = React.createRef<IOverflowSet>()
  private _resizeGroup = React.createRef<IResizeGroup>()
  private _classNames!: {
    [key in keyof ICommandBarStyles]: string
  }

  public render(): JSX.Element {
    const {
      className,
      items,
      overflowItems,
      farItems,
      styles,
      theme,
      onReduceData = this._onReduceData,
      onGrowData = this._onGrowData
    } = this.props

    const commandBarData: ICommandBarData = {
      primaryItems: [...items],
      overflowItems: [...overflowItems!],
      minimumOverflowItems: [...overflowItems!].length, // for tracking
      farItems,
      cacheKey: ""
    }

    this._classNames = classNamesFunction<ICommandBarStyleProps, ICommandBarStyles>()(styles!, { theme: theme! })

    return (
      <ResizeGroup
        componentRef={this._resizeGroup}
        className={className}
        data={commandBarData}
        onReduceData={onReduceData}
        onGrowData={onGrowData}
        onRenderData={this._onRenderData}
      />
    )
  }

  public focus(): void {
    const { current: overflowSet } = this._overflowSet

    overflowSet && overflowSet.focus()
  }

  public remeasure(): void {
    this._resizeGroup.current && this._resizeGroup.current.remeasure()
  }

  private _onRenderData = (data: ICommandBarData): JSX.Element => {
    return (
      <FocusZone
        className={css(this._classNames.root)}
        direction={FocusZoneDirection.horizontal}
        role={"menubar"}
        aria-label={this.props.ariaLabel}
      >
        {/*Primary Items*/}
        <OverflowSet
          //componentRef={this._resolveRef('_overflowSet')}
          className={css(this._classNames.primarySet)}
          doNotContainWithinFocusZone={true}
          role={"presentation"}
          items={data.primaryItems}
          overflowItems={data.overflowItems.length ? data.overflowItems : undefined}
          onRenderItem={this._onRenderItem}
          onRenderOverflowButton={this._onRenderOverflowButton}
        />

        {/*Secondary Items*/}
        {data.farItems && (
          <OverflowSet
            className={css(this._classNames.secondarySet)}
            doNotContainWithinFocusZone={true}
            role={"presentation"}
            items={data.farItems}
            onRenderItem={this._onRenderItem}
            onRenderOverflowButton={nullRender}
          />
        )}
      </FocusZone>
    )
  }

  private _onRenderItem = (item: ICommandBarItemProps): JSX.Element | React.ReactNode => {
    if (item.onRender) {
      // These are the top level items, there is no relevant menu dismissing function to
      // provide for the IContextualMenuItem onRender function. Pass in a no op function instead.
      return item.onRender(item, () => undefined)
    }

    const itemText = item.text || item.name
    const commandButtonProps: ICommandBarItemProps = {
      allowDisabledFocus: true,
      role: "menuitem",
      ...item,
      styles: { root: { height: "100%" }, label: { whiteSpace: "nowrap" }, ...item.buttonStyles },
      className: css("ms-CommandBarItem-link", item.className),
      text: !item.iconOnly ? itemText : undefined,
      menuProps: item.subMenuProps,
      onClick: this._onButtonClick(item)
    }

    if (item.iconOnly && itemText !== undefined) {
      return (
        <TooltipHost content={itemText} {...item.tooltipHostProps}>
          {this._commandButton(item, commandButtonProps)}
        </TooltipHost>
      )
    }

    return this._commandButton(item, commandButtonProps)
  }

  private _commandButton = (item: ICommandBarItemProps, props: ICommandBarItemProps | IButtonProps) => {
    if (this.props.buttonAs) {
      const Type = this.props.buttonAs
      return <Type {...(props as IButtonProps)} defaultRender={CommandBarButton} />
    }
    if (item.commandBarButtonAs) {
      const Type = item.commandBarButtonAs
      return <Type {...(props as ICommandBarItemProps)} />
    }
    return <CommandBarButton {...(props as IButtonProps)} defaultRender={CommandBarButton} />
  }

  private _onButtonClick(item: ICommandBarItemProps): (ev: React.MouseEvent<HTMLButtonElement>) => void {
    return (ev) => {
      // inactive is deprecated. remove check in 7.0
      if (item.inactive) {
        return
      }
      if (item.onClick) {
        item.onClick(ev, item)
      }
    }
  }

  private _onRenderOverflowButton = (overflowItems: ICommandBarItemProps[]): JSX.Element => {
    const {
      overflowButtonAs: OverflowButtonType = CommandBarButton,
      overflowButtonProps = {} // assure that props is not empty
    } = this.props

    const combinedOverflowItems: ICommandBarItemProps[] = [
      ...(overflowButtonProps.menuProps ? overflowButtonProps.menuProps.items : []),
      ...overflowItems
    ]

    const overflowProps: IButtonProps = {
      ...overflowButtonProps,
      styles: { menuIcon: { fontSize: "17px" }, ...overflowButtonProps.styles },
      className: css("ms-CommandBar-overflowButton", overflowButtonProps.className),
      menuProps: { ...overflowButtonProps.menuProps, items: combinedOverflowItems },
      menuIconProps: { iconName: "More", ...overflowButtonProps.menuIconProps }
    }

    return <OverflowButtonType {...(overflowProps as IButtonProps)} />
  }

  private _computeCacheKey(data: ICommandBarData): string {
    const { primaryItems, farItems = [], overflowItems } = data
    const returnKey = (acc: string, current: ICommandBarItemProps): string => {
      const { cacheKey = current.key } = current
      return acc + cacheKey
    }

    const primaryKey = primaryItems.reduce(returnKey, "")
    const farKey = farItems.reduce(returnKey, "")
    const overflowKey = !!overflowItems.length ? "overflow" : ""

    return [primaryKey, farKey, overflowKey].join(" ")
  }

  private _onReduceData = (data: ICommandBarData): ICommandBarData | undefined => {
    const { shiftOnReduce, onDataReduced } = this.props
    let { primaryItems, overflowItems, cacheKey } = data

    // Use first item if shiftOnReduce, otherwise use last item
    const movedItem = primaryItems[shiftOnReduce ? 0 : primaryItems.length - 1]

    if (movedItem !== undefined) {
      movedItem.renderedInOverflow = true

      overflowItems = [movedItem, ...overflowItems]
      primaryItems = shiftOnReduce ? primaryItems.slice(1) : primaryItems.slice(0, -1)

      const newData = { ...data, primaryItems, overflowItems }
      cacheKey = this._computeCacheKey(newData)

      if (onDataReduced) {
        onDataReduced(movedItem)
      }

      newData.cacheKey = cacheKey
      return newData
    }

    return undefined
  }

  private _onGrowData = (data: ICommandBarData): ICommandBarData | undefined => {
    const { shiftOnReduce, onDataGrown } = this.props
    const { minimumOverflowItems } = data
    let { primaryItems, overflowItems, cacheKey } = data
    const movedItem = overflowItems[0]

    // Make sure that moved item exists and is not one of the original overflow items
    if (movedItem !== undefined && overflowItems.length > minimumOverflowItems) {
      movedItem.renderedInOverflow = false

      overflowItems = overflowItems.slice(1)
      // if shiftOnReduce, movedItem goes first, otherwise, last.
      primaryItems = shiftOnReduce ? [movedItem, ...primaryItems] : [...primaryItems, movedItem]

      const newData = { ...data, primaryItems, overflowItems }
      cacheKey = this._computeCacheKey(newData)

      if (onDataGrown) {
        onDataGrown(movedItem)
      }

      newData.cacheKey = cacheKey
      return newData
    }

    return undefined
  }
}

const COMMAND_BAR_HEIGHT = 44

export const getCommandBarStyles = (props: ICommandBarStyleProps): ICommandBarStyles => {
  const { className, theme } = props
  const { palette } = theme

  return {
    root: [
      theme.fonts.small,
      "ms-CommandBar",
      {
        display: "flex",
        backgroundColor: palette.white,
        padding: "0 14px 0 24px",
        height: COMMAND_BAR_HEIGHT
      },
      className
    ],
    primarySet: [
      "ms-CommandBar-primaryCommand",
      {
        flexGrow: "1",
        display: "flex",
        alignItems: "stretch"
      }
    ],
    secondarySet: [
      "ms-CommandBar-secondaryCommand",
      {
        flexShrink: "0",
        display: "flex",
        alignItems: "stretch"
      }
    ]
  }
}

// Create a CommandBar variant which uses these default styles and this styled subcomponent.
export const CommandBar: React.FunctionComponent<ICommandBarProps> = styled<ICommandBarProps, ICommandBarStyleProps, ICommandBarStyles>(
  CommandBarBase,
  getCommandBarStyles,
  undefined,
  {
    scope: "CommandBar"
  }
)

/**
 * {@docCategory CommandBar}
 */
export interface ICommandBar {
  /**
   * Sets focus to the active command in the list.
   */
  focus(): void

  /**
   * Remeasures the available space.
   */
  remeasure(): void
}

/**
 * {@docCategory CommandBar}
 */
export interface ICommandBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional callback to access the ICommandBar interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ICommandBar>

  /**
   * Items to render. ICommandBarItemProps extend IContextualMenuItem
   */
  items: ICommandBarItemProps[]

  /**
   * Items to render on the right side (or left, in RTL). ICommandBarItemProps extend IContextualMenuItem
   */
  farItems?: ICommandBarItemProps[]

  /**
   * Default items to have in the overflow menu. ICommandBarItemProps extend IContextualMenuItem
   */
  overflowItems?: ICommandBarItemProps[]

  /**
   * Props to be passed to overflow button.
   * If menuProps are passed through this prop, any items provided will be prepended to the top of the existing menu.
   */
  overflowButtonProps?: IButtonProps

  /**
   * Custom button to be used as oveflow button
   */
  overflowButtonAs?: IComponentAs<IButtonProps>

  /**
   * Custom button to be used as near and far items
   */
  buttonAs?: IComponentAs<IButtonProps>

  /**
   * When true, items will be 'shifted' off the front of the array when reduced, and unshifted during grow
   */
  shiftOnReduce?: Boolean

  /**
   * Custom function to reduce data if items do not fit in given space. Return `undefined`
   * if no more steps can be taken to avoid infinate loop.
   */
  onReduceData?: (data: ICommandBarData) => ICommandBarData | undefined

  /**
   * Custom function to grow data if items are too small for the given space.
   * Return `undefined` if no more steps can be taken to avoid infinate loop.
   */
  onGrowData?: (data: ICommandBarData) => ICommandBarData

  /**
   * Function callback invoked when data has been reduced.
   */
  onDataReduced?: (movedItem: ICommandBarItemProps) => void

  /**
   * Function callback invoked when data has been grown.
   */
  onDataGrown?: (movedItem: ICommandBarItemProps) => void

  /**
   * Additional css class to apply to the command bar
   * @defaultvalue undefined
   */
  className?: string

  /**
   * Accessibility text to be read by the screen reader when the user's
   * focus enters the command bar. The screen reader will read this text
   * after reading information about the first focusable item in the command
   * bar.
   */
  ariaLabel?: string

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<ICommandBarStyleProps, ICommandBarStyles>

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme
}

/**
 * ICommandBarItemProps extends IContextualMenuItem and adds a few CommandBar specific props
 * {@docCategory CommandBar}
 */
export interface ICommandBarItemProps extends IContextualMenuItem {
  /**
   * Remove text when button is not in the overflow
   * @defaultvalue false
   */
  iconOnly?: boolean

  /**
   * Props to pass into tooltip during iconOnly
   */
  tooltipHostProps?: ITooltipHostProps

  /**
   * Custom styles for individual button
   */
  buttonStyles?: IButtonStyles

  /**
   * A custom cache key to be used for this item. If cacheKey is changed, the cache will invalidate. Defaults to key value;
   */
  cacheKey?: string

  /**
   * Context under which the item is being rendered
   * This value is controlled by the component and useful for adjusting onRender function
   */
  renderedInOverflow?: boolean

  /**
   * Method to override the render of the individual command bar button. Note, is not used when rendered in overflow
   * @defaultvalue CommandBarButton
   */
  commandBarButtonAs?: IComponentAs<ICommandBarItemProps>
}

/**
 * {@docCategory CommandBar}
 */
export interface ICommandBarStyleProps {
  theme: ITheme
  className?: string
}

/**
 * {@docCategory CommandBar}
 */
export interface ICommandBarStyles {
  root?: IStyle
  primarySet?: IStyle
  secondarySet?: IStyle
}
