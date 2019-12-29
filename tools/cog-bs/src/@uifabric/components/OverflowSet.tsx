import {
  classNamesFunction,
  IProcessedStyleSet,
  IStyle,
  IStyleFunction,
  IStyleFunctionOrObject,
  styled
} from "@uifabric/styleguide"
import {
  divProperties,
  elementContains,
  focusFirstChild,
  getNativeProps,
  IRefObject,
  IRenderFunction
} from "@uifabric/styleguide"
import * as React from "react"
import { FocusZone, FocusZoneDirection, IFocusZone, IFocusZoneProps } from "./FocusZone"
import { IKeytipProps } from "./Keytip"
import { KeytipManager } from "./KeytipManager"


export class OverflowSetBase extends React.Component<IOverflowSetProps, {}> implements IOverflowSet {
  public static defaultProps: Pick<IOverflowSetProps, "vertical" | "role"> = {
    vertical: false,
    role: "menubar"
  }

  private _focusZone = React.createRef<IFocusZone>()
  private _persistedKeytips: { [uniqueID: string]: IKeytipProps } = {}
  private _keytipManager: KeytipManager = KeytipManager.getInstance()
  private _divContainer = React.createRef<HTMLDivElement>()
  private _classNames: IProcessedStyleSet<IOverflowSetStyles>

  constructor(props: IOverflowSetProps) {
    super(props)

    // if (props.doNotContainWithinFocusZone) {
    //   this._warnMutuallyExclusive({
    //     doNotContainWithinFocusZone: 'focusZoneProps'
    //   });
    // }
  }

  public render(): JSX.Element {
    const { items, overflowItems, className, focusZoneProps, styles, vertical, role, doNotContainWithinFocusZone } = this.props

    this._classNames = classNamesFunction<IOverflowSetStyleProps, IOverflowSetStyles>()(styles, { className, vertical })

    let Tag
    let uniqueComponentProps

    if (doNotContainWithinFocusZone) {
      Tag = "div"
      uniqueComponentProps = {
        ...getNativeProps(this.props, divProperties),
        ref: this._divContainer
      }
    } else {
      Tag = FocusZone
      uniqueComponentProps = {
        ...getNativeProps(this.props, divProperties),
        ...focusZoneProps,
        componentRef: this._focusZone,
        direction: vertical ? FocusZoneDirection.vertical : FocusZoneDirection.horizontal
      }
    }

    return (
      <Tag {...uniqueComponentProps} className={this._classNames.root} role={role}>
        {items && this._onRenderItems(items)}
        {overflowItems && overflowItems.length > 0 && this._onRenderOverflowButtonWrapper(overflowItems)}
      </Tag>
    )
  }

  /**
   * Sets focus to the first tabbable item in the OverflowSet.
   * @param forceIntoFirstElement - If true, focus will be forced into the first element,
   * even if focus is already in theOverflowSet
   * @returns True if focus could be set to an active element, false if no operation was taken.
   */
  public focus(forceIntoFirstElement?: boolean): boolean {
    let focusSucceeded = false

    if (this.props.doNotContainWithinFocusZone) {
      if (this._divContainer.current) {
        focusSucceeded = focusFirstChild(this._divContainer.current)
      }
    } else if (this._focusZone.current) {
      focusSucceeded = this._focusZone.current.focus(forceIntoFirstElement)
    }

    return focusSucceeded
  }

  /**
   * Sets focus to a specific child element within the OverflowSet.
   * @param childElement - The child element within the zone to focus.
   * @returns True if focus could be set to an active element, false if no operation was taken.
   */
  public focusElement(childElement?: HTMLElement): boolean {
    let focusSucceeded = false

    if (!childElement) {
      return false
    }

    if (this.props.doNotContainWithinFocusZone) {
      if (this._divContainer.current && elementContains(this._divContainer.current, childElement)) {
        childElement.focus()
        focusSucceeded = document.activeElement === childElement
      }
    } else if (this._focusZone.current) {
      focusSucceeded = this._focusZone.current.focusElement(childElement)
    }

    return focusSucceeded
  }

  // Add keytip register/unregister handlers to lifecycle functions to correctly manage persisted keytips
  public componentDidMount() {
    this._registerPersistedKeytips()
  }

  public componentWillUnmount() {
    this._unregisterPersistedKeytips()
  }

  public UNSAFE_componentWillUpdate() {
    this._unregisterPersistedKeytips()
  }

  public componentDidUpdate() {
    this._registerPersistedKeytips()
  }

  private _registerPersistedKeytips() {
    Object.keys(this._persistedKeytips).forEach((key: string) => {
      const keytip = this._persistedKeytips[key]
      const uniqueID = this._keytipManager.register(keytip, true)
      // Update map
      this._persistedKeytips[uniqueID] = keytip
      delete this._persistedKeytips[key]
    })
  }

  private _unregisterPersistedKeytips() {
    // Delete all persisted keytips saved
    Object.keys(this._persistedKeytips).forEach((uniqueID: string) => {
      this._keytipManager.unregister(this._persistedKeytips[uniqueID], uniqueID, true)
    })
    this._persistedKeytips = {}
  }

  private _onRenderItems = (items: IOverflowSetItemProps[]): JSX.Element[] => {
    return items.map((item, i) => {
      const wrapperDivProps: React.HTMLProps<HTMLDivElement> = {
        className: this._classNames.item
      }
      return (
        <div key={item.key} {...wrapperDivProps}>
          {this.props.onRenderItem(item)}
        </div>
      )
    })
  }

  private _onRenderOverflowButtonWrapper = (items: any[]): JSX.Element => {
    const wrapperDivProps: React.HTMLProps<HTMLDivElement> = {
      className: this._classNames.overflowButton
    }

    const overflowKeytipSequences = this.props.keytipSequences
    let newOverflowItems: any[] = []

    if (overflowKeytipSequences) {
      items.forEach((overflowItem) => {
        const keytip = (overflowItem as IOverflowSetItemProps).keytipProps
        if (keytip) {
          // Create persisted keytip
          const persistedKeytip: IKeytipProps = {
            content: keytip.content,
            keySequences: keytip.keySequences,
            disabled: keytip.disabled || !!(overflowItem.disabled || overflowItem.isDisabled),
            hasDynamicChildren: keytip.hasDynamicChildren,
            hasMenu: keytip.hasMenu
          }

          if (keytip.hasDynamicChildren || this._getSubMenuForItem(overflowItem)) {
            // If the keytip has a submenu or children nodes, change onExecute to persistedKeytipExecute
            persistedKeytip.onExecute = this._keytipManager.menuExecute.bind(
              this._keytipManager,
              overflowKeytipSequences,
              overflowItem.keytipProps.keySequences
            )
          } else {
            // If the keytip doesn't have a submenu, just execute the original function
            persistedKeytip.onExecute = keytip.onExecute
          }

          // Add this persisted keytip to our internal list, use a temporary uniqueID (its content)
          // uniqueID will get updated on register
          this._persistedKeytips[persistedKeytip.content] = persistedKeytip

          // Add the overflow sequence to this item
          const newOverflowItem = {
            ...overflowItem,
            keytipProps: {
              ...keytip,
              overflowSetSequence: overflowKeytipSequences
            }
          }
          newOverflowItems.push(newOverflowItem)
        } else {
          // Nothing to change, add overflowItem to list
          newOverflowItems.push(overflowItem)
        }
      })
    } else {
      newOverflowItems = items
    }
    return <div {...wrapperDivProps}>{this.props.onRenderOverflowButton(newOverflowItems)}</div>
  }

  /**
   * Gets the subMenu for an overflow item
   * Checks if itemSubMenuProvider has been defined, if not defaults to subMenuProps
   */
  private _getSubMenuForItem(item: any): any[] | undefined {
    if (this.props.itemSubMenuProvider) {
      return this.props.itemSubMenuProvider(item)
    }
    if (item.subMenuProps) {
      return item.subMenuProps.items
    }
    return undefined
  }
}

const overflowItemStyle: IStyle = {
  flexShrink: 0,
  display: "inherit"
}

export const getOverflowSetStyles: IStyleFunction<IOverflowSetStyleProps, IOverflowSetStyles> = (props) => {
  const { className, vertical } = props
  return {
    root: [
      "ms-OverflowSet",
      {
        position: "relative",
        display: "flex",
        flexWrap: "nowrap"
      },
      vertical && { flexDirection: "column" },
      className
    ],
    item: ["ms-OverflowSet-item", overflowItemStyle],
    overflowButton: ["ms-OverflowSet-overflowButton", overflowItemStyle]
  }
}

export const OverflowSet: React.FunctionComponent<IOverflowSetProps> = styled(OverflowSetBase, getOverflowSetStyles, undefined, {
  scope: "OverflowSet"
})

/**
 * {@docCategory OverflowSet}
 */
export interface IOverflowSet {
  /**
   * Sets focus to the first tabbable item in the zone.
   * @param forceIntoFirstElement - If true, focus will be forced into the first element, even if
   * focus is already in the focus zone.
   * @returns True if focus could be set to an active element, false if no operation was taken.
   */
  focus(forceIntoFirstElement?: boolean): boolean

  /**
   * Sets focus to a specific child element within the zone. This can be used in conjunction with
   * onBeforeFocus to created delayed focus scenarios (like animate the scroll position to the correct
   * location and then focus.)
   * @param childElement - The child element within the zone to focus.
   * @returns True if focus could be set to an active element, false if no operation was taken.
   */
  focusElement(childElement?: HTMLElement): boolean
}

/**
 * {@docCategory OverflowSet}
 */
export interface IOverflowSetProps extends React.ClassAttributes<OverflowSetBase> {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<IOverflowSet>

  /**
   * Class name
   */
  className?: string

  /**
   * An array of items to be rendered by your onRenderItem function in the primary content area
   */
  items?: IOverflowSetItemProps[]

  /**
   * Change item layout direction to vertical/stacked.
   * @defaultvalue false
   */
  vertical?: boolean

  /**
   * An array of items to be passed to overflow contextual menu
   */
  overflowItems?: IOverflowSetItemProps[]

  /**
   * Method to call when trying to render an item.
   */
  onRenderItem: (item: IOverflowSetItemProps) => any

  /**
   * Rendering method for overflow button and contextual menu. The argument to the function is
   * the overflowItems passed in as props to this function.
   */
  onRenderOverflowButton: IRenderFunction<any[]>

  /**
   * Custom properties for OverflowSet's FocusZone.
   * If doNotContainWithinFocusZone is set to true focusZoneProps will be ignored.
   * Use one or the other.
   */
  focusZoneProps?: IFocusZoneProps

  /**
   * If true do not contain the OverflowSet inside of a FocusZone,
   * otherwise the OverflowSet will contain a FocusZone.
   * If this is set to true focusZoneProps will be ignored.
   * Use one or the other.
   */
  doNotContainWithinFocusZone?: boolean

  /**
   * The role for the OverflowSet.
   * @defaultvalue 'menubar'
   */
  role?: string

  /**
   * Optional full keytip sequence for the overflow button, if it will have a keytip.
   */
  keytipSequences?: string[]

  /**
   * Function that will take in an IOverflowSetItemProps and return the subMenu for that item.
   * If not provided, will use 'item.subMenuProps.items' by default.
   * This is only used if your overflow set has keytips.
   */
  itemSubMenuProvider?: (item: IOverflowSetItemProps) => any[] | undefined

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IOverflowSetProps, IOverflowSetStyles>
}

/**
 * {@docCategory OverflowSet}
 */
export interface IOverflowSetStyles {
  /** The style that is layered onto the root element of OverflowSet. */
  root?: IStyle
  /** The style that is layered onto each individual item in the overflow set. */
  item?: IStyle
  /** The style that is layered onto the overflow button for the overflow set. */
  overflowButton?: IStyle
}

/**
 * The props needed to construct styles. This represents the simplified set of immutable things which control the class names.
 * {@docCategory OverflowSet}
 */
export type IOverflowSetStyleProps = Pick<IOverflowSetProps, "vertical" | "className">

/**
 * {@docCategory OverflowSet}
 */
export interface IOverflowSetItemProps {
  /**
   * Unique id to identify the item.
   */
  key: string

  /**
   * Optional keytip for the overflowSetItem.
   */
  keytipProps?: IKeytipProps

  /**
   * Any additional properties to use when custom rendering menu items.
   */
  [propertyName: string]: any
}
