import { classNamesFunction, css, IProcessedStyleSet, IsFocusVisibleClassName, IStyle, styled } from "@uifabric/styleguide"
import { FontSizes, FontWeights, getGlobalClassNames, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import { getNativeProps, inputProperties } from "@uifabric/styleguide"
import * as React from "react"
import { IChoiceGroupOption } from "./ChoiceGroup"
import { Icon } from "./Icon"
import { Image } from "./Image"


export class ChoiceGroupOptionBase extends React.Component<IChoiceGroupOptionProps, any> {
  private _inputElement = React.createRef<HTMLInputElement>()
  private _classNames: IProcessedStyleSet<IChoiceGroupOptionStyles>

  public render(): JSX.Element {
    const {
      ariaLabel,
      focused,
      required,
      theme,
      iconProps,
      imageSrc,
      imageSize = { width: 32, height: 32 },
      disabled,
      checked,
      id,
      styles,
      name,
      onRenderField = this._onRenderField,
      ...rest
    } = this.props

    this._classNames = classNamesFunction<IChoiceGroupOptionStyleProps, IChoiceGroupOptionStyles>()(styles!, {
      theme: theme!,
      hasIcon: !!iconProps,
      hasImage: !!imageSrc,
      checked,
      disabled,
      imageIsLarge: !!imageSrc && (imageSize.width > 71 || imageSize.height > 71),
      focused
    })

    const { className, ...nativeProps } = getNativeProps<{ className: string }>(rest, inputProperties)

    return (
      <div className={this._classNames.root}>
        <div className={this._classNames.choiceFieldWrapper}>
          <input
            aria-label={ariaLabel ? ariaLabel : undefined}
            ref={this._inputElement}
            id={id}
            className={css(this._classNames.input, className)}
            type="radio"
            name={name}
            disabled={disabled}
            checked={checked}
            required={required}
            onChange={this._onChange.bind(this, this.props)}
            onFocus={this._onFocus.bind(this, this.props)}
            onBlur={this._onBlur.bind(this, this.props)}
            {...nativeProps}
          />
          {onRenderField(this.props, this._onRenderField)}
        </div>
      </div>
    )
  }

  private _onChange(props: IChoiceGroupOptionProps, evt: React.FormEvent<HTMLInputElement>): void {
    const { onChange } = props
    if (onChange) {
      onChange(evt, props)
    }
  }

  private _onBlur(props: IChoiceGroupOptionProps, evt: React.FocusEvent<HTMLElement>) {
    const { onBlur } = props
    if (onBlur) {
      onBlur(evt, props)
    }
  }

  private _onFocus(props: IChoiceGroupOptionProps, evt: React.FocusEvent<HTMLElement>) {
    const { onFocus } = props
    if (onFocus) {
      onFocus(evt, props)
    }
  }

  private _onRenderField = (props: IChoiceGroupOptionProps): JSX.Element => {
    const { onRenderLabel = this._onRenderLabel, id, imageSrc, imageAlt, selectedImageSrc, iconProps } = props

    const imageSize = props.imageSize ? props.imageSize : { width: 32, height: 32 }

    return (
      <label htmlFor={id} className={this._classNames.field}>
        {imageSrc && (
          <div className={this._classNames.innerField} style={{ height: imageSize.height, width: imageSize.width }}>
            <div className={this._classNames.imageWrapper}>
              <Image src={imageSrc} alt={imageAlt ? imageAlt : ""} width={imageSize.width} height={imageSize.height} />
            </div>
            <div className={this._classNames.selectedImageWrapper}>
              <Image src={selectedImageSrc} alt={imageAlt ? imageAlt : ""} width={imageSize.width} height={imageSize.height} />
            </div>
          </div>
        )}
        {iconProps ? (
          <div className={this._classNames.innerField}>
            <div className={this._classNames.iconWrapper}>
              <Icon {...iconProps} />
            </div>
          </div>
        ) : null}
        {imageSrc || iconProps ? (
          <div className={this._classNames.labelWrapper} style={{ maxWidth: imageSize.width * 2 }}>
            {onRenderLabel!(props)}
          </div>
        ) : (
          onRenderLabel!(props)
        )}
      </label>
    )
  }

  private _onRenderLabel = (props: IChoiceGroupOptionProps): JSX.Element => {
    return (
      <span id={props.labelId} className="ms-ChoiceFieldLabel">
        {props.text}
      </span>
    )
  }
}

const GlobalClassNames = {
  root: "ms-ChoiceField",
  choiceFieldWrapper: "ms-ChoiceField-wrapper",
  input: "ms-ChoiceField-input",
  field: "ms-ChoiceField-field",
  innerField: "ms-ChoiceField-innerField",
  imageWrapper: "ms-ChoiceField-imageWrapper",
  iconWrapper: "ms-ChoiceField-iconWrapper",
  labelWrapper: "ms-ChoiceField-labelWrapper",
  checked: "is-checked"
}

const labelWrapperLineHeight = 15
const iconSize = 32
const choiceFieldSize = 20
const choiceFieldTransitionDuration = "200ms"
const choiceFieldTransitionTiming = "cubic-bezier(.4, 0, .23, 1)"
const radioButtonSpacing = 3
const radioButtonInnerSize = 5

function getChoiceGroupFocusStyle(focusBorderColor: string, hasIconOrImage?: boolean): IStyle {
  return [
    "is-inFocus",
    {
      selectors: {
        [`.${IsFocusVisibleClassName} &`]: {
          position: "relative",
          outline: "transparent",
          selectors: {
            "::-moz-focus-inner": {
              border: 0
            },
            ":after": {
              content: '""',
              top: -2,
              right: -2,
              bottom: -2,
              left: -2,
              pointerEvents: "none",
              border: `1px solid ${focusBorderColor}`,
              position: "absolute",
              selectors: {
                [HighContrastSelector]: {
                  borderColor: "WindowText",
                  borderWidth: hasIconOrImage ? 1 : 2
                }
              }
            }
          }
        }
      }
    }
  ]
}

function getImageWrapperStyle(isSelectedImageWrapper: boolean, className?: string, checked?: boolean): IStyle {
  return [
    className,
    {
      paddingBottom: 2,
      transitionProperty: "opacity",
      transitionDuration: choiceFieldTransitionDuration,
      transitionTimingFunction: "ease",
      selectors: {
        ".ms-Image": {
          display: "inline-block",
          borderStyle: "none"
        }
      }
    },
    (checked ? !isSelectedImageWrapper : isSelectedImageWrapper) && [
      "is-hidden",
      {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        opacity: 0
      }
    ]
  ]
}

export const getChoiceGroupOptionStyles = (props: IChoiceGroupOptionStyleProps): IChoiceGroupOptionStyles => {
  const { theme, hasIcon, hasImage, checked, disabled, imageIsLarge, focused } = props
  const { palette, semanticColors } = theme

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  // Tokens
  // TODO: after updating the semanticColors slots mapping this needs to be semanticColors.smallInputBorder
  const circleBorderColor = palette.neutralPrimary
  const circleHoveredBorderColor = semanticColors.inputBorderHovered
  const circleCheckedBorderColor = semanticColors.inputBackgroundChecked
  // TODO: after updating the semanticColors slots mapping this needs to be semanticColors.inputBackgroundCheckedHovered
  const circleCheckedHoveredBorderColor = palette.themeDark
  const circleDisabledBorderColor = semanticColors.disabledBodySubtext
  const circleBackgroundColor = semanticColors.bodyBackground
  const dotUncheckedHoveredColor = palette.neutralSecondary
  const dotCheckedColor = semanticColors.inputBackgroundChecked
  // TODO: after updating the semanticColors slots mapping this needs to be semanticColors.inputBackgroundCheckedHovered
  const dotCheckedHoveredColor = palette.themeDark
  const dotDisabledColor = semanticColors.disabledBodySubtext
  // TODO: after updating the semanticColors slots mapping this needs to be semanticColors.bodyTextChecked
  const labelHoverFocusColor = palette.neutralDark
  const focusBorderColor = semanticColors.focusBorder
  const iconOrImageChoiceBorderUncheckedHoveredColor = semanticColors.inputBorderHovered
  // TODO: after updating the semanticColors slots mapping this needs to be semanticColors.inputBackgroundCheckedHovered
  const iconOrImageChoiceBorderCheckedColor = semanticColors.inputBackgroundChecked
  const iconOrImageChoiceBorderCheckedHoveredColor = palette.themeDark
  const iconOrImageChoiceBackgroundColor = palette.neutralLighter

  const fieldHoverOrFocusProperties = {
    selectors: {
      ".ms-ChoiceFieldLabel": {
        color: labelHoverFocusColor
      },
      ":before": {
        borderColor: checked ? circleCheckedHoveredBorderColor : circleHoveredBorderColor
      },
      ":after": [
        !hasIcon &&
          !hasImage &&
          !checked && {
            content: '""',
            transitionProperty: "background-color",
            left: 5,
            top: 5,
            width: 10,
            height: 10,
            backgroundColor: dotUncheckedHoveredColor
          },
        checked && {
          borderColor: dotCheckedHoveredColor
        }
      ]
    }
  }

  const enabledFieldWithImageHoverOrFocusProperties = {
    borderColor: checked ? iconOrImageChoiceBorderCheckedHoveredColor : iconOrImageChoiceBorderUncheckedHoveredColor,
    selectors: {
      ":before": {
        opacity: 1,
        borderColor: checked ? circleCheckedHoveredBorderColor : circleHoveredBorderColor
      }
    }
  }

  const circleAreaProperties: IStyle = [
    {
      content: '""',
      display: "inline-block",
      backgroundColor: circleBackgroundColor,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: circleBorderColor,
      width: choiceFieldSize,
      height: choiceFieldSize,
      fontWeight: "normal",
      position: "absolute",
      top: 0,
      left: 0,
      boxSizing: "border-box",
      transitionProperty: "border-color",
      transitionDuration: choiceFieldTransitionDuration,
      transitionTimingFunction: choiceFieldTransitionTiming,
      borderRadius: "50%"
    },
    disabled && {
      borderColor: circleDisabledBorderColor,
      selectors: {
        [HighContrastSelector]: {
          color: "GrayText"
        }
      }
    },
    checked && {
      borderColor: disabled ? circleDisabledBorderColor : circleCheckedBorderColor,
      selectors: {
        [HighContrastSelector]: {
          borderColor: "Highlight"
        }
      }
    },
    (hasIcon || hasImage) && {
      top: radioButtonSpacing,
      right: radioButtonSpacing,
      left: "auto", // To reset the value of 'left' to its default value, so that 'right' works
      opacity: checked ? 1 : 0
    }
  ]

  const dotAreaProperties: IStyle = [
    {
      content: '""',
      width: 0,
      height: 0,
      borderRadius: "50%",
      position: "absolute",
      left: choiceFieldSize / 2,
      right: 0,
      transitionProperty: "border-width",
      transitionDuration: choiceFieldTransitionDuration,
      transitionTimingFunction: choiceFieldTransitionTiming,
      boxSizing: "border-box"
    },
    checked && {
      borderWidth: 5,
      borderStyle: "solid",
      borderColor: disabled ? dotDisabledColor : dotCheckedColor,
      left: 5,
      top: 5,
      width: 10,
      height: 10,
      selectors: {
        [HighContrastSelector]: {
          borderColor: "Highlight"
        }
      }
    },
    checked &&
      (hasIcon || hasImage) && {
        top: radioButtonSpacing + radioButtonInnerSize,
        right: radioButtonSpacing + radioButtonInnerSize,
        left: "auto" // To reset the value of 'left' to its default value, so that 'right' works
      }
  ]

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      {
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        color: semanticColors.bodyText,
        fontSize: FontSizes.small,
        fontWeight: FontWeights.regular,
        minHeight: 26,
        border: "none",
        position: "relative",
        marginTop: 8,
        selectors: {
          ".ms-ChoiceFieldLabel": {
            fontSize: FontSizes.small,
            display: "inline-block"
          }
        }
      },
      !hasIcon &&
        !hasImage && {
          selectors: {
            ".ms-ChoiceFieldLabel": {
              paddingLeft: "26px"
            }
          }
        },
      hasImage && "ms-ChoiceField--image",
      hasIcon && "ms-ChoiceField--icon",
      (hasIcon || hasImage) && {
        display: "inline-flex",
        fontSize: 0,
        margin: "0 4px 4px 0",
        paddingLeft: 0,
        backgroundColor: iconOrImageChoiceBackgroundColor,
        height: "100%"
      }
    ],
    choiceFieldWrapper: [classNames.choiceFieldWrapper, focused && getChoiceGroupFocusStyle(focusBorderColor, hasIcon || hasImage)],
    // The hidden input
    input: [
      classNames.input,
      {
        position: "absolute",
        opacity: 0,
        top: 0,
        right: 0,
        width: "100%",
        height: "100%",
        margin: 0
      }
    ],
    field: [
      classNames.field,
      checked && classNames.checked,
      {
        display: "inline-block",
        cursor: "pointer",
        marginTop: 0,
        position: "relative",
        verticalAlign: "top",
        userSelect: "none",
        minHeight: 20,
        selectors: {
          ":hover": !disabled && fieldHoverOrFocusProperties,
          ":focus": !disabled && fieldHoverOrFocusProperties,

          // The circle
          ":before": circleAreaProperties,

          // The dot
          ":after": dotAreaProperties
        }
      },
      hasIcon && "ms-ChoiceField--icon",
      hasImage && "ms-ChoiceField-field--image",
      (hasIcon || hasImage) && {
        boxSizing: "content-box",
        cursor: "pointer",
        paddingTop: 22,
        margin: 0,
        textAlign: "center",
        transitionProperty: "all",
        transitionDuration: choiceFieldTransitionDuration,
        transitionTimingFunction: "ease",
        border: "1px solid transparent",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column"
      },
      checked && {
        borderColor: iconOrImageChoiceBorderCheckedColor
      },
      (hasIcon || hasImage) &&
        !disabled && {
          selectors: {
            ":hover": enabledFieldWithImageHoverOrFocusProperties,
            ":focus": enabledFieldWithImageHoverOrFocusProperties
          }
        },
      disabled && {
        cursor: "default",
        selectors: {
          ".ms-ChoiceFieldLabel": {
            color: semanticColors.disabledBodyText
          },
          [HighContrastSelector]: {
            color: "GrayText"
          }
        }
      },
      checked &&
        disabled && {
          borderColor: iconOrImageChoiceBackgroundColor
        }
    ],
    innerField: [
      classNames.innerField,
      (hasIcon || hasImage) && {
        position: "relative",
        display: "inline-block",
        paddingLeft: 30,
        paddingRight: 30
      },
      (hasIcon || hasImage) &&
        imageIsLarge && {
          paddingLeft: 24,
          paddingRight: 24
        },
      (hasIcon || hasImage) &&
        disabled && {
          opacity: 0.25,
          selectors: {
            [HighContrastSelector]: {
              color: "GrayText",
              opacity: 1
            }
          }
        }
    ],
    imageWrapper: getImageWrapperStyle(false, classNames.imageWrapper, checked),
    selectedImageWrapper: getImageWrapperStyle(true, classNames.imageWrapper, checked),
    iconWrapper: [
      classNames.iconWrapper,
      {
        fontSize: iconSize,
        lineHeight: iconSize,
        height: iconSize
      }
    ],
    labelWrapper: [
      classNames.labelWrapper,
      (hasIcon || hasImage) && {
        display: "block",
        position: "relative",
        margin: "4px 8px",
        height: labelWrapperLineHeight * 2,
        lineHeight: labelWrapperLineHeight,
        overflow: "hidden",
        whiteSpace: "pre-wrap",
        textOverflow: "ellipsis",
        fontSize: FontSizes.small,
        fontWeight: FontWeights.regular
      }
    ]
  }
}

export const ChoiceGroupOption: React.FunctionComponent<IChoiceGroupOptionProps> = styled<
  IChoiceGroupOptionProps,
  IChoiceGroupOptionStyleProps,
  IChoiceGroupOptionStyles
>(ChoiceGroupOptionBase, getChoiceGroupOptionStyles, undefined, { scope: "ChoiceGroupOption" })

/**
 * {@docCategory ChoiceGroup}
 */
export type OnFocusCallback = (ev?: React.FocusEvent<HTMLElement | HTMLInputElement>, props?: IChoiceGroupOption) => void | undefined

/**
 * {@docCategory ChoiceGroup}
 */
export type OnChangeCallback = (evt?: React.FormEvent<HTMLElement | HTMLInputElement>, props?: IChoiceGroupOption) => void

/**
 * {@docCategory ChoiceGroup}
 */
export interface IChoiceGroupOptionProps extends IChoiceGroupOption {
  /**
   * Optional callback to access the IChoiceGroup interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  //componentRef?: IRefObject<IChoiceGroupOption>;

  /**
   * A callback for receiving a notification when the choice has been changed.
   */
  onChange?: OnChangeCallback

  /**
   * A callback for receiving a notification when the choice has received focus.
   */
  onFocus?: OnFocusCallback

  /**
   * A callback for receiving a notification when the choice has lost focus.
   */
  onBlur?: (ev: React.FocusEvent<HTMLElement>, props?: IChoiceGroupOption) => void

  /**
   * Indicates if the ChoiceGroupOption should appear focused, visually
   */
  focused?: boolean

  /**
   * Theme (provided through customization.)
   */
  theme?: ITheme

  /**
   * If true, it specifies that an option must be selected in the ChoiceGroup before submitting the form
   */
  required?: boolean

  /**
   * This value is used to group each ChoiceGroupOption into the same logical ChoiceGroup
   */
  name?: string
}

/**
 * {@docCategory ChoiceGroup}
 */
export interface IChoiceGroupOptionStyleProps {
  theme: ITheme
  hasIcon?: boolean
  hasImage?: boolean
  checked?: boolean
  disabled?: boolean
  imageIsLarge?: boolean
  focused?: boolean
}

/**
 * {@docCategory ChoiceGroup}
 */
export interface IChoiceGroupOptionStyles {
  root?: IStyle
  choiceFieldWrapper?: IStyle
  input?: IStyle
  field?: IStyle
  innerField?: IStyle
  imageWrapper?: IStyle
  selectedImageWrapper?: IStyle
  iconWrapper?: IStyle
  labelWrapper?: IStyle
}
