import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { AnimationVariables, HighContrastSelector, ITheme, normalize } from "@uifabric/styleguide"
import {
  Async,
  EventGroup,
  getId,
  getNativeProps,
  inputProperties,
  IRefObject,
  KeyCodes,
  warnDeprecations
} from "@uifabric/styleguide"
import * as React from "react"
import { IButtonProps } from "./Buttons/Button"
import { IconButton } from "./Buttons/IconButton"
import { Icon, IIconProps } from "./Icon"


export interface ISearchBoxState {
  value?: string
  hasFocus?: boolean
  id?: string
}

export class SearchBoxBase extends React.Component<ISearchBoxProps, ISearchBoxState> {
  public static defaultProps: Pick<ISearchBoxProps, "disableAnimation" | "clearButtonProps"> = {
    disableAnimation: false,
    clearButtonProps: { ariaLabel: "Clear text" }
  }

  private _rootElement = React.createRef<HTMLDivElement>()
  private _inputElement = React.createRef<HTMLInputElement>()
  private _latestValue: string
  _async: Async
  _events: EventGroup

  public constructor(props: ISearchBoxProps) {
    super(props)

    this._async = new Async(this)
    this._events = new EventGroup(this)

    warnDeprecations("SearchBox", this.props, {
      labelText: "placeholder",
      defaultValue: "value"
    })

    this._latestValue = props.value || ""

    this.state = {
      value: this._latestValue,
      hasFocus: false,
      id: getId("SearchBox")
    }
  }

  public UNSAFE_componentWillReceiveProps(newProps: ISearchBoxProps): void {
    if (newProps.value !== undefined) {
      this._latestValue = newProps.value
      // If the user passes in null, substitute an empty string
      // (passing null is not allowed per typings, but users might do it anyway)
      this.setState({
        value: newProps.value || ""
      })
    }
  }

  public render() {
    const {
      ariaLabel,
      placeholder,
      className,
      disabled,
      underlined,
      styles,
      labelText,
      theme,
      clearButtonProps,
      disableAnimation,
      iconProps
    } = this.props
    const { value, hasFocus, id } = this.state
    const placeholderValue = labelText === undefined ? placeholder : labelText

    const classNames = classNamesFunction<ISearchBoxStyleProps, ISearchBoxStyles>()(styles!, {
      theme: theme!,
      className,
      underlined,
      hasFocus,
      disabled,
      hasInput: value!.length > 0,
      disableAnimation
    })

    const nativeProps = getNativeProps(this.props, inputProperties, ["id", "className", "placeholder", "onFocus", "onBlur", "value"])

    return (
      <div ref={this._rootElement} className={classNames.root} onFocusCapture={this._onFocusCapture}>
        <div className={classNames.iconContainer} onClick={this._onClickFocus} aria-hidden={true}>
          <Icon iconName="Search" {...iconProps} className={classNames.icon} />
        </div>
        <input
          {...nativeProps}
          id={id}
          className={classNames.field}
          placeholder={placeholderValue}
          onChange={this._onInputChange}
          onInput={this._onInputChange}
          onKeyDown={this._onKeyDown}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel ? ariaLabel : placeholder}
          ref={this._inputElement}
        />
        {value!.length > 0 && (
          <div className={classNames.clearButton}>
            <IconButton
              styles={{ root: { height: "auto" }, icon: { fontSize: "12px" } }}
              iconProps={{ iconName: "Clear" }}
              {...clearButtonProps}
              onClick={this._onClearClick}
            />
          </div>
        )}
      </div>
    )
  }

  /**
   * Sets focus to the search box input field
   */
  public focus() {
    if (this._inputElement.current) {
      this._inputElement.current.focus()
    }
  }

  /**
   * Returns whether or not the SearchBox has focus
   */
  public hasFocus(): boolean {
    return !!this.state.hasFocus
  }

  private _onClear(ev: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement> | React.KeyboardEvent<HTMLElement>) {
    this.props.onClear && this.props.onClear(ev)
    if (!ev.defaultPrevented) {
      this._latestValue = ""
      this.setState({
        value: ""
      })
      this._callOnChange("")
      ev.stopPropagation()
      ev.preventDefault()

      this.focus()
    }
  }

  private _onClickFocus = () => {
    const inputElement = this._inputElement.current
    if (inputElement) {
      this.focus()
      inputElement.selectionStart = inputElement.selectionEnd = 0
    }
  }

  private _onFocusCapture = (ev: React.FocusEvent<HTMLElement>) => {
    this.setState({
      hasFocus: true
    })

    this._events.on(ev.currentTarget, "blur", this._onBlur, true)

    if (this.props.onFocus) {
      this.props.onFocus(ev as React.FocusEvent<HTMLInputElement>)
    }
  }

  private _onClearClick = (ev: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const { clearButtonProps } = this.props

    if (clearButtonProps && clearButtonProps.onClick) {
      clearButtonProps.onClick(ev)
    }

    if (!ev.defaultPrevented) {
      this._onClear(ev)
    }
  }

  private _onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    switch (ev.which) {
      case KeyCodes.escape:
        this.props.onEscape && this.props.onEscape(ev)
        if (!ev.defaultPrevented) {
          this._onClear(ev)
        }
        break

      case KeyCodes.enter:
        if (this.props.onSearch) {
          this.props.onSearch(this.state.value)
        }
        break

      default:
        this.props.onKeyDown && this.props.onKeyDown(ev)
        if (!ev.defaultPrevented) {
          return
        }
    }

    // We only get here if the keypress has been handled,
    // or preventDefault was called in case of default keyDown handler
    ev.preventDefault()
    ev.stopPropagation()
  }

  private _onBlur = (ev: React.FocusEvent<HTMLInputElement>): void => {
    this._events.off(this._rootElement.current, "blur")
    this.setState({
      hasFocus: false
    })

    if (this.props.onBlur) {
      this.props.onBlur(ev)
    }
  }

  private _onInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value

    if (value === this._latestValue) {
      return
    }
    this._latestValue = value

    this.setState({ value })
    this._callOnChange(value)
  }

  private _callOnChange(newValue: string): void {
    const { onChange, onChanged } = this.props

    // Call @deprecated method.
    if (onChanged) {
      onChanged(newValue)
    }

    if (onChange) {
      onChange(newValue)
    }
  }
}

export function getSearchBoxStyles(props: ISearchBoxStyleProps): ISearchBoxStyles {
  const { theme, underlined, disabled, hasFocus, className, hasInput, disableAnimation } = props
  const { palette, fonts, semanticColors, effects } = theme

  return {
    root: [
      "ms-SearchBox",
      fonts.small,
      normalize,
      {
        color: palette.neutralPrimary,
        backgroundColor: semanticColors.inputBackground,
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "stretch",
        // The 1px top and bottom padding ensure the input field does not overlap the border
        padding: "1px 0 1px 4px",
        borderRadius: effects.roundedCorner2,
        border: `1px solid ${semanticColors.inputBorder}`,
        height: 32,
        selectors: {
          [HighContrastSelector]: {
            border: "1px solid WindowText"
          },
          ":hover": {
            borderColor: palette.neutralDark,
            selectors: {
              [HighContrastSelector]: {
                borderColor: "Highlight"
              }
            }
          },
          ":hover $iconContainer": {
            color: palette.themeDark
          }
        }
      },
      hasFocus && [
        "is-active",
        {
          borderColor: palette.themePrimary,
          selectors: {
            ":hover": {
              borderColor: palette.themePrimary
            },
            [HighContrastSelector]: {
              borderColor: "Highlight"
            }
          }
        }
      ],
      disabled && [
        "is-disabled",
        {
          borderColor: palette.neutralLighter,
          backgroundColor: palette.neutralLighter,
          pointerEvents: "none",
          cursor: "default"
        }
      ],
      underlined && [
        "is-underlined",
        {
          borderWidth: "0 0 1px 0",
          // Underlined SearchBox has a larger padding left to vertically align with the waffle in product
          padding: "1px 0 1px 8px"
        }
      ],
      underlined &&
        disabled && {
          backgroundColor: "transparent"
        },
      hasInput && "can-clear",
      className
    ],
    iconContainer: [
      "ms-SearchBox-iconContainer",
      {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 16,
        width: 32,
        textAlign: "center",
        color: palette.themePrimary,
        cursor: "text"
      },
      hasFocus && {
        width: 4
      },
      disabled && {
        color: palette.neutralTertiary
      },
      !disableAnimation && {
        transition: `width ${AnimationVariables.durationValue1}`
      }
    ],
    icon: [
      "ms-SearchBox-icon",
      {
        opacity: 1
      },
      hasFocus && {
        opacity: 0
      },
      !disableAnimation && {
        transition: `opacity ${AnimationVariables.durationValue1} 0s`
      }
    ],
    clearButton: [
      "ms-SearchBox-clearButton",
      {
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        cursor: "pointer",
        flexBasis: "32px",
        flexShrink: 0,
        padding: 1,
        color: palette.themePrimary
      }
    ],
    field: [
      "ms-SearchBox-field",
      normalize,
      {
        backgroundColor: "transparent",
        border: "none",
        outline: "none",
        fontWeight: "inherit",
        fontFamily: "inherit",
        fontSize: "inherit",
        color: palette.neutralPrimary,
        flex: "1 1 0px",
        // The default implicit value of 'auto' prevents the input from shrinking. Setting min-width to
        // 0px allows the input element to shrink to fit the container.
        minWidth: "0px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        // This padding forces the text placement to round up.
        paddingBottom: 0.5,
        // This removes the IE specific clear button in the input since we implimented our own
        selectors: {
          "::-ms-clear": {
            display: "none"
          },
          "::placeholder": {
            color: semanticColors.inputPlaceholderText,
            opacity: 1
          },
          ":-ms-input-placeholder": {
            color: semanticColors.inputPlaceholderText
          }
        }
      },
      disabled && {
        color: palette.neutralTertiary
      }
    ]
  }
}

export const SearchBox: React.FunctionComponent<ISearchBoxProps> = styled<ISearchBoxProps, ISearchBoxStyleProps, ISearchBoxStyles>(
  SearchBoxBase,
  getSearchBoxStyles,
  undefined,
  { scope: "SearchBox" }
)

/**
 * {@docCategory SearchBox}
 */
export interface ISearchBox {
  /**
   * Sets focus inside the search input box.
   */
  focus(): void

  /**
   * Returns whether or not the SearchBox has focus
   */
  hasFocus(): boolean
}

/**
 * {@docCategory SearchBox}
 */
export interface ISearchBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional callback to access the ISearchBox interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ISearchBox>

  /**
   * Placeholder for the search box.
   */
  placeholder?: string

  /**
   * Deprecated. Use `placeholder` instead.
   * @deprecated Use `placeholder` instead.
   */
  labelText?: string

  /**
   * Callback function for when the typed input for the SearchBox has changed.
   */
  onChange?: (newValue: any) => void

  /**
   * Callback executed when the user presses enter in the search box.
   */
  onSearch?: (newValue: any) => void

  /**
   * Callback executed when the user clears the search box by either clicking 'X' or hitting escape.
   */
  onClear?: (ev?: any) => void

  /**
   * Callback executed when the user presses escape in the search box.
   */
  onEscape?: (ev?: any) => void

  /**
   * Deprecated at v0.52.2, use `onChange` instead.
   * @deprecated Use `onChange` instead.
   */
  onChanged?: (newValue: any) => void

  /**
   * The value of the text in the SearchBox.
   */
  value?: string

  /**
   * The default value of the text in the SearchBox, in the case of an uncontrolled component.
   * This prop is being deprecated since so far, uncontrolled behavior has not been implemented.
   * @deprecated Not implemented.
   */
  defaultValue?: string

  /**
   * CSS class to apply to the SearchBox.
   */
  className?: string

  /**
   * The aria label of the SearchBox for the benefit of screen readers.
   * @defaultvalue placeholder
   */
  ariaLabel?: string

  /**
   * The props for the clear button.
   */
  clearButtonProps?: IButtonProps

  /**
   * The props for the icon.
   */
  iconProps?: Pick<IIconProps, Exclude<keyof IIconProps, "className">>

  /**
   * Whether or not the SearchBox is underlined.
   * @defaultvalue false
   */
  underlined?: boolean

  /**
   * Theme (provided through customization).
   */
  theme?: ITheme

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ISearchBoxStyleProps, ISearchBoxStyles>

  /**
   * Whether or not to animate the SearchBox icon on focus.
   * @defaultvalue false
   */
  disableAnimation?: boolean
}

/**
 * {@docCategory SearchBox}
 */
export interface ISearchBoxStyleProps {
  theme: ITheme
  className?: string
  disabled?: boolean
  hasFocus?: boolean
  underlined?: boolean
  hasInput?: boolean
  disableAnimation?: boolean
}

/**
 * {@docCategory SearchBox}
 */
export interface ISearchBoxStyles {
  root?: IStyle
  iconContainer?: IStyle
  icon?: IStyle
  field?: IStyle
  clearButton?: IStyle
}
