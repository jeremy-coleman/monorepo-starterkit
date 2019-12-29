import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { FontSizes, FontWeights, getGlobalClassNames, ITheme, normalize, noWrap } from "@uifabric/styleguide"
import { DirectionalHint, divProperties, getNativeProps, IRefObject, IRenderFunction } from "@uifabric/styleguide"
import * as React from "react"
import { ImageLoadState } from "./Image"
import { PersonaCoin, PersonaCoinBase } from "./PersonaCoin"
import { PersonaInitialsColor, PersonaPresenceEnum, personaSize, PersonaSize, presenceBoolean, sizeBoolean } from "./PersonaConsts"
import { TooltipHost, TooltipOverflowMode } from "./TooltipHost"

const GlobalClassNames = {
  root: "ms-Persona",
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
  size100: "ms-Persona--size100",
  available: "ms-Persona--online",
  away: "ms-Persona--away",
  blocked: "ms-Persona--blocked",
  busy: "ms-Persona--busy",
  doNotDisturb: "ms-Persona--donotdisturb",
  offline: "ms-Persona--offline",
  details: "ms-Persona-details",
  primaryText: "ms-Persona-primaryText",
  secondaryText: "ms-Persona-secondaryText",
  tertiaryText: "ms-Persona-tertiaryText",
  optionalText: "ms-Persona-optionalText",
  textContent: "ms-Persona-textContent"
}

export const getPersonaStyles = (props: IPersonaStyleProps): IPersonaStyles => {
  const { className, showSecondaryText, theme } = props

  const { palette } = theme

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  const size = sizeBoolean(props.size as PersonaSize)
  const presence = presenceBoolean(props.presence as PersonaPresenceEnum)

  const showSecondaryTextDefaultHeight = "16px"

  const sharedTextStyles: IStyle = {
    color: palette.neutralSecondary,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.xSmall
  }

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      normalize,
      {
        color: palette.neutralPrimary,
        fontSize: FontSizes.small,
        fontWeight: FontWeights.regular,
        position: "relative",
        height: personaSize.size48,
        minWidth: personaSize.size48,
        display: "flex",
        alignItems: "center",

        selectors: {
          ".contextualHost": {
            display: "none"
          },

          ":hover": {
            selectors: {
              $primaryText: {
                color: palette.neutralDark
              }
            }
          }
        }
      },

      size.isSize8 && [
        classNames.size8,
        {
          height: personaSize.size8,
          minWidth: personaSize.size8
        }
      ],

      // TODO: Deprecated size and needs to be removed in a future major release.
      size.isSize10 && [
        classNames.size10,
        {
          height: personaSize.size10,
          minWidth: personaSize.size10
        }
      ],

      // TODO: Deprecated size and needs to be removed in a future major release.
      size.isSize16 && [
        classNames.size16,
        {
          height: personaSize.size16,
          minWidth: personaSize.size16
        }
      ],

      size.isSize24 && [
        classNames.size24,
        {
          height: personaSize.size24,
          minWidth: personaSize.size24
        }
      ],

      size.isSize24 &&
        showSecondaryText && {
          height: "36px"
        },

      // TODO: Deprecated size and needs to be removed in a future major release.
      size.isSize28 && [
        classNames.size28,
        {
          height: personaSize.size28,
          minWidth: personaSize.size28
        }
      ],

      size.isSize28 &&
        showSecondaryText && {
          height: "32px"
        },

      size.isSize32 && [
        classNames.size32,
        {
          height: personaSize.size32,
          minWidth: personaSize.size32
        }
      ],

      size.isSize40 && [
        classNames.size40,
        {
          height: personaSize.size40,
          minWidth: personaSize.size40
        }
      ],

      size.isSize48 && classNames.size48,

      size.isSize56 && [
        classNames.size56,
        {
          height: personaSize.size56,
          minWidth: personaSize.size56
        }
      ],

      size.isSize72 && [
        classNames.size72,
        {
          height: personaSize.size72,
          minWidth: personaSize.size72
        }
      ],

      size.isSize100 && [
        classNames.size100,
        {
          height: personaSize.size100,
          minWidth: personaSize.size100
        }
      ],

      /**
       * Modifiers: presence
       */
      presence.isAvailable && classNames.available,
      presence.isAway && classNames.away,
      presence.isBlocked && classNames.blocked,
      presence.isBusy && classNames.busy,
      presence.isDoNotDisturb && classNames.doNotDisturb,
      presence.isOffline && classNames.offline,
      className
    ],

    details: [
      classNames.details,
      {
        padding: "0 24px 0 16px",
        minWidth: 0,
        width: "100%",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around"
      },

      (size.isSize8 || size.isSize10) && {
        paddingLeft: 17 // increased padding because we don't render a coin at this size
      },

      (size.isSize24 || size.isSize28 || size.isSize32) && {
        padding: "0 8px"
      },

      (size.isSize40 || size.isSize48) && {
        padding: "0 12px"
      }
    ],

    primaryText: [
      classNames.primaryText,
      noWrap,
      {
        color: palette.neutralPrimary,
        fontWeight: FontWeights.regular,
        fontSize: FontSizes.small
      },

      showSecondaryText && {
        height: showSecondaryTextDefaultHeight,
        lineHeight: showSecondaryTextDefaultHeight,
        overflowX: "hidden"
      },

      (size.isSize8 || size.isSize10) && {
        fontSize: FontSizes.xSmall,
        lineHeight: personaSize.size8
      },

      size.isSize16 && {
        lineHeight: personaSize.size28
      },

      (size.isSize24 || size.isSize28 || size.isSize32 || size.isSize40 || size.isSize48) &&
        showSecondaryText && {
          height: 18
        },

      (size.isSize56 || size.isSize72 || size.isSize100) && {
        fontSize: 20 // TODO: after type ramp reconcile this needs to be replaced with a FontSize variable.
      },

      (size.isSize56 || size.isSize72 || size.isSize100) &&
        showSecondaryText && {
          height: 22
        }
    ],

    secondaryText: [
      classNames.secondaryText,
      noWrap,
      sharedTextStyles,

      (size.isSize8 || size.isSize10 || size.isSize16 || size.isSize24 || size.isSize28 || size.isSize32) && {
        display: "none"
      },

      showSecondaryText && {
        display: "block",
        height: showSecondaryTextDefaultHeight,
        lineHeight: showSecondaryTextDefaultHeight,
        overflowX: "hidden"
      },

      size.isSize24 &&
        showSecondaryText && {
          height: 18
        },

      (size.isSize56 || size.isSize72 || size.isSize100) && {
        fontSize: FontSizes.small
      },

      (size.isSize56 || size.isSize72 || size.isSize100) &&
        showSecondaryText && {
          height: 18
        }
    ],

    tertiaryText: [
      classNames.tertiaryText,
      noWrap,
      sharedTextStyles,
      {
        display: "none",
        fontSize: FontSizes.small
      },

      (size.isSize72 || size.isSize100) && {
        display: "block"
      }
    ],

    optionalText: [
      classNames.optionalText,
      noWrap,
      sharedTextStyles,
      {
        display: "none",
        fontSize: FontSizes.small
      },

      size.isSize100 && {
        display: "block"
      }
    ],

    textContent: [classNames.textContent, noWrap]
  }
}


/**
 * Persona with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Styling)
 */
export class PersonaBase extends React.Component<IPersonaProps, {}> {
  public static defaultProps: IPersonaProps = {
    size: PersonaSize.size48,
    presence: PersonaPresenceEnum.none,
    imageAlt: ""
  }

  constructor(props: IPersonaProps) {
    super(props)

    //this._warnDeprecations({ primaryText: 'text' });
  }

  public render(): JSX.Element {
    // wrapping default render behavior based on various this.props properties
    const _onRenderPrimaryText = this._onRenderText(this._getText()),
      _onRenderSecondaryText = this._onRenderText(this.props.secondaryText),
      _onRenderTertiaryText = this._onRenderText(this.props.tertiaryText),
      _onRenderOptionalText = this._onRenderText(this.props.optionalText)

    const {
      hidePersonaDetails,
      onRenderOptionalText = _onRenderOptionalText,
      onRenderPrimaryText = _onRenderPrimaryText,
      onRenderSecondaryText = _onRenderSecondaryText,
      onRenderTertiaryText = _onRenderTertiaryText
    } = this.props
    const size = this.props.size as PersonaSize

    // These properties are to be explicitly passed into PersonaCoin because they are the only props directly used
    const {
      allowPhoneInitials,
      className,
      coinProps,
      showUnknownPersonaCoin,
      coinSize,
      styles,
      imageAlt,
      imageInitials,
      imageShouldFadeIn,
      imageShouldStartVisible,
      imageUrl,
      initialsColor,
      onPhotoLoadingStateChange,
      onRenderCoin,
      onRenderInitials,
      presence,
      showInitialsUntilImageLoads,
      showSecondaryText,
      theme
    } = this.props

    const personaCoinProps: IPersonaCoinProps = {
      allowPhoneInitials,
      showUnknownPersonaCoin,
      coinSize,
      imageAlt,
      imageInitials,
      imageShouldFadeIn,
      imageShouldStartVisible,
      imageUrl,
      initialsColor,
      onPhotoLoadingStateChange,
      onRenderCoin,
      onRenderInitials,
      presence,
      showInitialsUntilImageLoads,
      size,
      text: this._getText(),
      ...coinProps
    }

    const classNames = classNamesFunction<IPersonaStyleProps, IPersonaStyles>()(styles, {
      theme: theme!,
      className,
      showSecondaryText,
      presence,
      size
    })

    const divProps = getNativeProps(this.props, divProperties)
    const personaDetails = (
      <div className={classNames.details}>
        {this._renderElement(classNames.primaryText, onRenderPrimaryText, _onRenderPrimaryText)}
        {this._renderElement(classNames.secondaryText, onRenderSecondaryText, _onRenderSecondaryText)}
        {this._renderElement(classNames.tertiaryText, onRenderTertiaryText, _onRenderTertiaryText)}
        {this._renderElement(classNames.optionalText, onRenderOptionalText, _onRenderOptionalText)}
        {this.props.children}
      </div>
    )

    return (
      <div {...divProps} className={classNames.root} style={coinSize ? { height: coinSize, minWidth: coinSize } : undefined}>
        <PersonaCoin {...personaCoinProps} />
        {(!hidePersonaDetails || (size === PersonaSize.size8 || size === PersonaSize.size10 || size === PersonaSize.tiny)) &&
          personaDetails}
      </div>
    )
  }

  /**
   * Renders various types of Text (primaryText, secondaryText, etc)
   * based on the classNames passed
   * @param classNames - element className
   * @param renderFunction - render function
   * @param defaultRenderFunction - default render function
   */
  private _renderElement(
    classNames: string,
    renderFunction: IRenderFunction<IPersonaProps> | undefined,
    defaultRenderFunction: IRenderFunction<IPersonaProps> | undefined
  ): JSX.Element {
    return (
      <div dir="auto" className={classNames}>
        {renderFunction && renderFunction(this.props, defaultRenderFunction)}
      </div>
    )
  }

  /**
   * Deprecation helper for getting text.
   */
  private _getText(): string {
    return this.props.text || this.props.primaryText || ""
  }

  /**
   * using closure to wrap the default render behavior
   * to make it independent of the type of text passed
   * @param text - text to render
   */
  private _onRenderText(text: string | undefined): IRenderFunction<IPersonaProps> | undefined {
    // return default render behaviour for valid text or undefined
    return text
      ? (): JSX.Element => {
          // default onRender behaviour
          return (
            <TooltipHost content={text} overflowMode={TooltipOverflowMode.Parent} directionalHint={DirectionalHint.topLeftEdge}>
              {text}
            </TooltipHost>
          )
        }
      : undefined
  }
}

/**
 * {@docCategory Persona}
 */
export interface IPersona {}

/**
 * {@docCategory Persona}
 */
export interface IPersonaSharedProps extends React.HTMLAttributes<PersonaBase | PersonaCoinBase | HTMLDivElement> {
  /**
   * Primary text to display, usually the name of the person.
   */
  text?: string

  /**
   * Decides the size of the control.
   * @defaultvalue PersonaSize.size48
   */
  size?: PersonaSize

  /**
   * Optional custom renderer for the coin
   */
  onRenderCoin?: IRenderFunction<IPersonaSharedProps>

  /**
   * If true, adds the css class 'is-fadeIn' to the image.
   */
  imageShouldFadeIn?: boolean

  /**
   * If true, the image starts as visible and is hidden on error. Otherwise, the image is hidden until
   * it is successfully loaded. This disables imageShouldFadeIn.
   * @defaultvalue false
   */
  imageShouldStartVisible?: boolean

  /**
   * Url to the image to use, should be a square aspect ratio and big enough to fit in the image area.
   */
  imageUrl?: string

  /**
   * Alt text for the image to use. Defaults to an empty string.
   */
  imageAlt?: string

  /**
   * The user's initials to display in the image area when there is no image.
   * @defaultvalue [Derived from text]
   */
  imageInitials?: string

  /**
   * Whether initials are calculated for phone numbers and number sequences.
   * Example: Set property to true to get initials for project names consisting of numbers only.
   * @defaultvalue false
   */
  allowPhoneInitials?: boolean

  /**
   * Optional custom renderer for the initials
   */
  onRenderInitials?: IRenderFunction<IPersonaSharedProps>

  /**
   * Optional callback for when loading state of the photo changes
   */
  onPhotoLoadingStateChange?: (newImageLoadState: ImageLoadState) => void

  /**
   * The background color when the user's initials are displayed.
   * @defaultvalue [Derived from text]
   */
  initialsColor?: PersonaInitialsColor | string

  /**
   * Presence of the person to display - will not display presence if undefined.
   * @defaultvalue PersonaPresence.none
   */
  presence?: PersonaPresenceEnum

  /**
   * Secondary text to display, usually the role of the user.
   */
  secondaryText?: string

  /**
   * Tertiary text to display, usually the status of the user. The tertiary text will only be shown when using Size72 or Size100.
   */
  tertiaryText?: string

  /**
   * Optional text to display, usually a custom message set. The optional text will only be shown when using Size100.
   */
  optionalText?: string

  /**
   * Whether to not render persona details, and just render the persona image/initials.
   */
  hidePersonaDetails?: boolean

  /*
   * If true, show the secondary text line regardless of the size of the persona
   */
  showSecondaryText?: boolean

  /**
   * If true, show the special coin for unknown persona.
   * It has '?' in place of initials, with static font and background colors
   */
  showUnknownPersonaCoin?: boolean

  /**
   * If true renders the initials while the image is loading.
   * This only applies when an imageUrl is provided.
   * @defaultvalue false
   */
  showInitialsUntilImageLoads?: boolean

  /**
   * Optional custom persona coin size in pixel.
   */
  coinSize?: number

  /**
   * Optional HTML element props for Persona coin.
   */
  coinProps?: IPersonaCoinProps

  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme

  /**
   * Primary text to display, usually the name of the person.
   * @deprecated Use `text` instead.
   */
  primaryText?: string
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaProps extends IPersonaSharedProps {
  /**
   * Optional callback to access the IPersona interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IPersona>

  /**
   * Additional CSS class(es) to apply to the Persona
   */
  className?: string

  /**
   * Call to provide customized styling that will layer on top of variant rules
   */
  styles?: IStyleFunctionOrObject<IPersonaStyleProps, IPersonaStyles>

  /**
   * Optional custom renderer for the primary text.
   */
  onRenderPrimaryText?: IRenderFunction<IPersonaProps>

  /**
   * Optional custom renderer for the secondary text.
   */
  onRenderSecondaryText?: IRenderFunction<IPersonaProps>

  /**
   * Optional custom renderer for the tertiary text.
   */
  onRenderTertiaryText?: IRenderFunction<IPersonaProps>

  /**
   * Optional custom renderer for the optional text.
   */
  onRenderOptionalText?: IRenderFunction<IPersonaProps>
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaStyleProps {
  /**
   * Theme provided by High-Order Component.
   */
  theme: ITheme

  /**
   * Custom class name.
   */
  className?: string

  /**
   * Optional custom persona coin size in pixel.
   */
  coinSize?: number

  /**
   * Decides the size of the control.
   * @defaultvalue PersonaSize.size48
   */
  size?: PersonaSize

  /**
   * Presence of the person to display - will not display presence if undefined.
   * @defaultvalue PersonaPresence.none
   */
  presence?: PersonaPresenceEnum

  /*
   * If true, show the secondary text line regardless of the size of the persona
   */
  showSecondaryText?: boolean
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaStyles {
  root: IStyle
  details: IStyle
  primaryText: IStyle
  secondaryText: IStyle
  tertiaryText: IStyle
  optionalText: IStyle
  textContent: IStyle
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaCoinProps extends IPersonaSharedProps {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<{}>

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<IPersonaCoinStyleProps, IPersonaCoinStyles>

  /**
   * Additional css class to apply to the PersonaCoin
   * @defaultvalue undefined
   */
  className?: string
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaCoinStyleProps {
  /**
   * Theme provided by High-Order Component.
   */
  theme: ITheme

  /**
   * Custom class name.
   */
  className?: string

  /**
   * Decides the size of the control.
   * @defaultvalue PersonaSize.size48
   */
  size?: PersonaSize

  /**
   * Optional custom persona coin size in pixel.
   */
  coinSize?: number

  /**
   * Decides whether to display coin for unknown persona
   */
  showUnknownPersonaCoin?: boolean
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaCoinStyles {
  coin: IStyle
  imageArea: IStyle
  image: IStyle
  initials: IStyle
  size10WithoutPresenceIcon: IStyle
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaPresenceProps extends IPersonaSharedProps {
  /**
   * Gets the component ref.
   */
  componentRef?: IRefObject<{}>

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<IPersonaPresenceStyleProps, IPersonaPresenceStyles>
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaPresenceStyleProps {
  /**
   * Theme provided by High-Order Component.
   */
  theme: ITheme

  /**
   * Custom class name.
   */
  className?: string

  /**
   * Presence of the person to display - will not display presence if undefined.
   * @defaultvalue PersonaPresence.none
   */
  presence?: PersonaPresenceEnum

  /**
   * Decides the size of the control.
   * @defaultvalue PersonaSize.size48
   */
  size?: PersonaSize
}

/**
 * {@docCategory Persona}
 */
export interface IPersonaPresenceStyles {
  presence: IStyle
  presenceIcon: IStyle
}

/**
 * Personas are used for rendering an individual's avatar, presence and details.
 * They are used within the PeoplePicker components.
 */
export const Persona: React.FunctionComponent<IPersonaProps> = styled<IPersonaProps, IPersonaStyleProps, IPersonaStyles>(
  PersonaBase,
  getPersonaStyles,
  undefined,
  {
    scope: "Persona"
  }
)
