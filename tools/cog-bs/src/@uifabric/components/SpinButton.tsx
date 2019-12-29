import { concatStyleSets, IRawStyle, IStyle, memoizeFunction, mergeStyles } from "@uifabric/styleguide"
import { FontSizes, HighContrastSelector, IconFontSizes, ITheme } from "@uifabric/styleguide"
import {
  getId,
  IRefObject,
  KeyCodes,
  mergeAriaAttributeValues,
  Position,
  warnMutuallyExclusive,
  Async
} from "@uifabric/styleguide"
import * as React from "react"
import { IButtonStyles } from "./Buttons/Button"
import { Icon, IIconProps } from "./Icon"
import { IconButton } from "./Buttons/IconButton"
import { IKeytipProps } from "./Keytip"
import { KeytipData } from "./KeytipData"
import { Label } from "./Label"

export function calculatePrecision(value: number | string): number {
  /**
   * Group 1:
   * [1-9]([0]+$) matches trailing zeros
   * Group 2:
   * \.([0-9]*) matches all digits after a decimal point.
   */
  const groups = /[1-9]([0]+$)|\.([0-9]*)/.exec(String(value))
  if (!groups) {
    return 0
  }
  if (groups[1]) {
    return -groups[1].length
  }
  if (groups[2]) {
    return groups[2].length
  }
  return 0
}

/**
 * Rounds a number to a certain level of precision. Accepts negative precision.
 * @param value - The value that is being rounded.
 * @param precision - The number of decimal places to round the number to
 */
export function precisionRound(value: number, precision: number, base: number = 10): number {
  const exp = Math.pow(base, precision)
  return Math.round(value * exp) / exp
}

export interface ISpinButtonClassNames {
  root: string
  labelWrapper: string
  icon: string
  label: string
  spinButtonWrapper: string
  input: string
  arrowBox: string
}

export const getSpinButtonClassNames = memoizeFunction(
  (
    styles: ISpinButtonStyles,
    disabled: boolean,
    isFocused: boolean,
    keyboardSpinDirection: KeyboardSpinDirection,
    labelPosition: Position = Position.start,
    className: string | undefined = undefined
  ): ISpinButtonClassNames => {
    return {
      root: mergeStyles(styles.root, className),
      labelWrapper: mergeStyles(styles.labelWrapper, _getStyleForLabelBasedOnPosition(labelPosition, styles)),
      icon: mergeStyles(styles.icon, disabled && styles.iconDisabled),
      label: mergeStyles(styles.label, disabled && styles.labelDisabled),
      spinButtonWrapper: mergeStyles(
        styles.spinButtonWrapper,
        _getStyleForRootBasedOnPosition(labelPosition, styles),
        !disabled && [
          {
            selectors: {
              ":hover": styles.spinButtonWrapperHovered
            }
          },
          isFocused && {
            // This is to increase the specificity of the focus styles
            // and make it equal to that of the hover styles.
            selectors: {
              "&&": styles.spinButtonWrapperFocused
            }
          }
        ],
        disabled && styles.spinButtonWrapperDisabled
      ),
      input: mergeStyles(
        "ms-spinButton-input",
        styles.input,
        !disabled && {
          selectors: {
            "::selection": styles.inputTextSelected
          }
        },
        disabled && styles.inputDisabled
      ),
      arrowBox: mergeStyles(styles.arrowButtonsContainer, disabled && styles.arrowButtonsContainerDisabled)
    }
  }
)

/**
 * Returns the Style corresponding to the label position
 */
function _getStyleForLabelBasedOnPosition(labelPosition: Position, styles: ISpinButtonStyles): IStyle {
  switch (labelPosition) {
    case Position.start:
      return styles.labelWrapperStart
    case Position.end:
      return styles.labelWrapperEnd
    case Position.top:
      return styles.labelWrapperTop
    case Position.bottom:
      return styles.labelWrapperBottom
  }
}

/**
 * Returns the Style corresponding to the label position
 */
function _getStyleForRootBasedOnPosition(labelPosition: Position, styles: ISpinButtonStyles): IStyle {
  switch (labelPosition) {
    case Position.top:
    case Position.bottom:
      return styles.spinButtonWrapperTopBottom
    default:
      return {}
  }
}

const ARROW_BUTTON_WIDTH = 23
const ARROW_BUTTON_ICON_SIZE = 8
const DEFAULT_HEIGHT = 32
const LABEL_MARGIN = 10

const _getDisabledStyles = memoizeFunction(
  (theme: ITheme): IRawStyle => {
    const { semanticColors } = theme

    const SpinButtonTextColorDisabled = semanticColors.disabledText
    const SpinButtonBackgroundColorDisabled = semanticColors.disabledBackground

    return {
      backgroundColor: SpinButtonBackgroundColorDisabled,
      borderColor: "transparent",
      pointerEvents: "none",
      cursor: "default",
      color: SpinButtonTextColorDisabled,
      selectors: {
        [HighContrastSelector]: {
          color: "GrayText"
        }
      }
    }
  }
)

export const getArrowButtonStyles = memoizeFunction(
  (theme: ITheme, isUpArrow: boolean, customSpecificArrowStyles?: Partial<IButtonStyles>): IButtonStyles => {
    const { palette, effects } = theme

    // TODO: after updating the semanticColor slots all this need to be reevaluated.
    const ArrowButtonTextColor = palette.neutralSecondary
    const ArrowButtonTextColorHovered = palette.neutralPrimary
    const ArrowButtonTextColorPressed = palette.neutralPrimary

    const ArrowButtonBackgroundHovered = palette.neutralLighter
    const ArrowButtonBackgroundPressed = palette.neutralLight

    const defaultArrowButtonStyles: IButtonStyles = {
      root: {
        outline: "none",
        display: "block",
        height: "50%",
        width: ARROW_BUTTON_WIDTH,
        padding: 0,
        backgroundColor: "transparent",
        textAlign: "center",
        cursor: "default",
        color: ArrowButtonTextColor,
        selectors: {
          "&.ms-DownButton": {
            borderRadius: `0 0 ${effects.roundedCorner2} 0`
          },
          "&.ms-UpButton": {
            borderRadius: `0 ${effects.roundedCorner2} 0 0`
          }
        }
      },
      rootHovered: {
        backgroundColor: ArrowButtonBackgroundHovered,
        color: ArrowButtonTextColorHovered
      },
      rootChecked: {
        backgroundColor: ArrowButtonBackgroundPressed,
        color: ArrowButtonTextColorPressed,
        selectors: {
          [HighContrastSelector]: {
            backgroundColor: "Highlight",
            color: "HighlightText"
          }
        }
      },
      rootPressed: {
        backgroundColor: ArrowButtonBackgroundPressed,
        color: ArrowButtonTextColorPressed,
        selectors: {
          [HighContrastSelector]: {
            backgroundColor: "Highlight",
            color: "HighlightText"
          }
        }
      },
      rootDisabled: {
        opacity: 0.5,
        selectors: {
          [HighContrastSelector]: {
            color: "GrayText",
            opacity: 1
          }
        }
      },
      icon: {
        fontSize: ARROW_BUTTON_ICON_SIZE,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0
      }
    }

    // No specific styles needed as of now.
    const defaultUpArrowButtonStyles: Partial<IButtonStyles> = {}

    const defaultDownArrowButtonStyles: Partial<IButtonStyles> = {}

    return concatStyleSets(
      defaultArrowButtonStyles,
      isUpArrow ? defaultUpArrowButtonStyles : defaultDownArrowButtonStyles,
      customSpecificArrowStyles
    ) as IButtonStyles
  }
)

export const getSpinButtonStyles = memoizeFunction(
  (theme: ITheme, customStyles?: Partial<ISpinButtonStyles>): ISpinButtonStyles => {
    const { palette, semanticColors, effects } = theme

    const SpinButtonRootBorderColor = semanticColors.inputBorder
    const SpinButtonRootBorderColorHovered = semanticColors.inputBorderHovered
    const SpinButtonRootBorderColorFocused = semanticColors.inputFocusBorderAlt

    const SpinButtonTextColorDisabled = semanticColors.disabledText
    const SpinButtonInputTextColor = semanticColors.bodyText
    const SpinButtonInputTextColorSelected = palette.white
    const SpinButtonInputBackgroundColorSelected = palette.themePrimary

    const SpinButtonIconDisabledColor = semanticColors.disabledText

    const defaultStyles: ISpinButtonStyles = {
      root: {
        outline: "none",
        fontSize: FontSizes.small,
        width: "100%",
        minWidth: 86
      },
      labelWrapper: {
        display: "inline-flex"
      },
      labelWrapperStart: {
        height: DEFAULT_HEIGHT,
        alignItems: "center",
        float: "left",
        marginRight: LABEL_MARGIN
      },
      labelWrapperEnd: {
        height: DEFAULT_HEIGHT,
        alignItems: "center",
        float: "right",
        marginLeft: LABEL_MARGIN
      },
      labelWrapperTop: {
        marginBottom: LABEL_MARGIN
      },
      labelWrapperBottom: {
        marginTop: LABEL_MARGIN
      },
      icon: {
        padding: "0 5px",
        fontSize: IconFontSizes.large
      },
      iconDisabled: {
        color: SpinButtonIconDisabledColor
      },
      label: {
        pointerEvents: "none",
        padding: 0,
        // centering the label with the icon by forcing the exact same height as the icon.
        lineHeight: IconFontSizes.large
      },
      labelDisabled: {
        cursor: "default",
        color: SpinButtonTextColorDisabled,
        selectors: {
          [HighContrastSelector]: {
            color: "GrayText"
          }
        }
      },
      spinButtonWrapper: {
        display: "flex",
        boxSizing: "border-box",
        height: DEFAULT_HEIGHT,
        minWidth: 86,
        border: `1px solid ${SpinButtonRootBorderColor}`,
        borderRadius: effects.roundedCorner2
      },
      spinButtonWrapperTopBottom: {
        width: "100%"
      },
      spinButtonWrapperHovered: {
        borderColor: SpinButtonRootBorderColorHovered,
        selectors: {
          [HighContrastSelector]: {
            borderColor: "Highlight"
          }
        }
      },
      spinButtonWrapperFocused: {
        borderColor: SpinButtonRootBorderColorFocused,
        selectors: {
          [HighContrastSelector]: {
            borderColor: "Highlight"
          }
        }
      },
      spinButtonWrapperDisabled: _getDisabledStyles(theme),
      input: {
        boxSizing: "border-box",
        boxShadow: "none",
        borderStyle: "none",
        flex: 1,
        margin: 0,
        fontSize: FontSizes.small,
        color: SpinButtonInputTextColor,
        height: "100%",
        padding: "0 8px",
        outline: 0,
        display: "block",
        minWidth: 72,
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        cursor: "text",
        userSelect: "text",
        borderRadius: `${effects.roundedCorner2} 0 0 ${effects.roundedCorner2}`
      },
      inputTextSelected: {
        backgroundColor: SpinButtonInputBackgroundColorSelected,
        color: SpinButtonInputTextColorSelected,
        selectors: {
          [HighContrastSelector]: {
            backgroundColor: "Highlight",
            borderColor: "Highlight",
            color: "HighlightText"
          }
        }
      },
      inputDisabled: _getDisabledStyles(theme),
      arrowButtonsContainer: {
        display: "block",
        height: "100%",
        cursor: "default"
      },
      arrowButtonsContainerDisabled: _getDisabledStyles(theme)
    }
    return concatStyleSets(defaultStyles, customStyles) as ISpinButtonStyles
  }
)

export enum KeyboardSpinDirection {
  down = -1,
  notSpinning = 0,
  up = 1
}

export interface ISpinButtonState {
  /**
   * Is true when the control has focus.
   */
  isFocused: boolean

  /**
   * the value of the spin button
   */
  value: string

  /**
   * keyboard spin direction, used to style the up or down button
   * as active when up/down arrow is pressed
   */
  keyboardSpinDirection: KeyboardSpinDirection
}

export type DefaultProps = Required<
  Pick<ISpinButtonProps, "step" | "min" | "max" | "disabled" | "labelPosition" | "label" | "incrementButtonIcon" | "decrementButtonIcon">
>

/** Internal only props */
type ISpinButtonInternalProps = ISpinButtonProps & DefaultProps

//@customizable('SpinButton', ['theme', 'styles'], true)
export class SpinButton extends React.Component<ISpinButtonProps, ISpinButtonState> implements ISpinButton {
  public static defaultProps: DefaultProps = {
    step: 1,
    min: 0,
    max: 100,
    disabled: false,
    labelPosition: Position.start,
    label: "",
    incrementButtonIcon: { iconName: "ChevronUpSmall" },
    decrementButtonIcon: { iconName: "ChevronDownSmall" }
  }

  private _input = React.createRef<HTMLInputElement>()
  private _inputId: string
  private _labelId: string
  private _lastValidValue: string
  private _spinningByMouse: boolean
  private _valueToValidate: string | undefined // To avoid duplicate validations/submissions
  private _precision: number

  private _currentStepFunctionHandle: number
  private _initialStepDelay = 400
  private _stepDelay = 75

  _async = new Async(this)

  constructor(props: ISpinButtonProps) {
    super(props)

    const value = props.value || props.defaultValue || String(props.min) || "0"
    this._lastValidValue = value

    // Ensure that the autocalculated precision is not negative.
    this._precision = this._calculatePrecision(this.props as ISpinButtonInternalProps)

    this.state = {
      isFocused: false,
      value: value,
      keyboardSpinDirection: KeyboardSpinDirection.notSpinning
    }

    this._currentStepFunctionHandle = -1
    this._labelId = getId("Label")
    this._inputId = getId("input")
    this._spinningByMouse = false
    this._valueToValidate = undefined
  }

  /**
   * Invoked when a component is receiving new props. This method is not called for the initial render.
   */
  public UNSAFE_componentWillReceiveProps(newProps: ISpinButtonProps): void {
    this._lastValidValue = this.state.value
    let value: string = newProps.value ? newProps.value : String(newProps.min)
    if (newProps.defaultValue) {
      value = String(Math.max(newProps.min as number, Math.min(newProps.max as number, Number(newProps.defaultValue))))
    }

    if (newProps.value !== undefined) {
      this.setState({
        value: value
      })
    }
    this._precision = this._calculatePrecision(newProps as ISpinButtonProps & DefaultProps)
  }

  public render(): JSX.Element {
    const {
      disabled,
      label,
      min,
      max,
      labelPosition,
      iconProps,
      incrementButtonIcon,
      incrementButtonAriaLabel,
      decrementButtonIcon,
      decrementButtonAriaLabel,
      title,
      ariaLabel,
      ariaDescribedBy,
      styles: customStyles,
      upArrowButtonStyles: customUpArrowButtonStyles,
      downArrowButtonStyles: customDownArrowButtonStyles,
      theme,
      ariaPositionInSet,
      ariaSetSize,
      ariaValueNow,
      ariaValueText,
      keytipProps,
      className
    } = this.props as ISpinButtonInternalProps

    const { isFocused, value, keyboardSpinDirection } = this.state

    const classNames = this.props.getClassNames
      ? this.props.getClassNames(theme!, !!disabled, !!isFocused, keyboardSpinDirection, labelPosition, className)
      : getSpinButtonClassNames(
          getSpinButtonStyles(theme!, customStyles),
          !!disabled,
          !!isFocused,
          keyboardSpinDirection,
          labelPosition,
          className
        )

    return (
      <div className={classNames.root}>
        {labelPosition !== Position.bottom && (
          <div className={classNames.labelWrapper}>
            {iconProps && <Icon {...iconProps} className={classNames.icon} aria-hidden="true" />}
            {label && (
              <Label id={this._labelId} htmlFor={this._inputId} className={classNames.label}>
                {label}
              </Label>
            )}
          </div>
        )}
        <KeytipData keytipProps={keytipProps} disabled={disabled}>
          {(keytipAttributes: any): JSX.Element => (
            <div
              className={classNames.spinButtonWrapper}
              title={title && title}
              aria-label={ariaLabel && ariaLabel}
              aria-posinset={ariaPositionInSet}
              aria-setsize={ariaSetSize}
              data-ktp-target={keytipAttributes["data-ktp-target"]}
            >
              <input
                value={value}
                id={this._inputId}
                onChange={this._onChange}
                onInput={this._onInputChange}
                className={classNames.input}
                type="text"
                autoComplete="off"
                role="spinbutton"
                aria-labelledby={label && this._labelId}
                aria-valuenow={!isNaN(Number(ariaValueNow)) ? ariaValueNow : !isNaN(Number(value)) ? Number(value) : undefined}
                aria-valuetext={ariaValueText ? ariaValueText : isNaN(Number(value)) ? value : undefined}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-describedby={mergeAriaAttributeValues(ariaDescribedBy, keytipAttributes["aria-describedby"])}
                onBlur={this._onBlur}
                ref={this._input}
                onFocus={this._onFocus}
                onKeyDown={this._handleKeyDown}
                onKeyUp={this._handleKeyUp}
                readOnly={disabled}
                aria-disabled={disabled}
                data-lpignore={true}
                data-ktp-execute-target={keytipAttributes["data-ktp-execute-target"]}
              />
              <span className={classNames.arrowBox}>
                <IconButton
                  styles={getArrowButtonStyles(theme!, true, customUpArrowButtonStyles)}
                  className={"ms-UpButton"}
                  checked={keyboardSpinDirection === KeyboardSpinDirection.up}
                  disabled={disabled}
                  iconProps={incrementButtonIcon}
                  onMouseDown={this._onIncrementMouseDown}
                  onMouseLeave={this._stop}
                  onMouseUp={this._stop}
                  tabIndex={-1}
                  ariaLabel={incrementButtonAriaLabel}
                  data-is-focusable={false}
                />
                <IconButton
                  styles={getArrowButtonStyles(theme!, false, customDownArrowButtonStyles)}
                  className={"ms-DownButton"}
                  checked={keyboardSpinDirection === KeyboardSpinDirection.down}
                  disabled={disabled}
                  iconProps={decrementButtonIcon}
                  onMouseDown={this._onDecrementMouseDown}
                  onMouseLeave={this._stop}
                  onMouseUp={this._stop}
                  tabIndex={-1}
                  ariaLabel={decrementButtonAriaLabel}
                  data-is-focusable={false}
                />
              </span>
            </div>
          )}
        </KeytipData>
        {labelPosition === Position.bottom && (
          <div className={classNames.labelWrapper}>
            {iconProps && <Icon iconName={iconProps.iconName} className={classNames.icon} aria-hidden="true" />}
            {label && (
              <Label id={this._labelId} htmlFor={this._inputId} className={classNames.label}>
                {label}
              </Label>
            )}
          </div>
        )}
      </div>
    )
  }

  public focus(): void {
    if (this._input.current) {
      this._input.current.focus()
    }
  }

  private _onFocus = (ev: React.FocusEvent<HTMLInputElement>): void => {
    // We can't set focus on a non-existing element
    if (!this._input.current) {
      return
    }

    if (this._spinningByMouse || this.state.keyboardSpinDirection !== KeyboardSpinDirection.notSpinning) {
      this._stop()
    }

    this._input.current.select()

    this.setState({ isFocused: true })

    if (this.props.onFocus) {
      this.props.onFocus(ev)
    }
  }

  private _onBlur = (ev: React.FocusEvent<HTMLInputElement>): void => {
    this._validate(ev)
    this.setState({ isFocused: false })
    if (this.props.onBlur) {
      this.props.onBlur(ev)
    }
  }

  /**
   * Gets the value of the spin button.
   */
  public get value(): string | undefined {
    return this.props.value === undefined ? this.state.value : this.props.value
  }

  private _onValidate = (value: string, event?: React.SyntheticEvent<HTMLElement>): string | void => {
    if (this.props.onValidate) {
      return this.props.onValidate(value, event)
    } else {
      return this._defaultOnValidate(value)
    }
  }

  private _calculatePrecision = (props: ISpinButtonProps & DefaultProps) => {
    const { precision = Math.max(calculatePrecision(props.step), 0) } = props
    return precision
  }

  /**
   * Validate function to use if one is not passed in
   */
  private _defaultOnValidate = (value: string) => {
    if (value === null || value.trim().length === 0 || isNaN(Number(value))) {
      return this._lastValidValue
    }
    const newValue = Math.min(this.props.max as number, Math.max(this.props.min as number, Number(value)))
    return String(newValue)
  }

  private _onIncrement = (value: string): string | void => {
    if (this.props.onIncrement) {
      return this.props.onIncrement(value)
    } else {
      return this._defaultOnIncrement(value)
    }
  }

  /**
   * Increment function to use if one is not passed in
   */
  private _defaultOnIncrement = (value: string): string | void => {
    const { max, step } = this.props as ISpinButtonInternalProps
    let newValue: number = Math.min(Number(value) + Number(step), max)
    newValue = precisionRound(newValue, this._precision)
    return String(newValue)
  }

  private _onDecrement = (value: string): string | void => {
    if (this.props.onDecrement) {
      return this.props.onDecrement(value)
    } else {
      return this._defaultOnDecrement(value)
    }
  }

  /**
   * Increment function to use if one is not passed in
   */
  private _defaultOnDecrement = (value: string): string | void => {
    const { min, step } = this.props as ISpinButtonInternalProps
    let newValue: number = Math.max(Number(value) - Number(step), min)
    newValue = precisionRound(newValue, this._precision)
    return String(newValue)
  }

  private _onChange(): void {
    /**
     * A noop input change handler.
     * https://github.com/facebook/react/issues/7027.
     * Using the native onInput handler fixes the issue but onChange
     * still need to be wired to avoid React console errors
     * TODO: Check if issue is resolved when React 16 is available.
     */
  }

  /**
   * This is used when validating text entry
   * in the input (not when changed via the buttons)
   * @param event - the event that fired
   */
  private _validate = (event: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>): void => {
    if (this.state.value !== undefined && this._valueToValidate !== undefined && this._valueToValidate !== this._lastValidValue) {
      const newValue = this._onValidate!(this._valueToValidate, event)
      if (newValue) {
        this._lastValidValue = newValue
        this._valueToValidate = undefined
        this.setState({ value: newValue })
      }
    }
  }

  /**
   * The method is needed to ensure we are updating the actual input value.
   * without this our value will never change (and validation will not have the correct number)
   * @param event - the event that was fired
   */
  private _onInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const element: HTMLInputElement = event.target as HTMLInputElement
    const value: string = element.value
    this._valueToValidate = value
    this.setState({
      value: value
    })
  }

  /**
   * Update the value with the given stepFunction
   * @param shouldSpin - should we fire off another updateValue when we are done here? This should be true
   * when spinning in response to a mouseDown
   * @param stepFunction - function to use to step by
   */
  private _updateValue = (shouldSpin: boolean, stepDelay: number, stepFunction: (value: string) => string | void): void => {
    const newValue: string | void = stepFunction(this.state.value)
    if (newValue) {
      this._lastValidValue = newValue
      this.setState({ value: newValue })
    }

    if (this._spinningByMouse !== shouldSpin) {
      this._spinningByMouse = shouldSpin
    }

    if (shouldSpin) {
      this._currentStepFunctionHandle = this._async.setTimeout(() => {
        this._updateValue(shouldSpin, this._stepDelay, stepFunction)
      }, stepDelay)
    }
  }

  /**
   * Stop spinning (clear any currently pending update and set spinning to false)
   */
  private _stop = (): void => {
    if (this._currentStepFunctionHandle >= 0) {
      this._async.clearTimeout(this._currentStepFunctionHandle)
      this._currentStepFunctionHandle = -1
    }

    if (this._spinningByMouse || this.state.keyboardSpinDirection !== KeyboardSpinDirection.notSpinning) {
      this._spinningByMouse = false
      this.setState({ keyboardSpinDirection: KeyboardSpinDirection.notSpinning })
    }
  }

  /**
   * Handle keydown on the text field. We need to update
   * the value when up or down arrow are depressed
   * @param event - the keyboardEvent that was fired
   */
  private _handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    // eat the up and down arrow keys to keep focus in the spinButton
    // (especially when a spinButton is inside of a FocusZone)
    if (event.which === KeyCodes.up || event.which === KeyCodes.down || event.which === KeyCodes.enter) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (this.props.disabled) {
      this._stop()
      return
    }

    let spinDirection = KeyboardSpinDirection.notSpinning

    switch (event.which) {
      case KeyCodes.up:
        spinDirection = KeyboardSpinDirection.up
        this._updateValue(false /* shouldSpin */, this._initialStepDelay, this._onIncrement!)
        break
      case KeyCodes.down:
        spinDirection = KeyboardSpinDirection.down
        this._updateValue(false /* shouldSpin */, this._initialStepDelay, this._onDecrement!)
        break
      case KeyCodes.enter:
      case KeyCodes.tab:
        this._validate(event)
        break
      case KeyCodes.escape:
        if (this.state.value !== this._lastValidValue) {
          this.setState({ value: this._lastValidValue })
        }
        break
      default:
        break
    }

    // style the increment/decrement button to look active
    // when the corresponding up/down arrow keys trigger a step
    if (this.state.keyboardSpinDirection !== spinDirection) {
      this.setState({ keyboardSpinDirection: spinDirection })
    }
  }

  /**
   * Make sure that we have stopped spinning on keyUp
   * if the up or down arrow fired this event
   * @param event - keyboard event
   */
  private _handleKeyUp = (event: React.KeyboardEvent<HTMLElement>): void => {
    if (this.props.disabled || event.which === KeyCodes.up || event.which === KeyCodes.down) {
      this._stop()
      return
    }
  }

  private _onIncrementMouseDown = (): void => {
    this._updateValue(true /* shouldSpin */, this._initialStepDelay, this._onIncrement!)
  }

  private _onDecrementMouseDown = (): void => {
    this._updateValue(true /* shouldSpin */, this._initialStepDelay, this._onDecrement!)
  }
}

/**
 * {@docCategory SpinButton}
 */
export interface ISpinButton {
  /**
   * The value of the SpinButton. Use this if you intend to pass in a new value as a result of onChange events.
   * This value is mutually exclusive to defaultValue. Use one or the other.
   */
  value?: string

  /**
   * Sets focus to the spin button.
   */
  focus: () => void
}

/**
 * {@docCategory SpinButton}
 */
export interface ISpinButtonProps {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<ISpinButton>

  /**
   * The initial value of the SpinButton. Use this if you intend for the SpinButton to be an uncontrolled component.
   * This value is mutually exclusive to value. Use one or the other.
   * @defaultvalue 0
   */
  defaultValue?: string

  /**
   * The value of the SpinButton. Use this if you intend to pass in a new value as a result of onChange events.
   * This value is mutually exclusive to defaultValue. Use one or the other.
   */
  value?: string

  /**
   * The min value of the SpinButton.
   * @defaultvalue 0
   */
  min?: number

  /**
   * The max value of the SpinButton.
   * @defaultvalue 10
   */
  max?: number

  /**
   * The difference between the two adjacent values of the SpinButton.
   * This value is sued to calculate the precision of the input if no
   * precision is given. The precision calculated this way will always
   * be \>= 0.
   * @defaultvalue 1
   */
  step?: number

  /**
   * A description of the SpinButton for the benefit of screen readers.
   */
  ariaLabel?: string

  /**
   * Optional prop to add a string id that can be referenced inside the aria-describedby attribute
   */
  ariaDescribedBy?: string

  /**
   * A title for the SpinButton used for a more descriptive name that's also visible on its tooltip.
   */
  title?: string

  /**
   * Whether or not the SpinButton is disabled.
   */
  disabled?: boolean

  /**
   * Optional className for SpinButton.
   */
  className?: string

  /**
   * Descriptive label for the SpinButton.
   */
  label?: string

  /**
   * @defaultvalue Left
   */
  labelPosition?: Position

  /**
   * Icon that goes along with the label for the whole SpinButton
   */
  iconProps?: IIconProps

  /**
   * This callback is triggered when the value inside the SpinButton should be validated.
   * @param value - The value entered in the SpinButton to validate
   * @param event - The event that triggered this validate, if any. (For accessibility)
   * @returns If a string is returned, it will be used as the value of the SpinButton.
   */
  onValidate?: (value: string, event?: React.SyntheticEvent<HTMLElement>) => string | void

  /**
   * This callback is triggered when the increment button is pressed or if the user presses up arrow
   * with focus on the input of the spinButton
   * @returns If a string is returned, it will be used as the value of the SpinButton.
   */
  onIncrement?: (value: string) => string | void

  /**
   * This callback is triggered when the decrement button is pressed or if the user presses down arrow
   * with focus on the input of the spinButton
   * @returns If a string is returned, it will be used as the value of the SpinButton.
   */
  onDecrement?: (value: string) => string | void

  /**
   * A callback for when the user put focus on the picker
   */
  onFocus?: React.FocusEventHandler<HTMLInputElement>

  /**
   * A callback for when the user moves the focus away from the picker
   */
  onBlur?: React.FocusEventHandler<HTMLInputElement>

  /**
   * Icon for the increment button of the spinButton
   */
  incrementButtonIcon?: IIconProps

  /**
   * Icon for the decrement button of the spinButton
   */
  decrementButtonIcon?: IIconProps

  /**
   * Custom styling for individual elements within the button DOM.
   */
  styles?: Partial<ISpinButtonStyles>

  /**
   * Custom function for providing the classNames for the spinbutton. Can be used to provide
   * all styles for the component instead of applying them on top of the default styles.
   */
  getClassNames?: (
    theme: ITheme,
    disabled: boolean,
    isFocused: boolean,
    keyboardSpinDirection: KeyboardSpinDirection,
    labelPosition?: Position,
    className?: string
  ) => ISpinButtonClassNames

  /**
   * Custom styles for the upArrow button.
   *
   * Note: The buttons are in a checked state when arrow keys are used to
   * incremenent/decrement the spinButton. Use rootChecked instead of rootPressed
   * for styling when that is the case.
   */
  upArrowButtonStyles?: Partial<IButtonStyles>

  /**
   * Custom styles for the downArrow button.
   *
   * Note: The buttons are in a checked state when arrow keys are used to
   * incremenent/decrement the spinButton. Use rootChecked instead of rootPressed
   * for styling when that is the case.
   */
  downArrowButtonStyles?: Partial<IButtonStyles>

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Accessibile label text for the increment button for the benefit of the screen reader.
   */
  incrementButtonAriaLabel?: string

  /**
   * Accessibile label text for the decrement button for the benefit of the screen reader.
   */
  decrementButtonAriaLabel?: string

  /**
   * To how many decimal places the value should be rounded to.
   * The default value is calculated based on the precision of step.
   * IE: if step = 1, precision = 0. step = 0.0089, precision = 4. step = 300, precision = 2. step = 23.00, precision = 2.
   */
  precision?: number

  /**
   * The position in the parent set (if in a set) for aria-posinset.
   */
  ariaPositionInSet?: number

  /**
   * The total size of the parent set (if in a set) for aria-setsize.
   */
  ariaSetSize?: number

  /**
   * Sets the aria-valuenow of the spin button. The component must be
   * controlled by the creator who controls the value externally.
   * ariaValueNow would be the numeric form of value.
   */
  ariaValueNow?: number

  /*
   * Sets the aria-valuetext of the spin button. The component must be
   * controlled by the creator who controls the values externally.
   */
  ariaValueText?: string

  /**
   * Optional keytip for this spin button
   */
  keytipProps?: IKeytipProps
}

/**
 * {@docCategory SpinButton}
 */
export interface ISpinButtonStyles {
  /**
   * Styles for the root of the spin button component.
   */
  root: IStyle

  /**
   * Style for the label wrapper element of the component
   * The label wrapper contains the icon and the label.
   */
  labelWrapper: IStyle

  /**
   * Style override when the label is positioned at the start.
   */
  labelWrapperStart: IStyle

  /**
   * Style override when the label is positioned at the end.
   */
  labelWrapperEnd: IStyle

  /**
   * Style override when the label is positioned at the top.
   */
  labelWrapperTop: IStyle

  /**
   * Style override when the label is positioned at the bottom.
   */
  labelWrapperBottom: IStyle

  /**
   * Style for the icon.
   */
  icon: IStyle

  /**
   * Style for the icon.
   */
  iconDisabled: IStyle

  /**
   * Style for the label text
   */
  label: IStyle

  /**
   * Style for the label text
   */
  labelDisabled: IStyle

  /**
   * Style for spinButtonWrapper when enabled.
   */
  spinButtonWrapper: IStyle

  /**
   * Style override when label is positioned at the top/bottom.
   */
  spinButtonWrapperTopBottom: IStyle

  /**
   * Style override when spinButton is enabled/hovered.
   */
  spinButtonWrapperHovered: IStyle

  /**
   * Style override when spinButton is enabled/focused.
   */
  spinButtonWrapperFocused: IStyle

  /**
   * Style override when spinButton is disabled.
   */
  spinButtonWrapperDisabled: IStyle

  /**
   * Styles for the input.
   */
  input: IStyle

  /**
   * Style override for ::selection
   */
  inputTextSelected: IStyle

  /**
   * Style override when spinButton is disabled.
   */
  inputDisabled: IStyle

  /**
   * Styles for the arrowButtonsContainer
   */
  arrowButtonsContainer: IStyle

  /**
   * Style override for the arrowButtonsContainer when spin button is disabled.
   */
  arrowButtonsContainerDisabled: IStyle
}
