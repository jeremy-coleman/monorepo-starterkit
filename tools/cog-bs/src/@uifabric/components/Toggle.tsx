import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { FontWeights, getFocusStyle, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import { getId, getNativeProps, IComponentAs, inputProperties, IRefObject } from "@uifabric/styleguide"
import * as React from "react"
import { IKeytipProps } from "./Keytip"
import { KeytipData } from "./KeytipData"
import { Label } from "./Label"

export interface IToggleState {
  checked: boolean
}


export class ToggleBase extends React.Component<IToggleProps, IToggleState> implements IToggle {
  private _id: string
  private _toggleButton = React.createRef<HTMLButtonElement>()

  public static getDerivedStateFromProps(props: IToggleProps, state: IToggleState): IToggleState {
    if (props.checked === undefined) {
      return state
    }

    return {
      ...state,
      checked: !!props.checked
    }
  }

  constructor(props: IToggleProps) {
    super(props)

    // this._warnMutuallyExclusive({
    //   checked: 'defaultChecked'
    // });

    // this._warnDeprecations({
    //   onAriaLabel: 'ariaLabel',
    //   offAriaLabel: undefined,
    //   onChanged: 'onChange'
    // });

    this.state = {
      checked: !!(props.checked || props.defaultChecked)
    }
    this._id = props.id || getId("Toggle")
  }

  /**
   * Gets the current checked state of the toggle.
   */
  public get checked(): boolean {
    return this.state.checked
  }

  public render(): JSX.Element {
    const {
      as: RootType = "div",
      className,
      theme,
      disabled,
      keytipProps,
      label,
      ariaLabel,
      onAriaLabel,
      offAriaLabel,
      offText,
      onText,
      styles,
      inlineLabel
    } = this.props
    const { checked } = this.state
    const stateText = checked ? onText : offText
    const badAriaLabel = checked ? onAriaLabel : offAriaLabel
    const toggleNativeProps = getNativeProps(this.props, inputProperties, ["defaultChecked"])
    const classNames = classNamesFunction<IToggleStyleProps, IToggleStyles>()(styles!, {
      theme: theme!,
      className,
      disabled,
      checked,
      inlineLabel,
      onOffMissing: !onText && !offText
    })

    const labelId = `${this._id}-label`
    const stateTextId = `${this._id}-stateText`

    // The following properties take priority for what Narrator should read:
    // 1. ariaLabel
    // 2. onAriaLabel (if checked) or offAriaLabel (if not checked)
    // 3. label
    // 4. onText (if checked) or offText (if not checked)
    let labelledById: string | undefined = undefined
    if (!ariaLabel && !badAriaLabel) {
      if (label) {
        labelledById = labelId
      } else if (stateText) {
        labelledById = stateTextId
      }
    }

    return (
      <RootType className={classNames.root} hidden={(toggleNativeProps as any).hidden}>
        {label && (
          <Label htmlFor={this._id} className={classNames.label} id={labelId}>
            {label}
          </Label>
        )}

        <div className={classNames.container}>
          <KeytipData keytipProps={keytipProps} ariaDescribedBy={(toggleNativeProps as any)["aria-describedby"]} disabled={disabled}>
            {(keytipAttributes: any): JSX.Element => (
              <button
                {...toggleNativeProps}
                {...keytipAttributes}
                className={classNames.pill}
                disabled={disabled}
                id={this._id}
                type="button"
                role="switch" // ARIA 1.1 definition; "checkbox" in ARIA 1.0
                ref={this._toggleButton}
                aria-disabled={disabled}
                aria-checked={checked}
                aria-label={ariaLabel ? ariaLabel : badAriaLabel}
                data-is-focusable={true}
                onChange={this._noop}
                onClick={this._onClick}
                aria-labelledby={labelledById}
              >
                <div className={classNames.thumb} />
              </button>
            )}
          </KeytipData>
          {stateText && (
            <Label htmlFor={this._id} className={classNames.text} id={stateTextId}>
              {stateText}
            </Label>
          )}
        </div>
      </RootType>
    )
  }

  public focus() {
    if (this._toggleButton.current) {
      this._toggleButton.current.focus()
    }
  }

  private _onClick = (ev: React.MouseEvent<HTMLElement>) => {
    const { disabled, checked: checkedProp, onChange, onChanged, onClick } = this.props
    const { checked } = this.state

    if (!disabled) {
      // Only update the state if the user hasn't provided it.
      if (checkedProp === undefined) {
        this.setState({
          checked: !checked
        })
      }

      if (onChange) {
        onChange(ev, !checked)
      }

      if (onChanged) {
        onChanged(!checked)
      }

      if (onClick) {
        onClick(ev)
      }
    }
  }

  private _noop(): void {
    /* no-op */
  }
}

const DEFAULT_PILL_WIDTH = 40
const DEFAULT_PILL_HEIGHT = 20
const DEFAULT_THUMB_SIZE = 12

export const getToggleStyles = (props: IToggleStyleProps): IToggleStyles => {
  const { theme, className, disabled, checked, inlineLabel, onOffMissing } = props
  const { semanticColors, palette } = theme

  // Tokens
  const pillUncheckedBackground = semanticColors.bodyBackground
  const pillCheckedBackground = semanticColors.inputBackgroundChecked
  // TODO: after updating the semanticColors slots mapping this needs to be semanticColors.inputBackgroundCheckedHovered
  const pillCheckedHoveredBackground = palette.themeDark
  const thumbUncheckedHoveredBackground = palette.neutralDark
  const pillCheckedDisabledBackground = semanticColors.disabledBodySubtext
  const thumbBackground = semanticColors.smallInputBorder
  const thumbCheckedBackground = semanticColors.inputForegroundChecked
  const thumbDisabledBackground = semanticColors.disabledBodySubtext
  const thumbCheckedDisabledBackground = semanticColors.disabledBackground
  const pillBorderColor = semanticColors.smallInputBorder
  const pillBorderHoveredColor = semanticColors.inputBorderHovered
  const pillBorderDisabledColor = semanticColors.disabledBodySubtext
  const textDisabledColor = semanticColors.disabledText

  return {
    root: [
      "ms-Toggle",
      checked && "is-checked",
      !disabled && "is-enabled",
      disabled && "is-disabled",
      theme.fonts.small,
      {
        marginBottom: "8px"
      },
      inlineLabel && {
        display: "flex",
        alignItems: "center"
      },
      className
    ],

    label: [
      "ms-Toggle-label",
      disabled && {
        color: textDisabledColor,
        selectors: {
          [HighContrastSelector]: {
            color: "GrayText"
          }
        }
      },
      inlineLabel &&
        !onOffMissing && {
          marginRight: 16
        },
      onOffMissing &&
        inlineLabel && {
          order: 1,
          marginLeft: 16
        }
    ],

    container: [
      "ms-Toggle-innerContainer",
      {
        display: "inline-flex",
        position: "relative"
      }
    ],

    pill: [
      "ms-Toggle-background",
      getFocusStyle(theme, { inset: -3 }),
      {
        fontSize: "20px",
        boxSizing: "border-box",
        width: DEFAULT_PILL_WIDTH,
        height: DEFAULT_PILL_HEIGHT,
        borderRadius: DEFAULT_PILL_HEIGHT / 2,
        transition: "all 0.1s ease",
        border: `1px solid ${pillBorderColor}`,
        background: pillUncheckedBackground,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: "0 3px"
      },
      !disabled && [
        !checked && {
          selectors: {
            ":hover": [
              {
                borderColor: pillBorderHoveredColor
              }
            ],
            ":hover .ms-Toggle-thumb": [
              {
                backgroundColor: thumbUncheckedHoveredBackground,
                selectors: {
                  [HighContrastSelector]: {
                    borderColor: "Highlight"
                  }
                }
              }
            ]
          }
        },
        checked && [
          {
            background: pillCheckedBackground,
            borderColor: "transparent",
            justifyContent: "flex-end"
          },
          {
            selectors: {
              ":hover": [
                {
                  backgroundColor: pillCheckedHoveredBackground,
                  borderColor: "transparent",
                  selectors: {
                    [HighContrastSelector]: {
                      backgroundColor: "Highlight"
                    }
                  }
                }
              ],
              [HighContrastSelector]: {
                backgroundColor: "WindowText"
              }
            }
          }
        ]
      ],
      disabled && [
        {
          cursor: "default"
        },
        !checked && [
          {
            borderColor: pillBorderDisabledColor
          }
        ],
        checked && [
          {
            backgroundColor: pillCheckedDisabledBackground,
            borderColor: "transparent",
            justifyContent: "flex-end"
          }
        ]
      ],
      !disabled && {
        selectors: {
          "&:hover": {
            selectors: {
              [HighContrastSelector]: {
                borderColor: "Highlight"
              }
            }
          }
        }
      }
    ],

    thumb: [
      "ms-Toggle-thumb",
      {
        width: DEFAULT_THUMB_SIZE,
        height: DEFAULT_THUMB_SIZE,
        borderRadius: "50%",
        transition: "all 0.1s ease",
        backgroundColor: thumbBackground,
        /* Border is added to handle high contrast mode for Firefox */
        borderColor: "transparent",
        borderWidth: ".28em",
        borderStyle: "solid",
        boxSizing: "border-box"
      },
      !disabled &&
        checked && [
          {
            backgroundColor: thumbCheckedBackground,
            selectors: {
              [HighContrastSelector]: {
                backgroundColor: "Window",
                borderColor: "Window"
              }
            }
          }
        ],
      disabled && [
        !checked && [
          {
            backgroundColor: thumbDisabledBackground
          }
        ],
        checked && [
          {
            backgroundColor: thumbCheckedDisabledBackground
          }
        ]
      ]
    ],

    text: [
      "ms-Toggle-stateText",
      {
        selectors: {
          // Workaround: make rules more specific than Label rules.
          "&&": {
            padding: "0",
            margin: "0 8px",
            userSelect: "none",
            fontWeight: FontWeights.regular
          }
        }
      },
      disabled && {
        selectors: {
          "&&": {
            color: textDisabledColor,
            selectors: {
              [HighContrastSelector]: {
                color: "GrayText"
              }
            }
          }
        }
      }
    ]
  }
}

export const Toggle: React.FunctionComponent<IToggleProps> = styled<IToggleProps, IToggleStyleProps, IToggleStyles>(
  ToggleBase,
  getToggleStyles,
  undefined,
  { scope: "Toggle" }
)

/**
 * {@docCategory Toggle}
 */
export interface IToggle {
  focus: () => void
}

/**
 * Toggle component props.
 * {@docCategory Toggle}
 */
export interface IToggleProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Render the root element as another type.
   */
  as?: IComponentAs<React.HTMLAttributes<HTMLElement>>

  /**
   * Optional callback to access the IToggle interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IToggle>

  /**
   * A label for the toggle.
   */
  label?: string

  /**
   * Text to display when toggle is ON.
   * Caution: when not providing on/off text user may get confused in differentiating the on/off states of the toggle.
   */
  onText?: string

  /**
   * Text to display when toggle is OFF.
   * Caution: when not providing on/off text user may get confused in differentiating the on/off states of the toggle.
   */
  offText?: string

  /**
   * Text for screen-reader to announce as the name of the toggle.
   */
  ariaLabel?: string

  /**
   * @deprecated Use `ariaLabel` for name, and let the metadata convey state
   */
  onAriaLabel?: string

  /**
   * @deprecated Use `ariaLabel` for name, and let the metadata convey state
   */
  offAriaLabel?: string

  /**
   * Checked state of the toggle. If you are maintaining state yourself, use this property. Otherwise refer to `defaultChecked`.
   */
  checked?: boolean

  /**
   * Initial state of the toggle. If you want the toggle to maintain its own state, use this. Otherwise refer to `checked`.
   */
  defaultChecked?: boolean

  /**
   * Optional disabled flag.
   */
  disabled?: boolean

  /**
   * Whether the label (not the onText/offText) should be positioned inline with the toggle control.
   * Left (right in RTL) side when on/off text provided VS right (left in RTL) side when no on/off text.
   * Caution: when not providing on/off text user may get confused in differentiating the on/off states of the toggle.
   */
  inlineLabel?: boolean

  /**
   * Callback issued when the value changes.
   */
  onChange?: (event: React.MouseEvent<HTMLElement>, checked?: boolean) => void

  /**
   * @deprecated Use `onChange` instead.
   */
  onChanged?: (checked: boolean) => void

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Optional styles for the component.
   */
  styles?: IStyleFunctionOrObject<IToggleStyleProps, IToggleStyles>

  /**
   * Optional keytip for this toggle
   */
  keytipProps?: IKeytipProps
}

/**
 * Properties required to build the styles for the Toggle component.
 * {@docCategory Toggle}
 */
export interface IToggleStyleProps {
  /**
   * Theme values.
   */
  theme: ITheme

  /**
   * Root element class name.
   */
  className?: string

  /**
   * Component is disabled.
   */
  disabled?: boolean

  /**
   * Component is checked.
   */
  checked?: boolean

  /**
   * Whether label should be positioned inline with the toggle.
   */
  inlineLabel?: boolean

  /**
   * Whether the user did not specify a on/off text. Influencing only when inlineLabel is used.
   */
  onOffMissing?: boolean
}

/**
 * Styles for the Toggle component.
 * {@docCategory Toggle}
 */
export interface IToggleStyles {
  /** Root element. */
  root: IStyle

  /**
   * Label element above the toggle.
   */
  label: IStyle

  /**
   * Container for the toggle pill and the text next to it.
   */
  container: IStyle

  /**
   * Pill, rendered as a button.
   */
  pill: IStyle

  /**
   * Thumb inside of the pill.
   */
  thumb: IStyle

  /**
   * Text next to the pill.
   */
  text: IStyle
}
