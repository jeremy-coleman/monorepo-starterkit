import {
  classNamesFunction,
  css,
  getRTL,
  getRTLSafeKeyCode,
  IStyle,
  IStyleFunctionOrObject,
  styled
} from "@uifabric/styleguide"
import { AnimationVariables, getFocusStyle, getGlobalClassNames, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import {
  divProperties,
  EventGroup,
  getId,
  getNativeProps,
  IRefObject,
  KeyCodes,
  warnMutuallyExclusive
} from "@uifabric/styleguide"
import * as React from "react"
import { Label } from "./Label"

export interface ISliderState {
  value?: number
  renderedValue?: number
}

//implements ISlider


export class SliderBase extends React.Component<ISliderProps, ISliderState> {
  public static defaultProps: ISliderProps = {
    step: 1,
    min: 0,
    max: 10,
    showValue: true,
    disabled: false,
    vertical: false,
    buttonProps: {}
  }

  private _sliderLine = React.createRef<HTMLDivElement>()
  private _thumb = React.createRef<HTMLSpanElement>()
  private _id: string
  _events = new EventGroup(this)

  constructor(props: ISliderProps) {
    super(props)

    warnMutuallyExclusive("Slider", this.props, {
      value: "defaultValue"
    })

    this._id = getId("Slider")

    const value = props.value !== undefined ? props.value : props.defaultValue !== undefined ? props.defaultValue : props.min

    this.state = {
      value: value,
      renderedValue: undefined
    }
  }

  componentWillUnmount() {
    this._events.dispose()
  }

  public render(): React.ReactElement<{}> {
    const { ariaLabel, className, disabled, label, max, min, showValue, buttonProps, vertical, valueFormat, styles, theme } = this.props
    const value = this.value
    const renderedValue = this.renderedValue

    const thumbOffsetPercent: number = min === max ? 0 : ((renderedValue! - min!) / (max! - min!)) * 100
    const lengthString = vertical ? "height" : "width"
    const onMouseDownProp: {} = disabled ? {} : { onMouseDown: this._onMouseDownOrTouchStart }
    const onTouchStartProp: {} = disabled ? {} : { onTouchStart: this._onMouseDownOrTouchStart }
    const onKeyDownProp: {} = disabled ? {} : { onKeyDown: this._onKeyDown }
    const classNames = classNamesFunction<ISliderStyleProps, ISliderStyles>()(styles, {
      className,
      disabled,
      vertical,
      showTransitions: renderedValue === value,
      showValue,
      theme: theme!
    })
    const divButtonProps = buttonProps ? getNativeProps(buttonProps, divProperties) : undefined

    return (
      <div className={classNames.root}>
        {label && (
          <Label className={classNames.titleLabel} {...(ariaLabel ? {} : { htmlFor: this._id })}>
            {label}
          </Label>
        )}
        <div className={classNames.container}>
          <div
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={this._getAriaValueText(value)}
            aria-label={ariaLabel || label}
            aria-disabled={disabled}
            {...onMouseDownProp}
            {...onTouchStartProp}
            {...onKeyDownProp}
            {...divButtonProps}
            className={css(classNames.slideBox, buttonProps!.className)}
            id={this._id}
            role="slider"
            tabIndex={disabled ? undefined : 0}
            data-is-focusable={!disabled}
          >
            <div ref={this._sliderLine} className={classNames.line}>
              <span ref={this._thumb} className={classNames.thumb} style={this._getThumbStyle(vertical, thumbOffsetPercent)} />
              <span
                className={css(classNames.lineContainer, classNames.activeSection)}
                style={{ [lengthString]: thumbOffsetPercent + "%" }}
              />
              <span
                className={css(classNames.lineContainer, classNames.inactiveSection)}
                style={{ [lengthString]: 100 - thumbOffsetPercent + "%" }}
              />
            </div>
          </div>
          {showValue && <Label className={classNames.valueLabel}>{valueFormat ? valueFormat(value!) : value}</Label>}
        </div>
      </div>
    ) as React.ReactElement<{}>
  }

  public focus(): void {
    if (this._thumb.current) {
      this._thumb.current.focus()
    }
  }

  public get value(): number | undefined {
    const { value = this.state.value } = this.props
    if (this.props.min === undefined || this.props.max === undefined || value === undefined) {
      return undefined
    } else {
      return Math.max(this.props.min, Math.min(this.props.max, value))
    }
  }

  private get renderedValue(): number | undefined {
    // renderedValue is expected to be defined while user is interacting with control, otherwise `undefined`. Fall back to `value`.
    const { renderedValue = this.value } = this.state
    return renderedValue
  }

  private _getAriaValueText = (value: number | undefined): string | undefined => {
    if (this.props.ariaValueText && value !== undefined) {
      return this.props.ariaValueText(value)
    }
  }

  private _getThumbStyle(vertical: boolean | undefined, thumbOffsetPercent: number): any {
    const direction: string = vertical ? "bottom" : getRTL() ? "right" : "left"
    return {
      [direction]: thumbOffsetPercent + "%"
    }
  }

  private _onMouseDownOrTouchStart = (event: MouseEvent | TouchEvent): void => {
    if (event.type === "mousedown") {
      this._events.on(window, "mousemove", this._onMouseMoveOrTouchMove, true)
      this._events.on(window, "mouseup", this._onMouseUpOrTouchEnd, true)
    } else if (event.type === "touchstart") {
      this._events.on(window, "touchmove", this._onMouseMoveOrTouchMove, true)
      this._events.on(window, "touchend", this._onMouseUpOrTouchEnd, true)
    }
    this._onMouseMoveOrTouchMove(event, true)
  }

  private _onMouseMoveOrTouchMove = (event: MouseEvent | TouchEvent, suppressEventCancelation?: boolean): void => {
    if (!this._sliderLine.current) {
      return
    }

    const { max, min, step } = this.props
    const steps: number = (max! - min!) / step!
    const sliderPositionRect: ClientRect = this._sliderLine.current.getBoundingClientRect()
    const sliderLength: number = !this.props.vertical ? sliderPositionRect.width : sliderPositionRect.height
    const stepLength: number = sliderLength / steps
    let currentSteps: number | undefined
    let distance: number | undefined

    if (!this.props.vertical) {
      const left: number | undefined = this._getPosition(event, this.props.vertical)
      distance = getRTL() ? sliderPositionRect.right - left! : left! - sliderPositionRect.left
      currentSteps = distance / stepLength
    } else {
      const bottom: number | undefined = this._getPosition(event, this.props.vertical)
      distance = sliderPositionRect.bottom - bottom!
      currentSteps = distance / stepLength
    }

    let currentValue: number | undefined
    let renderedValue: number | undefined

    // The value shouldn't be bigger than max or be smaller than min.
    if (currentSteps! > Math.floor(steps)) {
      renderedValue = currentValue = max as number
    } else if (currentSteps! < 0) {
      renderedValue = currentValue = min as number
    } else {
      renderedValue = min! + step! * currentSteps!
      currentValue = min! + step! * Math.round(currentSteps!)
    }

    this._updateValue(currentValue, renderedValue)

    if (!suppressEventCancelation) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  private _getPosition(event: MouseEvent | TouchEvent, vertical: boolean | undefined): number | undefined {
    let currentPosition: number | undefined
    switch (event.type) {
      case "mousedown":
      case "mousemove":
        currentPosition = !vertical ? (event as MouseEvent).clientX : (event as MouseEvent).clientY
        break
      case "touchstart":
      case "touchmove":
        currentPosition = !vertical ? (event as TouchEvent).touches[0].clientX : (event as TouchEvent).touches[0].clientY
        break
    }
    return currentPosition
  }
  private _updateValue(value: number, renderedValue: number): void {
    const { step } = this.props

    let numDec = 0
    if (isFinite(step!)) {
      while (Math.round(step! * Math.pow(10, numDec)) / Math.pow(10, numDec) !== step!) {
        numDec++
      }
    }

    // Make sure value has correct number of decimal places based on number of decimals in step
    const roundedValue = parseFloat(value.toFixed(numDec))
    const valueChanged = roundedValue !== this.state.value

    this.setState(
      {
        value: roundedValue,
        renderedValue
      },
      () => {
        if (valueChanged && this.props.onChange) {
          this.props.onChange(this.state.value as number)
        }
      }
    )
  }

  private _onMouseUpOrTouchEnd = (event: MouseEvent | TouchEvent): void => {
    // Disable renderedValue override.
    this.setState({
      renderedValue: undefined
    })

    if (this.props.onChanged) {
      this.props.onChanged(event, this.state.value as number)
    }

    this._events.off()
  }

  private _onKeyDown = (event: KeyboardEvent): void => {
    let value: number | undefined = this.state.value
    const { max, min, step } = this.props

    let diff: number | undefined = 0

    switch (event.which) {
      case getRTLSafeKeyCode(KeyCodes.left):
      case KeyCodes.down:
        diff = -(step as number)
        break
      case getRTLSafeKeyCode(KeyCodes.right):
      case KeyCodes.up:
        diff = step
        break

      case KeyCodes.home:
        value = min
        break

      case KeyCodes.end:
        value = max
        break

      default:
        return
    }

    const newValue: number = Math.min(max as number, Math.max(min as number, value! + diff!))

    this._updateValue(newValue, newValue)

    event.preventDefault()
    event.stopPropagation()
  }
}

const GlobalClassNames = {
  root: "ms-Slider",
  enabled: "ms-Slider-enabled",
  disabled: "ms-Slider-disabled",
  row: "ms-Slider-row",
  column: "ms-Slider-column",
  container: "ms-Slider-container",
  slideBox: "ms-Slider-slideBox",
  line: "ms-Slider-line",
  thumb: "ms-Slider-thumb",
  activeSection: "ms-Slider-active",
  inactiveSection: "ms-Slider-inactive",
  valueLabel: "ms-Slider-value",
  showValue: "ms-Slider-showValue",
  showTransitions: "ms-Slider-showTransitions"
}

export const getSliderStyles = (props: ISliderStyleProps): ISliderStyles => {
  const { className, titleLabelClassName, theme, vertical, disabled, showTransitions, showValue } = props
  const { palette } = theme
  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  // Tokens
  const sliderInteractedActiveSectionColor = palette.themePrimary
  const sliderInteractedInactiveSectionColor = palette.themeLight
  const sliderRestActiveSectionColor = palette.neutralSecondary
  const sliderRestInactiveSectionColor = palette.neutralTertiaryAlt

  const sliderDisabledActiveSectionColor = palette.neutralTertiary
  const sliderDisabledInactiveSectionColor = palette.neutralLight

  const sliderThumbBackgroundColor = palette.white
  const sliderThumbBorderColor = palette.neutralSecondary
  const sliderThumbDisabledBorderColor = palette.neutralTertiaryAlt

  const slideBoxActiveSectionStyles = !disabled && {
    backgroundColor: sliderInteractedActiveSectionColor,
    selectors: {
      [HighContrastSelector]: {
        backgroundColor: "Highlight"
      }
    }
  }

  const slideBoxInactiveSectionStyles = !disabled && {
    backgroundColor: sliderInteractedInactiveSectionColor,
    selectors: {
      [HighContrastSelector]: {
        borderColor: "Highlight"
      }
    }
  }

  const slideBoxActiveThumbStyles = !disabled && {
    border: `2px solid ${sliderInteractedActiveSectionColor}`,
    selectors: {
      [HighContrastSelector]: {
        borderColor: "Highlight"
      }
    }
  }

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      {
        userSelect: "none"
      },
      vertical && {
        marginRight: 8
      },
      ...[!disabled ? classNames.enabled : undefined],
      ...[disabled ? classNames.disabled : undefined],
      ...[!vertical ? classNames.row : undefined],
      ...[vertical ? classNames.column : undefined],
      className
    ],
    titleLabel: [
      {
        padding: 0
      },
      titleLabelClassName
    ],
    container: [
      classNames.container,
      {
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "center"
      },
      vertical && {
        flexDirection: "column",
        height: "100%",
        textAlign: "center",
        margin: "8px 0"
      }
    ],
    slideBox: [
      classNames.slideBox,
      getFocusStyle(theme),
      {
        background: "transparent",
        border: "none",
        flexGrow: 1,
        lineHeight: 28,
        display: "flex",
        alignItems: "center",
        selectors: {
          ":active $activeSection": slideBoxActiveSectionStyles,
          ":hover $activeSection": slideBoxActiveSectionStyles,
          ":active $inactiveSection": slideBoxInactiveSectionStyles,
          ":hover $inactiveSection": slideBoxInactiveSectionStyles,
          ":active $thumb": slideBoxActiveThumbStyles,
          ":hover $thumb": slideBoxActiveThumbStyles,
          $thumb: [
            {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: sliderThumbBorderColor,
              borderRadius: 10,
              boxSizing: "border-box",
              background: sliderThumbBackgroundColor,
              display: "block",
              width: 16,
              height: 16,
              position: "absolute"
            },
            vertical
              ? {
                  left: -6,
                  margin: "0 auto",
                  transform: "translateY(8px)"
                }
              : {
                  top: -6,
                  transform: getRTL() ? "translateX(50%)" : "translateX(-50%)"
                },
            showTransitions && {
              transition: `left ${AnimationVariables.durationValue3} ${AnimationVariables.easeFunction1}`
            },
            disabled && {
              borderColor: sliderThumbDisabledBorderColor,
              selectors: {
                [HighContrastSelector]: {
                  borderColor: "GrayText"
                }
              }
            }
          ]
        }
      },
      vertical
        ? {
            height: "100%",
            width: 28,
            padding: "8px 0" // Make room for thumb at bottom of line
          }
        : {
            height: 28,
            width: "auto",
            padding: "0 8px" // Make room for thumb at ends of line
          },
      ...[showValue ? classNames.showValue : undefined],
      ...[showTransitions ? classNames.showTransitions : undefined]
    ],
    thumb: [classNames.thumb],
    line: [
      classNames.line,
      {
        display: "flex",
        position: "relative",
        selectors: {
          $lineContainer: [
            {
              borderRadius: 4,
              boxSizing: "border-box"
            },
            vertical
              ? {
                  width: 4,
                  height: "100%"
                }
              : {
                  height: 4,
                  width: "100%"
                }
          ]
        }
      },
      vertical
        ? {
            height: "100%",
            width: 4,
            margin: "0 auto",
            flexDirection: "column-reverse"
          }
        : {
            width: "100%"
          }
    ],
    lineContainer: [{}],
    activeSection: [
      classNames.activeSection,
      {
        background: sliderRestActiveSectionColor,
        selectors: {
          [HighContrastSelector]: {
            backgroundColor: "WindowText"
          }
        }
      },
      showTransitions && {
        transition: `width ${AnimationVariables.durationValue3} ${AnimationVariables.easeFunction1}`
      },
      disabled && {
        background: sliderDisabledActiveSectionColor,
        selectors: {
          [HighContrastSelector]: {
            backgroundColor: "GrayText",
            borderColor: "GrayText"
          }
        }
      }
    ],
    inactiveSection: [
      classNames.inactiveSection,
      {
        background: sliderRestInactiveSectionColor,
        selectors: {
          [HighContrastSelector]: {
            border: "1px solid WindowText"
          }
        }
      },
      showTransitions && {
        transition: `width ${AnimationVariables.durationValue3} ${AnimationVariables.easeFunction1}`
      },
      disabled && {
        background: sliderDisabledInactiveSectionColor,
        selectors: {
          [HighContrastSelector]: {
            backgroundColor: "GrayText",
            borderColor: "GrayText"
          }
        }
      }
    ],
    valueLabel: [
      classNames.valueLabel,
      {
        flexShrink: 1,
        width: 30,
        lineHeight: "1" // using a string here meaning it's relative to the size of the font
      },
      vertical
        ? {
            margin: "0 auto",
            whiteSpace: "nowrap",
            width: 40
          }
        : {
            margin: "0 8px",
            whiteSpace: "nowrap",
            width: 40
          }
    ]
  }
}

export const Slider: React.FunctionComponent<ISliderProps> = styled<ISliderProps, ISliderStyleProps, ISliderStyles>(
  SliderBase,
  getSliderStyles,
  undefined,
  {
    scope: "Slider"
  }
)

/**
 * {@docCategory Slider}
 */
export interface ISlider {
  value: number | undefined

  focus: () => void
}

/**
 * {@docCategory Slider}
 */
export interface ISliderProps extends React.ClassAttributes<SliderBase> {
  /**
   * Optional callback to access the ISlider interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ISlider>

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ISliderStyleProps, ISliderStyles>

  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme

  /**
   * Description label of the Slider
   */
  label?: string

  /**
   * The initial value of the Slider. Use this if you intend for the Slider to be an uncontrolled component.
   * This value is mutually exclusive to value. Use one or the other.
   */
  defaultValue?: number

  /**
   * The initial value of the Slider. Use this if you intend to pass in a new value as a result of onChange events.
   * This value is mutually exclusive to defaultValue. Use one or the other.
   */
  value?: number

  /**
   * The min value of the Slider
   * @defaultvalue 0
   */
  min?: number

  /**
   * The max value of the Slider
   * @defaultvalue 10
   */
  max?: number

  /**
   * The difference between the two adjacent values of the Slider
   * @defaultvalue 1
   */
  step?: number

  /**
   * Whether to show the value on the right of the Slider.
   * @defaultvalue true
   */
  showValue?: boolean

  /**
   * Callback when the value has been changed
   */
  onChange?: (value: number) => void

  /**
   * Callback on mouse up or touch end
   */
  onChanged?: (event: MouseEvent | TouchEvent, value: number) => void

  /**
   * A description of the Slider for the benefit of screen readers.
   */
  ariaLabel?: string

  /**
   * A text description of the Slider number value for the benefit of screen readers.
   * This should be used when the Slider number value is not accurately represented by a number.
   */
  ariaValueText?: (value: number) => string
  /**
   * Optional flag to render the slider vertically. Defaults to rendering horizontal.
   */
  vertical?: boolean

  /**
   * Optional flag to render the Slider as disabled.
   */
  disabled?: boolean

  /**
   * Optional className to attach to the slider root element.
   */
  className?: string

  /**
   * Optional mixin for additional props on the thumb button within the slider.
   */
  buttonProps?: React.HTMLAttributes<HTMLButtonElement>

  /**
   * Optional function to format the slider value.
   */
  valueFormat?: (value: number) => string
}

/**
 * {@docCategory Slider}
 */
export type ISliderStyleProps = Required<Pick<ISliderProps, "theme">> &
  Pick<ISliderProps, "className" | "disabled" | "vertical"> & {
    showTransitions?: boolean
    showValue?: boolean
    titleLabelClassName?: string
  }

/**
 * {@docCategory Slider}
 */
export interface ISliderStyles {
  root: IStyle
  titleLabel: IStyle
  container: IStyle
  slideBox: IStyle
  line: IStyle
  thumb: IStyle
  lineContainer: IStyle
  activeSection: IStyle
  inactiveSection: IStyle
  valueLabel: IStyle
}
