import { classNamesFunction, css, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { ITheme } from "@uifabric/styleguide"
import { getId, getNativeProps, htmlElementProperties, IRefObject, toMatrix } from "@uifabric/styleguide"
import * as React from "react"
import { ActionButton } from "./Buttons/ActionButton"
import { FocusZone } from "./FocusZone"


export class GridBase extends React.Component<IGridProps, {}> implements IGrid {
  private _id: string

  constructor(props: IGridProps) {
    super(props)
    this._id = getId()
  }

  public render(): JSX.Element {
    const { items, columnCount, onRenderItem, positionInSet, setSize, styles } = this.props

    const htmlProps = getNativeProps(this.props, htmlElementProperties, ["onBlur, aria-posinset, aria-setsize"])

    const classNames = classNamesFunction<IGridStyleProps, IGridStyles>()(styles!, { theme: this.props.theme! })

    // Array to store the cells in the correct row index
    const rowsOfItems: any[][] = toMatrix(items, columnCount)

    const content = (
      <table {...htmlProps} aria-posinset={positionInSet} aria-setsize={setSize} id={this._id} role={"grid"} className={classNames.root}>
        <tbody>
          {rowsOfItems.map((rows: any[], rowIndex: number) => {
            return (
              <tr role={"row"} key={this._id + "-" + rowIndex + "-row"}>
                {rows.map((cell: any, cellIndex: number) => {
                  return (
                    <td role={"presentation"} key={this._id + "-" + cellIndex + "-cell"} className={classNames.tableCell}>
                      {onRenderItem(cell, cellIndex)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )

    // Create the table/grid
    return this.props.doNotContainWithinFocusZone ? (
      content
    ) : (
      <FocusZone
        isCircularNavigation={this.props.shouldFocusCircularNavigate}
        className={classNames.focusedContainer}
        onBlur={this.props.onBlur}
      >
        {content}
      </FocusZone>
    )
  }
}

export const getGridStyles = (props: IGridStyleProps): IGridStyles => {
  return {
    root: {
      padding: 2,
      outline: "none"
    },
    tableCell: {
      padding: 0
    }
  }
}

export const Grid: React.FunctionComponent<IGridProps> = styled<IGridProps, IGridStyleProps, IGridStyles>(GridBase, getGridStyles)

export interface IGrid {}

export interface IGridProps {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<IGrid>

  /**
   * The items to turn into a grid
   */
  items: any[]

  /**
   * The number of columns
   */
  columnCount: number

  /**
   * Custom renderer for the individual items
   */
  onRenderItem: (item: any, index: number) => JSX.Element

  /**
   * Boolean indicating if the focus should support circular navigation.
   * This prop is only relevant if doNotcontainWithinFocusZone is not true
   */
  shouldFocusCircularNavigate?: boolean

  /**
   * If true do not contain the grid inside of a FocusZone.
   * If false contain the grid inside of a FocusZone.
   */
  doNotContainWithinFocusZone?: boolean

  /**
   * Optional, class name for the FocusZone container for the grid
   * @deprecated Use `styles` and `IGridStyles` to define a styling for the focus zone container with
   * focusedContainer property.
   */
  containerClassName?: string

  /**
   * Optional, handler for when the grid should blur
   */
  onBlur?: () => void

  /**
   * The optional position this grid is in the parent set (index in a parent menu, for example)
   */
  positionInSet?: number

  /**
   * The optional size of the parent set (size of parent menu, for example)
   */
  setSize?: number

  /**
   * Theme to apply to the component.
   */
  theme?: ITheme

  /**
   * Optional styles for the component.
   */
  styles?: IStyleFunctionOrObject<IGridStyleProps, IGridStyles>
}

/**
 * Properties required to build the styles for the grid component.
 */
export interface IGridStyleProps {
  /**
   * Theme to apply to the grid
   */
  theme: ITheme
}

/**
 * Styles for the Grid Component.
 */
export interface IGridStyles {
  /**
   * Style for the table container of a grid.
   */
  root: IStyle

  /**
   * Style for the table cells of the grid.
   */
  tableCell: IStyle

  /**
   * Optional, style for the FocusZone container for the grid
   */
  focusedContainer?: IStyle
}

export class GridCell<T, P extends IGridCellProps<T>> extends React.Component<P, {}> {
  public static defaultProps = {
    disabled: false,
    id: getId("gridCell")
  }

  public render(): JSX.Element {
    const {
      item,
      id,
      className,
      role,
      selected,
      disabled,
      onRenderItem,
      cellDisabledStyle,
      cellIsSelectedStyle,
      index,
      label,
      getClassNames
    } = this.props

    return (
      <ActionButton
        id={id}
        data-index={index}
        data-is-focusable={true}
        disabled={disabled}
        className={css(className, {
          ["" + cellIsSelectedStyle]: selected,
          ["" + cellDisabledStyle]: disabled
        })}
        onClick={this._onClick}
        onMouseEnter={this._onMouseEnter}
        onMouseMove={this._onMouseMove}
        onMouseLeave={this._onMouseLeave}
        onFocus={this._onFocus}
        role={role}
        aria-selected={selected}
        ariaLabel={label}
        title={label}
        getClassNames={getClassNames}
      >
        {onRenderItem(item)}
      </ActionButton>
    )
  }

  private _onClick = (): void => {
    const { onClick, disabled, item } = this.props as P

    if (onClick && !disabled) {
      onClick(item)
    }
  }

  private _onMouseEnter = (ev: React.MouseEvent<HTMLButtonElement>): void => {
    const { onHover, disabled, item, onMouseEnter } = this.props as P

    const didUpdateOnEnter = onMouseEnter && onMouseEnter(ev)

    if (!didUpdateOnEnter && onHover && !disabled) {
      onHover(item)
    }
  }

  private _onMouseMove = (ev: React.MouseEvent<HTMLButtonElement>): void => {
    const { onHover, disabled, item, onMouseMove } = this.props as P

    const didUpdateOnMove = onMouseMove && onMouseMove(ev)

    if (!didUpdateOnMove && onHover && !disabled) {
      onHover(item)
    }
  }

  private _onMouseLeave = (ev: React.MouseEvent<HTMLButtonElement>): void => {
    const { onHover, disabled, onMouseLeave } = this.props as P

    const didUpdateOnLeave = onMouseLeave && onMouseLeave(ev)
    //@ts-ignore
    if (!didUpdateOnLeave && onHover && !disabled) {
      onHover()
    }
  }

  private _onFocus = (): void => {
    const { onFocus, disabled, item } = this.props as P

    if (onFocus && !disabled) {
      onFocus(item)
    }
  }
}

export interface IGridCellProps<T> {
  /**
   * The option that will be made available to the user
   */
  item: T

  /**
   * Arbitrary unique string associated with this option
   */
  id: string

  /**
   * Optional, if the this option should be diabled
   */
  disabled?: boolean

  /**
   * Optional, if the cell is currently selected
   */
  selected?: boolean

  /**
   * The on click handler
   */
  onClick?: (item: T) => void

  /**
   * The render callback to handle rendering the item
   */
  onRenderItem: (item: T) => JSX.Element

  /**
   * Optional, the onHover handler
   */
  onHover?: (item?: T) => void

  /**
   * Optional, the onFocus handler
   */
  onFocus?: (item: T) => void

  /**
   * The accessible role for this option
   */
  role?: string

  /**
   * Optional, className(s) to apply
   */
  className?: string

  /**
   * Optional, the CSS class used for when the cell is disabled
   */
  cellDisabledStyle?: string[]

  /**
   * Optional, the CSS class used for when the cell is selected
   */
  cellIsSelectedStyle?: string[]

  /**
   * Index for this option
   */
  index?: number

  /**
   * The label for this item.
   * Visible text if this item is a header,
   * tooltip if is this item is normal
   */
  label?: string

  /**
   * Method to provide the classnames to style a button.
   * The default value for this prop is the getClassnames func
   * defined in BaseButton.classnames.
   */

  getClassNames?: (...args: any) => any
  // getClassNames?: (
  //   theme: ITheme,
  //   className: string,
  //   variantClassName: string,
  //   iconClassName: string | undefined,
  //   menuIconClassName: string | undefined,
  //   disabled: boolean,
  //   checked: boolean,
  //   expanded: boolean,
  //   isSplit: boolean | undefined
  // ) => IButtonClassNames;

  /**
   * Optional, mouseEnter handler.
   * @returns true if the event should be processed, false otherwise
   */
  onMouseEnter?: (ev: React.MouseEvent<HTMLButtonElement>) => boolean

  /**
   * Optional, mouseMove handler
   * @returns true if the event should be processed, false otherwise
   */
  onMouseMove?: (ev: React.MouseEvent<HTMLButtonElement>) => boolean

  /**
   * Optional, mouseLeave handler
   */
  onMouseLeave?: (ev: React.MouseEvent<HTMLButtonElement>) => void

  /**
   * Optional, onWheel handler
   */
  onWheel?: (ev: React.MouseEvent<HTMLButtonElement>) => void

  /**
   * Optional, onkeydown handler
   */
  onKeyDown?: (ev: React.KeyboardEvent<HTMLButtonElement>) => void
}
