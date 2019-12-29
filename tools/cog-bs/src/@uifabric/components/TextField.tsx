import { classNamesFunction, IStyle, IStyleFunctionOrObject, IStyleSet, styled } from "@uifabric/styleguide"
import { AnimationClassNames, FontSizes, getGlobalClassNames, HighContrastSelector, ITheme, normalize } from "@uifabric/styleguide"
import {
  Async,
  getId,
  getNativeProps,
  initializeComponentRef,
  inputProperties,
  IRefObject,
  IRenderFunction,
  textAreaProperties,
  warnDeprecations,
  warnMutuallyExclusive
} from "@uifabric/styleguide"
import * as React from "react"
import { DelayedRender } from "./DelayedRender"
import { Icon, IIconProps } from "./Icon"
import { ILabelStyleProps, ILabelStyles, Label } from "./Label"

const globalClassNames = {
  root: "ms-TextField",
  description: "ms-TextField-description",
  errorMessage: "ms-TextField-errorMessage",
  field: "ms-TextField-field",
  fieldGroup: "ms-TextField-fieldGroup",
  prefix: "ms-TextField-prefix",
  suffix: "ms-TextField-suffix",
  wrapper: "ms-TextField-wrapper",

  multiline: "ms-TextField--multiline",
  borderless: "ms-TextField--borderless",
  underlined: "ms-TextField--underlined",
  unresizable: "ms-TextField--unresizable",

  required: "is-required",
  disabled: "is-disabled",
  active: "is-active"
}

function getTextFieldLabelStyles(props: ITextFieldStyleProps): IStyleFunctionOrObject<ILabelStyleProps, ILabelStyles> {
  const { underlined, disabled, focused } = props
  return () => ({
    root: [
      underlined &&
        disabled && {
          color: props.theme.palette.neutralTertiary
        },
      underlined && {
        fontSize: FontSizes.small,
        marginRight: 8,
        paddingLeft: 12,
        paddingRight: 0,
        lineHeight: "22px",
        height: 32
      },
      underlined &&
        focused && {
          selectors: {
            [HighContrastSelector]: {
              height: 31 // -1px to prevent jumpiness in HC with the increased border-width to 2px
            }
          }
        }
    ]
  })
}

export function getTextFieldStyles(props: ITextFieldStyleProps): ITextFieldStyles {
  const {
    theme,
    className,
    disabled,
    focused,
    required,
    multiline,
    hasLabel,
    borderless,
    underlined,
    hasIcon,
    resizable,
    hasErrorMessage,
    iconClass,
    inputClassName,
    autoAdjustHeight
  } = props

  const { semanticColors, effects } = theme

  const classNames = getGlobalClassNames(globalClassNames, theme)

  const fieldPrefixSuffix: IStyle = {
    background: semanticColors.disabledBackground, // Suffix/Prefix are not editable so the disabled slot perfectly fits.
    color: !disabled ? semanticColors.inputPlaceholderText : semanticColors.disabledText,
    display: "flex",
    alignItems: "center",
    padding: "0 10px",
    lineHeight: 1,
    whiteSpace: "nowrap",
    flexShrink: 0
  }

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      required && classNames.required,
      disabled && classNames.disabled,
      focused && classNames.active,
      multiline && classNames.multiline,
      borderless && classNames.borderless,
      underlined && classNames.underlined,
      normalize,
      {
        position: "relative"
      },
      className
    ],
    wrapper: [
      classNames.wrapper,
      underlined && {
        display: "flex",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        borderBottomColor: semanticColors.inputBorder,
        width: "100%"
      },
      hasErrorMessage &&
        underlined &&
        !disabled && {
          borderBottomColor: semanticColors.errorText,
          selectors: {
            ":hover": {
              borderBottomColor: semanticColors.errorText,
              selectors: {
                [HighContrastSelector]: {
                  borderBottomColor: "Highlight"
                }
              }
            }
          }
        },
      underlined &&
        disabled && {
          borderBottomColor: semanticColors.disabledBackground
        },
      underlined &&
        !disabled &&
        !focused &&
        !hasErrorMessage && {
          selectors: {
            ":hover": {
              borderBottomColor: semanticColors.inputBorderHovered,
              selectors: {
                [HighContrastSelector]: {
                  borderBottomColor: "Highlight"
                }
              }
            }
          }
        },
      underlined &&
        focused && {
          borderBottomColor: !hasErrorMessage ? semanticColors.inputFocusBorderAlt : semanticColors.errorText,
          selectors: {
            [HighContrastSelector]: {
              borderBottomWidth: 2,
              borderBottomColor: "Highlight"
            }
          }
        }
    ],
    fieldGroup: [
      classNames.fieldGroup,
      normalize,
      {
        border: `1px solid ${semanticColors.inputBorder}`,
        borderRadius: effects.roundedCorner2,
        background: semanticColors.inputBackground,
        cursor: "text",
        height: 32,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        position: "relative",
        selectors: {
          ":hover": {
            selectors: {
              [HighContrastSelector]: {
                borderColor: "Highlight"
              }
            }
          }
        }
      },
      multiline && {
        minHeight: "60px",
        height: "auto",
        display: "flex"
      },
      borderless && {
        border: "none"
      },
      !focused &&
        !disabled && {
          selectors: {
            ":hover": {
              borderColor: semanticColors.inputBorderHovered
            }
          }
        },
      focused && {
        borderColor: semanticColors.inputFocusBorderAlt,
        selectors: {
          [HighContrastSelector]: {
            borderWidth: 2,
            borderColor: "Highlight"
          }
        }
      },
      disabled && {
        backgroundColor: semanticColors.disabledBackground,
        borderColor: semanticColors.disabledBackground,
        cursor: "default"
      },
      underlined && {
        flex: "1 1 0px",
        border: "none",
        textAlign: "left"
      },
      underlined &&
        focused && {
          selectors: {
            [HighContrastSelector]: {
              height: 31 // -1px to prevent jumpiness in HC with the increased border-width to 2px
            }
          }
        },
      underlined &&
        disabled && {
          backgroundColor: "transparent"
        },
      hasErrorMessage && {
        borderColor: semanticColors.errorText,
        selectors: {
          "&:focus, &:hover": {
            borderColor: semanticColors.errorText
          }
        }
      },
      hasErrorMessage &&
        focused && {
          borderColor: semanticColors.errorText
        },
      !hasLabel &&
        required && {
          selectors: {
            ":after": {
              content: `'*'`,
              color: semanticColors.errorText,
              position: "absolute",
              top: -5,
              right: -10
            },
            [HighContrastSelector]: {
              selectors: {
                ":after": {
                  right: -14 // moving the * 4 pixel to right to alleviate border clipping in HC mode.
                }
              }
            }
          }
        }
    ],
    field: [
      theme.fonts.small,
      classNames.field,
      normalize,
      {
        fontSize: FontSizes.small,
        borderRadius: 0,
        border: "none",
        background: "none",
        backgroundColor: "transparent",
        color: semanticColors.inputText,
        padding: "0 8px",
        width: "100%",
        minWidth: 0,
        textOverflow: "ellipsis",
        outline: 0,
        selectors: {
          "&:active, &:focus, &:hover": { outline: 0 },
          "::-ms-clear": {
            display: "none"
          },
          "::placeholder": [
            theme.fonts.small,
            {
              color: semanticColors.inputPlaceholderText,
              opacity: 1
            }
          ],
          ":-ms-input-placeholder": [
            theme.fonts.small,
            {
              color: semanticColors.inputPlaceholderText,
              opacity: 1
            }
          ]
        }
      },
      multiline &&
        !resizable && [
          classNames.unresizable,
          {
            resize: "none"
          }
        ],
      multiline && {
        minHeight: "inherit",
        lineHeight: 17,
        flexGrow: 1,
        paddingTop: 6,
        paddingBottom: 6,
        overflow: "auto",
        width: "100%"
      },
      multiline &&
        autoAdjustHeight && {
          overflow: "hidden"
        },
      hasIcon && {
        paddingRight: 24
      },
      multiline &&
        hasIcon && {
          paddingRight: 40
        },
      disabled && {
        backgroundColor: "transparent",
        borderColor: "transparent",
        color: semanticColors.disabledText,
        selectors: {
          "::placeholder": {
            color: semanticColors.disabledText
          },
          ":-ms-input-placeholder": {
            color: semanticColors.disabledText
          }
        }
      },
      underlined && {
        textAlign: "left"
      },
      focused &&
        !borderless && {
          selectors: {
            [HighContrastSelector]: {
              paddingLeft: 11,
              paddingRight: 11
            }
          }
        },
      focused &&
        multiline &&
        !borderless && {
          selectors: {
            [HighContrastSelector]: {
              paddingTop: 4 // take into consideration the 2px increased border-width (not when borderless).
            }
          }
        },
      inputClassName
    ],
    icon: [
      multiline && {
        paddingRight: 24,
        paddingBottom: 8,
        alignItems: "flex-end"
      },
      {
        pointerEvents: "none",
        position: "absolute",
        bottom: 5,
        right: 8,
        top: "auto",
        fontSize: 16,
        lineHeight: 18
      },
      disabled && {
        color: semanticColors.disabledText
      },
      iconClass
    ],
    description: [
      classNames.description,
      {
        color: semanticColors.bodySubtext,
        fontSize: FontSizes.mini
      }
    ],
    errorMessage: [
      classNames.errorMessage,
      AnimationClassNames.slideDownIn20,
      theme.fonts.xSmall,
      {
        color: semanticColors.errorText,
        margin: 0,
        paddingTop: 5,
        display: "flex",
        alignItems: "center"
      }
    ],
    prefix: [classNames.prefix, fieldPrefixSuffix],
    suffix: [classNames.suffix, fieldPrefixSuffix],
    subComponentStyles: {
      label: getTextFieldLabelStyles(props)
    }
  }
}


export interface ITextFieldState {
  value: string

  /** Is true when the control has focus. */
  isFocused: boolean

  /**
   * The validation error message.
   *
   * - If there is no validation error or we have not validated the input value, errorMessage is an empty string.
   * - If we have done the validation and there is validation error, errorMessage is the validation error message.
   */
  errorMessage: string | JSX.Element
}

const DEFAULT_STATE_VALUE = ""

export class TextFieldBase extends React.Component<ITextFieldProps, ITextFieldState> implements ITextField {
  public static defaultProps: ITextFieldProps = {
    multiline: false,
    resizable: true,
    autoAdjustHeight: false,
    underlined: false,
    borderless: false,
    onChange: () => {
      /* noop */
    },
    onBeforeChange: () => {
      /* noop */
    },
    onNotifyValidationResult: () => {
      /* noop */
    },
    onGetErrorMessage: () => undefined,
    deferredValidationTime: 200,
    errorMessage: "",
    validateOnFocusIn: false,
    validateOnFocusOut: false,
    validateOnLoad: true
  }

  private _id: string
  private _descriptionId: string
  private _delayedValidate: (value: string | undefined) => void
  private _isMounted: boolean
  private _lastValidation: number
  private _latestValue: string | undefined
  private _latestValidateValue: string | undefined
  private _textElement = React.createRef<HTMLTextAreaElement | HTMLInputElement>()
  private _classNames: any //IProcessedStyleSet<ITextFieldStyles>;
  private _async: Async

  /**
   * If true, the text field is changing between single- and multi-line, so we'll need to reset
   * focus after the change completes.
   */
  private _shouldResetFocusAfterRender: boolean | undefined
  /**
   * If set, the text field is changing between single- and multi-line, so we'll need to reset
   * selection/cursor after the change completes.
   */
  private _selectionBeforeInputTypeChange: [number | null, number | null] | undefined

  public constructor(props: ITextFieldProps) {
    super(props)

    initializeComponentRef(this)

    this._async = new Async(this)

    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
      warnDeprecations("TextField", props, {
        iconClass: "iconProps",
        addonString: "prefix",
        onRenderAddon: "onRenderPrefix",
        onChanged: "onChange"
      })

      warnMutuallyExclusive("TextField", props, {
        value: "defaultValue"
      })
    }

    this._id = props.id || getId("TextField")
    this._descriptionId = getId("TextFieldDescription")

    if (props.value !== undefined) {
      this._latestValue = props.value
    } else if (props.defaultValue !== undefined) {
      this._latestValue = props.defaultValue
    } else {
      this._latestValue = DEFAULT_STATE_VALUE
    }

    this.state = {
      value: this._latestValue,
      isFocused: false,
      errorMessage: ""
    }

    this._delayedValidate = this._async.debounce(this._validate, this.props.deferredValidationTime)
    this._lastValidation = 0
  }

  /**
   * Gets the current value of the text field.
   */
  public get value(): string | undefined {
    return this.state.value
  }

  public componentDidMount(): void {
    this._isMounted = true
    this._adjustInputHeight()

    if (this.props.validateOnLoad) {
      this._validate(this.state.value)
    }
  }

  public UNSAFE_componentWillReceiveProps(newProps: ITextFieldProps): void {
    const { onBeforeChange } = this.props

    // If old value prop was undefined, then component is controlled and we should
    //    respect new undefined value and update state accordingly.
    if (newProps.value !== this.state.value && (newProps.value !== undefined || this.props.value !== undefined)) {
      if (onBeforeChange) {
        onBeforeChange(newProps.value)
      }

      this._id = newProps.id || this._id
      this._setValue(newProps.value)

      if (_shouldValidateAllChanges(newProps)) {
        this._delayedValidate(newProps.value)
      }
    }

    // If component is not currently controlled and defaultValue changes, set value to new defaultValue.
    if (newProps.defaultValue !== this.props.defaultValue && newProps.value === undefined) {
      this._setValue(newProps.defaultValue)
    }

    // Text field is changing between single- and multi-line. After the change is complete,
    // we'll need to reset focus and selection/cursor.
    if (!!newProps.multiline !== !!this.props.multiline && this.state.isFocused) {
      this._shouldResetFocusAfterRender = true
      this._selectionBeforeInputTypeChange = [this.selectionStart, this.selectionEnd]
    }
  }

  public componentDidUpdate(): void {
    if (this._shouldResetFocusAfterRender) {
      // The text field has just changed between single- and multi-line, so we need to reset focus
      // and selection/cursor.
      this._shouldResetFocusAfterRender = false
      this.focus()
      if (this._selectionBeforeInputTypeChange) {
        const [start, end] = this._selectionBeforeInputTypeChange
        if (start !== null && end !== null) {
          this.setSelectionRange(start, end)
        }
      }
    }
  }

  public componentWillUnmount(): void {
    this._isMounted = false
    this._async.dispose()
  }

  public render(): JSX.Element {
    const {
      borderless,
      className,
      disabled,
      iconClass,
      iconProps,
      inputClassName,
      label,
      multiline,
      required,
      underlined,
      addonString, // @deprecated
      prefix,
      resizable,
      suffix,
      theme,
      styles,
      autoAdjustHeight,
      onRenderAddon = this._onRenderAddon, // @deprecated
      onRenderPrefix = this._onRenderPrefix,
      onRenderSuffix = this._onRenderSuffix,
      onRenderLabel = this._onRenderLabel,
      onRenderDescription = this._onRenderDescription
    } = this.props
    const { isFocused } = this.state
    const errorMessage = this._errorMessage

    this._classNames = classNamesFunction<any, any>()(styles!, {
      theme: theme!,
      className,
      disabled,
      focused: isFocused,
      required,
      multiline,
      hasLabel: !!label,
      hasErrorMessage: !!errorMessage,
      borderless,
      resizable,
      hasIcon: !!iconProps,
      underlined,
      iconClass,
      inputClassName,
      autoAdjustHeight
    })

    return (
      <div className={this._classNames.root}>
        <div className={this._classNames.wrapper}>
          {onRenderLabel(this.props, this._onRenderLabel)}
          <div className={this._classNames.fieldGroup}>
            {(addonString !== undefined || this.props.onRenderAddon) && (
              <div className={this._classNames.prefix}>{onRenderAddon(this.props, this._onRenderAddon)}</div>
            )}
            {(prefix !== undefined || this.props.onRenderPrefix) && (
              <div className={this._classNames.prefix}>{onRenderPrefix(this.props, this._onRenderPrefix)}</div>
            )}
            {multiline ? this._renderTextArea() : this._renderInput()}
            {(iconClass || iconProps) && <Icon className={this._classNames.icon} {...iconProps} />}
            {(suffix !== undefined || this.props.onRenderSuffix) && (
              <div className={this._classNames.suffix}>{onRenderSuffix(this.props, this._onRenderSuffix)}</div>
            )}
          </div>
        </div>
        {this._isDescriptionAvailable && (
          <span id={this._descriptionId}>
            {onRenderDescription(this.props, this._onRenderDescription)}
            {errorMessage && (
              <div role="alert">
                <DelayedRender>
                  <p className={this._classNames.errorMessage}>
                    <span data-automation-id="error-message">{errorMessage}</span>
                  </p>
                </DelayedRender>
              </div>
            )}
          </span>
        )}
      </div>
    )
  }

  /**
   * Sets focus on the text field
   */
  public focus() {
    if (this._textElement.current) {
      this._textElement.current.focus()
    }
  }

  /**
   * Blurs the text field.
   */
  public blur() {
    if (this._textElement.current) {
      this._textElement.current.blur()
    }
  }

  /**
   * Selects the text field
   */
  public select() {
    if (this._textElement.current) {
      this._textElement.current.select()
    }
  }

  /**
   * Sets the selection start of the text field to a specified value
   */
  public setSelectionStart(value: number): void {
    if (this._textElement.current) {
      this._textElement.current.selectionStart = value
    }
  }

  /**
   * Sets the selection end of the text field to a specified value
   */
  public setSelectionEnd(value: number): void {
    if (this._textElement.current) {
      this._textElement.current.selectionEnd = value
    }
  }

  /**
   * Gets the selection start of the text field
   */
  public get selectionStart(): number | null {
    return this._textElement.current ? this._textElement.current.selectionStart : -1
  }

  /**
   * Gets the selection end of the text field
   */
  public get selectionEnd(): number | null {
    return this._textElement.current ? this._textElement.current.selectionEnd : -1
  }

  /**
   * Sets the start and end positions of a selection in a text field.
   * @param start - Index of the start of the selection.
   * @param end - Index of the end of the selection.
   */
  public setSelectionRange(start: number, end: number): void {
    if (this._textElement.current) {
      ;(this._textElement.current as HTMLInputElement).setSelectionRange(start, end)
    }
  }

  private _setValue(value?: string) {
    this._latestValue = value
    this.setState(
      {
        value: value || DEFAULT_STATE_VALUE,
        errorMessage: ""
      } as ITextFieldState,
      () => {
        this._adjustInputHeight()
      }
    )
  }

  private _onFocus = (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (this.props.onFocus) {
      this.props.onFocus(ev)
    }

    this.setState({ isFocused: true })
    if (this.props.validateOnFocusIn) {
      this._validate(this.state.value)
    }
  }

  private _onBlur = (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (this.props.onBlur) {
      this.props.onBlur(ev)
    }

    this.setState({ isFocused: false })
    if (this.props.validateOnFocusOut) {
      this._validate(this.state.value)
    }
  }

  private _onRenderLabel = (props: ITextFieldProps): JSX.Element | null => {
    const { label, required } = props
    // IProcessedStyleSet definition requires casting for what Label expects as its styles prop
    const labelStyles = this._classNames.subComponentStyles
      ? (this._classNames.subComponentStyles.label as IStyleFunctionOrObject<ILabelStyleProps, ILabelStyles>)
      : undefined

    if (label) {
      return (
        <Label required={required} htmlFor={this._id} styles={labelStyles} disabled={props.disabled}>
          {props.label}
        </Label>
      )
    }
    return null
  }

  private _onRenderDescription = (props: ITextFieldProps): JSX.Element | null => {
    if (props.description) {
      return <span className={this._classNames.description}>{props.description}</span>
    }
    return null
  }

  // @deprecated
  private _onRenderAddon(props: ITextFieldProps): JSX.Element {
    const { addonString } = props
    return <span style={{ paddingBottom: "1px" }}>{addonString}</span>
  }

  private _onRenderPrefix(props: ITextFieldProps): JSX.Element {
    const { prefix } = props
    return <span style={{ paddingBottom: "1px" }}>{prefix}</span>
  }

  private _onRenderSuffix(props: ITextFieldProps): JSX.Element {
    const { suffix } = props
    return <span style={{ paddingBottom: "1px" }}>{suffix}</span>
  }

  private get _errorMessage(): string | JSX.Element | undefined {
    let { errorMessage } = this.state
    if (!errorMessage && this.props.errorMessage) {
      errorMessage = this.props.errorMessage
    }

    return errorMessage
  }

  /**
   * If a custom description render function is supplied then treat description as always available.
   * Otherwise defer to the presence of description or error message text.
   */
  private get _isDescriptionAvailable(): boolean {
    const props = this.props
    return !!(props.onRenderDescription || props.description || this._errorMessage)
  }

  private _renderTextArea(): React.ReactElement<React.HTMLAttributes<HTMLAreaElement>> {
    const textAreaProps = getNativeProps(this.props, textAreaProperties, ["defaultValue"])

    return (
      <textarea
        id={this._id}
        {...textAreaProps}
        ref={this._textElement}
        value={this.state.value}
        onInput={this._onInputChange}
        onChange={this._onInputChange}
        className={this._classNames.field}
        aria-describedby={this._isDescriptionAvailable ? this._descriptionId : this.props["aria-describedby"]}
        aria-invalid={!!this._errorMessage}
        aria-label={this.props.ariaLabel}
        readOnly={this.props.readOnly}
        onFocus={this._onFocus}
        onBlur={this._onBlur}
      />
    )
  }

  private _renderInput(): React.ReactElement<React.HTMLAttributes<HTMLInputElement>> {
    const inputProps = getNativeProps<React.HTMLAttributes<HTMLInputElement>>(this.props, inputProperties, ["defaultValue"])

    return (
      <input
        type={"text"}
        id={this._id}
        {...inputProps}
        ref={this._textElement as any}
        value={this.state.value}
        onInput={this._onInputChange}
        onChange={this._onInputChange}
        className={this._classNames.field}
        aria-label={this.props.ariaLabel}
        aria-describedby={this._isDescriptionAvailable ? this._descriptionId : this.props["aria-describedby"]}
        aria-invalid={!!this._errorMessage}
        readOnly={this.props.readOnly}
        onFocus={this._onFocus}
        onBlur={this._onBlur}
      />
    )
  }

  private _onInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    event.persist()
    const element: HTMLInputElement = event.target as HTMLInputElement
    const value: string = element.value

    // Avoid doing unnecessary work when the value has not changed.
    if (value === this._latestValue) {
      return
    }
    this._latestValue = value

    this.setState({ value: value } as ITextFieldState, () => {
      this._adjustInputHeight()

      if (this.props.onChange) {
        this.props.onChange(event, value)
      }

      if (this.props.onChanged) {
        this.props.onChanged(value)
      }
    })

    if (_shouldValidateAllChanges(this.props)) {
      this._delayedValidate(value)
    }

    if (this.props.onBeforeChange) {
      this.props.onBeforeChange(value)
    }
  }

  private _validate(value: string | undefined): void {
    // In case of _validate called multi-times during executing validate logic with promise return.
    if (this._latestValidateValue === value && _shouldValidateAllChanges(this.props)) {
      return
    }

    this._latestValidateValue = value
    const onGetErrorMessage = this.props.onGetErrorMessage as (value: string) => string | PromiseLike<string> | undefined
    const result = onGetErrorMessage(value || "")

    if (result !== undefined) {
      if (typeof result === "string" || !("then" in result)) {
        this.setState({ errorMessage: result } as ITextFieldState)
        this._notifyAfterValidate(value, result)
      } else {
        const currentValidation: number = ++this._lastValidation

        result.then((errorMessage: string | JSX.Element) => {
          if (this._isMounted && currentValidation === this._lastValidation) {
            this.setState({ errorMessage } as ITextFieldState)
          }
          this._notifyAfterValidate(value, errorMessage)
        })
      }
    } else {
      this._notifyAfterValidate(value, "")
    }
  }

  private _notifyAfterValidate(value: string | undefined, errorMessage: string | JSX.Element): void {
    if (this._isMounted && value === this.state.value && this.props.onNotifyValidationResult) {
      this.props.onNotifyValidationResult(errorMessage, value)
    }
  }

  private _adjustInputHeight(): void {
    if (this._textElement.current && this.props.autoAdjustHeight && this.props.multiline) {
      const textField = this._textElement.current
      textField.style.height = ""
      textField.style.height = textField.scrollHeight + "px"
    }
  }
}

/**
 * If `validateOnFocusIn` or `validateOnFocusOut` is true, validation should run **only** on that event.
 * Otherwise, validation should run on every change.
 */
function _shouldValidateAllChanges(props: ITextFieldProps): boolean {
  return !(props.validateOnFocusIn || props.validateOnFocusOut)
}

//export { ITextField } from './TextField.types';

export const TextField: React.FunctionComponent<ITextFieldProps> = styled<ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles>(
  TextFieldBase,
  getTextFieldStyles,
  undefined,
  {
    scope: "TextField"
  }
)

/**
 * {@docCategory TextField}
 */
export interface ITextField {
  /** Gets the current value of the input. */
  value: string | undefined

  /** Sets focus to the input. */
  focus: () => void

  /** Blurs the input */
  blur: () => void

  /** Select the value of the text field. */
  select: () => void

  /** Sets the selection start of the text field to a specified value. */
  setSelectionStart: (value: number) => void

  /** Sets the selection end of the text field to a specified value. */
  setSelectionEnd: (value: number) => void

  /**
   * Sets the start and end positions of a selection in a text field.
   * Call with start and end set to the same value to set the cursor position.
   * @param start - Index of the start of the selection.
   * @param end - Index of the end of the selection.
   */
  setSelectionRange: (start: number, end: number) => void

  /** Gets the selection start of the text field. Returns -1 if there is no selection. */
  selectionStart: number | null

  /** Gets the selection end of the text field. Returns -1 if there is no selection. */
  selectionEnd: number | null
}

/**
 * TextField component props.
 * {@docCategory TextField}
 */
export interface ITextFieldProps extends React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  /**
   * Optional callback to access the ITextField component. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ITextField>

  /**
   * Whether or not the text field is a multiline text field.
   * @defaultvalue false
   */
  multiline?: boolean

  /**
   * For multiline text fields, whether or not the field is resizable.
   * @defaultvalue true
   */
  resizable?: boolean

  /**
   * For multiline text fields, whether or not to auto adjust text field height.
   * @defaultvalue false
   */
  autoAdjustHeight?: boolean

  /**
   * Whether or not the text field is underlined.
   * @defaultvalue false
   */
  underlined?: boolean

  /**
   * Whether or not the text field is borderless.
   * @defaultvalue false
   */
  borderless?: boolean

  /**
   * Label displayed above the text field (and read by screen readers).
   */
  label?: string

  /**
   * Custom renderer for the label.
   */
  onRenderLabel?: IRenderFunction<ITextFieldProps>

  /**
   * Description displayed below the text field to provide additional details about what text to enter.
   */
  description?: string

  /**
   * Custom renderer for the description.
   */
  onRenderDescription?: IRenderFunction<ITextFieldProps>

  /**
   * @deprecated Use `prefix` instead.
   */
  addonString?: string

  /**
   * Prefix displayed before the text field contents. This is not included in the value.
   * Ensure a descriptive label is present to assist screen readers, as the value does not include the prefix.
   */
  prefix?: string

  /**
   * Suffix displayed after the text field contents. This is not included in the value.
   * Ensure a descriptive label is present to assist screen readers, as the value does not include the suffix.
   */
  suffix?: string

  /**
   * @deprecated Use `onRenderPrefix` instead.
   */
  onRenderAddon?: IRenderFunction<ITextFieldProps>

  /**
   * Custom render function for prefix.
   */
  onRenderPrefix?: IRenderFunction<ITextFieldProps>

  /**
   * Custom render function for suffix.
   */
  onRenderSuffix?: IRenderFunction<ITextFieldProps>

  /**
   * Props for an optional icon, displayed in the far right end of the text field.
   */
  iconProps?: IIconProps

  /**
   * Default value of the text field. Only provide this if the text field is an uncontrolled component;
   * otherwise, use the `value` property.
   */
  defaultValue?: string

  /**
   * Current value of the text field. Only provide this if the text field is a controlled component where you
   * are maintaining its current state; otherwise, use the `defaultValue` property.
   */
  value?: string

  /**
   * Disabled state of the text field.
   * @defaultvalue false
   */
  disabled?: boolean

  /**
   * If true, the text field is readonly.
   * @defaultvalue false
   */
  readOnly?: boolean

  /**
   * Static error message displayed below the text field. Use `onGetErrorMessage` to dynamically
   * change the error message displayed (if any) based on the current value. `errorMessage` and
   * `onGetErrorMessage` are mutually exclusive (`errorMessage` takes precedence).
   */
  errorMessage?: string | JSX.Element

  /**
   * Callback for when the input value changes.
   * This is called on both `input` and `change` native events.
   */
  onChange?: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void

  /**
   * @deprecated Use `onChange` instead.
   */
  onChanged?: (newValue: any) => void

  /**
   * Called after the input's value updates but before re-rendering.
   * Unlike `onChange`, this is also called when the value is updated via props.
   *
   * NOTE: This should be used *very* rarely. `onChange` is more appropriate for most situations.
   *
   * @param newValue - The new value. Type should be string.
   */
  onBeforeChange?: (newValue?: string) => void

  /**
   * Function called after validation completes.
   */
  onNotifyValidationResult?: (errorMessage: string | JSX.Element, value: string | undefined) => void

  /**
   * Function used to determine whether the input value is valid and get an error message if not.
   * Mutually exclusive with the static string `errorMessage` (it will take precedence over this).
   *
   * When it returns string | JSX.Element:
   * - If valid, it returns empty string.
   * - If invalid, it returns the error message and the text field will
   *   show a red border and show an error message below the text field.
   *
   * When it returns Promise\<string | JSX.Element\>:
   * - The resolved value is displayed as the error message.
   * - If rejected, the value is thrown away.
   */
  onGetErrorMessage?: (value: string) => string | JSX.Element | PromiseLike<string | JSX.Element> | undefined

  /**
   * Text field will start to validate after users stop typing for `deferredValidationTime` milliseconds.
   * @defaultvalue 200
   */
  deferredValidationTime?: number

  /**
   * Optional class name that is added to the container of the component.
   */
  className?: string

  /**
   * Optional class name that is added specifically to the input/textarea element.
   */
  inputClassName?: string

  /**
   * Aria label for the text field.
   */
  ariaLabel?: string

  /**
   * Run validation when focus moves into the input, and **do not** validate on change.
   *
   * (Unless this prop and/or `validateOnFocusOut` is set to true, validation will run on every change.)
   * @defaultvalue false
   */
  validateOnFocusIn?: boolean

  /**
   * Run validation when focus moves out of the input, and **do not** validate on change.
   *
   * (Unless this prop and/or `validateOnFocusIn` is set to true, validation will run on every change.)
   * @defaultvalue false
   */
  validateOnFocusOut?: boolean

  /**
   * Whether validation should run when the input is initially rendered.
   * @defaultvalue true
   */
  validateOnLoad?: boolean

  /**
   * Theme (provided through customization).
   */
  theme?: ITheme

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ITextFieldStyleProps, ITextFieldStyles>

  /**
   * @deprecated Use `iconProps` instead.
   */
  iconClass?: string

  /**
   * Whether the input field should have autocomplete enabled.
   * This tells the browser to display options based on earlier typed values.
   * Common values are 'on' and 'off' but for all possible values see the following links:
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#Values
   * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
   */
  autoComplete?: string

  /**
   * The masking string that defines the mask's behavior.
   * A backslash will escape any character.
   * Special format characters are:
   * '9': [0-9]
   * 'a': [a-zA-Z]
   * '*': [a-zA-Z0-9]
   *
   * @example `Phone Number: (999) 999-9999`
   */
  mask?: string

  /**
   * The character to show in place of unfilled characters of the mask.
   * @defaultvalue '_'
   */
  maskChar?: string

  /**
   * An object defining the format characters and corresponding regexp values.
   * Default format characters: \{
   *  '9': /[0-9]/,
   *  'a': /[a-zA-Z]/,
   *  '*': /[a-zA-Z0-9]/
   * \}
   */
  maskFormat?: { [key: string]: RegExp }

  /**
   * @deprecated Serves no function.
   */
  componentId?: string
}

export type ITextFieldStyleProps = Required<Pick<ITextFieldProps, "theme">> &
  Pick<
    ITextFieldProps,
    | "className"
    | "disabled"
    | "inputClassName"
    | "required"
    | "multiline"
    | "borderless"
    | "resizable"
    | "underlined"
    | "iconClass"
    | "autoAdjustHeight"
  > & {
    /** Element has an error message. */
    hasErrorMessage?: boolean
    /** Element has an icon. */
    hasIcon?: boolean
    /** Element has a label. */
    hasLabel?: boolean
    /** Element has focus. */
    focused?: boolean
  }

/**
 * {@docCategory TextField}
 */
export interface ITextFieldSubComponentStyles {
  /**
   * Styling for Label child component.
   */
  // TODO: this should be the interface once we're on TS 2.9.2 but otherwise causes errors in 2.8.4
  label: IStyleFunctionOrObject<ILabelStyleProps, ILabelStyles>
  //label: IStyleFunctionOrObject<any, any>;
}

export interface ITextFieldStyles extends IStyleSet<ITextFieldStyles> {
  /**
   * Style for root element.
   */
  root: IStyle

  /**
   * Style for field group encompassing entry area (prefix, field, icon and suffix).
   */
  fieldGroup: IStyle

  /**
   * Style for prefix element.
   */
  prefix: IStyle

  /**
   * Style for suffix element.
   */
  suffix: IStyle

  /**
   * Style for main field entry element.
   */
  field: IStyle

  /**
   * Style for icon prop element.
   */
  icon: IStyle

  /**
   * Style for description element.
   */
  description: IStyle

  /**
   * Style for TextField wrapper element.
   */
  wrapper: IStyle

  /**
   * Style for error message element.
   */
  errorMessage: IStyle

  /**
   * Styling for subcomponents.
   */
  subComponentStyles: any //ITextFieldSubComponentStyles;
}
