import { classNamesFunction, mergeStyles, getRTL, styled } from "@uifabric/styleguide"
import { FontSizes, FontWeights, getGlobalClassNames, HighContrastSelector } from "@uifabric/styleguide"
import { divProperties, getNativeProps } from "@uifabric/styleguide"
import * as React from "react"
import { Icon } from "./Icon"
import { Image, ImageFit, ImageLoadState } from "./Image"
import { IPersonaCoinProps, IPersonaCoinStyleProps, IPersonaCoinStyles, IPersonaPresenceProps } from "./Persona"
import { PersonaPresenceEnum, PersonaSize, sizeBoolean, sizeToPixels } from "./PersonaConsts"
import { initialsColorPropToColorCode } from "./PersonaInitialsColor"
import { PersonaPresence } from "./PersonaPresence"

/**
 * Regular expression matching characters to ignore when calculating the initials.
 * The first part matches characters within parenthesis, including the parenthesis.
 * The second part matches special ASCII characters except space, plus some unicode special characters.
 */
const UNWANTED_CHARS_REGEX: RegExp = /\([^)]*\)|[\0-\u001F\!-/:-@\[-`\{-\u00BF\u0250-\u036F\uD800-\uFFFF]/g

/**
 * Regular expression matching phone numbers. Applied after chars matching UNWANTED_CHARS_REGEX have been removed
 * and number has been trimmed for whitespaces
 */
const PHONENUMBER_REGEX: RegExp = /^\d+[\d\s]*(:?ext|x|)\s*\d+$/i

/** Regular expression matching one or more spaces. */
const MULTIPLE_WHITESPACES_REGEX: RegExp = /\s+/g

/**
 * Regular expression matching languages for which we currently don't support initials.
 * Arabic:   Arabic, Arabic Supplement, Arabic Extended-A.
 * Korean:   Hangul Jamo, Hangul Compatibility Jamo, Hangul Jamo Extended-A, Hangul Syllables, Hangul Jamo Extended-B.
 * Japanese: Hiragana, Katakana.
 * CJK:      CJK Unified Ideographs Extension A, CJK Unified Ideographs, CJK Compatibility Ideographs, CJK Unified Ideographs Extension B
 */
/* tslint:disable:max-line-length */
const UNSUPPORTED_TEXT_REGEX: RegExp = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\uD840-\uD869][\uDC00-\uDED6]/
/* tslint:enable:max-line-length */

function getInitialsLatin(displayName: string, isRtl: boolean): string {
  let initials = ""

  const splits: string[] = displayName.split(" ")

  if (splits.length === 2) {
    initials += splits[0].charAt(0).toUpperCase()
    initials += splits[1].charAt(0).toUpperCase()
  } else if (splits.length === 3) {
    initials += splits[0].charAt(0).toUpperCase()
    initials += splits[2].charAt(0).toUpperCase()
  } else if (splits.length !== 0) {
    initials += splits[0].charAt(0).toUpperCase()
  }

  if (isRtl && initials.length > 1) {
    return initials.charAt(1) + initials.charAt(0)
  }

  return initials
}

function cleanupDisplayName(displayName: string): string {
  displayName = displayName.replace(UNWANTED_CHARS_REGEX, "")
  displayName = displayName.replace(MULTIPLE_WHITESPACES_REGEX, " ")
  displayName = displayName.trim()

  return displayName
}

/**
 * Get (up to 2 characters) initials based on display name of the persona.
 *
 * @public
 */
export function getInitials(displayName: string | undefined | null, isRtl: boolean, allowPhoneInitials?: boolean): string {
  if (!displayName) {
    return ""
  }

  displayName = cleanupDisplayName(displayName)

  // For names containing CJK characters, and phone numbers, we don't display initials
  if (UNSUPPORTED_TEXT_REGEX.test(displayName) || (!allowPhoneInitials && PHONENUMBER_REGEX.test(displayName))) {
    return ""
  }

  return getInitialsLatin(displayName, isRtl)
}


export const getPersonaCoinStyles = (props: IPersonaCoinStyleProps): IPersonaCoinStyles => {
  const { className, theme, coinSize } = props

  const { palette } = theme

  const size = sizeBoolean(props.size as PersonaSize)

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  // Static colors used when displaying 'unknown persona' coin
  const unknownPersonaBackgroundColor = "rgb(234, 234, 234)"
  const unknownPersonaFontColor = "rgb(168, 0, 0)"

  const dimension = coinSize || (props.size && sizeToPixels[props.size]) || 48

  return {
    coin: [
      classNames.coin,
      theme.fonts.small,
      size.isSize8 && classNames.size8,
      size.isSize10 && classNames.size10,
      size.isSize16 && classNames.size16,
      size.isSize24 && classNames.size24,
      size.isSize28 && classNames.size28,
      size.isSize32 && classNames.size32,
      size.isSize40 && classNames.size40,
      size.isSize48 && classNames.size48,
      size.isSize56 && classNames.size56,
      size.isSize72 && classNames.size72,
      size.isSize100 && classNames.size100,
      className
    ],

    size10WithoutPresenceIcon: {
      fontSize: "10px",
      position: "absolute",
      top: "5px",
      right: "auto",
      left: 0
    },

    imageArea: [
      classNames.imageArea,
      {
        position: "relative",
        textAlign: "center",
        flex: "0 0 auto",
        height: dimension,
        width: dimension
      },

      dimension <= 10 && {
        overflow: "visible",
        background: "transparent",
        height: 0,
        width: 0
      }
    ],

    image: [
      classNames.image,
      {
        marginRight: "10px",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: 0,
        borderRadius: "50%",
        perspective: "1px"
      },

      dimension <= 10 && {
        overflow: "visible",
        background: "transparent",
        height: 0,
        width: 0
      },

      dimension > 10 && {
        height: dimension,
        width: dimension
      }
    ],

    initials: [
      classNames.initials,
      {
        borderRadius: "50%",
        color: props.showUnknownPersonaCoin ? unknownPersonaFontColor : palette.white,
        fontSize: FontSizes.medium,
        fontWeight: FontWeights.semibold,
        lineHeight: dimension === 48 ? 46 : dimension, // copying the logic for the dimensions; defaulted to 46 for size48
        height: dimension,

        selectors: {
          [HighContrastSelector]: {
            border: "1px solid WindowText",
            MsHighContrastAdjust: "none",
            color: "WindowText",
            boxSizing: "border-box",
            backgroundColor: "Window !important"
          },
          i: {
            fontWeight: FontWeights.semibold
          }
        }
      },

      props.showUnknownPersonaCoin && {
        backgroundColor: unknownPersonaBackgroundColor
      },

      dimension < 32 && {
        fontSize: FontSizes.mini
      },

      dimension >= 32 &&
        dimension < 40 && {
          fontSize: FontSizes.small
        },

      dimension >= 40 &&
        dimension < 56 && {
          fontSize: 16 // TODO needs to replaced after type ramp reconcile
        },

      dimension >= 56 &&
        dimension < 72 && {
          fontSize: 20 // TODO needs to replaced after type ramp reconcile
        },

      dimension >= 72 &&
        dimension < 100 && {
          fontSize: FontSizes.xLarge
        },

      dimension >= 100 && {
        fontSize: FontSizes.superLarge
      }
    ]
  }
}

export interface IPersonaState {
  isImageLoaded?: boolean
  isImageError?: boolean
}

/**
 * PersonaCoin with no default styles.
 * [Use the `getStyles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Styling)
 */
export class PersonaCoinBase extends React.Component<IPersonaCoinProps, IPersonaState> {
  public static defaultProps: IPersonaCoinProps = {
    size: PersonaSize.size48,
    presence: PersonaPresenceEnum.none,
    imageAlt: ""
  }

  constructor(props: IPersonaCoinProps) {
    super(props)

    //this._warnDeprecations({ primaryText: 'text' });

    this.state = {
      isImageLoaded: false,
      isImageError: false
    }
  }

  public UNSAFE_componentWillReceiveProps(nextProps: IPersonaCoinProps): void {
    if (nextProps.imageUrl !== this.props.imageUrl) {
      this.setState({
        isImageLoaded: false,
        isImageError: false
      })
    }
  }

  public render(): JSX.Element | null {
    const {
      className,
      coinProps,
      showUnknownPersonaCoin,
      coinSize,
      styles,
      imageUrl,
      onRenderCoin = this._onRenderCoin,
      onRenderInitials = this._onRenderInitials,
      presence,
      showInitialsUntilImageLoads,
      theme
    } = this.props

    const size = this.props.size as PersonaSize
    const divProps = getNativeProps(this.props, divProperties)
    const divCoinProps = getNativeProps(coinProps || {}, divProperties)
    const coinSizeStyle = coinSize ? { width: coinSize, height: coinSize } : undefined
    const hideImage = showUnknownPersonaCoin

    const personaPresenceProps: IPersonaPresenceProps = {
      coinSize,
      presence,
      size,
      theme
    }

    // Use getStyles from props, or fall back to getStyles from styles file.
    const classNames = classNamesFunction<IPersonaCoinStyleProps, IPersonaCoinStyles>()(styles, {
      theme: theme!,
      className: coinProps && coinProps.className ? coinProps.className : className,
      size,
      coinSize,
      showUnknownPersonaCoin
    })

    const shouldRenderInitials = Boolean(
      !this.state.isImageLoaded && ((showInitialsUntilImageLoads && imageUrl) || !imageUrl || this.state.isImageError || hideImage)
    )

    return (
      <div {...divProps} className={classNames.coin}>
        {// Render PersonaCoin if size is not size8. size10 and tiny need to removed after a deprecation cleanup.
        size !== PersonaSize.size8 && size !== PersonaSize.size10 && size !== PersonaSize.tiny ? (
          <div {...divCoinProps} className={classNames.imageArea} style={coinSizeStyle}>
            {shouldRenderInitials && (
              <div
                className={mergeStyles(
                  classNames.initials,
                  !showUnknownPersonaCoin && { backgroundColor: initialsColorPropToColorCode(this.props) }
                )}
                style={coinSizeStyle}
                aria-hidden="true"
              >
                {onRenderInitials(this.props, this._onRenderInitials)}
              </div>
            )}
            {!hideImage && onRenderCoin(this.props, this._onRenderCoin)}
            <PersonaPresence {...personaPresenceProps} />
          </div>
        ) : // Otherwise, render just PersonaPresence.
        this.props.presence ? (
          <PersonaPresence {...personaPresenceProps} />
        ) : (
          // Just render Contact Icon if there isn't a Presence prop.
          <Icon iconName="Contact" className={classNames.size10WithoutPresenceIcon} />
        )}
        {this.props.children}
      </div>
    )
  }

  private _onRenderCoin = (props: IPersonaCoinProps): JSX.Element | null => {
    const { coinSize, styles, imageUrl, imageAlt, imageShouldFadeIn, imageShouldStartVisible, theme, showUnknownPersonaCoin } = this.props

    // Render the Image component only if an image URL is provided
    if (!imageUrl) {
      return null
    }

    const size = this.props.size as PersonaSize

    const classNames = classNamesFunction<IPersonaCoinStyleProps, IPersonaCoinStyles>()(styles, {
      theme: theme!,
      size,
      showUnknownPersonaCoin
    })

    const dimension = coinSize || sizeToPixels[size]

    return (
      <Image
        className={classNames.image}
        imageFit={ImageFit.cover}
        src={imageUrl}
        width={dimension}
        height={dimension}
        alt={imageAlt}
        shouldFadeIn={imageShouldFadeIn}
        shouldStartVisible={imageShouldStartVisible}
        onLoadingStateChange={this._onPhotoLoadingStateChange}
      />
    )
  }

  /**
   * Deprecation helper for getting text.
   */
  private _getText(): string {
    return this.props.text || this.props.primaryText || ""
  }

  private _onRenderInitials = (props: IPersonaCoinProps): JSX.Element => {
    let { imageInitials } = props
    const { allowPhoneInitials, showUnknownPersonaCoin } = props

    if (showUnknownPersonaCoin) {
      return <Icon iconName="Help" />
    }

    const isRTL = getRTL()

    imageInitials = imageInitials || getInitials(this._getText(), isRTL, allowPhoneInitials)

    return imageInitials !== "" ? <span>{imageInitials}</span> : <Icon iconName="Contact" />
  }

  private _onPhotoLoadingStateChange = (loadState: ImageLoadState) => {
    this.setState({
      isImageLoaded: loadState === ImageLoadState.loaded,
      isImageError: loadState === ImageLoadState.error
    })

    this.props.onPhotoLoadingStateChange && this.props.onPhotoLoadingStateChange(loadState)
  }
}

const GlobalClassNames = {
  coin: "ms-Persona-coin",
  imageArea: "ms-Persona-imageArea",
  image: "ms-Persona-image",
  initials: "ms-Persona-initials",
  size8: "ms-Persona--size8",
  size10: "ms-Persona--size10",
  size16: "ms-Persona--size16",
  size24: "ms-Persona--size24",
  size28: "ms-Persona--size28",
  size32: "ms-Persona--size32",
  size40: "ms-Persona--size40",
  size48: "ms-Persona--size48",
  size56: "ms-Persona--size56",
  size72: "ms-Persona--size72",
  size100: "ms-Persona--size100"
}

/**
 * PersonaCoin is used to render an individual's avatar and presence.
 */
export const PersonaCoin: React.FunctionComponent<IPersonaCoinProps> = styled<
  IPersonaCoinProps,
  IPersonaCoinStyleProps,
  IPersonaCoinStyles
>(PersonaCoinBase, getPersonaCoinStyles, undefined, {
  scope: "PersonaCoin"
})
