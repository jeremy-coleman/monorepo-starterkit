import { classNamesFunction, css, IProcessedStyleSet, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getFocusStyle, getGlobalClassNames, hiddenContentStyle, HighContrastSelector, ITheme } from "@uifabric/styleguide"
import { format, getId, IRefObject, warnDeprecations } from "@uifabric/styleguide"
import * as React from "react"
import { FocusZone, FocusZoneDirection } from "./FocusZone"
import { Icon } from "./Icon"


interface IRatingStarProps extends React.AllHTMLAttributes<HTMLElement> {
  fillPercentage: number
  disabled: boolean
  readOnly: boolean
  classNames: IProcessedStyleSet<IRatingStyles>
  icon?: string
}

export interface IRatingState {
  rating: number | null | undefined
}

const RatingStar = (props: IRatingStarProps) => {
  const icon = props.icon || "FavoriteStarFill"
  return (
    <div className={props.classNames.ratingStar} key={props.id}>
      <Icon className={props.classNames.ratingStarBack} iconName={icon} />
      {!props.disabled && (
        <Icon className={props.classNames.ratingStarFront} iconName={icon} style={{ width: props.fillPercentage + "%" }} />
      )}
    </div>
  )
}

export class RatingBase extends React.Component<IRatingProps, IRatingState> {
  public static defaultProps: IRatingProps = {
    min: 1,
    max: 5
  }
  private _id: string
  private _min: number
  private _labelId: string
  private _classNames: IProcessedStyleSet<IRatingStyles>

  constructor(props: IRatingProps) {
    super(props)

    warnDeprecations("RatingBase", this.props, {
      onChanged: "onChange"
    })

    this._id = getId("Rating")
    this._min = this.props.allowZeroStars ? 0 : 1
    if (this.props.min !== undefined && this.props.min !== 1) {
      this._min = this.props.min
    }
    this._labelId = getId("RatingLabel")

    this.state = {
      rating: this._getInitialValue(props)
    }
  }

  public UNSAFE_componentWillReceiveProps(nextProps: IRatingProps): void {
    if (typeof nextProps.rating !== "undefined" && nextProps.rating !== this.state.rating) {
      this.setState({
        rating: this._getClampedRating(nextProps.rating)
      } as IRatingState)
    }
  }

  public render(): JSX.Element {
    const id = this._id
    const stars = []
    const starIds = []
    const {
      disabled,
      getAriaLabel,
      styles,
      max,
      rating,
      readOnly,
      size,
      theme,
      icon = "FavoriteStarFill",
      unselectedIcon = "FavoriteStar"
    } = this.props

    this._classNames = classNamesFunction<IRatingStyleProps, IRatingStyles>()(styles!, {
      disabled,
      readOnly,
      theme: theme!
    })

    for (let i = this._min as number; i <= (max as number); i++) {
      if (i !== 0) {
        const fillPercentage = this._getFillingPercentage(i)
        const ratingStarProps: IRatingStarProps = {
          fillPercentage,
          disabled: disabled ? true : false,
          readOnly: readOnly ? true : false,
          classNames: this._classNames,
          icon: fillPercentage > 0 ? icon : unselectedIcon
        }

        starIds.push(this._getStarId(i - 1))

        stars.push(
          <button
            className={css(this._classNames.ratingButton, {
              [this._classNames.ratingStarIsLarge]: size === RatingSize.Large,
              [this._classNames.ratingStarIsSmall]: size !== RatingSize.Large
            })}
            id={starIds[i - 1]}
            key={i}
            {...(i === Math.ceil(this.state.rating as number) ? { "data-is-current": true } : {})}
            onFocus={this._onFocus.bind(this, i)}
            onClick={this._onFocus.bind(this, i)} // For Safari & Firefox on OSX
            disabled={disabled || readOnly ? true : false}
            role="presentation"
            type="button"
          >
            {this._getLabel(i)}
            <RatingStar key={i + "rating"} {...ratingStarProps} />
          </button>
        )
      }
    }

    return (
      <div
        className={css("ms-Rating-star", this._classNames.root, {
          [this._classNames.rootIsLarge]: size === RatingSize.Large,
          [this._classNames.rootIsSmall]: size !== RatingSize.Large
        })}
        aria-label={getAriaLabel ? getAriaLabel(this.state.rating ? this.state.rating : 0, this.props.max as number) : ""}
        id={id}
      >
        <FocusZone
          direction={FocusZoneDirection.horizontal}
          tabIndex={readOnly ? 0 : -1}
          className={css(this._classNames.ratingFocusZone, {
            [this._classNames.rootIsLarge]: size === RatingSize.Large,
            [this._classNames.rootIsSmall]: size !== RatingSize.Large
          })}
          data-is-focusable={readOnly ? true : false}
          defaultActiveElement={rating ? starIds[rating - 1] && "#" + starIds[rating - 1] : undefined}
        >
          {stars}
        </FocusZone>
      </div>
    )
  }

  private _getStarId(index: number): string {
    return this._id + "-star-" + index
  }

  private _onFocus(value: number, ev: React.FocusEvent<HTMLElement>): void {
    if (this.state.rating !== value) {
      this.setState({
        rating: value
      } as IRatingState)

      const { onChange, onChanged } = this.props

      if (onChange) {
        onChange(ev, value)
      }

      if (onChanged) {
        onChanged(value)
      }
    }
  }

  private _getLabel(rating: number): JSX.Element {
    const text = this.props.ariaLabelFormat || ""

    return (
      <span id={`${this._labelId}-${rating}`} className={this._classNames.labelText}>
        {format(text, rating, this.props.max)}
      </span>
    )
  }

  private _getInitialValue(props: IRatingProps): number | undefined {
    if (typeof props.rating === "undefined") {
      return this._min
    }

    if (props.rating === null) {
      return undefined
    }

    return this._getClampedRating(props.rating)
  }

  private _getClampedRating(rating: number): number {
    return Math.min(Math.max(rating, this._min as number), this.props.max as number)
  }

  private _getFillingPercentage(starPosition: number): number {
    const ceilValue = Math.ceil(this.state.rating as number)
    let fillPercentage = 100

    if (starPosition === this.state.rating) {
      fillPercentage = 100
    } else if (starPosition === ceilValue) {
      fillPercentage = 100 * ((this.state.rating as number) % 1)
    } else if (starPosition > ceilValue) {
      fillPercentage = 0
    }
    return fillPercentage
  }
}

const GlobalClassNames = {
  root: "ms-RatingStar-root",
  rootIsSmall: "ms-RatingStar-root--small",
  rootIsLarge: "ms-RatingStar-root--large",
  ratingStar: "ms-RatingStar-container",
  ratingStarBack: "ms-RatingStar-back",
  ratingStarFront: "ms-RatingStar-front",
  ratingButton: "ms-Rating-button",
  ratingStarIsSmall: "ms-Rating--small",
  ratingStartIsLarge: "ms-Rating--large",
  labelText: "ms-Rating-labelText",
  ratingFocusZone: "ms-Rating-focuszone"
}

function _getColorWithHighContrast(color: string, highContrastColor: string) {
  return {
    color: color,
    selectors: {
      [HighContrastSelector]: {
        color: highContrastColor
      }
    }
  }
}

export function getRatingStyles(props: IRatingStyleProps): IRatingStyles {
  const { disabled, readOnly, theme } = props

  const { semanticColors, palette } = theme

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  const ratingSmallIconSize = 16
  const ratingLargeIconSize = 20
  const ratingVerticalPadding = 8
  const ratingHorizontalPadding = 2

  const ratingStarUncheckedColor = palette.neutralTertiary
  const ratingStarUncheckedHoverColor = palette.themePrimary
  const ratingStarUncheckedHoverSelectedColor = palette.themeDark
  const ratingStarCheckedColor = palette.neutralPrimary
  const ratingStarDisabledColor = semanticColors.disabledBodySubtext

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      !disabled &&
        !readOnly && {
          selectors: {
            // This is part 1 of highlighting all stars up to the one the user is hovering over
            "&:hover": {
              selectors: {
                ".ms-RatingStar-back": _getColorWithHighContrast(ratingStarCheckedColor, "Highlight")
              }
            }
          }
        }
    ],
    rootIsSmall: [
      classNames.rootIsSmall,
      {
        height: ratingSmallIconSize + ratingVerticalPadding * 2 + "px"
      }
    ],
    rootIsLarge: [
      classNames.rootIsLarge,
      {
        height: ratingLargeIconSize + ratingVerticalPadding * 2 + "px"
      }
    ],
    ratingStar: [
      classNames.ratingStar,
      {
        display: "inline-block",
        position: "relative",
        height: "inherit"
      }
    ],
    ratingStarBack: [
      classNames.ratingStarBack,
      {
        // TODO: Use a proper semantic color for this
        color: ratingStarUncheckedColor,
        width: "100%"
      },
      disabled && _getColorWithHighContrast(ratingStarDisabledColor, "GrayText")
    ],
    ratingStarFront: [
      classNames.ratingStarFront,
      {
        position: "absolute",
        height: "100 %",
        left: "0",
        top: "0",
        textAlign: "center",
        verticalAlign: "middle",
        overflow: "hidden"
      },
      _getColorWithHighContrast(ratingStarCheckedColor, "Highlight")
    ],
    ratingButton: [
      getFocusStyle(theme),
      classNames.ratingButton,
      {
        backgroundColor: "transparent",
        padding: `${ratingVerticalPadding}px ${ratingHorizontalPadding}px`,
        boxSizing: "content-box",
        margin: "0px",
        border: "none",
        cursor: "pointer",
        selectors: {
          "&:disabled": {
            cursor: "default"
          },
          "&[disabled]": {
            cursor: "default"
          }
        }
      },
      !disabled &&
        !readOnly && {
          selectors: {
            // This is part 2 of highlighting all stars up to the one the user is hovering over
            "&:hover ~ .ms-Rating-button": {
              selectors: {
                ".ms-RatingStar-back": _getColorWithHighContrast(ratingStarUncheckedColor, "WindowText"),
                ".ms-RatingStar-front": _getColorWithHighContrast(ratingStarUncheckedColor, "WindowText")
              }
            },
            "&:hover": {
              selectors: {
                ".ms-RatingStar-back": {
                  color: ratingStarUncheckedHoverColor
                },
                ".ms-RatingStar-front": {
                  color: ratingStarUncheckedHoverSelectedColor
                }
              }
            }
          }
        },
      disabled && {
        cursor: "default"
      }
    ],
    ratingStarIsSmall: [
      classNames.ratingStarIsSmall,
      {
        fontSize: ratingSmallIconSize + "px",
        lineHeight: ratingSmallIconSize + "px",
        height: ratingSmallIconSize + "px"
      }
    ],
    ratingStarIsLarge: [
      classNames.ratingStartIsLarge,
      {
        fontSize: ratingLargeIconSize + "px",
        lineHeight: ratingLargeIconSize + "px",
        height: ratingLargeIconSize + "px"
      }
    ],
    labelText: [classNames.labelText, hiddenContentStyle],
    ratingFocusZone: [
      classNames.ratingFocusZone,
      {
        display: "inline-block"
      }
    ]
  }
}

export const Rating: React.FunctionComponent<IRatingProps> = styled<IRatingProps, IRatingStyleProps, IRatingStyles>(
  RatingBase,
  getRatingStyles,
  undefined,
  { scope: "Rating" }
)

/**
 * {@docCategory Rating}
 */
export interface IRating {}

/**
 * Rating component props.
 * {@docCategory Rating}
 */
export interface IRatingProps extends React.AllHTMLAttributes<HTMLElement> {
  /**
   * Optional callback to access the IRating interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IRating>

  /**
   * Selected rating, has to be an integer between min and max
   */
  rating?: number

  /**
   * Minimum rating, defaults to 1, has to be \>= 0
   * @deprecated No longer used.
   */
  min?: number

  /**
   * Maximum rating, defaults to 5, has to be \>= min
   */
  max?: number

  /**
   * Allow the rating value to be set to 0 instead of a minimum of 1.
   */
  allowZeroStars?: boolean

  /**
   * Custom icon
   * @defaultvalue FavoriteStarFill
   */
  icon?: string

  /**
   * Custom icon for unselected rating elements.
   * @defaultvalue FavoriteStar
   */
  unselectedIcon?: string

  /**
   * Size of rating, defaults to small
   */
  size?: RatingSize

  /**
   * Callback issued when the rating changes.
   */
  onChange?: (event: React.FocusEvent<HTMLElement>, rating?: number) => void

  /**
   * @deprecated Use `onChange` instead.
   */
  onChanged?: (rating: number) => void

  /**
   * Optional label format for star ratings, will be read by screen readers, defaults to ''.
   * Can be used like "\{0\} of \{1\} stars selected".
   * Where \{0\} will be subsituted by the current rating and \{1\} will be subsituted by the max rating.
   */
  ariaLabelFormat?: string

  /**
   * Deprecated: Optional id of label describing this instance of Rating. Use `getAriaLabel` instead.
   * @deprecated Use `getAriaLabel` instead.
   */
  ariaLabelId?: string

  /**
   * Optional flag to mark rating control as readOnly
   */
  readOnly?: boolean

  /*
   * Optional callback to set the arialabel for rating control.
   */
  getAriaLabel?: (rating: number, max: number) => string

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IRatingStyleProps, IRatingStyles>

  /**
   * Theme (provided through customization.)
   */
  theme?: ITheme
}

/**
 * {@docCategory Rating}
 */
export enum RatingSize {
  Small = 0,
  Large = 1
}

/**
 * {@docCategory Rating}
 */
export interface IRatingStyleProps {
  disabled?: boolean
  readOnly?: boolean
  theme: ITheme
}

/**
 * {@docCategory Rating}
 */
export interface IRatingStyles {
  root: IStyle
  ratingStar: IStyle
  ratingStarBack: IStyle
  ratingStarFront: IStyle
  ratingButton: IStyle
  ratingStarIsSmall: IStyle
  ratingStarIsLarge: IStyle
  rootIsSmall: IStyle
  rootIsLarge: IStyle
  labelText: IStyle
  ratingFocusZone: IStyle
}
